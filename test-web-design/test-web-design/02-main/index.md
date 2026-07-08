# index.html — 우정공간 메인 앱

**최종 수정**: 2026-07-01  
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
| `dt-tab-feed` | 📸 추억피드 | 월별 아카이브, 월 선택 레일, 전체/내기록/친구기록 필터, 글쓰기 |
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

`defaultGroupsData.friend.posts` — 12개 더미 게시글 (2026.01 ~ 2026.06)
`defaultGroupsData.friend.schedules` — 14개 더미 일정 (인증 가능 / 다가오는 약속 / 완료된 약속 상태 포함)

버전 관리: `DATA_VERSION = '4'` — 불일치 시 localStorage 자동 리셋

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
index.html  →  04-feed/memory_detail.html  (추억 더보기)
03-rooms/makerooms.html  ←  index.html  (‹ 뒤로가기)
```

---

## 관련 파일

- [css/desktop.css](css/desktop.css) — 공통 스타일
- [js/desktop.js](js/desktop.js) — 전체 로직 (2818줄)
- [index_recovered.html](index_recovered.html) — 복구 백업본
