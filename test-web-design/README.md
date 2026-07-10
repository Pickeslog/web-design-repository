# 🍀 Clov — 화면 작업 폴더 구조

> 각 폴더 = 하나의 화면 파트 = 담당자 1명

---

## 폴더 구조

```
test-web-design/
├── 01-auth/          로그인 + 회원가입
├── 02-main/          메인 앱 (우정공간 허브, 4탭 통합)
├── 03-rooms/         우정공간 목록 / 만들기 / 초대
├── 04-feed/          추억피드 (독립 페이지)
├── 05-letter/        행운편지 상세
├── 07-notification/  알림
├── 08-profile/       내 프로필 / 개인정보 수정
├── _archive/         구버전 보관 (건드리지 않음)
└── _docs/            작업 보고서 + 화면 명세서
```

---

## 파트별 파일 목록

| 폴더 | HTML 파일 | 상태 |
|---|---|---|
| `01-auth/` | `login.html`, `signup.html` | ✅ 완성 + 연결됨 |
| `02-main/` | `index.html` + `css/` `js/` | ✅ 완성 + 연결됨 |
| `03-rooms/` | `makerooms.html`, `invite.html`, `join_room.html` | ✅ 완성 + 연결됨 |
| `04-feed/` | `feed.html`, `memory_detail.html` | ✅ 완성 + 연결됨 |
| `05-letter/` | `letter_detail.html` | ✅ 완성 + 연결됨 |
| `07-notification/` | `notification.html` | ✅ 완성 + 연결됨 |
| `08-profile/` | `profile_edit.html` | ✅ 완성 + 연결됨 |

> 일정계획은 별도 폴더 없이 `02-main/index.html` 내부 탭(인생4컷)으로만 존재한다. 과거 독립 캘린더 페이지(`06-schedule/schedule.html`)는 실제 구현과 컨셉이 갈라져 사용되지 않았으므로 `_archive/schedule/`로 이동했다.

---

## 전체 화면 흐름

```
[01-auth] login.html
    │  로그인 성공
    ▼
[01-auth] signup.html ──(가입 완료)──▶ login.html
    │  (회원가입 링크)
    │
    ▼ (로그인 성공)
[03-rooms] makerooms.html
    │  방 카드 클릭 / 코드 입장
    ▼
[02-main] index.html  ◀──────────────────────────────┐
    │                                                  │
    ├──[📸 추억피드 탭]── 04-feed/memory_detail.html ──┤
    ├──[💌 행운편지 탭]── 05-letter/letter_detail.html ┤
    ├──[📅 일정계획 탭]── index.html 내부 (인생4컷)     │
    ├──[🔔 알림]──────── 07-notification/notification.html
    ├──[개인정보 수정]──── index.html 내부 모달 ┘
    └──[로그아웃]──────── 01-auth/login.html

[04-feed] feed.html  (피드 단독 뷰 — makerooms에서도 진입 가능)
    └──[← 방 목록]──── 03-rooms/makerooms.html
```

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

---

## 작업 규칙

1. **자기 파트 폴더만 수정** — 다른 폴더 파일은 건드리지 않는다
2. **`_archive/` 건드리지 않음** — 구버전 참고용이지 작업 폴더 아님
3. **공통 CSS/JS 수정 필요 시** — 팀장에게 먼저 알린다 (`02-main/styles/`, `02-main/js/`, `02-main/components/`)
4. **각 HTML 파일 옆에 같은 이름의 `.md` 파일** — 화면 명세서 작성 시 활용

---

## 문서 위치

- 화면 명세서 소스: `../screen-spec-source/`
- 팀 작업 가이드: `../team-guides/`
- 작업 보고서·진행 기록: `_docs/`(날짜별)
