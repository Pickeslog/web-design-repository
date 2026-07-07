# 0705 작업 진행 — 02-main 폴더 구조 재편 (styles/js/pages 분리)

## 작업 위치

`02-main/index.html`, `02-main/css/desktop.css`(분리 후 미사용, 보존), `02-main/js/desktop.js`(분리 후 미사용, 보존), 신규 `02-main/styles/`, `02-main/js/`, `02-main/pages/`

---

## 배경

화면명세서(화면별 스펙 문서)를 작성하기 전에, 탭(화면) 단위로 코드를 찾아보기 쉽도록 폴더를 나눠달라는 요청. `index.html`(1590줄) 한 파일에 4개 탭 마크업이 전부 들어있고, `desktop.js`(4800줄)/`desktop.css`(9054줄) 각각 한 파일에 전체 로직/스타일이 몰려있던 것을 `styles/`, `js/`, `pages/` 폴더로 분리했다.

**프레임워크(React/Vue) 도입은 하지 않음** — 순수 JS 유지, 파일 구조만 정리(사용자가 명시적으로 확인). "hooks" 폴더도 만들지 않았다 — vanilla JS엔 해당 개념이 없음. 범위는 `02-main`만(다른 페이지는 후속 작업).

**핵심 설계 제약**: 이 프로젝트는 `file:///C:/...`로 직접 열어서 테스트하는 경우가 실제로 있다(`components/clov-header.js`/`clov-profile-modal.js` 코드에도 "file://로 직접 열어도 깨지지 않도록"이라는 기존 주석이 있음). 그래서 HTML을 `fetch()`로 쪼개 불러오는 방식은 **처음부터 배제**했다(file://에서 CORS로 막힘). 대신 이 프로젝트가 이미 쓰고 있던 패턴 — **JS 파일이 템플릿 문자열로 HTML을 들고 있다가 런타임에 `innerHTML`로 주입**하는 방식(`components/clov-header.js`와 동일)을 그대로 따랐다.

---

## 1. CSS 분리 — desktop.css(9054줄) → styles/ 5개 파일

섹션 경계를 기준으로 `sed`로 잘라냈다: `base.css`(990, 레이아웃/헤더/공용모달/다크모드), `space.css`(4499, 대시보드+V5씬+추억증거뷰어), `feed.css`(247), `letter.css`(849), `schedule.css`(2469, 일정계획+인생4컷 극장). 섹션이 파일 전체에 걸쳐 여러 번 흩어져 있는 경우(예: 다크모드 보정, 일정계획 D-day 스포트라이트)가 있어 각 대상 파일마다 `sed -n '범위1;범위2;...'`로 비연속 구간을 이어 붙였다. 5개 파일 줄 수 합계가 정확히 9054로 맞아떨어지는 것으로 커버리지 누락/중복이 없음을 확인.

`<link>` 순서는 원본 desktop.css 안에서 섹션이 등장하던 순서 그대로(`base → space → feed → letter → schedule`) 유지해 캐스케이드 결과가 달라지지 않게 했다.

---

## 2. JS 분리 — desktop.js(4800줄) → js/ 10개 파일

함수 선언 경계를 정확히 grep으로 잡아내(`grep -n "^        function "` 등) 24개 연속 블록으로 나눈 뒤 각 파일에 배분했다: `data.js`(524, 몽키패치+seed데이터+`window._clov`), `utils.js`(253, escapeHtml/openModal/날짜계산 등 탭 공용 헬퍼), `space.js`(1354), `feed.js`(297), `letter.js`(362), `schedule.js`(891), `fourcut.js`(336, 인생4컷 극장), `v5-banner.js`(610, 기존 V5 IIFE 그대로), `nav.js`(110), `init.js`(63, window.onload 등 — 항상 마지막 로드).

**검증**: 24개 블록 줄 수 합계가 정확히 4800으로 일치. 추가로 원본과 분리본 사이에 top-level `function` 선언 165개, `window.X =` 익스포트, top-level `const`/`let` 선언 개수를 각각 diff/카운트로 비교해 전부 일치함을 확인(분실·중복 없음). `node --check`로 10개 파일 전부 문법 통과.

**크로스파일 참조 위험 점검**: 분리 전 우려했던 `window._clov = {...}`(data.js)가 `feed.js`의 `addNewPost` 등을 즉시 참조하는지 직접 코드를 읽어 확인 — 실제로는 `typeof X === 'function'` 가드로 감싸거나 호출 시점에만 참조하는 지연 패턴이라 로드 순서 걱정이 필요 없었다. `v5-banner.js`가 `space.js`의 `clovLevelInfo()` 등을 부르는 부분도 전부 함수 바디 안(호출은 나중에)이라 top-level 즉시실행 의존성 없음을 확인. 유일한 top-level 즉시 호출(`ensureLifeFourCutScheduleExamples()`)은 `data.js` 자기 자신 안에서 자기 자신을 부르는 것이라 안전.

`<script>` 순서: `data, utils` → (아래 3번의 `pages/*.js`) → `space, feed, letter, schedule, fourcut, v5-banner` → `nav, init`(항상 마지막).

---

## 3. HTML 페이지 분리 — 4개 탭 + 인생4컷 극장 → pages/ 4개 파일

`dt-tab-space`/`dt-tab-feed`/`dt-tab-letter`/`dt-tab-schedule`의 내부 마크업을 `components/clov-header.js`와 동일한 패턴(IIFE, HTML을 템플릿 문자열로 보관, `window.XPage.init()`에서 `container.innerHTML = HTML`)으로 옮겼다. `index.html`의 해당 자리는 빈 `<div id="dt-tab-*"></div>` + 바로 뒤에 `<script>XPage.init();</script>` 호출로 교체(`<div id="app-header"></div><script>ClovHeader.init(...)</script>`와 동일한 관례).

**인생4컷 극장(로비 모달 + 상영관 오버레이)도 `schedule-page.js`에 포함**해서 함께 옮겼다. 원본에서 이 두 요소는 `dt-tab-schedule`의 자식이 아니라 `<main id="desktop-scroll-container">`의 **형제**였다(`.modal-overlay`가 `position:absolute`라 어느 위치 컨텍스트 안에 있느냐가 중요) — 그대로 `#dt-tab-schedule` 안에 주입하면 포지셔닝 기준이 달라져 버그가 날 수 있어서, `SchedulePage.init()`이 `tab.closest('main').insertAdjacentHTML('afterend', FOURCUT_HTML)`로 **`<main>` 바로 뒤에 형제로** 삽입하도록 구현했다.

**작업 중 발견한 실수 1**: 각 탭의 "내부 콘텐츠만 잘라내고 바깥 열림/닫힘 태그는 새 빈 div로 교체" 작업을 라인 슬라이싱(Node `lines.slice()`)으로 하다가, `letter` 탭에서 슬라이스 경계를 하나 잘못 잡아 원래 탭의 닫는 `</div>`가 삭제되지 않고 그대로 남아 구조가 깨지는 실수가 있었다(`lines.slice(END)` 대신 실수로 `END-1`을 안 뺀 경우). `space` 탭을 옮길 때는 정확한 공식(`before = slice(0, START-1)`, `after = slice(END)`)으로 재확인 후 진행. **전체 파일의 `<div`/`</div>` 개수가 정확히 156:156으로 일치**하는 것으로 최종 검증.

**작업 중 발견/확인한 것 2**: 이 프로젝트의 기존 코드 안에도 `getElementById`를 몽키패치해서 없는 id를 조회하면 숨겨진 더미 div를 만들어 반환하는 로직이 있다(`data.js` 최상단). 검증 스크립트에서 `!!document.getElementById(...)`로 존재 여부를 확인하면 이 패치 때문에 **항상 true가 나와 오탐**이 생길 수 있어서, 실제 DOM 존재 여부는 `document.querySelector(...)`로 확인해야 한다(이 몽키패치가 없는 셀렉터라서 우회되지 않음).

---

## 검증 내용

- 각 단계(CSS/JS/HTML) 후 즉시 `node --check` + 브라우저 프리뷰로 확인
- 최종적으로 localhost 프리뷰에서: 4개 탭 전환(각 탭에 `.active` 클래스가 정확히 하나만 남는지), 일정계획 카드 렌더링(16개), 인생4컷 극장 입장→나가기, 다크모드 on/off, 그룹 전환(friend↔study), 행운편지 박스 존재 확인까지 전부 통과, 콘솔 에러 없음
- 네트워크 탭에서 `styles/*.css`(5개)·`js/*.js`(10개)·`pages/*.js`(4개) 전부 200 OK로 로드되는 것 확인
- **`file://`로 직접 여는 경우는 프리뷰 도구가 `localhost`에서 `file://`로의 네비게이션을 막아(추정) 실제로 재현 확인은 못 했다.** 대신 `pages/*.js` 4개 파일에 `fetch`/`XMLHttpRequest`가 전혀 없음을 정적으로 확인해, `file://`에서도 깨질 새 코드 경로가 없다는 점을 구조적으로 보장했다 — **팀에서 한 번은 실제 파일 더블클릭으로 최종 확인 권장**

---

## 팀 공유 시 주의할 점

- **`css/desktop.css`, `js/desktop.js`(기존 모놀리식 파일)는 삭제하지 않고 그대로 남겨뒀다.** `04-feed/feed.html`이 `../02-main/css/desktop.css`, `../02-main/js/desktop.js`를 상대경로로 참조하고 있어서, 지우면 그 페이지가 깨진다. `index.html`은 이제 이 두 파일을 로드하지 않는다. `feed.html`을 새 구조로 옮기거나, 이 레거시 파일을 계속 "호환용"으로 유지할지는 후속 결정 필요
- **파일이 1개(desktop.js/css)에서 19개(styles 5 + js 10 + pages 4)로 늘었다.** 캐시 버전(`?v=`)은 **고친 파일만** 개별적으로 올리면 된다 — 전체를 다 올릴 필요 없음(이번엔 전부 신규라 `?v=1`로 통일)
- **JS 로드 순서 규칙**: `data.js`/`utils.js` 최우선, `nav.js`/`init.js` 항상 마지막. 새 파일을 추가할 때 다른 파일의 함수를 **top-level(함수 밖)에서 즉시 호출**하면 로드 순서를 반드시 맞춰야 한다 — 함수 안에서 호출하는 것은 순서 무관하게 안전(호출은 페이지 로드 완료 후 이벤트로 일어나므로)
- **`components/*.js`와 동일하게, `pages/*.js`도 `fetch()`/`XMLHttpRequest`를 쓰면 안 된다.** file://에서 CORS로 막힌다 — HTML은 반드시 템플릿 문자열로 들고 있다가 `innerHTML`로 주입할 것
- **인생4컷 극장(로비+상영관)은 `dt-tab-schedule`의 자식이 아니라 `<main>`의 형제로 주입돼야 한다.** `.modal-overlay`/`.fourcut-theater`의 `position:absolute`/`fixed` 기준이 달라지면 레이아웃이 깨진다
- **`document.getElementById`로 존재 여부를 확인하지 말 것** — 이 프로젝트는 없는 id를 조회하면 숨겨진 더미 엘리먼트를 만들어 반환하는 널포인터 안전 패치가 있어서 항상 존재하는 것처럼 보인다. 존재 확인은 `document.querySelector`로 할 것
