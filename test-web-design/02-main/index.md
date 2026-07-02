# index.html — 우정공간 메인 앱

**최종 수정**: 2026-07-02  
**담당 파트**: `02-main/`

---

## 화면 개요

Clov의 핵심 화면. 방 목록에서 방을 선택하면 진입한다.  
하나의 HTML 안에서 4개 탭을 전환하는 SPA 구조.

- 외부 스타일: `css/desktop.css`
- 외부 스크립트: `js/desktop.js`

---

## 탭 구성

| 탭 ID | 탭명 | 주요 내용 |
|---|---|---|
| `dt-tab-space` | 🏠 우정공간 | V5 씬 배너, 대표 사진 카드, 일정 배너, 참여자별 추억 증거(폴라로이드 팬 레이아웃) |
| `dt-tab-feed` | 📸 추억피드 | 월별 아카이브, 월 선택 레일, 전체/내기록/친구기록 필터, 폴라로이드 카드, 글쓰기(`wm-*` 모달) |
| `dt-tab-letter` | 💌 행운편지 | 편지 보관함, 편지 작성 토글 |
| `dt-tab-schedule` | 📅 일정계획 | 포토부스 4컷 카드 기반 약속 여정, 당일 이후 인증 사진 업로드 |

---

## 헤더

```
‹ 🍀 Clov.    [🏠][📸][💌][📅][🔔][☀️]    [김 ▾]
```

- **‹ (방 목록)**: `../03-rooms/makerooms.html` 링크
- **🍀 Clov.** 로고 클릭 → 우정공간 탭으로 이동
- **🔔**: `../07-notification/notification.html` 이동
- **프로필 드롭다운**:
  - 👥 방 변경하기 → `openModal('dt-group-modal')`
  - 🤝 현재 방 코드 공유하기 → `openModal('dt-invite-modal')`
  - 개인정보 수정 → `openProfileModal()` 모달
  - 로그아웃 → `../01-auth/login.html`

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

## 추억 증거 뷰어 — 폴라로이드 팬 레이아웃

삼성페이 카드 UI에서 영감받은 팬(fan) 레이아웃.

| 슬롯 | 내용 | z-index | 회전 |
|---|---|---|---|
| `fan-left` | 더 오래된 게시글 | 5 | `rotate(-24deg) translateY(14px)` |
| `fan-center` | 현재 활성 게시글 | 10 | `rotate(-1deg)` |
| `fan-right` | 더 최근 게시글 | 5 | `rotate(24deg) translateY(14px)` |

- `transform-origin: bottom center` — 카드 하단 축 기준 부채꼴 회전
- 비활성 카드: `opacity: 0.68`, `filter: saturate(0.55)`

---

## 추억피드 — 폴라로이드 카드 & 상세 모달 (게시자 + 친구 메시지 모델)

추억 게시글은 **참여자별 각자 전체 기록**(과거 `participants[].text`) 방식이 아니라,
**게시자 1명(`authorId`)이 쓴 글 + 참여자들의 한 줄 메시지(`messages[]`)** 구조다.

- `participants[]`는 "누가 함께했는가"만 나타내는 정체성 목록 (`id`/`name`/`icon`/`type`), 각자의 본문은 없다.
- `messages[]`는 참여자 1인당 최대 1개(`{ authorId, text }`). 게시자 본인도 자기 글에 메시지를 남길 수 있다.
- 과거 데이터의 `participants[].text`는 `normalizeMemoryPost()`가 최초 렌더링 시 `messages[]`로 1회 자동 이관한다.

### 권한

| 액션 | 권한 |
|---|---|
| 제목·본문 수정/삭제 | 게시자만 |
| 한 줄 메시지 작성 | 참여 멤버 각자 (게시자 포함) |
| 메시지 수정·삭제 | 그 메시지 작성자 본인만 |

### 피드 카드 (`renderMemoryCard`)

순서: 참여자 아바타 레일(게시자만 민트 링) → 대표 사진(클릭 시 상세 모달, `🔍 자세히` 힌트, 사진이 여러 장이면 우상단 `📷 N` 배지) → 캡션(작성자 라벨 + `···더보기` + 제목 + 48자 본문 미리보기) → 해시태그 → 날짜·장소 / `💬` 메시지 수.

### 상세 모달 (`#memory-detail-sheet`)

중앙 정렬 2열 모달(데스크톱), 좁은 화면에서는 세로 스택으로 전환된다.

- 좌: 대표 사진(사진이 여러 장이면 하단에 썸네일 스트립, 클릭으로 넘겨봄) / 우: 제목·본문·태그 (또는 게시자 수정 폼)
- 하단: 참여자별 한 줄 메시지 목록 — 타인 메시지(읽기전용) / 타인 미작성(`아직 메시지 없음`) / 내 메시지(수정·삭제) / 내 미작성(입력창 + 등록)
- 액션바: 게시자는 `수정`/`삭제`/`닫기`, 그 외는 `닫기`만 (`삭제`는 확인 단계를 거침)
- 수정 모드에서는 사진 영역이 썸네일 묶음 + `📷 추가` 타일로 바뀌며 여러 장(최대 6장) 업로드 가능. 업로드가 끝나면 `showProofResultModal()`을 재사용해 "이미지 업로드 완료" 안내 모달을 띄운다.

관련 함수: `normalizeMemoryPost`, `getMemoryHashtags`, `renderMemoryCard`, `openMemoryDetail`/`closeMemoryDetail`, `renderMemoryDetailModal`, `updateMemoryPost`, `requestDeleteMemoryPost`/`confirmDeleteMemoryPost`, `saveMemoryMessage`, `startMemoryMessageEdit`/`saveMemoryMessageEdit`/`cancelMemoryMessageEdit`, `deleteMemoryMessage`, `handleMemoryEditPhotoUpload`/`removeMemoryEditPhoto`/`setMemoryDetailPhotoIndex`.

### 글쓰기 모달 (`#wm-backdrop`, `openWriteModal()`/`saveWritePost()`)

피드 헤더 "✏️ 글쓰기"와 대시보드 "✏️ 추억 기록하기" 버튼이 여는 모달. (예전에 있던 `#dt-post-modal`/`addNewDesktopPost()`는 더 이상 호출되지 않는 죽은 코드로 남아 있다.)

- 사진: 썸네일 묶음 + `📷 추가` 타일, 여러 장(최대 6장) 한 번에 선택 가능. 업로드 완료 시 상세 모달 수정과 동일하게 "이미지 업로드 완료" 모달 표시
- 제목 / 본문 / 해시태그(직접 입력, `#` 자동 접두·중복 제거·최대 5개, 비우면 자동 태그로 대체) / 함께한 친구(칩 선택 — "나"는 항상 자동 포함되므로 칩 목록에는 없음)
- 저장 시 `authorId: CURRENT_USER_ID`, `messages: []`로 생성되어 상세 모달의 메시지 기능과 바로 호환된다.

### 피드 필터

`전체`/`내 기록`/`친구 기록` 필터는 `authorId` 기준으로 동작한다.

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

---

## 시드 데이터

`defaultGroupsData.friend.posts` — 12개 더미 게시글 (2026.01 ~ 2026.06). 그중 3개(성수 스터디 카페=솔, 부산 당일 여행=민, 졸업식 날=준)는 친구가 올린 글로 지정되어 있어, "나"가 친구 글에 메시지를 남기는 흐름을 바로 체험할 수 있다.
`defaultGroupsData.friend.schedules` — 14개 더미 일정 (인증 가능 / 다가오는 약속 / 완료된 약속 상태 포함)

게시글의 사진은 `post.photos: string[]`로 여러 장을 담을 수 있다. `post.bg`는 `photos[0]`와 항상 동기화되는 하위호환용 필드다.

버전 관리: `DATA_VERSION = '4'` — 불일치 시 localStorage 자동 리셋 (친구 저자 시드 반영을 위해 `3`→`4`로 올림)

---

## 다크모드

`toggleDarkMode()` → `body.dark-mode` 토글 → `localStorage('clov_darkMode')` 저장

---

## 페이지 연결 (진입/진출)

```
03-rooms/makerooms.html  →  index.html  (방 카드 클릭)
index.html  →  07-notification/notification.html  (🔔)
index.html  내부 모달  (개인정보 수정)
index.html  →  01-auth/login.html  (로그아웃)
index.html  →  05-letter/letter_detail.html  (편지 클릭)
index.html  내부 모달  (추억 더보기 → 상세 모달, 페이지 이동 아님. 04-feed/memory_detail.html은 더 이상 진입 경로가 아닌 레거시 페이지)
03-rooms/makerooms.html  ←  index.html  (‹ 뒤로가기)
```

---

## 관련 파일

- [css/desktop.css](css/desktop.css) — 공통 스타일
- [js/desktop.js](js/desktop.js) — 전체 로직 (3500줄+)
- [index_recovered.html](index_recovered.html) — 복구 백업본
- [../_docs/0702-추억피드-폴라로이드-메시지모델-작업기록.md](../_docs/0702-추억피드-폴라로이드-메시지모델-작업기록.md) — 게시자+메시지 모델, 다중 사진 업로드 작업 기록
