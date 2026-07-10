# 🍀 Clov Web Design Repository

> Clov 프로젝트의 **화면 명세서·UI/UX 설계 문서**와 **동작하는 HTML 프로토타입**을 함께 관리하는 저장소입니다.

## 📖 목적

Clov는 "친구와의 약속을 함께 완성하고, 그 순간을 추억으로 남기는" 우정 기록 서비스입니다.
이 저장소는 두 가지 산출물을 담습니다.

1. **설계 문서** — 서비스 구조 원칙, 화면 명세서, 사용자 플로우, 컴포넌트 설계, 팀 작업 가이드
2. **프로토타입** — 프레임워크 없이 순수 HTML/CSS/JavaScript로 만든, 실제로 클릭·전환되는 화면(`test-web-design/`)

## 📂 저장소 구성

| 폴더 | 내용 |
|---|---|
| `test-web-design/` | 동작하는 HTML/CSS/JS 화면 프로토타입 (이 저장소의 핵심) |
| `screen-spec-source/` | 화면 명세서 소스 문서 (`00`~`09`) |
| `team-guides/` | 팀원·AI 에이전트 협업 작업 가이드 (`10`~`15`) |
| `work-logs/` | 팀원별 작업 내역 기록 |
| `CLAUDE.md` / `AGENTS.md` | AI 에이전트가 이 저장소에서 작업할 때 따르는 지침 |

## 🖥 화면 프로토타입 (`test-web-design/`)

순수 HTML/CSS/JavaScript 기반이며 **빌드 도구·프레임워크가 없습니다.** `file://`로 직접 열어도 되고, 정적 서버로 서빙해도 됩니다.

```
test-web-design/
├── 01-auth/          로그인 · 회원가입          (login.html, signup.html)
├── 02-main/          메인 앱 — 우정공간 허브 + 4탭 통합 (index.html)
├── 03-rooms/         우정공간 목록 · 만들기 · 초대 · 입장
├── 04-feed/          추억피드 단독 페이지
├── 05-letter/        행운편지 상세
├── 07-notification/  알림
├── 08-profile/       내 프로필 · 개인정보 수정
├── _archive/         구버전 보관 (수정하지 않음)
├── _docs/            작업 보고서 + 화면 명세서
└── assets/           공용 이미지·아이콘
```

**진입 흐름**: `01-auth/login.html` → `03-rooms/makerooms.html`(우정공간 선택) → `02-main/index.html`(허브)

**메인 앱(`02-main/index.html`)의 4개 탭**

- 🏠 **우정공간 대시보드** — 커버, 참여 멤버, 다가오는 약속(D-day) 배너
- 📸 **추억피드** — 월별 아카이브, 검색·정렬·필터, 폴라로이드 카드
- 💌 **행운편지** — 편지 상자
- 📅 **일정계획** — 약속 여정 + "인생4컷" 극장(제안→만남 4단계 인증)

우측 하단에는 마스코트 위젯(크로비 / 롭)이 상주하며, 사용자설정에서 캐릭터를 전환할 수 있습니다.

### 코드 구조 (`02-main/`)

2025-07-05 재편 이후 화면(탭) 단위로 파일이 나뉘어 있습니다. **프레임워크 도입 없이 JS 템플릿 문자열을 런타임에 주입**하는 패턴을 씁니다.

| 폴더 | 역할 |
|---|---|
| `styles/` | 화면별 CSS (`base` `space` `feed` `letter` `schedule`) — `index.html`이 로드 |
| `js/` | 로직 (`data` `utils` `space` `feed` `schedule` `nav` `init` …) |
| `pages/` | 탭별 마크업 주입 스크립트 (`*-page.js`) |
| `components/` | 공용 컴포넌트 (헤더·모달·프로필모달 등) |
| `css/`, `desktop.js` | 레거시 모놀리식 파일 — `04-feed/feed.html`만 참조 (보존용) |

> 상세한 폴더/파일 설명·작업 규칙은 [`test-web-design/README.md`](test-web-design/README.md)를 참고하세요.

### 디자인 토큰 (`02-main/styles/base.css`)

라이트는 아이보리·포레스트 그린, 다크는 "미드나잇 올리브" 팔레트입니다.

| 토큰 | 라이트 | 다크 |
|---|---|---|
| `--primary-green` | `#1b4332` | `#5a7a3e` |
| `--accent-green` | `#52b788` | `#9ccc65` |
| `--card-bg` | `#ffffff` | `#1e2016` |
| `--text-color` | `#2c3e35` | `#eef0e2` |

## 🧩 화면 명세 소스 (`screen-spec-source/`)

- `00-service-summary.md` — 서비스 개요와 핵심 구조 원칙
- `01-design-system.md` — 공통 디자인 시스템
- `02-dashboard-screen.md` — 우정공간 대시보드
- `03-memory-feed-screen.md` — 추억피드
- `04-lucky-letter-screen.md` — 행운편지
- `05-schedule-screen.md` — 일정계획
- `06-modal-and-interaction.md` — 공통 모달·인터랙션
- `07-user-flow.md` — 화면 간 사용자 흐름
- `08-data-and-state.md` — 데이터 구조·UI 상태
- `09-component-inventory.md` — 컴포넌트 인벤토리

## 🧭 팀 작업 가이드 (`team-guides/`)

- `10-merge-plan.md` — HTML 기준본 병합 계획
- `11-claude-prompt-template.md` — Claude 프롬프트 템플릿
- `12-ai-agent-team-workflow.md` — AI 에이전트 작업 흐름
- `13-gemini-prompt-recipes.md` — Gemini 프롬프트 레시피
- `14-html-prototype-review-checklist.md` — HTML 검수 체크리스트
- `15-ai-design-work-guide.md` — AI 디자인 작업 실전 절차

## 🧷 핵심 서비스 원칙

화면·문서를 수정할 때 아래 원칙은 임의로 바꾸지 않습니다.

- 우정공간은 **최대 8명이 참여하는 단일 구조**이며, 1:1 전용/1:N 전용으로 나누지 않는다.
- 방장·대표자·관리자 같은 **특별 권한 개념을 두지 않는다** — 모든 멤버는 동등하다.
- 핵심 흐름은 **약속 완료 → 추억 작성**으로 이어지며, 같은 약속을 친구별로 다른 관점에서 기록할 수 있다.

## 📝 작업 기록

- 최신 작업 로그: `test-web-design/_docs/`(날짜별 진행 기록)
- 팀원별 내역: `work-logs/`

---

Team Leader : myeongjundev
