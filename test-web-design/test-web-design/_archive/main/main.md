# 🍀 Clov - 메인 작업 디렉토리 (work-logs/main)

**작성일**: 2026년 6월 30일
**디렉토리**: `web-design-repository/work-logs/main/`

---

## 파일 구성

```
main/
├── index.html          — 메인 앱 (4개 탭 통합 화면)
├── index_recovered.html — index.html 복구 백업본
├── invite.html         — 그룹 초대 코드 입력
├── join_room.html      — 방 코드로 접속
├── letter_detail.html  — 행운 편지 상세 보기
├── login.html          — 로그인
├── makerooms.html      — 우정공간 목록 / 만들기
├── makerooms.md        — makerooms.html 전용 문서
├── memory_detail.html  — 추억 게시글 상세 보기
├── notification.html   — 알림
├── profile_edit.html   — 개인정보 수정
├── css/
│   └── desktop.css     — index.html 공유 스타일
└── js/
    └── desktop.js      — index.html 공유 스크립트
```

---

## 공통 디자인 시스템

### 색상 토큰

모든 파일이 동일한 CSS 변수를 사용합니다. `index.html`은 `css/desktop.css`에서, 나머지 독립 페이지는 각 파일 내 `<style>` 블록에 동일한 토큰을 인라인으로 선언합니다.

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--primary-green` | `#1b4332` | `#007c2e` | 로고, 제목, 강조 |
| `--accent-green` | `#52b788` | `#00bd45` 또는 `#4ade80` | 버튼, 포인트 |
| `--btn-primary-bg` | `#357a58` | `#1da858` | 주요 버튼 배경 |
| `--bg-light` / `--body-bg` | `#fafbfc` / `#cbdad2` | `#0d1510` / `#090d0a` | 페이지 배경 |
| `--card-bg` | `#ffffff` | `#151f18` | 카드 배경 |
| `--text-color` | `#2c3e35` | `#f0fdf4` | 본문 텍스트 |
| `--text-muted` | `#61766a` | `#86efac` | 보조 텍스트 |
| `--border-color` | `#eef2f0` | `#1e2f24` | 테두리 |
| `--danger` | `#d95f5f` 또는 `#e74c3c` | `#ff8a8a` 또는 `#f87171` | 삭제, 경고 |

### 다크모드 전환

- `index.html`: `toggleDarkMode()` 함수로 `body.dark-mode` 토글, `localStorage`에 `clov_darkMode` 저장
- 독립 페이지(`memory_detail`, `letter_detail`, `notification` 등): URL 파라미터 `?theme=dark|light`를 우선 읽고, 없으면 `localStorage` 폴백

### 공통 UI 패턴

- **카드 컨테이너**: `border-radius: 24px`, `box-shadow: 0 20px 40px rgba(0,0,0,0.4)`, `animation: fadeUp 0.6s`
- **입력 필드 포커스**: `border-color: --accent-green` + `box-shadow: 0 0 0 3px rgba(82,183,136,0.18)`
- **헤더 글래스**: `backdrop-filter: blur(20px) saturate(1.5)`, `background: --header-glass-bg`

---

## 페이지별 설명

### index.html — 메인 앱

**역할**: Clov의 핵심 화면. 하나의 HTML 안에서 4개 탭(우정공간·추억피드·행운편지·일정계획)을 전환합니다.

**외부 의존**
- `css/desktop.css` — 레이아웃·컴포넌트 스타일
- `js/desktop.js` — 그룹 전환, 피드 필터, 일정 데이터, 다크모드 로직

**탭 구성**

| 탭 ID | 탭명 | 주요 내용 |
|---|---|---|
| `dt-tab-space` | 🏠 우정공간 | V5 씬 배너, 대표 사진 카드, 일정 배너, 참여자별 추억 증거 카드 |
| `dt-tab-feed` | 📸 추억피드 | 월별 아카이브, 월 선택 레일, 전체/내기록/친구기록 필터, 글쓰기 |
| `dt-tab-letter` | 💌 행운편지 | 편지 보관함, 편지 작성 |
| `dt-tab-schedule` | 📅 일정계획 | 일정 관리 |

**V5 씬 배너 (`#dt-v5scene`)**
- `data-time` (day/night), `data-season` (spring/summer/autumn/winter), `data-level`, `data-event` 속성으로 배경이 동적으로 변합니다.
- 구름·별·산·클로버밭·파티클·풍선 레이어로 구성됩니다.
- HUD에 함께한 날수(`D+N일째`)와 레벨 진행 바(`lv-pill`)를 표시합니다.

**헤더 프로필 드롭다운**
- 그룹 변경 / 친구 초대코드 / 개인정보 수정 / 로그아웃 항목을 포함합니다.

---

### index_recovered.html — 메인 앱 복구본

`index.html`의 백업 파일입니다. 구조와 기능은 `index.html`과 동일하며, 특정 시점의 안정 버전을 보존하는 용도입니다.

---

### invite.html — 그룹 초대 코드 입력

**역할**: 친구가 공유한 초대 코드를 입력해 그룹(우정공간)에 합류하는 독립 페이지.

**UI 특징**
- 중앙 정렬 카드 (`max-width: 480px`), 큰 아이콘, 코드 입력창 (`letter-spacing: 4px`, 큰 폰트)
- 제출 버튼 클릭 → 그룹 입장 처리
- 뒤로가기(`✕ 닫기`) 버튼 제공

---

### join_room.html — 방 코드로 접속

**역할**: `CLOV-XXXX` 형식의 방 코드를 입력해 특정 우정공간에 접속하는 독립 페이지.

**UI 특징**
- 데스크톱 브라우저 프레임 목업 (`850×750px`, 초록 상단 바 + 3개 닷)을 사용한 화면 안 화면 구조
- 헤더에 로고·아이콘·아바타 버튼 포함
- 코드 입력창과 입장 버튼이 중앙에 배치

---

### letter_detail.html — 행운 편지 상세 보기

**역할**: 행운 편지 한 통의 전체 내용을 보여주는 상세 페이지.

**URL 파라미터로 데이터 수신** (index.html에서 전달)
- 발신자(`from`), 편지 내용(`text`), 날짜, 즐겨찾기 여부

**UI 구성**
- 발신자 레이블 (내 기록 / 친구 이름)
- 편지 본문 (`white-space: pre-wrap`, `font-size: 18px`)
- 액션 버튼: 즐겨찾기(⭐), 삭제(🗑), 목록으로 닫기

---

### login.html — 로그인

**역할**: 이메일/비밀번호 로그인 화면.

**레이아웃**: 2열 그리드 (`minmax(310px, .92fr) / minmax(360px, 1fr)`)
- **왼쪽 (memory-panel)**: 진한 초록 배경, 브랜드 로고, 서비스 소개 문구, 더미 추억 카드 2개 (그리드 패턴 마스크 효과)
- **오른쪽 (form-panel)**: 이메일·비밀번호 입력, 로그인 버튼, 소셜 로그인(구글·카카오)

**폰트**: `Outfit` (Google Fonts, 300–900 웨이트)

**애니메이션**: `rise` (translateY + scale 0.98→1, 650ms)

---

### makerooms.html — 우정공간 목록 / 만들기

별도 문서인 `makerooms.md`를 참조하세요.

**주요 기능 요약**
- 방 목록 (최대 8개/페이지, 필터: 최신순·오래된 순·즐겨찾기)
- 새 게시글 unread 배지 (방 사진 우상단)
- 방 코드 입력 + 입장 버튼 (상단 툴바)
- 방 만들기 폼 → 초대 코드 생성

---

### memory_detail.html — 추억 게시글 상세 보기

**역할**: 추억 피드의 게시글 한 건을 전체 내용으로 보여주는 상세 페이지.

**URL 파라미터로 데이터 수신**
- `theme=dark|light` (다크모드 동기화)
- 제목, 날짜, 본문, 태그, 작성자 정보를 URL 또는 sessionStorage로 받아 렌더링

**UI 구성**
- 작성자 레이블 (내 기록 / 친구 이름)
- 날짜 (`detail-date`)
- 제목 (`font-size: 22px, font-weight: 700`)
- 본문 (`white-space: pre-wrap`, 카드 형태)
- 해시태그 목록 (`rgba(74,222,128,0.1)` 배경 필)
- 액션 버튼: 수정, 삭제, 닫기

**페이지 진입 애니메이션**: `fadeUp` (translateY 20px→0, 600ms)

---

### notification.html — 알림

**역할**: 서비스 공지와 친구 활동 알림을 탭으로 구분해 보여주는 독립 페이지.

**탭 구성**

| 탭 | 내용 |
|---|---|
| 📢 관리진 공지 | 서비스 업데이트, 기능 공지 (초록 왼쪽 보더 카드 형식) |
| 🔔 친구들 알림 | 친구의 게시글 작성, D-day 임박 등 활동 알림 |

- 활성 탭: `--primary-green` 배경 + 흰 글자
- 비활성 탭: 테두리만 있는 아웃라인 스타일
- 빈 상태: 가운데 정렬 아이콘 + 안내 문구 (`empty-state`)

---

### profile_edit.html — 개인정보 수정

**역할**: 프로필 아바타, 닉네임, 이메일, 비밀번호, 상태 메시지 등을 수정하는 독립 페이지.

**폰트**: `Inter` (Google Fonts)

**UI 구성**

| 섹션 | 내용 |
|---|---|
| 아바타 섹션 | 88px 원형 아바타 (그라디언트 배경), 하단 편집 배지(📷) |
| 기본 정보 카드 | 닉네임, 이메일, 상태 메시지 입력 폼 |
| 비밀번호 변경 카드 | 현재 비밀번호, 새 비밀번호, 확인 입력 |
| 계정 관리 카드 | 로그아웃, 계정 탈퇴 (danger 색상) |

- 읽기 전용 필드(`readonly`)는 시각적으로 구분되어 직접 편집 불가
- 저장 버튼 클릭 시 유효성 검사 후 처리

---

## 공유 인프라

### css/desktop.css

`index.html`이 외부 링크로 불러오는 공유 스타일시트입니다.

**포함 내용**
- CSS 변수 선언 (라이트/다크 전체 토큰)
- `.split-workspace` 레이아웃 (데스크톱/모바일 미리보기 분할)
- `.desktop-window`, `.mobile-window` 프레임
- 헤더, 내비게이션, 카드, 피드, 편지, 일정, 모달 등 모든 컴포넌트 스타일
- V5 씬 배너 관련 스타일 (sky, stars, mountains, clover-field, particles, balloons)

### js/desktop.js

`index.html`이 외부 링크로 불러오는 공유 스크립트입니다.

**포함 내용**
- Null Pointer Safe Patch (`document.getElementById` 래핑 — 존재하지 않는 ID 참조 시 더미 `div` 반환)
- 그룹 전환 상태 (`activeGroup`: `friend` / `family` / `study`)
- 피드 필터/월 상태 (`activeFeedFilter`, `activeFeedMonth`)
- 증거 슬라이드 인덱스, 일정 스포트라이트 상태
- `formatDdayText` 등 공통 유틸 함수

---

## 페이지 연결 흐름

```
login.html
    │
    └─► index.html  ──────────────────────────────────────────┐
            │  (탭 전환)                                        │
            ├── 우정공간 탭                                     │
            │       └── 방 목록 → makerooms.html                │
            ├── 추억피드 탭                                     │
            │       └── 게시글 클릭 → memory_detail.html        │
            ├── 행운편지 탭                                     │
            │       └── 편지 클릭 → letter_detail.html          │
            └── 알림 → notification.html                        │
                                                               │
        프로필 드롭다운 ──────────────────────────────────────┘
            ├── 그룹 변경 (모달, index.html 내)
            ├── 친구 초대코드 → invite.html
            ├── 개인정보 수정 → profile_edit.html
            └── 방 코드 접속 → join_room.html
```

---

## 독립 페이지 공통 특징

`index.html`을 제외한 나머지 페이지들은 공통적으로 아래 패턴을 따릅니다.

- **스타일 인라인 선언**: 외부 CSS 파일 없이 `<style>` 블록에 토큰과 컴포넌트를 모두 포함
- **단일 카드 레이아웃**: `max-width` 제한 (480px 또는 600px), `fadeUp` 등장 애니메이션
- **다크모드**: `?theme=dark|light` URL 파라미터 + `localStorage` 폴백
- **뒤로가기**: `goBack()` 또는 `✕ 닫기` 버튼으로 이전 화면 복귀
