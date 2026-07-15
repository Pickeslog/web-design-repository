# React SPA 이식 작업 기록 (2026-07-15)

## 배경 및 목표

`test-web-design/`의 순수 HTML/CSS/JS 프로토타입을 `web-app/`(Vite + React 19 + react-router-dom + @emotion/react + @tanstack/react-query + zustand + axios)로 이식했다. 원칙은 "기능·디자인은 그대로, 구조만 React로" — 화면을 재설계하지 않고 그대로 옮기는 작업.

## 기반 인프라

- **`src/utils/legacyHtmlInjector.js`**: 레거시 HTML 조각(head/body)을 React 컴포넌트 안에서 원본과 동일한 순서로 `<script>`까지 실제 실행되게 주입하는 유틸. `<base href>`로 원본의 상대경로(`../assets/...`)를 그대로 살리고, React StrictMode의 이중 마운트에도 안전하도록 `data-legacy-owner` 태그 + 라이브 DOM 기준 cleanup 방식을 쓴다.
- **`src/components/LegacyEmbed.jsx`**: 위 유틸을 재사용 가능한 컴포넌트로 뽑아낸 것. 화면 전체가 addEventListener/상태로 촘촘히 얽혀 손으로 JSX 재작성하면 회귀 위험이 큰 화면(방 목록, 추억피드)에 사용. `retriggerOnload` 옵션으로 `window.onload`에 초기 렌더를 등록하는 레거시 스크립트(desktop.js 등)도 지원.
- **`src/components/SuccessOverlay.jsx`**: 로그인/회원가입 성공 시 뜨는 애니메이션 오버레이를 React 컴포넌트로 재구현(원본은 DOM을 직접 body에 붙이는 방식이었음). 애니메이션 종료 시 `onDone` 콜백으로 SPA 이동.
- **`src/utils/clovAuth.js`**: 로그인 토큰 관리(원본 `auth.js` 포팅).
- 공용 유틸(`clovToast`/`clovAlert`)은 `index.html`에 전역 스크립트로 로드해 모든 화면에서 재사용.

## 이식한 화면

| 화면 | 방식 | 비고 |
|---|---|---|
| 대시보드(`/`) | 1단계 임베딩 + 부분 JSX | 이전 세션에서 헤더/4개 탭/모달 대부분을 JSX로 전환, 사용자설정 모달·마스코트·V5배너는 레거시 그대로 |
| 로그인(`/login`) | 완전 JSX | CSS Modules로 스코프, SuccessOverlay 재사용 |
| 회원가입(`/signup`) | 완전 JSX | 5단계 위저드(이메일/비번→약관→사진→닉네임/생일→완료) 전부 상태로 재구현 |
| 방 만들기(`/rooms/make`) | 1단계 임베딩(LegacyEmbed) | makerooms.html이 드래그 정렬·페이지네이션·3뷰 모달 등 ~1080줄 상태 로직이라 회귀 위험 커서 임베딩 |
| 방 참여(`/rooms/join`) | 완전 JSX | |
| 초대(`/rooms/invite`) | 완전 JSX | |
| 추억피드(`/feed`) | 1단계 임베딩(LegacyEmbed) | desktop.js(~4700줄) 엔진 재사용 |
| 추억 상세(`/feed/:memoryId`) | 완전 JSX | postId는 원본처럼 배열 인덱스 |
| 행운편지 상세(`/letter/:letterId`) | 완전 JSX | |
| 알림(`/notification`) | 완전 JSX | 관리진공지/친구알림/가입신청 3탭 |
| 프로필 수정(`/profile/edit`) | 완전 JSX | |

## 발견하고 고친 버그

1. **`window.onload` SPA 비호환**: 레거시 스크립트가 초기 렌더를 `window.onload`에 등록하는데 SPA에서는 그 이벤트가 다시 안 뜸 → `LegacyEmbed`의 `retriggerOnload` 옵션으로 마운트 후 수동 호출.
2. **React StrictMode 이중 마운트로 `<head>` 중복 삽입**: `data-legacy-owner` 태그 + 라이브 DOM 기준 cleanup으로 해결.
3. **`createPortal`이 기존 자식을 안 지움**: 레거시 스크립트가 문자열로 먼저 그려둔 자리에 portal을 꽂을 때 직접 `innerHTML=''` 후 마운트.
4. **`src/index.css`의 스캐폴딩 잔재**: `#root`에 고정폭(1126px)+테두리가 남아있어 전체 앱이 가운데 정렬 칼럼에 갇히던 버그. 전체 폭으로 수정.
5. **`feed.html`이 원본에서도 깨져 있던 버그**: `getEvidenceCardTheme is not defined` — `clov-profile-modal.js`를 안 불러온 원본의 누락. 해당 스크립트를 head에 추가해 수정(디자인/기능 변경 없음, 누락된 의존성만 보충).
6. **정적 경로 하드 리다이렉트들**: `clov-header.js`의 `logout()`, `clov-profile-modal.js`의 계정탈퇴, `makerooms`의 `enterRoom()`이 `../01-auth/login.html`, `../02-main/index.html` 같은 우리 서버에 없는 정적 경로로 이동하려던 것을 전부 실제 라우트(`/login`, `/`)로 수정.
7. **feed.html의 죽은 알림 벨 버튼**: 원본에도 onclick이 없던 버튼인데, 이제 실제 `/notification` 페이지가 생겼으니 링크로 연결.

## 화면마다 다른 다크모드 저장소 (의도적으로 보존)

원본이 정적 페이지마다 독립적으로 다크모드를 관리해서 localStorage 키가 제각각이다 — 포팅 시 그대로 유지했다(임의로 통일하지 않음):
- 대시보드: `clov_theme`
- 방 참여(join_room): `theme`
- 초대/추억상세/편지상세/알림/프로필수정: `clov_darkMode`

## 보류한 항목 (위험도 판단으로 JSX 전환 안 함)

- 사용자설정 모달(`clov-profile-modal.js`, addEventListener 36곳)
- 크로비 마스코트 / V5 배너 테스트 패널

## 검증 방식

화면마다 브라우저에서 직접 폼 검증·모달 열고닫기·localStorage CRUD·다크모드 토글 등 실제 인터랙션을 실행해 확인했고, 매번 콘솔 에러 0건·중복 DOM id 0건·대시보드 회귀 없음을 확인했다. 테스트 중 변경한 localStorage 시드 데이터는 원상복구했다.
