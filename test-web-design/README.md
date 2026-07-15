# 🍀 Clov — 화면 프로토타입 & 명세서

> "약속이 추억으로 자라는 친구 전용 기록공간"
> 순수 HTML/CSS/JS 프로토타입 + 화면 명세서. 각 폴더 = 하나의 화면 파트.
> **최종 갱신**: 2026-07-10 (화면 명세서 전면 재작성 완료)

---

## 📄 화면 명세서 체계 (2계층)

명세서는 **"왜/구조"를 담는 마스터**와 **"현재 구현 상세"를 담는 화면별 문서** 두 층으로 나뉜다. 세부 스펙은 **화면별 문서가 우선**이고, 마스터는 링크로 화면별을 가리킨다.

| 층 | 위치 | 성격 | 기준 |
|---|---|---|---|
| **마스터** | `../screen-spec-source/00~09` | 서비스 원칙·디자인 시스템·흐름·데이터·컴포넌트 (왜/구조) | 개념 유지 + 현재 구현 반영 + 화면별 링크 |
| **화면별** | 각 HTML 옆 같은 이름 `.md` | 화면 하나의 실제 동작 상세 | **현재 구현 기준** (이쪽 우선) |

- 화면별 문서는 **9섹션 표준 템플릿**으로 작성한다: ① 목적 ② 진입·이탈 ③ 레이아웃 스케치 ④ 컴포넌트 표 ⑤ 액션·상태 전이 ⑥ 데이터·저장 ⑦ 예외·경계 ⑧ 반응형·테마 ⑨ 관련 화면.
- 마스터 ↔ 화면별 링크는 상대경로(`../test-web-design/...`)로 연결돼 있다.

---

## 폴더 구조

```
test-web-design/
├── 01-auth/          로그인 + 회원가입
├── 02-main/          메인 앱 (우정공간 허브, 4탭 통합)
├── 03-rooms/         우정공간 목록 / 만들기 / 초대 / 입장
├── 04-feed/          추억피드 (독립 페이지)
├── 05-letter/        행운편지 상세
├── 07-notification/  알림
├── 08-profile/       사용자설정 (개인정보 + 테마)
├── _archive/         구버전 보관 (건드리지 않음)
└── _docs/            작업 보고서 + 진행 기록 (날짜별)
```

---

## 화면별 파일 + 명세서

| 폴더 | HTML | 화면별 명세서 `.md` | 다루는 화면 |
|---|---|---|---|
| `01-auth/` | `login.html` · `signup.html` | `login.md` · `signup.md` | 로그인(자동로그인·간편로그인·성공 오버레이) / 회원가입 5단계 위저드 |
| `02-main/` | `index.html` (+ `styles/` `js/` `pages/` `components/`) | `index.md` | 앱 셸 + 우정공간 대시보드 + 일정계획(인생4컷) |
| `03-rooms/` | `makerooms.html` · `invite.html` · `join_room.html` | `makerooms.md` · `invite.md` · `join_room.md` | 방 목록(보딩패스·입장 스탬프) / 초대 / 코드 입장→가입 신청 |
| `04-feed/` | `feed.html` · `memory_detail.html` | `feed.md` · `memory_detail.md` | 추억피드(검색·정렬·사진 모아보기) / 추억 여권(MEMORY PASSPORT) 상세 |
| `05-letter/` | `letter_detail.html` | `letter_detail.md` | 행운편지 상세(작성은 `02-main` 인라인 폼) |
| `07-notification/` | `notification.html` | `notification.md` | 알림(가입 신청 수락·5분 되돌리기·거절, 친구 알림, 공지) |
| `08-profile/` | `profile_edit.html` | `profile_edit.md` | 사용자설정(테마 스와치·물감 커스텀 색·바탕화면 아이콘) |

> **일정계획**은 별도 폴더 없이 `02-main/index.html` 내부 탭(인생4컷)으로만 존재한다 → `index.md`에 포함. 과거 독립 캘린더 페이지(`06-schedule/`)는 컨셉이 갈라져 `_archive/schedule/`로 이동했다.
> `07-notification`·`08-profile`은 실제로는 `02-main` 헤더의 모달로 동작하고, 각 단독 HTML은 참고용이다.

---

## 전체 화면 흐름

```
[01-auth] login.html
    │  accessToken 있으면 로그인 화면 건너뜀 → 바로 방 선택
    │  회원가입 링크 → signup.html ──(가입 완료)──▶ login.html
    ▼ (로그인 성공 · 성공 오버레이)
[03-rooms] makerooms.html
    │  방 카드 클릭(입장 스탬프 연출) / 코드 입장 / 새 공간 만들기
    │  코드 입장 → join_room.html → 가입 신청(clov_joinRequests)
    │             → 알림에서 멤버 1명 수락 시 입장 확정
    ▼
[02-main] index.html  ◀──────────────────────────────────┐
    │  헤더: 🔔 알림 · 다크모드 · 설정 · 로그아웃            │
    ├──[📸 추억피드]──── 04-feed/memory_detail.html ───────┤
    ├──[💌 행운편지]──── 05-letter/letter_detail.html ─────┤
    ├──[📅 일정계획]──── index.html 내부 (인생4컷 · 영수증) │
    ├──[🔔 알림]──────── 모달 (가입 신청 수락/되돌리기)      │
    ├──[⚙️ 사용자설정]── 모달 (개인정보 + 테마)            │
    └──[로그아웃]──────── 01-auth/login.html

[04-feed] feed.html  (피드 단독 뷰 — makerooms에서도 진입 가능)
    └──[← 방 목록]──── 03-rooms/makerooms.html
```

> 화면을 가로지르는 여정 상세는 `../screen-spec-source/07-user-flow.md` 참고.

---

## 공통 디자인 토큰 (`02-main/styles/base.css`)

라이트는 아이보리·포레스트 그린, 다크는 "미드나잇 올리브" 팔레트.

| 토큰 | 라이트 | 다크 |
|---|---|---|
| `--primary-green` | `#1b4332` | `#5a7a3e` |
| `--accent-green` | `#52b788` | `#9ccc65` |
| `--btn-primary-bg` | `#357a58` | (base.css 참조) |
| `--card-bg` | `#ffffff` | `#1e2016` |
| `--text-color` | `#2c3e35` | `#eef0e2` |
| `--level-accent` | 레벨별 진화 | 레벨별 진화 |

> 솔리드 초록 CTA는 `--btn-primary-bg`로 통일. 약속 여정 영수증(크림 종이)·행운편지 편지함은 **다크에서도 라이트 유지**(가독성·감성). 자세한 토큰/패턴은 `../screen-spec-source/01-design-system.md`.

---

## 작업 규칙

1. **자기 파트 폴더만 수정** — 다른 폴더 파일은 건드리지 않는다.
2. **`_archive/` 건드리지 않음** — 구버전 참고용이지 작업 폴더 아님.
3. **공통 CSS/JS 수정 필요 시** — 팀장에게 먼저 알린다 (`02-main/styles/`, `02-main/js/`, `02-main/components/`, `02-main/pages/`).
4. **각 HTML 파일 옆의 같은 이름 `.md`** = 화면별 명세서. 화면을 바꾸면 이 문서도 **9섹션 템플릿**에 맞춰 갱신한다.
5. **화면 세부는 화면별 `.md` 우선**, 마스터(00~09)는 원칙·구조·링크만. 낡은 개념(Clover Growth Path 등)은 화면별 최신 내용으로 덮어쓴다.

---

## 문서 위치

- **화면별 명세서**: 각 화면 폴더의 `*.md` (현재 구현 기준, 우선)
- **마스터 명세서**: `../screen-spec-source/00~09` (원칙·디자인시스템·흐름·데이터·컴포넌트)
- **팀 작업 가이드**: `../team-guides/` — 프롬프트 템플릿(11)·워크플로우(12)·검수 체크리스트(14)·디자인 절차(15)
- **작업 보고서·진행 기록**: `_docs/` (날짜별)

---

## 다음 단계 — 와이어프레임 뽑기

화면별 `.md`는 **③ 레이아웃 스케치 + ④ 컴포넌트 표 + ⑤ 상태 전이**를 담고 있어 와이어프레임 입력으로 바로 쓸 수 있다.

- 한 번에 **한 화면**만: `00-service-summary` + `01-design-system` + 그 화면의 `.md` (모달 많으면 `06-modal-and-interaction`)를 넣는다.
- 저충실도(회색 박스) 기준, 데스크톱/모바일 + 상태별 프레임으로 요청한다.
- 프롬프트 형식은 `../team-guides/11-claude-prompt-template.md` 참고.
