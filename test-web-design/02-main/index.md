# index.html — 우정공간 메인 앱

**최종 수정**: 2026-07-05 (styles/js/pages 폴더 재편 세션)  
**담당 파트**: `02-main/`

---

## 화면 개요

Clov의 핵심 화면. 방 목록에서 방을 선택하면 진입한다.  
하나의 HTML 안에서 4개 탭을 전환하는 SPA 구조.

---

## 폴더 구조 (0705 재편 — styles/js/pages 분리)

기존엔 `css/desktop.css`(9054줄) + `js/desktop.js`(4800줄) + `index.html`(모든 탭 마크업 포함) 3개 파일에 전부 몰려있었다. 화면명세서 작성을 앞두고 탭(화면) 단위로 찾기 쉽도록 아래처럼 재편했다 — **프레임워크 도입 없이 순수 JS 유지**, `?v=` 캐시 버전 규칙은 그대로 적용.

```
02-main/
  index.html          얇은 셸 — head(링크/스크립트) + 탭 빈 컨테이너 div + 각 페이지 init() 호출 + 공용 모달
  styles/
    base.css            :root 변수(라이트+다크), 레이아웃 셸, 헤더/네비, 공용 모달 베이스, 공유 애니메이션
    space.css            대시보드/V5씬, 대표사진, 일정배너, 추억증거 카드(폴라로이드/부채/빨랫줄/겹침), V5 배너 디테일
    feed.css              추억피드 그리드, 월 선택 팝오버, 태그 피커
    letter.css             행운편지 탭 + 선물상자/우체통 SVG
    schedule.css            일정계획 탭, 여정 타임라인, 4컷 포토부스 카드, 인생4컷 극장(로비+상영관)
  js/
    data.js              defaultGroupsData, DATA_VERSION, groupsData 로드/마이그레이션, window._clov API
    utils.js               escapeHtml, openModal/closeModal, saveGroupsData, 날짜/dday 계산 등 탭 공용 헬퍼
    space.js                우정레벨, 대시보드 환경, 대표사진 편집, 멤버모달, 추억증거 뷰어, 일정배너 렌더 진입점
    feed.js                  renderFeeds, 피드 필터/월별 아카이브, 글쓰기
    letter.js                 편지함/작성/상세
    schedule.js                일정 CRUD, 성장단계, 여정 타임라인, renderScheduleList, 인증사진 업로드
    fourcut.js                  인생4컷 극장 fourCut* 전체
    v5-banner.js                 기존 V5 BANNER ENGINE IIFE(그대로 이동)
    nav.js                        switchTab/switchDesktopTab, selectGroup, 다크모드
    init.js                        window.onload, window.onclick, 레거시 핸들러 — **항상 마지막 로드**
  pages/                        (신규 — components/와 동일한 IIFE+innerHTML 주입 패턴으로 탭 마크업을 JS가 들고 있음)
    space-page.js, feed-page.js, letter-page.js — 각 탭 내부 마크업을 해당 `dt-tab-*` 컨테이너에 주입
    schedule-page.js               일정계획 탭 셸 + 인생4컷 극장(로비 모달+상영관 오버레이)까지 함께 주입
                                     (극장은 원래도 `<main>`의 형제 요소였으므로, 주입 시에도 `<main>` 바로 뒤에 형제로 삽입해 위치 컨텍스트 그대로 유지)
  components/                    기존 그대로 (clov-header.js/clov-modal.js/clov-profile-modal.js)
```

**핵심 제약**: 이 프로젝트는 `file:///C:/...`로 직접 열어서 테스트하는 경우가 있어 `fetch()`로 HTML 조각을 불러오는 방식은 쓸 수 없다(file://에서 CORS로 막힘). `pages/*.js`는 `components/clov-header.js`와 동일하게 **템플릿 문자열로 HTML을 들고 있다가 런타임에 `innerHTML`로 주입**하는 방식이라 file://에서도 동일하게 동작한다(내부에 `fetch`/`XMLHttpRequest` 전혀 없음, 정적 분석으로 확인).

**⚠️ `css/desktop.css`, `js/desktop.js`(기존 모놀리식 파일)는 삭제하지 않고 그대로 남겨뒀다** — `04-feed/feed.html`이 `../02-main/css/desktop.css`, `../02-main/js/desktop.js`를 상대경로로 그대로 참조하고 있어서 지우면 그 페이지가 깨진다. `index.html`은 더 이상 이 두 파일을 로드하지 않는다(전부 `styles/*`, `js/*`로 교체). `feed.html`도 나중에 새 구조로 옮기거나, 이 레거시 파일 두 개를 "호환용"으로 계속 유지할지 결정이 필요하다.

자세한 분리 작업 이력·검증 내용은 `_docs/0705-styles_js_pages_폴더_재편_작업기록.md` 참고.

---

## 탭 구성

| 탭 ID | 탭명 | 주요 내용 |
|---|---|---|
| `dt-tab-space` | 🏠 우정공간 | V5 씬 배너, 대표 사진 카드(폴라로이드 스타일), 일정 배너(3칸 그리드), 참여자별 추억 증거(빨랫줄/겹침카드 테마 선택 가능) |
| `dt-tab-feed` | 📸 추억피드 | 월별 아카이브, 월 선택 레일, 전체/내기록/친구기록 필터, 글쓰기 |
| `dt-tab-letter` | 💌 행운편지 | 선물상자(또는 우체통) 클릭 → 편지함 모달, 편지 작성(받는사람 피커) |
| `dt-tab-schedule` | 📅 일정계획 | 포토부스 4컷 카드 기반 약속 여정, 당일 이후 인증 사진 업로드 |

---

## 헤더

```
‹ 🍀 Clov.    [🏠][📸][💌][📅][🔔]    [김 ▾]
```

- **‹ (방 목록)**: `../03-rooms/makerooms.html` 링크
- **🍀 Clov.** 로고 클릭 → 우정공간 탭으로 이동
- **🔔**: `../07-notification/notification.html` 이동
- 별도의 ☀️/🌙 다크모드 토글 버튼은 없음 — 사용자설정 안으로 통합됨(아래 참고)
- **프로필 드롭다운**:
  - 👥 방 변경하기 → `openModal('dt-group-modal')`
  - 🤝 현재 방 코드 공유하기 → `openModal('dt-invite-modal')`
  - ⚙️ 사용자설정 → `openProfileModal()` 모달 (아래 "사용자설정 모달 — 공용 컴포넌트" 참고)
  - 로그아웃 → `../01-auth/login.html`
  - 🔔 알림 배지: `updateHeaderNotiBadge()` — 대기 중인 가입 신청 건수만 카운트

---

## V5 씬 배너 (`#dt-v5scene`)

`data-time`, `data-season`, `data-level`, `data-event` 속성으로 배경 동적 변경.

| 레이어 | 역할 |
|---|---|
| `.scene-sky` | 하늘 배경 |
| `.scene-stars` | 별 |
| `.scene-celestial` | 해/달 |
| `.scene-clouds` | 구름 (3개, 각기 다른 animation-duration) |
| `.scene-mountains` | 산 |
| `.scene-clover-field` | 클로버밭 |
| `.scene-particles` | 파티클 |
| `.scene-balloons` | 풍선 |

HUD 요소: 함께한 날수(`D+N일째`), 레벨 진행 바(`.lv-pill`)

---

## 추억 증거 뷰어 (`renderEvidenceViewer`, `.cline-viewer`) — 0703 대폭 개편

**⚠️ 위 문단(`fan-left`/`fan-center`/`fan-right`)은 실제 구현과 이미 어긋나 있던 구버전 설명이었다.** 실제 구조는 `.cline-wire-area` > `.cline-cards` > `.cline-card-slot`(`cline-slot--far-past` ~ `cline-slot--far-newer`, 데스크톱은 좌우 ±2)이며, 각 슬롯은 `renderClinePolaroid()`가 만드는 `.cline-polaroid` 카드를 담는다.

**참여자별 추억 증거 카드 테마 — 사용자설정에서 선택 가능 (`clov_evidenceCardTheme`, 기본값 `wire`)**

| 테마 | 값 | 설명 |
|---|---|---|
| 빨랫줄 | `wire` (기본) | `.cline-wire`(빨랫줄) + `clothespinSvg`(빨래집게)로 카드를 걸어둔 모습. 슬롯 ±2개, 회전+축소로 부채꼴 형태 |
| 겹침 카드 | `coverflow` | 와이어/집게 완전히 숨김(`.theme-coverflow`). 카드 폭 210px에 `margin: 0 -38px`로 겹치는 코드플로우 스타일. 슬롯 ±3개까지 확장(`cline-slot--far-far-past/newer` 추가), 중앙 100% → 86% → 72% → 58% 스케일 |

- `getEvidenceCardTheme()` / `setEvidenceCardTheme(theme)` / `updateEvidenceCardThemeUI()` — `desktop.js`
- `setEvidenceCardTheme()`는 `renderEvidenceViewers()`를 다시 호출해 테마별 슬롯 개수(±2 vs ±3)를 즉시 반영한다
- 참여자 아바타(`.presence-tile`/`.presence-dot`)는 기존 "이름 텍스트가 붙은 캡슐형"에서 **완전한 원형(28×28px)만 남도록 단순화** — 이름 라벨(`.presence-name-label`) 표시는 제거됨

**하단 필름 스트립(`.cline-film-strip`) — 드래그/휠 스크롤 지원**

- 라벨(`과거`/`현재`)이 세로쓰기(`writing-mode: vertical-rl`) 필름통 모양 박스로 변경
- `.cline-film-frames` 안에 `.cline-film-track` 래퍼 추가, `cursor: grab/grabbing`
- `initEvidenceInteractions()`(desktop.js) — 마우스로 필름을 눌러서 끌면 스크롤(`pointerdown/move/up`), 마우스 휠(세로)을 가로 스크롤로 변환, 이미지 네이티브 드래그 방지
- 드래그 중에는 `window.isFilmDraggingPreventClick` 플래그로 프레임 클릭(사진 전환)이 무시됨 — `setEvidenceIndex()` 최상단에서 체크
- 창 크기 변경 시 현재 프레임으로 다시 정렬(`window resize` 리스너, 최초 1회만 바인딩)

**주의**: 위쪽 폴라로이드 스테이지의 연속 슬라이드 애니메이션(88ms 스텝 이동)과 클로버 없는 클로버/집게 완전 제거는 이번에 포팅하지 않았다 — 필요 시 참고용으로 정적 겹침 배치만 반영된 상태다.

## 일정계획 — 포토부스 4컷 카드

`dt-tab-schedule`은 일반 캘린더가 아니라 약속이 추억으로 완성되는 과정을 포토부스 4컷 카드로 보여준다.

| 컷 | 단계 | 상태 규칙 |
|---|---|---|
| 1 | 약속 씨앗 | 날짜가 지나면 체크 완료, 현재 단계면 강조 |
| 2 | D-day 새싹 | 날짜가 지나면 체크 완료, 현재 단계면 강조 |
| 3 | 만남 클로버 | 약속 당일 단계, 현재 단계면 강조 |
| 4 | 추억 꽃 | 약속 당일 이후 인증 사진 업로드 가능 |

- 프레임 1~3: 지난 단계는 `✓`, 현재 진행 중인 단계는 pulse 강조, 미래 단계는 잠금 상태로 표시한다.
- 프레임 4: 약속 당일 또는 지난 뒤에 `인증하기` 업로드 버튼을 노출한다.
- 인증 사진이 업로드되면 마지막 컷이 사진으로 채워지고 일정 카드가 완료 상태가 된다.
- 인증 완료 상태는 `groupsData[activeGroup].schedules[].stagePhotos.bloom`에 저장한다.
- 일정 카드 상단은 `전체`, `인증 가능`, `다가오는 약속`, `완료된 약속` 상태 필터 칩으로 분류한다.

**⚠️ 알려진 불일치**: 위 표의 "약속 씨앗/D-day 새싹/만남 클로버/추억 꽃" 명칭은 구버전(Clover Growth Path) 용어이고, 실제 화면은 "인생4컷"(포토부스) 컨셉으로 바뀐 지 오래됐다. 명칭 정리가 아직 안 된 상태이니 코드 수정 시 실제 UI 문구를 기준으로 할 것.

### 우정공간 대시보드 일정 배너 (`#dt-schedule-banner-container`) — 0703 3칸 그리드로 개편

- 기존엔 가장 가까운 일정 1개만 단일 배너로 보여줬으나, `updateScheduleUI()`를 다중 배너 렌더링으로 교체 — 다가오는 일정 최대 3개를 그리드로 표시(미래 일정 우선, 부족하면 지난 일정으로 채움)
- 일정이 3개 미만이면 남은 칸에 반투명 회색 점선 카드 "➕ 새로운 약속 만들기"가 표시되고, 클릭 시 바로 생성 모달이 열린다
- 각 배너의 D-day 뱃지는 `getDdayAccent()`로 색상이 동적으로 바뀌고(7일 이하: 주황/빨강, 8일 이상: 초록), `.schedule-dday-badge::before`에 은은한 번짐(수채화) 효과 추가
- **배너 클릭 시 스포트라이트 (0705)**: 클릭하면 `switchDesktopTab('schedule')`만 실행되던 것을, `selectScheduleChip('dt', 해당일정id)`를 같이 호출하도록 수정 — 이제 배너가 가리키는 그 일정이 일정계획 탭에서 바로 펼쳐져 보이고 화면이 그 카드 위치로 스크롤된다(이전엔 항상 첫 카드만 보였음)

### 인생4컷 극장 (`#dt-fourcut-theater`) — 0705 신규, 코르크보드 "모아보기" 완전 대체

완성된(4/4 인증사진) 인생4컷들을 영화관 입장 연출로 감상하는 몰입형 기능. `모아두기 버튼 연출 방법/design_handoff_fourcut_theater/`의 디자인 핸드오프를 그대로 이식했다. 기존 코르크보드 갤러리 모달(`renderFourCutGalleryCard`, `.fourcut-gallery-grid` 등)은 완전히 삭제됨.

- **트리거**: 일정계획 탭 상단 `.fourcut-gallery-btn`("모아보기" → **"입장하기"**로 명칭 변경, 티켓 아이콘) → `openFourCutGallery()`
- **로비(포스터, `#dt-fourcut-gallery-modal`)**: 완성작들의 '만남' 컷이 3.6초마다 크로스페이드되는 히어로 슬라이드쇼(`.fourcut-poster`, `fourCutStartPoster`). 넷플릭스 히어로 배너처럼 타이틀/태그라인 바로 아래에 "입장하기" 버튼 + 완료/다가오는 약속 칩을 포스터 이미지 위에 직접 배치(`.fourcut-poster-actions`). 그 아래 완성작 목록을 넷플릭스 "Trending Now"풍 카드 줄로 나열(`.fourcut-row`, 이미지 위 그라디언트 캡션+"인생4컷" 배지) — 카드 클릭 시 `fourCutEnterAt(index)`로 해당 완성작으로 바로 입장. 모달 전체가 어두운 테마로 통일되어 있음(`.modal-box.fourcut-gallery-modal`)
- **극장 오버레이**: 모달이 아니라 `position:fixed; z-index:500`인 별도 풀스크린 오버레이. 흐름: **입장하기**(`fourCutEnter`, 돌리인+착석 버튼 등장) → **착석하기**(`fourCutSit`, 좌석↑·소등·커튼열림·카운트다운·상영 시작) → **◁/▷**(`fourCutNav`, 재렌더 없이 DOM 직접 갱신) → **나가기**(`fourCutExit`, 페이드아웃 + 내부 마크업 하드 리셋)
- **재입장 시 항상 깨끗한 상태 보장**: `fourCutCaptureTheaterTemplate()`가 페이지 로드 후 극장 내부 마크업을 최초 1회 캡처해두고, `나가기`를 누를 때마다 그 원본으로 `innerHTML`을 통째로 갈아끼운다(`fourCutResetChildren`) — 애니메이션 취소/스타일 리셋만으로는 이전 상영 상태(열린 커튼 등)가 새어나오는 경우가 있었던 문제를 "새로고침한 것처럼" 만드는 방식으로 근본 해결
- 관련 함수는 전부 `fourCut*` 접두사(`desktop.js`): `fourCutMemories`/`fourCutStartPoster`/`fourCutStopPoster`/`fourCutCaptureTheaterTemplate`/`fourCutResetChildren`/`fourCutResetTheater`/`fourCutRenderScreen`/`fourCutSpawnDust`/`fourCutAnim`/`fourCutEnter`/`fourCutEnterAt`/`fourCutSit`/`fourCutFilmAdvance`/`fourCutNav`/`fourCutExit`
- 자세한 시행착오(버그 원인 3단계, 넷플릭스 개편 이력, 스크롤 애니메이션 실험)는 `_docs/0705-인생4컷_극장_넷플릭스_로비_작업기록.md` 참고

### 일정 수정 시 과거 날짜 제한

- 생성 모달은 원래부터 `dateInput.min = getTodayDateStr()` + 저장 시 검증이 있었으나, **수정 모달은 날짜 제한이 아예 없었음**(`removeAttribute('min')`으로 오히려 풀어버리고 있었음) — `openScheduleModal()`에서 수정 시에도 `min` 설정하도록 수정
- 저장 시 검증(`saveSchedule()`): "이미 저장돼 있던 날짜를 그대로 두는 것"은 허용하고, "새로 오늘 이전 날짜로 바꾸려는 시도"만 차단 — 이미 지난 일정의 제목/내용만 고치는 것까지 막지 않기 위한 설계

---

## 행운편지 — 선물상자/우체통 UI + 받는사람 피커 작성 (0703 병합, 재작업)

기존 필터버튼 + 카드그리드 방식을 폐기하고, 상자를 여는 방식으로 개편했다. **상자 디자인은 사용자설정에서 선물상자/우체통 중 선택 가능** (아래 "우정편지 테마" 참고).

| 요소 | 설명 |
|---|---|
| `.letter-box-trigger` (`openLetterInboxModal()`) | 상자 클릭 시 편지함 모달 오픈. `.letter-box-visual-giftbox`(선물상자, 기본)/`.letter-box-visual-mailbox`(우체통) 두 비주얼을 함께 렌더링해두고 테마 클래스로 토글 |
| `#dt-letter-zone` | 상자 위 요약 문구 영역 (동적 렌더링) |
| `#dt-letter-inbox-modal` | 편지함 모달 — 3통씩 페이지네이션(`moveLetterPage()`), **전체/즐겨찾기/보낸 편지함** 필터 탭(`dt-letter-modal-filter-all/favorite/sent`) |
| `#dt-letter-detail-modal` | 편지지 스타일(`letter-detail-paper`) 상세 모달 — "← 돌아가기"(`backToLetterInbox()`)로 편지함 모달로 복귀, 페이지 이동 없이 모달 전환만으로 완결 |

- `renderLetters()`: 편지 0통이면 감성 문구 5종 중 랜덤 노출, 즐겨찾기 필터 결과 0건이면 별도 문구, 보낸 편지함(`sent`)은 요약 문구 없음(`letter.isMine` 기준 필터)
- `.modal-overlay`에 `overflow-y: auto` 추가 — 편지 내용이 길 때 스크롤 가능
- 옛 필터 버튼 id(`dt-letter-filter-all/favorite`)는 삭제됨. 관련 코드 추가 시 새 모달 필터 id(`dt-letter-modal-filter-*`) 기준으로 작업할 것

### 편지 작성 — 받는사람 피커로 전면 재작업 (0703)

**중요**: 병합을 여러 차례 거치며 `submitLetter`/`toggleLetterToAllBtn`/`selectLetterEmoji`가 **3중으로 중복 정의**돼 있었고, JS의 "나중에 정의된 함수가 이긴다" 특성 때문에 실제로 살아있던 버전은 **편지를 저장하지 않고 성공 토스트만 띄우는 미완성 스텁**이었다(써도 편지함에 안 쌓이는 버그). 김대훈님 작업본의 완결된 버전으로 교체해 해결했다.

- 받는사람: 자유 텍스트 입력 → 현재 방 멤버 칩(`.letter-recipient-chip`, "나"/"솔"/"민"/"준" — 하드코딩) 중 선택하는 방식으로 변경. "모두에게" 토글(`toggleLetterToAllBtn`)과 배타적
- 보내는사람: 항상 `clov_profile`의 내 이름 (예전엔 자유 입력이라 스푸핑 가능했음)
- 이모지 장식 선택 필드는 삭제, 대신 글자수 제한(한글 500/영어 1000자, `handleLetterContentInput`) 추가
- 핵심 함수: `selectedLetterRecipient`, `updateLetterRecipientMutedState`, `selectLetterRecipient`, `toggleLetterToAllBtn`, `toggleInlineLetterWrite`, `submitLetter` — 실제로 `groupsData[group].letters`에 저장 + `localStorage` 반영 + `renderLetters()` 재호출까지 완결

---

## 사용자설정 모달 — 공용 컴포넌트로 분리 (`#dt-profile-modal`) — 0703 대규모 개편

**⚠️ 가장 중요한 변화**: 이 모달은 더 이상 `index.html`에 직접 작성돼 있지 않다. **`components/clov-profile-modal.js`**(신규)로 완전히 이동했고, `index.html`/`03-rooms/makerooms.html` 둘 다 이 컴포넌트를 가져다 쓴다. 예전엔 "두 파일 모두 반영해야 한다"는 주의사항이 있었지만, 이제 **이 컴포넌트 파일 하나만 고치면 두 곳 다 자동으로 반영된다.**

**사용법** (다른 페이지에 추가하고 싶을 때)
```html
<script src="../02-main/components/clov-header.js?v=9"></script>
<script src="../02-main/components/clov-modal.js?v=1"></script>
<script src="../02-main/components/clov-profile-modal.js?v=2"></script>
...
<script>ClovHeader.init({...}); ClovProfileModal.init();</script>
```
`ClovProfileModal.init()`은 모달 HTML을 `document.body`에 주입(`injectHTML()`, 중복 주입 방지 가드 포함)하고, 저장된 우정편지/증거카드 테마를 적용한다. **주의**: 이 테마 적용은 `document.readyState === 'loading'`이면 `DOMContentLoaded`까지 미룬다 — `init()`이 `<body>` 상단(다른 요소가 파싱되기 전)에서 호출되는 경우가 많아서, 곧바로 적용하면 아직 존재하지 않는 요소(`#dt-letter-box-trigger` 등)를 못 찾고 조용히 실패하는 버그가 있었다(실제로 겪은 버그, 재발 주의).

**페이지 간 CSS 클래스 체계 차이 대응**: `index.html`과 `makerooms.html`은 완전히 별도의 스타일시트를 쓰고 폼 필드 클래스 이름도 다르다(`index.html`: `.modal-form-group`+무클래스 `label`/`input`, 버튼 `.btn-sub`/`.btn-main` — `makerooms.html`: `.field-wrap`+`.field-label`+`.text-input`, 버튼 `.profile-footer-btn`). 컴포넌트는 **두 체계의 클래스를 모든 요소에 동시에** 넣어서(`class="modal-form-group field-wrap"` 등) 양쪽 다 안 깨지게 했다. 새 필드를 추가할 땐 이 관례를 유지할 것 — 한쪽 클래스만 넣으면 다른 페이지에서 스타일 안 먹는 필드가 생긴다.

**구조**
- 좌측 `.settings-rail`: 미니 아바타(`.settings-rail-avatar`, 이제 클릭 불가능한 순수 표시용 — 사진 변경은 아래 계정 탭으로 이동) + 이름, 그 아래 내비게이션(`.settings-nav-scroll`) — `계정` 카테고리 아래 "개인정보 수정", `화면` 카테고리 아래 **"테마 설정"**(← "라이트모드 · 다크모드"에서 변경. 테마 탭에 항목이 늘어나 이름이 안 맞게 돼서 수정)
- 우측 `.profile-form-panel`: `switchSettingsPane('account' | 'theme')`로 전환되는 두 pane
  - `#dt-settings-pane-account`: **프로필 사진**(신규, 이름/닉네임 필드 바로 위 — 클릭 가능한 64px 원형 업로드 버튼 `.profile-avatar-upload-circle`) + 이름/닉네임 + 연락처 + 비밀번호 변경
  - `#dt-settings-pane-theme`: 4개 섹션 — **테마**(라이트/다크, 기존과 동일) / **배경**(준비중 placeholder) / **우정편지 테마**(선물상자·우체통, 신규) / **참여자별 추억 증거 카드**(빨랫줄·겹침카드, 신규)
- 좌측 레일과 우측 콘텐츠는 각각 `height: 100%; overflow-y: auto`로 **독립 스크롤**
- 하단 액션바(`#dt-profile-modal-actions`)는 탭이 바뀌어도 항상 같은 자리에 유지되고 **내용만** 전환됨

**프로필 사진 — 레일(표시 전용) + 계정 탭(업로드) 분리**
- 레일의 `#dt-profile-avatar-circle`(`<div>`, 클릭 불가)은 그대로 두고, 실제 업로드 트리거는 계정 탭의 `#dt-profile-avatar-circle-2`(`<button>`)로 옮김. 파일 인풋(`#dt-profile-avatar-file`)도 함께 이동
- `loadProfileModalData`/`updateProfilePreview`/`handleProfileAvatarUpload` 세 함수 모두 레일 쪽(`-avatar-img/-initial`)과 계정 탭 쪽(`-avatar-img-2/-initial-2`) 이미지·이니셜을 동시에 갱신 — 하나만 바꾸면 다른 쪽이 안 따라감

**함수** (전부 `clov-profile-modal.js` 안에 있음)
- `openProfileModal()` — 드롭다운 닫기 → `loadProfileModalData()` → `switchSettingsPane('account')` → 모달 오픈. 배경 클릭으로도 닫힘(`onclick="if(event.target===this) closeModal(...)"`)
- `switchSettingsPane(pane)` — 좌측 내비, 우측 pane, 하단 액션바 전환 + 테마 탭이면 3개 테마 UI(`updateThemeOptionUI`/`updateLetterBoxThemeUI`/`updateEvidenceCardThemeUI`) 동시 갱신
- `setThemeMode(mode)` — **`toggleDarkMode()`가 있는 페이지(index.html)는 그걸 쓰고, 없는 페이지(makerooms.html)는 `ClovHeader.applyDark()`로 폴백** — 페이지마다 다크모드 구현이 달라서 이렇게 분기함
- `getLetterBoxTheme`/`applyLetterBoxTheme`/`updateLetterBoxThemeUI`/`setLetterBoxTheme` — 우정편지 테마(giftbox/mailbox), `localStorage.clov_letterBoxTheme`
- `getEvidenceCardTheme`/`updateEvidenceCardThemeUI`/`setEvidenceCardTheme` — 증거카드 테마(wire/coverflow), `localStorage.clov_evidenceCardTheme`. `setEvidenceCardTheme`는 `typeof renderEvidenceViewers === 'function'`일 때만 재렌더링 호출 — 이 함수가 없는 페이지(makerooms.html)에선 설정값만 저장되고 에러 없이 넘어감
- `notifyThemeComingSoon()` — 배경 테마용 "준비중" 토스트
- `loadProfileModalData`, `updateProfilePreview`, `toggleProfilePassword`, `checkProfilePasswordMatch`, `saveProfileModal`, `confirmDeleteProfileAccount`, `triggerProfileAvatarUpload`, `handleProfileAvatarUpload` — 기존 로직 그대로, 위 프로필 사진 이중 갱신만 추가

헤더의 별도 ☀️/🌙 다크모드 토글 버튼(`darkBtn(true)`)은 삭제하고 이 모달의 "화면" 탭으로 완전히 흡수했다.

---

## 알림 (🔔 `openNotiModal()`) — 0703 추가/변경

- **가입 신청 [삭제] 버튼**: "🤝 가입 신청" 탭에서 이미 수락/거절 처리된 항목에 `deleteJoinRequest(id)` 삭제 버튼 추가 (`clov_joinRequests`에서 완전히 제거)
- **거절은 세션 전용**: `rejectJoinRequest(id, name)`이 더 이상 `clov_joinRequests`(localStorage)에 `status:'rejected'`를 영구 기록하지 않는다. 대신 `notiSessionOverrides`(메모리 전용 변수)에만 기록 → **새로고침하면 다시 대기(pending) 상태로 돌아온다.** `renderJoinRequestsNoti()`가 렌더링할 때 `notiSessionOverrides[req.id] || req.status`로 실제 상태를 판단한다. 수락(accept)은 기존처럼 영구 저장 그대로 둠 — 거절만 이렇게 바뀐 것에 주의
- **멤버 퇴장 알림 시뮬레이션**: 참여 멤버 모달에 "👋 멤버 퇴장 테스트" 버튼 추가(`simulateMemberLeave()`). `clov_acceptedMembers`(가입 승인으로 들어온 동적 멤버) 중 무작위 1명을 제거하고, `groupsData[group].notifications`에 `"{이름}님이 {방이름}에서 나갔습니다."` 알림을 추가 → "🔔 친구들 알림" 탭(`renderFriendsNoti()`)에서 확인 가능. 이 기능이 생기기 전엔 방 나가기 관련 코드가 아예 없었음(가입 신청의 대칭 기능으로 신규 구현)

---

## 다크모드 팔레트 — 미드나잇 올리브

아이보리 라이트모드(`#fffdf3`)와 어울리도록 `body.dark-mode`의 색상 전부를 기존 네온 그린 계열에서 올리브 계열로 교체했다.

| 변수 | 기존 | 현재 |
|---|---|---|
| `--body-bg` | `#090d0a` | `#14150e` |
| `--card-bg` | `#151f18` | `#1e2016` |
| `--accent-green` | `#00bd45` | `#9ccc65` |
| `--primary-green` | `#007c2e` | `#5a7a3e` |
| `--text-color` | `#f0fdf4` | `#eef0e2` |
| `--btn-primary-bg` | `#1da858` | `#7c9c52` |

`03-rooms`(makerooms/join_room/invite)도 각자의 변수 체계에 맞춰 동일 계열로 통일됨. `04-feed`/`05-letter`/`07-notification`/`08-profile`은 아직 미반영.

---

## 버그 수정 이력 (0703)

- **헤더 드롭다운 고정 버그 (1차)**: "개인정보 수정" 메뉴가 `style.display='none'`로 드롭다운을 닫던 것을, 여는 쪽(`ClovHeader._toggleDrop`)과 동일하게 `classList.remove('open')` 방식으로 통일.
- **헤더 드롭다운 고정 버그 (2차, 재발)**: `openProfileModal()`이 드롭다운을 닫으려고 쓴 `[id$="-drop"]` 셀렉터가 `clov-hdr-drop`까지 잡아 `style.display='none'`(인라인 스타일)을 남겼고, 인라인 스타일이 `.clov-hdr-dropdown.open` 클래스 규칙보다 우선해 재오픈이 막혔다. `document.querySelectorAll('.clov-hdr-dropdown.open').forEach(el => el.classList.remove('open'))`로 클래스 기반 통일.
- **전역 클릭 핸들러 TypeError**: `openModal()`/`window.onclick`이 존재하지 않는 레거시 id(`mb-drop`, `dt-drop`)를 null 체크 없이 참조해 화면 어디를 클릭해도 에러가 나던 문제 수정 — 모달 바깥 클릭 닫기, 월별 팝오버 바깥 클릭 닫기가 이 버그로 거의 항상 죽어있었음. **주의**: `mb-drop`/`dt-drop`은 현재 HTML에 없는 id이므로 관련 코드 추가 시 null 체크 필수
- **`clov-header.js` 다크모드 하드코딩 폴백 버그**: 헤더 배경/로고/아바타 색상 규칙이 `--header-bg`/`--primary` 등 페이지별 변수를 안 거치고 옛 네온 그린 하드코딩값으로 바로 떨어져, `03-rooms` 쪽 헤더만 올리브 팔레트가 반영 안 되던 문제. 폴백 체인에 `--header-bg`/`--primary`를 추가하고 하드코딩 기본값도 올리브로 교체 (자세한 내용은 `03-rooms/makerooms.md` 참고)
- **편지 작성 3중 중복정의 버그**: `submitLetter`/`toggleLetterToAllBtn`/`selectLetterEmoji`가 여러 차례 병합을 거치며 3중으로 정의돼 있었고, 실제 살아있던(가장 나중에 정의된) 버전이 편지를 저장하지 않는 미완성 스텁이었음 — 편지 작성해도 편지함에 안 쌓이는 버그였음. 완결된 버전으로 교체 (위 "행운편지" 섹션 참고)
- **`ClovProfileModal.init()` 타이밍 버그**: 컴포넌트 분리 후, `init()`이 `<body>` 상단(우정편지 상자 등 다른 요소가 아직 파싱되기 전)에서 호출돼 저장된 우정편지 테마가 새로고침 시 적용 안 되던 문제. `document.readyState` 체크 후 `DOMContentLoaded`까지 테마 적용을 미루도록 수정
- **일정 수정 모달 날짜 미제한 버그**: 생성 모달엔 과거 날짜 제한이 있었지만 수정 모달엔 아예 없었음(오히려 `removeAttribute('min')`으로 풀어버림) — 위 "일정 수정 시 과거 날짜 제한" 섹션 참고
- 캐시 버전 갱신: `desktop.css?v=36`, `clov-header.js?v=9`, `desktop.js?v=20260703o`, `clov-modal.js?v=1`, `clov-profile-modal.js?v=2`(신규) — JS/CSS 수정 시 `index.html`의 버전 번호도 반드시 같이 올릴 것 (안 올리면 기존 방문자의 브라우저 캐시가 갱신되지 않음)

---

## 시드 데이터

`defaultGroupsData.friend.posts` — 12개 더미 게시글 (2026.01 ~ 2026.06)
`defaultGroupsData.friend.schedules` — 14개 더미 일정 (인증 가능 / 다가오는 약속 / 완료된 약속 상태 포함)

버전 관리: `DATA_VERSION = '4'` — 불일치 시 localStorage 자동 리셋

---

## 다크모드 전환 트리거

`toggleDarkMode()` → `body.dark-mode` 토글 → `localStorage('clov_darkMode')` 저장.  
전환 진입점은 헤더 버튼이 아니라 사용자설정 모달의 "화면" 탭(`setThemeMode()`)이다 — 팔레트 자체는 위 "다크모드 팔레트" 섹션 참고.

---

## 페이지 연결 (진입/진출)

```
03-rooms/makerooms.html  →  index.html  (방 카드 클릭)
index.html  →  07-notification/notification.html  (🔔)
index.html  내부 모달  (사용자설정)
index.html  →  01-auth/login.html  (로그아웃)
index.html  →  05-letter/letter_detail.html  (편지 클릭)
index.html  →  04-feed/memory_detail.html  (추억 더보기)
03-rooms/makerooms.html  ←  index.html  (‹ 뒤로가기)
```

---

## 관련 파일

- `styles/base.css`(990줄)/`space.css`(4499줄)/`feed.css`(247줄)/`letter.css`(849줄)/`schedule.css`(2469줄) — 전부 `?v=1`(0705 재편으로 신규 분리)
- `js/data.js`(524)/`utils.js`(253)/`space.js`(1354)/`feed.js`(297)/`letter.js`(362)/`schedule.js`(891)/`fourcut.js`(336)/`v5-banner.js`(610)/`nav.js`(110)/`init.js`(63) — 전부 `?v=1`(0705 재편으로 신규 분리)
- `pages/space-page.js`(132)/`feed-page.js`(33)/`letter-page.js`(154)/`schedule-page.js`(126) — 전부 `?v=1`(신규, 탭 마크업 주입 전용)
- ~~`css/desktop.css`~~/~~`js/desktop.js`~~ — **`index.html`은 더 이상 로드하지 않음.** 삭제는 안 함 — `04-feed/feed.html`이 아직 상대경로로 참조 중(9054줄/4800줄 그대로 보존)
- [components/clov-profile-modal.js](components/clov-profile-modal.js) — 사용자설정 모달 HTML+JS 전체 (461줄). `index.html`/`03-rooms/makerooms.html` 공용
- [components/clov-header.js](components/clov-header.js) / [components/clov-modal.js](components/clov-modal.js) — 기존 공용 헤더/토스트·알림·확인 모달 헬퍼
- [index_recovered.html](index_recovered.html) — 복구 백업본 (이번 세션 변경사항 미반영, 참고용)

**⚠️ `styles/*.css`/`js/*.js`/`pages/*.js` 중 하나라도 고치면 그 파일의 `?v=` 번호를 반드시 같이 올릴 것.** 안 올리면 방문자 브라우저가 예전 코드를 캐시로 계속 서빙한다 — 0703·0704·0705 세션 모두 이 실수가 반복됐다. 파일이 하나에서 19개로 늘었으니 **고친 파일만** 정확히 올리고 나머지는 그대로 둘 것(전부 올릴 필요는 없음).
