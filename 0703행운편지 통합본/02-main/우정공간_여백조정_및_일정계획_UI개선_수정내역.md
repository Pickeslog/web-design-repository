# 🍀 우정공간 여백 조정 & 일정계획 UI 개선 수정 내역

> **작업 일자**: 2026년 7월 3일
> **대상 파일**: `02-main/index.html`, `02-main/css/desktop.css`, `02-main/js/desktop.js`

---

## 📋 주요 수정 요약

| 구분 | 수정 사항 | 세부 내용 |
| :---: | :--- | :--- |
| **UI/UX** | 우정공간 탭 좌우 여백 조정 | • 추억 피드(`.feed-grid`)의 카드 여백폭에 맞추기 위해 `.main-content-inner`에 `max-width: 980px` 적용<br>• 적용 후 대표 사진 카드의 제목 입력창(`.title-input-box`, 최소폭 480px)이 좁아진 공간에 밀려 글자수 카운터가 잘리는 회귀 발생<br>• `max-width: 1200px`로 재조정하여 여백은 이전보다 좁히면서도 잘림 현상 해소 |
| **UI/UX** | 일정계획 `새 D-day 만들기` 버튼 강조 | • 배경 없는 텍스트 버튼(`.btn-action-sm`)만으로는 눈에 잘 띄지 않던 문제 개선<br>• 초록 그라디언트 알약형 CTA 스타일 클래스 `.btn-schedule-new` 신규 추가하여 다른 주요 액션 버튼(`.btn-memory-write`, `.feed-write-btn`)과 동일한 시각적 무게 부여 |
| **기능/UX** | 추억 증거 카드(클로즈라인) 사이드 카드 클릭 동작 개선 | • 사이드(비활성) 카드를 클릭하면 상세보기 모달이 곧바로 열리던 것을, **해당 카드를 가운데로 이동**시키는 동작으로 변경<br>• 가운데(활성) 카드를 클릭했을 때만 상세보기 모달이 열리도록 분기 |
| **UI/UX** | 클로즈라인 좌우 화살표 내비게이션 제거 | • 사이드 카드 클릭만으로 이동이 가능해지면서 기능이 중복된 `‹ ›` 내비게이션 버튼 제거<br>• 관련 함수(`moveEvidence`), SVG 상수(`chevronLeftSvg`/`chevronRightSvg`), 미사용 변수(`isLatest`/`isOldest`), CSS(`.cline-nav`, 모바일 오버라이드 포함) 정리 |
| **UI/UX** | 일정계획 `growth-detail` 좌우 여백 추가 | • 약속 상세 카드(`.growth-detail`)가 컨테이너 전체 폭을 꽉 채우던 것에 `margin: 0 14px` 추가<br>• 바로 아래 4컷 카드 레일(`.growth-card-rail`)과는 의도적으로 여백 폭을 다르게 두어 서로 맞춰 보이지 않도록 처리 |
| **유지보수** | 캐시 버스팅 버전 갱신 | • `desktop.css?v=20` → `v=21`<br>• `desktop.js?v=20260702` → `v=20260703`<br>• 브라우저가 수정 전 CSS/JS를 계속 캐시해서 쓰는 문제 해결 |

---

## 🛠️ 파일별 상세 수정 내역

### 1. `index.html` (버튼 클래스 적용 및 캐시 버전)
- **일정계획 CTA 버튼 강조**:
  - `<button class="btn-action-sm" onclick="openScheduleModal('dt')">➕ 새 D-day 만들기</button>` →
  - `<button class="btn-action-sm btn-schedule-new" onclick="openScheduleModal('dt')">➕ 새 D-day 만들기</button>`
- **캐시 버스팅 쿼리 스트링 갱신**:
  - `<link rel="stylesheet" href="css/desktop.css?v=20">` → `?v=21`
  - `<script src="js/desktop.js?v=20260702"></script>` → `?v=20260703`

---

### 2. `css/desktop.css` (레이아웃 여백 조정 및 미사용 스타일 정리)
- **`.desktop-window .main-content-inner`**:
  - 여백 매칭 실험: `max-width: 980px` 적용 → 대표 사진 카드 제목 입력창 잘림 발생 확인 → `max-width: 1200px`로 재조정 (`margin: 0 auto`는 유지).
- **`.btn-schedule-new`** (신규):
  - `.btn-memory-write` 아래에 추가. 알약형(`border-radius: 999px`), 초록 그라디언트 배경(`linear-gradient(135deg, #52b788, #1b4332)`), 흰색 텍스트, 그림자, 호버 시 살짝 떠오르는 애니메이션 정의.
- **`.cline-nav` 및 관련 CSS 삭제**:
  - 데스크톱용 `.cline-nav`, `.cline-nav:hover`, `.cline-nav:disabled` 규칙 삭제.
  - 모바일 오버라이드 `.mobile-window .cline-nav` 규칙 삭제.
  - `.cline-stage`, `.cline-wire-area`는 유지 (`.cline-wire-area`가 `flex: 1`이라 버튼이 없어도 전체 폭을 그대로 채움).
- **`.growth-detail`**:
  - `margin: 0 14px;` 추가.

---

### 3. `js/desktop.js` (클로즈라인 카드 클릭 로직 및 내비게이션 정리)
- **`renderClinePolaroid` 클릭 동작 분기**:
  ```javascript
  // 변경 전
  <article class="cline-polaroid ${isActive ? 'is-active' : ''}"
       onclick="event.stopPropagation(); openMemoryDetail(${postIndex})">

  // 변경 후
  <article class="cline-polaroid ${isActive ? 'is-active' : ''}"
       onclick="event.stopPropagation(); ${isActive ? `openMemoryDetail(${postIndex})` : `setEvidenceIndex(${postIndex})`}">
  ```
  - 활성(가운데) 카드는 기존처럼 상세보기 모달 오픈.
  - 비활성(사이드) 카드는 `setEvidenceIndex(postIndex)` 호출로 해당 카드를 가운데로 이동만 시킴. (슬롯 래퍼 `.cline-card-slot`에 이미 동일한 목적의 핸들러가 있었지만, 카드 내부에서 `stopPropagation()`을 호출해 실행되지 못하던 것이 원인이었음.)
- **`renderEvidenceViewer` 내비게이션 버튼 제거**:
  - `.cline-stage` 템플릿에서 좌우 `<button class="cline-nav" onclick="moveEvidence(...)">` 2개 삭제, `.cline-wire-area`만 남김.
  - 버튼에만 쓰이던 `isLatest`, `isOldest` 변수 삭제.
- **미사용 코드 정리**:
  - `moveEvidence(direction)` 함수 삭제 (호출부가 사라져 더 이상 쓰이지 않음).
  - `chevronLeftSvg`, `chevronRightSvg` SVG 문자열 상수 삭제 (`clothespinSvg`는 유지).

---

## ✅ 검증 및 결과
1. **여백 조정**: `getBoundingClientRect()` 측정으로 `.main-content-inner`가 `max-width: 1200px` 기준 좌우 약 16px 여백(뷰포트 1280px 기준)을 가지면서, 대표 사진 카드의 제목 입력창(`.title-input-box`)이 `clientWidth === scrollWidth`로 더 이상 잘리지 않음을 확인.
2. **CTA 버튼 강조**: `getComputedStyle()`로 `.btn-schedule-new` 적용 버튼의 배경(그라디언트), 색상(흰색), radius(999px)가 정상 적용됨을 확인.
3. **클로즈라인 카드 클릭**: 콘솔에서 클릭 이벤트 시뮬레이션 — 사이드 카드 클릭 시 상세보기 모달(`#memory-detail-sheet`)이 열리지 않고 해당 카드가 `is-active`로 전환됨을 확인. 활성 카드 클릭 시에는 정상적으로 모달이 열림을 확인.
4. **내비게이션 버튼 제거**: `document.querySelectorAll('.cline-nav').length === 0` 및 `.cline-stage` 자식 요소가 `.cline-wire-area` 1개만 남음을 확인. 콘솔 에러 없음.
5. **growth-detail 여백**: `.growth-detail`이 부모(`.growth-shell`, `.growth-card-rail`)와 다른 좌우 14px 인셋을 가짐을 좌표 비교로 확인.
6. **캐시 버스팅**: 버전 쿼리 갱신 후 프리뷰 서버 재로드 시 위 변경 사항이 즉시 반영됨을 확인. (`file://`로 직접 여는 경우 브라우저별 프레임/캐시 제약으로 반영이 늦어질 수 있어 로컬 서버 구동을 권장.)
