# makerooms.html — 우정공간 목록

**최종 수정**: 2026-07-03 (로그아웃 추가 + 사용자설정 공용 컴포넌트화)  
**담당 파트**: `03-rooms/`

---

## 화면 개요

로그인 후 진입하는 첫 번째 화면으로, 사용자가 참여 중인 우정공간(방) 목록을 보여준다.  
방을 선택해 입장하거나, 새 방을 만들거나, 방 코드로 기존 방에 참여할 수 있다.

---

## 화면 구성 — 3개 패널 전환

`showPanel('list' | 'create' | 'success')` 함수로 패널 전환.  
"우정공간 수정" 모달(연필 버튼)과 "사용자설정" 모달은 패널과 별개로 오버레이 레이어에 띄운다 (0703부터 중앙 팝업 모달 방식, 아래 참고).

| 패널 | 역할 |
|---|---|
| `panel-list` | 방 목록 (기본 화면) |
| `panel-create` | 새 우정공간 만들기 폼 |
| `panel-success` | 방 생성 완료 + 초대 코드 표시 |

---

## 1. 방 목록 패널 (`panel-list`)

### 상단 툴바
한 줄에 왼쪽 제목 + 오른쪽 4개 컨트롤 배치:

```
🍀 우리 우정공간들이에요    [방 코드 입력] [입장] [+ 방 만들기] [편집]
```

- **방 코드 입력 + 입장**: 초대 코드(`CLOV-XXXX` 형식)를 입력해 기존 방에 참여 (입력창 Enter 키 지원, 코드 없이 클릭 시 브라우저 alert 대신 Clov 테마 **알림 모달** 표시 및 확인 후 입력창 자동 포커스)
- **+ 방 만들기**: `panel-create` 패널로 전환
- **편집**: 편집 모드 진입/종료 토글 (활성 시 "완료"로 변경, 테두리 강조)

### 필터 탭
```
[⏰ 최신순] [⏱ 오래된 순] [☆ 즐겨찾기] [⊞ 내 순서]
```

| 필터 | 정렬 기준 |
|---|---|
| 최신순 | `createdAt` 내림차순 (기본값) |
| 오래된 순 | `createdAt` 오름차순 |
| 즐겨찾기 | `fav === true` 인 방만 |
| 내 순서 | 사용자가 드래그로 설정한 `rooms` 배열 순서 |

> **자동 전환**: 편집 모드에서 드래그 순서 변경 후 "완료" 클릭 시 → "내 순서" 탭으로 자동 전환됨. 드래그 없이 완료 시에는 기존 필터 유지.

### 편집 모드 안내 배너
편집 모드 진입 시 필터 위에 표시:
> "카드를 길게 누르거나 드래그해서 순서를 바꿀 수 있어요 · 연필 버튼으로 정보를 수정하세요"

---

## 방 카드 그리드

### 레이아웃
- `grid-template-columns: repeat(3, 1fr)` — 3열 고정
- 페이지당 9개 표시 (`ITEMS_PER_PAGE = 9`)
- 9개 초과 시 페이지네이션 표시 (`← 1 2 3 →`)
- 반응형: 760px 이하 → 2열 / 520px 이하 → 1열

### 카드 구성 요소

```
┌─────────────────────────────┐
│ [③]  📷아이콘(60×60)      ☆ │  ← 새 게시글 배지 / 즐겨찾기
│                              │
│  방이름 · Lv.N               │
│  소개글 · X시간 전 활동       │
│                              │
│  [📅 D-21  /  제주 여행  ]   │  ← D-day 버튼 (없으면 생략)
└─────────────────────────────┘
```

| 요소 | 설명 |
|---|---|
| 방 아이콘 | 60×60px, border-radius 16px. 대표 사진 있으면 이미지, 없으면 기본 아이콘 |
| 새 게시글 배지 | 아이콘 좌상단 빨간 원 + 숫자. `newPosts > 0` 일 때만 표시. 99 초과 시 "99+" |
| 즐겨찾기 버튼 | ☆ / ★ 토글. 활성 시 주황색(`#f6ad55`). 편집 모드와 무관하게 항상 동작 |
| 초대 코드 칩 | 열쇠 아이콘(`🔑`)과 함께 고유 초대 코드(`CLOV-XXXX`)를 직관적으로 표시 |
| D-day 버튼 | 진녹색 pill 버튼. `dday` 값이 있는 방만 표시. 클릭해도 이벤트 없음(프로토타입) |

---

## 우정공간 미리보기 모달 (`#room-preview-modal`)

방 카드를 클릭했을 때 즉시 메인 화면으로 넘어가지 않고, 방에 대한 상세 요약 정보를 확인할 수 있는 모달 창을 표시한다.  
모달 하단의 **[🚀 우정공간 입장하기]** 버튼을 클릭해야 실제 방으로 진입(`enterRoom(id)`)한다.

**탭 구성 (0703 추가)**: 상단에 `정보` / `편지함` / `알림` 3개 탭(`switchPreviewTab('info'|'letters'|'notices')`). 방에 안읽음 항목이 있으면 탭 옆에 빨간 점(`.preview-tab-dot.show`) 표시. 방 목록 화면 헤더의 편지함/알림 아이콘(전체 방 요약)과는 별개로, 이 탭은 **그 방 하나의 실제 편지/알림 내용**을 미리 보여준다.

- **정보 탭** (`#preview-pane-info`, 기본 표시)
  - **기본 정보**: 우정공간 이름, 소개글, 레벨(`Lv.N`), 최근 활동 시간
  - **주요 알람**: 읽지 않은 새 게시글/사진 수(`+N`), 실시간 알림 상태
  - **참여 멤버 정보**: 함께하는 친구들(4인 칩 형태 프로필 표시)
  - **우정공간 초대 코드**: 고유 초대 코드(`CLOV-XXXX`) 표시 및 **[복사]** 버튼을 통한 클립보드 복사 기능 지원
- **편지함 탭** (`#preview-pane-letters`, `renderRoomPreviewLetters()`): `room.letters` 배열을 카드 리스트로 렌더링, "OO님이 보낸 행운편지" + 미리보기 텍스트 + 시간. 비어 있으면 빈 상태 문구
- **알림 탭** (`#preview-pane-notices`, `renderRoomPreviewNotices()`): `room.notices` 배열 렌더링, 제목/설명/시간. 비어 있으면 빈 상태 문구
- 모달을 열 때마다(`showRoomPreviewModal(id)`) `정보` 탭으로 초기화됨

---

## 편집 모드

`편집` 버튼 클릭 시 진입. 카드마다 드래그 핸들 + 수정/삭제 버튼 노출.

### 드래그 앤 드롭 (순서 변경)

- **데스크톱**: `draggable="true"` + HTML5 DragEvent (`dragstart` / `dragover` / `drop`)
- **모바일**: `touchstart` 500ms 롱프레스 → 드래그 활성 → `touchend` 시 드롭
- 드롭 시 `rooms` 배열에서 splice → 재삽입으로 순서 변경 후 즉시 리렌더링
- 드래그 중인 카드: `opacity: 0.35` + 점선 테두리
- 드롭 대상 카드: 배경 강조 + 실선 테두리 + `scale(1.02)`

### 수정 모달 (연필 버튼)

편집 모드에서 각 카드 우측 상단 연필 버튼 클릭 → 중앙 팝업 모달(`#edit-modal`)이 뜬다.

> **0703 변경**: 기존에는 화면 아래에서 슬라이드 업하는 바텀시트(`.edit-modal`, 별도 `#modal-overlay`)였으나, 같은 파일의 다른 모달들(편지보관함/알림/방 만들기/방 미리보기)과 시각적으로 통일하기 위해 `room-header-modal-backdrop` / `room-header-modal` 중앙 팝업 패턴으로 재작성했다. 배경 클릭 닫기는 `closeRoomHeaderModalOnBackdrop()` 공용 함수를 재사용하고, ESC 키로도 닫힌다. 옛 바텀시트 전용 CSS(`.modal-overlay`, `.edit-modal`, `.modal-handle`, `.modal-header`)는 삭제됨.

**수정 가능 항목:**

| 항목 | 방식 |
|---|---|
| 대표 사진 | 파일 업로드 (`<input type="file" accept="image/*">`) → FileReader로 base64 미리보기 |
| 우정공간 이름 | 텍스트 입력, 2~20자 정규식 검증 (`/^[가-힣a-zA-Z0-9\s]{2,20}$/`) |
| 소개글 | textarea, 최대 60자, 실시간 글자 수 표시 |

- 모달 열릴 때 현재 방 정보 자동 채워짐
- **저장하기** 클릭 → `rooms` 배열 직접 갱신 → 카드 즉시 반영
- 오버레이 클릭 또는 ✕ 버튼으로 닫기 (변경 사항 미저장)

### 삭제 버튼 (휴지통)

`confirm()` 확인 후 `rooms` 배열에서 제거 → 리렌더링.

---

## 2. 방 만들기 패널 (`panel-create`)

| 필드 | 필수 | 설명 |
|---|---|---|
| 대표 사진 | 선택 | 파일 업로드. 미설정 시 기본 아이콘 |
| 우정공간 이름 | **필수** | 2~20자, 한글·영문·숫자만 허용 |
| 소개글 | 선택 | 최대 60자. 비워두면 "소개글을 아직 안 적었어요" 기본값 |

- 방 생성 시 `rooms` 배열 맨 앞(`unshift`)에 추가 → 목록 상단 노출
- 초대 코드: `'CLOV-' + 4자리 랜덤 영숫자` 형식으로 자동 생성

---

## 3. 생성 완료 패널 (`panel-success`)

- 방 이름 포함 완료 메시지 표시
- 초대 코드 + 복사 버튼 (`navigator.clipboard` 우선, 미지원 시 `execCommand('copy')` 폴백)
- "우정공간 목록으로" → `panel-list`로 복귀

---

## 페이지네이션

- 총 방 수 9개 이하: 페이지네이션 미표시
- 10개 이상: `← 1 2 → ` 버튼 표시
- 페이지 이동 시 `currentPage` 갱신 → `renderList()` 재호출

---

## 헤더

```
🍀 Clov.                              [아바타 ▾]
```

- 글래스모피즘: `backdrop-filter: blur(18px) saturate(1.4)`
- `ClovHeader.init({ type: 'home', showMail: false, showBell: false, ... })`로 렌더링. 별도의 다크모드 토글 버튼도 없음 — 프로필 드롭다운의 "⚙️ 사용자설정" 안에서 전환한다 (아래 참고)
- **프로필 드롭다운 (0703 수정)**: `dropdownItems`에 "⚙️ 사용자설정"만 있고 **로그아웃 항목이 빠져있었음** — `ClovHeader`의 기본 드롭다운(`renderMain` 기준)엔 원래 로그아웃이 있는데, 이 페이지는 `dropdownItems`를 커스텀 배열로 통째로 넘겨서 기본값을 덮어쓰는 바람에 로그아웃이 사라진 상태였다. `{ label: '로그아웃', onclick: "window.location.href='../01-auth/login.html'" }` 항목을 추가해 복구
- **0703 변경**: 헤더의 편지함/알림 아이콘(방 목록 전체 요약)을 제거했다. 개별 방의 편지/알림은 방 카드 클릭 시 뜨는 미리보기 모달의 편지함/알림 탭에서 확인한다 (위 참고). 이에 따라 전용이었던 `openRoomMailModal()`/`openRoomNotiModal()`/`getRoomMailItems()`/`getRoomNotiItems()`/`renderRoomModalChips()`/`renderRoomModalItems()`/`escapeModalText()`/`getStoredLetterItems()` 함수와 `room-mail-modal`/`room-noti-modal` 마크업, 관련 CSS(`.room-modal-*`)를 모두 삭제했다.

---

## 사용자설정 모달 (`#dt-profile-modal`) — 0703 공용 컴포넌트로 재구성

**이 파일에 독립적으로 복제돼 있던 상태를 정리했다.** 이제 `02-main/components/clov-profile-modal.js`(신규 공용 컴포넌트, `02-main/index.md` 참고)를 가져다 쓴다 — 모달 HTML/JS를 이 파일에서 완전히 제거하고 스크립트 include + `ClovProfileModal.init()` 호출로 교체했다. **더 이상 이 파일과 `02-main/index.html`을 각각 고칠 필요 없이, 컴포넌트 파일 하나만 고치면 두 곳 다 반영된다.**

```html
<script src="../02-main/components/clov-header.js?v=9"></script>
<script src="../02-main/components/clov-modal.js?v=1"></script>
<script src="../02-main/components/clov-profile-modal.js?v=2"></script>
...
<script>ClovHeader.init({ type: 'home', ... }); ClovProfileModal.init();</script>
```

**이 페이지만의 CSS 클래스 체계 대응**: 컴포넌트는 `index.html`(`.modal-form-group`+무클래스 `label`/`input`, 버튼 `.btn-sub`/`.btn-main`)과 이 페이지(`.field-wrap`+`.field-label`+`.text-input`, 버튼 `.profile-footer-btn`) 양쪽 클래스를 모든 폼 요소에 동시에 넣는 방식으로 작성돼 있다. 이 파일의 CSS는 그대로 두고 신규로 `.is-coming-soon`/`.theme-coming-soon-badge` 두 규칙만 추가했다("배경" 테마의 "준비중" 배지용).

**이 페이지에 새로 생긴 것**: "화면" 카테고리 내비 라벨이 "라이트모드 · 다크모드"에서 **"테마 설정"**으로 바뀌었고, 테마 탭에 라이트/다크모드 외에 **배경(준비중) / 우정편지 테마(선물상자·우체통) / 참여자별 추억 증거 카드(빨랫줄·겹침카드)** 3개 섹션이 추가로 노출된다. 이 페이지엔 행운편지 상자나 추억 증거 뷰어가 실제로 없어서 시각적으로 아무 효과가 없지만, `localStorage`에 설정값은 저장되고 나중에 `02-main/index.html`을 방문하면 그대로 적용된다 — 전역 설정이라는 걸 보여주기 위해 일부러 숨기지 않고 모든 페이지에 노출하는 방식을 택했다.

**개인정보 수정 탭에 프로필 사진 업로드 필드 신설**: 이름/닉네임 입력란 바로 위에 64px 원형 업로드 버튼(`#dt-profile-avatar-circle-2`) 추가. 좌측 레일의 미니 아바타(`#dt-profile-avatar-circle`)는 표시 전용으로 남겨두고, 실제 업로드 트리거는 이 새 필드로 옮겼다.

- `setThemeMode(mode)`는 이 페이지에 `toggleDarkMode()`가 없으므로 자동으로 `ClovHeader.applyDark(mode === 'dark')`로 폴백 (컴포넌트가 `typeof toggleDarkMode === 'function'` 체크 후 없으면 이 경로를 탐)
- `ClovHeader.init()`의 `dropdownItems`에 `⚙️ 사용자설정` 항목으로 진입 (위 "헤더" 섹션 참고)

---

## 다크모드 팔레트 — 미드나잇 올리브 (0703)

`02-main`과 동일 계열로 통일. 이 파일과 `join_room.html`/`invite.html`은 변수명 체계가 서로 달라 각각 매핑해서 반영했다 (`--primary-green` ↔ `--primary`, `--text-color` ↔ `--text`, `--border-color` ↔ `--border` 등).

| 역할 | 기존 | 현재 |
|---|---|---|
| body 배경 | `#0a0f0c` | `#14150e` |
| 카드 배경 | `#141f18` | `#1e2016` |
| 주요색 | `#4ade80` | `#5a7a3e` |
| 포인트색 | `#22c55e` | `#9ccc65` |

**버그**: `clov-header.js`의 다크모드 CSS가 이 페이지의 `--header-bg`/`--primary` 변수를 안 거치고 하드코딩된 옛 색으로 바로 떨어지는 폴백 누락이 있어서, 몸통은 올리브인데 헤더만 예전 색으로 보이는 문제가 있었다. `clov-header.js` 쪽 폴백 체인을 고쳐 해결 (자세한 내용은 `02-main/index.md` 참고). 이 파일이 `clov-header.js`/`clov-modal.js`를 버전 쿼리 없이 로드하고 있어 브라우저 캐시 혼선이 있었던 것도 발견 — `?v=9`/`?v=1` 캐시 버스팅 추가.

---

## 데이터 구조 (더미)

```js
rooms = [
  {
    id: Number,
    name: String,         // 방 이름
    level: Number,        // Lv.N
    intro: String,        // 소개글
    lastActive: String,   // '30분 전', '1시간 전' 등
    dday: { count: Number, label: String } | null,
    fav: Boolean,         // 즐겨찾기 여부
    newPosts: Number,     // 새 게시글 수 (0이면 배지 미표시)
    photo: String | null, // base64 또는 URL. null이면 기본 아이콘
    createdAt: Date,
    letters: [            // 0703 추가 — 미리보기 모달 편지함 탭 데이터
      { from: String, text: String, time: String, unread: Boolean }
    ],
    notices: [             // 0703 추가 — 미리보기 모달 알림 탭 데이터
      { icon: String, title: String, desc: String, time: String, unread: Boolean }
    ],
  }
]
```

---

## 관련 파일

- [invite.html](invite.html) — 초대 코드 공유 화면
- [join_room.html](join_room.html) — 방 코드 입력 참여 화면
- [02-main/index.html](../02-main/index.html) — 방 입장 후 이동하는 메인 앱
- [02-main/components/clov-profile-modal.js](../02-main/components/clov-profile-modal.js) — 사용자설정 모달 공용 컴포넌트 (0703 신규, 이 파일의 모달 HTML/JS는 여기로 이동함)
