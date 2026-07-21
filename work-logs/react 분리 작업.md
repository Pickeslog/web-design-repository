# React 분리(SPA 포팅) 작업 기록

- 작성자: 김대훈
- 작성일자: 2026-07-15 (작업일) / 2026-07-20 (문서 정리일)
- 담당 파트: `test-web-design/` 정적 HTML/CSS/JS 프로토타입 → `web-app/`(Vite + React 19 + react-router-dom) SPA 이식
- 관련 브랜치/커밋: `chacha1650a` 브랜치, 커밋 [`0732d2f`](https://github.com/Pickeslog/web-design-repository/commit/0732d2f) "web-app React SPA 이식: 10개 화면 포팅 + 라우트 연결"

> 참고: 이 파일은 한 시점에는 다른 세션(다크모드/버튼 일관성 검수)의 기록이 잘못 저장돼 있던 적이 있다. 해당 내용은 `work-logs/2026-07-20-darkmode-button-consistency-review-and-proof-modal-esc-fix.md`로 분리했고, 이 파일은 파일명 그대로 React 분리 작업 전용 기록으로 재작성한다.

---

## 1. 배경 및 목표

`test-web-design/`은 `file://`로 직접 여는 순수 HTML/CSS/JS 프로토타입이라 화면 간 이동이 전부 `<a href="../xx/yy.html">` 정적 링크였고, 상태 공유는 `localStorage` 뿐이었다. 이를 실제 서비스에 가까운 구조인 **Vite + React 19 + react-router-dom** SPA(`web-app/`)로 옮기는 작업이다.

원칙:
- 화면을 새로 디자인하지 않는다. 기능·레이아웃·인터랙션은 원본 그대로, **구조만 React로** 바꾼다.
- 위험도가 높은(상태 로직이 크고 촘촘한) 화면은 손으로 재작성하지 않고 원본을 그대로 임베딩해서 회귀를 원천 차단한다.
- 위험도가 낮은(폼 중심, 상태가 단순한) 화면은 완전히 JSX로 재작성해 React 생태계(라우팅, 컴포넌트 재사용)에 자연스럽게 편입시킨다.

작업은 두 세션에 걸쳐 진행됐다 — 이전 세션에서 대시보드(`/`)를 부분 JSX화했고, 이번 세션에서 나머지 10개 화면(01-auth, 03-rooms, 04-feed, 05-letter, 07-notification, 08-profile)을 전부 처리했다.

---

## 2. 기반 인프라 파트

화면 이식에 들어가기 전에 공통으로 쓸 인프라 4가지를 먼저 구축했다.

### 2-1. `src/utils/legacyHtmlInjector.js` — 레거시 HTML 조각 실행기

레거시 화면(방 만들기, 추억피드)은 `<script>` 태그를 문자열로 넣어봐야 브라우저가 실행해주지 않는다(React가 `dangerouslySetInnerHTML`로 넣은 `<script>`는 파싱만 되고 실행 안 됨). 그래서 head/body 조각을 받아 **실제 DOM에 스크립트 태그를 새로 생성해서 순서대로 append**하는 방식으로 원본과 동일하게 실행되도록 만들었다.

- `<base href>`를 주입해 원본의 상대경로(`../assets/...`, `../02-main/css/...`)를 그대로 살림.
- React StrictMode는 마운트를 의도적으로 두 번 실행하는데, 이 과정에서 `<head>`에 스크립트가 중복 주입되는 문제가 있었음 → `data-legacy-owner` 속성으로 소유권을 표시하고, "라이브 DOM에 실제로 있는지"를 기준으로 cleanup하도록 설계(자세한 내용은 4-2 참고).
- 주요 함수: `injectLegacyHead`, `injectLegacyBody`, `cleanupLegacyHead`, `markBodyBoundary`, `cleanupAfterBodyBoundary`, `createLegacyOwnerId`.

### 2-2. `src/components/LegacyEmbed.jsx` — 재사용 가능한 임베딩 컴포넌트

```jsx
export default function LegacyEmbed({ headHtml, bodyHtml, baseHref, retriggerOnload = false }) {
  const containerRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const onloadFiredRef = useRef(false)

  useEffect(() => {
    const token = { cancelled: false }
    const ownerId = createLegacyOwnerId()
    const bodyBoundary = markBodyBoundary()
    async function boot() {
      await injectLegacyHead(headHtml, baseHref, ownerId, token)
      if (token.cancelled || !containerRef.current) return
      await injectLegacyBody(containerRef.current, bodyHtml, token)
      if (token.cancelled) return
      setMounted(true)
    }
    boot()
    return () => {
      token.cancelled = true
      onloadFiredRef.current = false
      setMounted(false)
      cleanupLegacyHead(ownerId)
      if (containerRef.current) containerRef.current.innerHTML = ''
      cleanupAfterBodyBoundary(bodyBoundary)
    }
  }, [headHtml, bodyHtml, baseHref])

  useEffect(() => {
    if (retriggerOnload && mounted && !onloadFiredRef.current) {
      onloadFiredRef.current = true
      if (typeof window.onload === 'function') {
        try { window.onload() } catch (e) { console.error('[LegacyEmbed] onload error:', e) }
      }
    }
  }, [retriggerOnload, mounted])

  return <div ref={containerRef} />
}
```

`retriggerOnload` 옵션은 `window.onload = function(){...}` 패턴으로 초기 렌더를 등록하는 레거시 스크립트(예: `desktop.js`)를 위한 것 — SPA에서는 `load` 이벤트가 페이지 최초 1회만 발생하고 이후 라우트 전환으로는 다시 발생하지 않기 때문에, 마운트 완료 후 수동으로 한 번 호출해준다. `try/catch`로 감싸 에러가 나도 `console.error`로만 남고 React 트리 전체가 죽지 않게 했다.

### 2-3. `src/components/SuccessOverlay.jsx` — 로그인/회원가입 성공 애니메이션

원본은 성공 시 오버레이 DOM을 `document.body`에 직접 붙이고 애니메이션 끝나면 `window.location.href`로 하드 리다이렉트하는 방식이었다. React 버전은 상태 기반 컴포넌트(`idle → active → zoomout → warp` 4단계)로 재구현하고, 마지막에 `onDone` 콜백을 호출하면 호출부에서 `navigate()`로 SPA 방식 이동을 하도록 바꿨다.

### 2-4. `src/utils/clovAuth.js`, 전역 스크립트

- `clovAuth.js`: 원본 `auth.js`의 토큰 관리 로직을 그대로 포팅.
- `clovToast`/`clovAlert`(원본 `clov-modal.js`)는 화면마다 따로 안 붙이고 `web-app/index.html`에 전역 `<script>`로 한 번만 로드해서 모든 화면이 공유하도록 함.
- Outfit/Inter Google Fonts도 `index.html`에 전역으로 추가(원본 화면들이 화면마다 제각각 로드하던 걸 통합).

---

## 3. 화면별 이식 상세

### 3-1. 완전 JSX 재작성 화면 (8개)

폼 중심이거나 상태 로직이 단순해서, 원본 스크립트를 그대로 옮기지 않고 React 컴포넌트로 손수 재작성한 화면들. 전부 CSS Modules로 스타일을 스코프했다(`.loginPage`, `.signupPage`, `.joinRoomPage`, `.invitePage`, `.memoryDetailPage`, `.letterDetailPage`, `.notificationPage`, `.profileEditPage` 같은 루트 클래스로 감싸서 다른 라우트로 스타일이 새는 것을 방지).

| 화면 | 경로 | 라우트 | 특이사항 |
|---|---|---|---|
| 로그인 | `src/pages/Auth/Login.jsx` | `/login` | `SuccessOverlay` 재사용. 엔터키로 이메일→비밀번호 포커스 이동 로직 포함(트러블슈팅 4-6 참고) |
| 회원가입 | `src/pages/Auth/Signup.jsx` | `/signup` | 이메일/비번 → 약관 → 사진 → 닉네임/생일 → 완료, 5단계 위저드를 컴포넌트 상태로 재구현 |
| 방 참여 | `src/pages/Rooms/JoinRoom.jsx` | `/rooms/join` | `localStorage.getItem('theme')` 키 그대로 유지. 쿼리파라미터 `code`/`roomCode`로 초대코드 프리필. 코드 길이 5자 이상 검증. `clov_joinRequests`에 신청 내역 저장 |
| 초대 | `src/pages/Rooms/Invite.jsx` | `/rooms/invite` | `clov_darkMode` 키 + `?theme=` 쿼리 우선순위 유지. 제출 시 `/?action=invite&code=...`로 이동 |
| 추억 상세 | `src/pages/Feed/MemoryDetail.jsx` | `/feed/:memoryId` | `postId`는 원본처럼 **배열 인덱스**로 취급(id 조회 아님, 원본의 특이한 데이터 모델을 그대로 보존). 네이티브 `alert`/`confirm` 유지 |
| 행운편지 상세 | `src/pages/Letter/LetterDetail.jsx` | `/letter/:letterId` | `saveLetter()`를 원본의 `window.location.reload()` 대신 로컬 상태 갱신으로 처리(기능은 동일, SPA에서 더 매끄러운 의도적 변경) |
| 알림 | `src/pages/Notification/Notification.jsx` | `/notification` | 관리진공지/친구알림/가입신청 3탭 상태머신. `clov_joinRequests` 승인/거절 처리 |
| 프로필 수정 | `src/pages/Profile/ProfileEdit.jsx` | `/profile/edit` | 아바타 이니셜은 원본처럼 `'김'` 고정값 유지(name 연동 안 함 — 원본의 실제 동작 그대로). 비밀번호 검증 순서(현재→새 비번 길이≥8→일치) 보존. 계정탈퇴 시 `localStorage.clear()` 후 `/login` 이동 |

### 3-2. 1단계 임베딩(LegacyEmbed) 화면 (2개)

상태 로직이 매우 크고 촘촘해서 손으로 재작성하면 회귀 위험이 큰 화면들. `LegacyEmbed`로 원본 HTML/JS를 그대로 실행시켜 **기능을 100% 보존**하는 전략을 택했다.

| 화면 | 경로 | 라우트 | 원본 규모 | 비고 |
|---|---|---|---|---|
| 방 만들기 | `src/pages/Rooms/MakeRoom.jsx` | `/rooms/make` | `makerooms.html` 약 1,080줄(드래그 정렬, 페이지네이션, 3뷰 모달 등) | head/body를 `sed`로 추출해 `legacy-source/makerooms-head.html`·`makerooms-body.html`로 분리 저장, `baseHref="/legacy/03-rooms/"` |
| 추억피드 | `src/pages/Feed/Feed.jsx` | `/feed` | `desktop.js` 약 4,700줄 엔진 | `retriggerOnload` 사용. `legacy-source/feed-head.html`·`feed-body.html`로 분리 |

레거시 정적 자산(`css/`, `js/`, `components/` 등)은 `web-app/public/legacy/02-main/` 아래로 그대로 복사해 `/legacy/...` 경로로 서빙되도록 배치했다.

---

## 4. 트러블슈팅 (오류 발견 지점 및 수정)

### 4-1. `window.onload` 콜백이 SPA에서 실행되지 않음

- **발견 지점**: 추억피드(`Feed.jsx`), `desktop.js`가 초기 렌더 로직을 `window.onload = function(){...}`로 등록.
- **증상**: 라우트를 `/feed`로 이동해도 화면이 빈 채로 안 그려짐.
- **원인**: 브라우저 `load` 이벤트는 최초 페이지 로드 시 한 번만 발생. SPA에서는 이미 그 시점이 지나버려서 나중에 `/feed`로 진입해도 이벤트가 다시 안 뜸.
- **수정**: `LegacyEmbed`에 `retriggerOnload` prop 추가 → 컴포넌트 마운트(body 주입 완료) 후 `window.onload`가 함수로 등록돼 있으면 1회 수동 호출(2-2 코드 참고).
- **왜 안전한가**: `onloadFiredRef`로 언마운트/재마운트 시마다 정확히 1회만 실행되도록 가드했고, 실행 실패해도 `try/catch`로 잡아 `console.error`만 남기고 앱 전체가 죽지 않게 함.

### 4-2. React StrictMode 이중 마운트로 `<head>` 스크립트 중복 삽입

- **발견 지점**: `LegacyEmbed`를 쓰는 화면 진입 시 콘솔에 동일 스크립트의 전역 함수/변수 중복 선언 경고.
- **원인**: 개발 모드의 StrictMode가 effect를 의도적으로 두 번 실행(mount → unmount → mount)하는데, 정리(cleanup) 시점에 "내가 넣은 걸 지운다"는 기준이 없어서 두 번째 마운트 때 스크립트가 또 추가됨.
- **수정**: 주입한 모든 `<script>`/`<link>`에 `data-legacy-owner="<ownerId>"` 속성을 달고, unmount 시 해당 `ownerId`로 태그된 요소만 제거(`cleanupLegacyHead`). body 쪽도 `markBodyBoundary`/`cleanupAfterBodyBoundary`로 주입 경계를 표시해 정확히 그 구간만 청소.
- **왜 안전한가**: 다른 컴포넌트나 전역 스크립트(`clov-modal.js` 등)가 심어둔 태그는 `ownerId`가 다르므로 건드리지 않음 — 삭제 범위가 자신이 넣은 것으로 한정됨.

### 4-3. `createPortal`이 레거시가 미리 그려둔 자식을 안 지움

- **증상**: 레거시 스크립트가 문자열 템플릿으로 먼저 그려둔 자리에 React `createPortal`로 콘텐츠를 꽂으면 기존 내용 위에 겹쳐 보임.
- **수정**: portal을 마운트하기 전에 대상 컨테이너에 대해 직접 `container.innerHTML = ''`로 비운 뒤 마운트.

### 4-4. `src/index.css`의 Vite 스캐폴딩 잔재로 전체 앱이 좁은 칼럼에 갇힘

- **증상**: 첫 화면 렌더 시 앱 전체가 화면 가운데의 좁은 고정폭 칼럼 안에 갇혀서 나머지 영역이 빈 배경으로 보임.
- **원인**: Vite React 템플릿이 기본 생성한 `#root` 관련 스타일(고정폭 1126px + 테두리)이 지워지지 않고 그대로 남아있었음.
- **수정**: 해당 규칙 제거, 전체 폭을 쓰도록 정리.

### 4-5. `feed.html`의 `getEvidenceCardTheme is not defined` — 원본에도 있던 버그

- **발견 지점**: 추억피드 진입 시 `desktop.js`에서 `ReferenceError: getEvidenceCardTheme is not defined`. 임시로 `LegacyEmbed`에 `try/catch` + `window.__legacyEmbedError` 디버그 플래그를 붙여 원인을 추적(추적 완료 후 `try/catch`+`console.error`만 남기고 디버그 플래그는 제거).
- **원인**: `getEvidenceCardTheme` 함수는 `clov-profile-modal.js`에 정의돼 있는데, **원본 `feed.html` 자체가 이 스크립트를 로드하지 않고 있었음** — 포팅 대상 원본에 이미 있던 누락 버그.
- **수정**: `legacy-source/feed-head.html`의 `desktop.css` 링크 바로 뒤에 `<script src="../02-main/components/clov-profile-modal.js"></script>` 추가.
- **왜 안전한 수정인가**: 새 기능을 추가한 게 아니라 이미 존재하는(그러나 로드가 안 돼서 크래시만 내던) 증거사진 뷰어 기능이 원래 의도대로 동작하게 만드는 누락 의존성 보충일 뿐, 디자인·다른 기능에는 영향 없음.

### 4-6. 정적 파일 경로로 하드 리다이렉트하던 곳들을 실제 SPA 라우트로 연결

정적 프로토타입 시절 `window.location.href = '../xx/yy.html'`로 걸려있던 링크들이, React 앱에서는 해당 정적 파일이 서빙되지 않아 전부 죽은 링크였다. 발견된 3곳을 실제 라우트로 교체했다.

**(1) 방 만들기 → 방 입장 (`enterRoom`)**

원본(`test-web-design/03-rooms/makerooms.html:1789-1794`):
```js
function enterRoom(id) {
  const room = rooms.find(r => r.id === id);
  if (!room) return;
  room.newPosts = 0;
  window.location.href = `../02-main/index.html?roomId=${id}&roomName=${encodeURIComponent(room.name)}&roomCode=${encodeURIComponent(room.code || 'CLOV-' + (1000 + (id * 837) % 9000))}`;
}
```

포팅 후(`web-app/src/pages/Rooms/legacy-source/makerooms-body.html`):
```js
function enterRoom(id) {
  const room = rooms.find(r => r.id === id);
  if (!room) return;
  room.newPosts = 0;
  window.location.href = `/?roomId=${id}&roomName=${encodeURIComponent(room.name)}&roomCode=${encodeURIComponent(room.code || 'CLOV-' + (1000 + (id * 837) % 9000))}`;
}
```

**(2) 헤더 로그아웃 (`clov-header.js`)**

원본(`test-web-design/02-main/components/clov-header.js:311-321`):
```js
function logout() {
  try {
    if (window.ClovAuth && typeof ClovAuth.clearAccessToken === 'function') {
      ClovAuth.clearAccessToken();
    } else {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
    }
  } catch (e) {}
  window.location.href = MAIN_BASE + '../01-auth/login.html';
}
```

포팅 후(`web-app/public/legacy/02-main/components/clov-header.js`):
```js
function logout() {
  try {
    if (window.ClovAuth && typeof ClovAuth.clearAccessToken === 'function') {
      ClovAuth.clearAccessToken();
    } else {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
    }
  } catch (e) {}
  // React 포팅본에서는 실제 라우트(/login)로 보낸다 — MAIN_BASE 기준 정적 파일 경로는
  // 이 앱에서 서빙되지 않는다. Dashboard 자체 헤더는 HeaderMain.jsx가 이 함수 대신
  // useNavigate()로 처리하므로, 여기는 makerooms 등 레거시 임베딩 화면에서만 실제로 탄다.
  window.location.href = '/login';
}
```

**(3) 프로필의 계정탈퇴 (`clov-profile-modal.js`)**

`setTimeout(..., 1400)` 안의 리다이렉트를 `'../01-auth/login.html'` → `'/login'`으로 교체(로그아웃과 동일한 사유).

- **왜 안전한 수정인가**: 셋 다 "이동할 URL 문자열"만 실제 서빙 가능한 경로로 바꾼 것이고, 그 앞의 상태 정리 로직(토큰 삭제, `newPosts` 초기화 등)은 그대로 유지했다.

### 4-7. `feed.html`의 죽은 알림 벨 버튼을 실제 알림 페이지로 연결

- **발견 지점**: `feed-body.html`의 헤더 알림 벨 — 원본에도 `onclick`이 없는 `<button>`이라 눌러도 아무 반응이 없었음(원본 자체의 미완성 상태).
- **판단**: 이번 포팅으로 `/notification` 페이지가 실제로 생겼으므로, 죽어있던 버튼을 살리는 게 자연스러움. 디자인은 그대로 두고 태그만 교체.
- **수정**: `<button class="hdr-icon-btn">...` → `<a class="hdr-icon-btn" href="/notification" title="알림" style="text-decoration:none;">...</a>` (아이콘 마크업은 그대로 이동).

### 4-8. 로그인 화면 엔터키 포커스 이동 버그

- **증상**: 이메일 입력 후 엔터를 눌러도 비밀번호 입력창으로 포커스가 안 넘어감.
- **원인**: `pwRef`가 비밀번호 `<input>`이 아니라 그걸 감싼 바깥 `<div>`에 잘못 연결돼 있었음.
- **수정**: 불필요한 `pwRef`를 제거하고, 이미 존재하던 `pwInputRef`(실제 `<input>` 참조)를 `enterNext`의 대상으로 사용하도록 정리.

---

## 5. 화면마다 다른 다크모드 저장 키 (의도적으로 통일하지 않음)

원본이 정적 페이지마다 독립적으로 다크모드를 관리해서 `localStorage` 키가 화면마다 제각각이었다. 포팅 시 이 불일치를 "버그"로 보고 통일하지 않고 **원본 그대로 보존**했다 — 화면 간 다크모드 동기화 자체가 원본 설계에 없던 기능이라, 임의로 묶으면 없던 동작을 새로 만드는 셈이기 때문.

| 화면 | localStorage 키 |
|---|---|
| 대시보드 | `clov_theme` |
| 방 참여(join_room) | `theme` |
| 초대 / 추억상세 / 편지상세 / 알림 / 프로필수정 | `clov_darkMode` |

---

## 6. 보류한 항목 (위험도 판단으로 JSX 전환 보류)

- 사용자설정 모달(`clov-profile-modal.js`) — `addEventListener` 36곳이 얽혀 있어 이번 범위에서는 손대지 않고 레거시 그대로 유지.
- 크로비 마스코트(`croby-mascot.js`) / V5 배너 테스트 패널(`v5-banner.js`) — 대시보드에 남아있는 레거시 조각, 이번 세션 범위 밖.

## 7. 남은 연결 작업 ("나머지도 연결하자")

10개 화면 포팅이 끝난 뒤, 화면 간에 아직 안 이어진 네비게이션 링크를 전수 점검해서 실제 라우트로 연결했다(4-6, 4-7 항목 포함). 이 과정에서 추가로 깨진 정적 링크가 있는지 `grep`으로 `window.location.href`, `<a href=`를 전수 확인했고, 남은 하드코딩 정적 경로는 발견되지 않았다.

---

## 8. 검증 방법

- 화면마다 브라우저(Claude Browser 프리뷰)에서 직접 실행: 폼 검증, 모달 열기/닫기, `localStorage` CRUD, 다크모드 토글 등 실제 인터랙션 수행.
- 매 화면 진입/이동마다 콘솔 에러 0건, 중복 DOM id 0건, 대시보드 회귀 없음을 확인.
- `MemoryDetail`의 잘못된 `postId` 경로 테스트 중 네이티브 `alert()`가 브라우저 자동화 탭을 블로킹한 사례가 있었는데, 이는 `alert()`가 정상적으로 떴다는 뜻(자동화 도구 한계였지 앱 버그 아님) — 새 탭을 열어 검증을 이어감.
- 테스트 중 변경한 `localStorage` 시드 데이터는 확인 후 원상복구.
- 코드 정적 검토: 하드코딩된 정적 파일 경로(`../xx/yy.html`) 전수 `grep`, 중복 ID/중복 함수 선언 확인.

## 9. 커밋/푸시 내역

| 항목 | 내용 |
|---|---|
| 브랜치 | `chacha1650a` (`https://github.com/Pickeslog/web-design-repository.git`) |
| 커밋 | [`0732d2f`](https://github.com/Pickeslog/web-design-repository/commit/0732d2f) |
| 포함 | `web-app/` 전체(141개 파일, 45,532줄 추가), `work-logs/2026-07-15-react-spa-porting.md`, `.claude/launch.json`(브랜치에 기존 있던 `clov-preview` 설정은 유지하고 `web-app` 설정만 추가) |
| 제외 | `test-web-design/02-main/02-main-frontend-화면명세서.md`(2026-07-10 기존 파일, 이번 작업분 아님), `.claude/settings.local.json`(로컬 툴 설정, 프로젝트 산출물 아님) |
| 후처리 | 푸시 후 `main` 브랜치로 복귀, 로컬 전용 `.claude/launch.json`(web-app 설정만 있는 버전)을 원상 복원 — `main`의 작업 상태에는 영향 없음 |
