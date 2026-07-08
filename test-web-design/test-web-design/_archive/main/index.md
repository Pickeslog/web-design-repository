# index.html — 메인 앱 (4탭 통합 화면)

## 개요

Clov의 핵심 화면으로, 하나의 HTML 안에서 4개 탭을 전환하는 단일 페이지 앱(SPA) 구조다.

- 외부 스타일: `css/desktop.css`
- 외부 스크립트: `js/desktop.js`

---

## 탭 구성

| 탭 ID | 탭명 | 주요 내용 |
|---|---|---|
| `dt-tab-space` | 🏠 우정공간 | V5 씬 배너, 대표 사진 카드, 일정 배너, 참여자별 추억 증거(폴라로이드 팬 레이아웃) |
| `dt-tab-feed` | 📸 추억피드 | 월별 아카이브, 월 선택 레일, 전체/내기록/친구기록 필터, 글쓰기 |
| `dt-tab-letter` | 💌 행운편지 | 편지 보관함, 편지 작성 토글 |
| `dt-tab-schedule` | 📅 일정계획 | 일정 관리 |

---

## 주요 구성 요소

### 헤더

- 로고(`🍀 Clov.`) 클릭 시 우정공간 탭으로 이동
- 상단 네비게이션 버튼 (4탭 + 🔔 알림)
- 우측 상단 프로필 드롭다운: 내 프로필 / 방 이동하기 / 새로운 방 추가 / 로그아웃
- 다크모드 토글 버튼 (`☀️`)

### V5 씬 배너 (`#dt-v5scene`)

`data-time`, `data-season`, `data-level`, `data-event` 속성으로 배경이 동적으로 변한다.

구성 레이어:
- `.scene-sky` — 하늘 배경
- `.scene-stars` — 별
- `.scene-celestial` — 해/달
- `.scene-clouds` — 구름 (3개, 각기 다른 animation-duration)
- `.scene-mountains` — 산
- `.scene-clover-field` — 클로버밭
- `.scene-particles` — 파티클
- `.scene-balloons` — 풍선

HUD 요소:
- 함께한 날수 (`D+N일째`)
- 레벨 진행 바 (`.lv-pill`)

### 추억 증거 뷰어 — 폴라로이드 팬 레이아웃

삼성페이 카드 UI에서 영감받은 팬(fan) 레이아웃.

| 슬롯 | 내용 | z-index | 회전 |
|---|---|---|---|
| `fan-left` | 더 오래된 게시글 | 5 | `rotate(-24deg) translateY(14px)` |
| `fan-center` | 현재 활성 게시글 | 10 | `rotate(-1deg)` |
| `fan-right` | 더 최근 게시글 | 5 | `rotate(24deg) translateY(14px)` |

- `transform-origin: bottom center` — 카드 하단을 축으로 부채꼴 회전
- 음수 마진(`-82px`)으로 카드 중첩 효과
- 비활성 카드: `opacity: 0.68`, `filter: saturate(0.55)`

### 내 프로필 모달 (`openProfileSettingsModal()`)

Discord 설정창 구조 (좌측 사이드바 + 우측 패널).

좌측: 프로필 이미지/닉네임/상태메시지/메뉴 목록  
우측: 닉네임·상태메시지·이메일·생년월일·이미지 업로드·비밀번호 변경

저장 방식: `localStorage` (`clov_profile`, `clov_profile_nickname` 등)

---

## 시드 데이터

`defaultGroupsData.friend.posts` — 12개 더미 게시글 (2026.01.01 ~ 2026.06.20)

버전 관리: `DATA_VERSION = '3'` — 버전 불일치 시 localStorage 자동 리셋

---

## 다크모드

- `toggleDarkMode()` 함수로 `body.dark-mode` 토글
- `localStorage`에 `clov_darkMode` 저장

---

## 페이지 연결

```
index.html
 ├── makerooms.html       (방 목록)
 ├── memory_detail.html   (추억 게시글 상세)
 ├── letter_detail.html   (행운 편지 상세)
 ├── notification.html    (알림)
 ├── invite.html          (초대 코드 입력)
 ├── join_room.html       (방 코드 접속)
 └── profile_edit.html    (개인정보 수정)
```

---

## 관련 파일

- [css/desktop.css](css/desktop.css)
- [js/desktop.js](js/desktop.js)
- [index_recovered.html](index_recovered.html) — 복구 백업본
