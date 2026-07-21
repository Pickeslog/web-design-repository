# 2026-07-21 오전 준비 — M2 도메인 팬아웃

> 기준: `2026-07-20-day-summary.md`, `2026-07-20-governance-codex-review.md`,
> `docs/API-CONTRACT.md`, `docs/DOMAIN-NAMING-REGISTRY.md`,
> `docs/AI-TEAM-HARNESS.md`, `team-guides/16-onboarding-first-pr.md`.

## 0. 현재 결론

- 2026-07-20 기준 governance 이슈 A~D 완료, E는 **User 현 위치 유지**로 결정.
- `clov-api`/`clov-web` 모두 main 보호와 CI required 적용 완료 상태로 기록됨.
- 팀원 3명 온보딩 PR 완주. M2 도메인 팬아웃 시작 가능.
- 팀 로스터: chacha1650a=Claude, kimgyubi1234=Gemini, lami2342=Claude.
- 최신 하루 요약은 clov-api PR #18 머지 완료로 기록되어 있다. 이전 핸드오프 문서의 "PR #18 머지 대기"는 stale로 본다.

## 1. 오전 첫 결정

**추천 결정: M2는 세로슬라이스 기준으로 맡긴다.**

이유:
- 한 사람이 백엔드+프론트 맥락을 같이 잡아 PR 설명과 QA가 단순해진다.
- 온보딩에서 이미 브랜치 -> PR -> CI -> 리뷰 -> 머지 흐름을 경험했다.
- 프론트/백을 나누면 비전공 팀원에게 대기와 핸드오프가 늘어난다.

단, 어려운 동시성/잠금 로직은 리더가 직접 맡거나 리뷰 강도를 올린다.

## 2. 오전 추천 배정

| 우선순위 | 담당 후보 | 도메인 | 범위 | 난이도/주의 |
|---|---|---|---|---|
| 1 | 리더/Codex | `room` 일부 | §6 공간 생성/목록/상세의 골격 | 다른 도메인의 `roomId` 기반. 먼저 뚫으면 팀원 작업이 쉬워짐 |
| 2 | chacha1650a | `letter` | §11 행운편지 발송/받은함/보낸함/읽음/즐겨찾기 | 비교적 독립적. `letter_favorites` 포함 |
| 3 | kimgyubi1234 | `notification` | §13 알림 목록/읽음/전체읽음 | 단순 CRUD성. 레지스트리 담당이 리더라 실제 배정 시 담당표 갱신 필요 |
| 4 | lami2342 | `plan` 기본 | §8 약속 CRUD + §9 checklist 기본 | stage-photo 잠금은 어려우므로 별도 이슈로 분리 권장 |
| 5 | 리더/Codex | `invite` | §7 초대/가입신청/수락/거절/5분 undo | 낙관적 락과 경합 처리. 팀원 첫 이슈로는 무거움 |

보류:
- `memory` §10은 FREE MEMORY(`planId NULL`) 생성 엔드포인트가 미확정이다. 먼저 `POST /rooms/{roomId}/memories` 등 리더 결정을 확정하고 계약을 갱신한 뒤 배정한다.
- `exp/mascot` §12는 `room` 기반 서버 계산이므로 `room` 골격 후 착수한다.

확인 필요:
- clov-web collaborator `code1218` 신원이 필요하면 확인한다.

## 3. 오늘 오전 체크리스트

1. GitHub에서 양쪽 repo ruleset의 `build` required 유지 확인.
2. M2 담당 방식을 "세로슬라이스"로 공지.
3. 레지스트리 §2 담당표를 실제 이름으로 갱신할지 결정.
4. M2 이슈를 작게 생성: `room-core`, `letter`, `notification`, `plan-core`, `invite`.
5. 각 이슈 본문에 계약 §번호, 레지스트리 행, 완료 기준, PR 첫 줄 `Closes #N` 규칙을 넣는다.
6. memory FREE MEMORY 엔드포인트를 리더 결정으로 확정할 때까지 memory 구현 이슈는 열지 않는다.

## 4. M2 이슈 본문 템플릿

```md
## 범위
- 도메인: `<domain>`
- 계약: `web-design-repository/docs/API-CONTRACT.md` §<N>
- 이름: `web-design-repository/docs/DOMAIN-NAMING-REGISTRY.md` §2 `<domain>` 행
- 화면/프론트: 레지스트리의 page/component, api module, query key 기준

## 구현
- 백엔드: controller/service/mapper/dto/entity를 auth 슬라이스 패턴에 맞춘다.
- 프론트: 기존 `client.js`/auth store/Query 패턴을 재사용한다.
- 공통 응답 봉투, 인증, DB DDL, 시크릿, 새 axios client는 건드리지 않는다.

## 완료 조건
- 계약의 경로/요청/응답/에러 코드와 JSON ID 문자열화가 맞다.
- 레지스트리의 패키지/클래스/파일/API 모듈/query key 이름만 사용한다.
- 로컬 검증: API `./gradlew.bat test`, Web `npm run lint && npm run build`.
- PR 본문 첫 줄에 `Closes #<이슈번호>`를 넣는다.
- PR에는 변경/검증/남은 점을 적고 CI `build` 초록 후 리뷰 요청한다.

## 주의
- `role`, 방장, 관리자 개념을 만들지 않는다.
- MyBatis는 `#{}`만 사용하고 JPA를 추가하지 않는다.
- 무관한 파일이나 다른 이슈 변경을 섞지 않는다.
```

## 5. 팀원에게 붙여넣을 공통 시작 프롬프트

```text
작업 전 대상 레포의 AGENTS.md(Claude면 CLAUDE.md),
web-design-repository/docs/AI-TEAM-HARNESS.md, DOMAIN-NAMING-REGISTRY.md,
CODE-CONVENTION.md와 관련 API 계약 §번호를 읽어.

이슈 #N의 M2 도메인 세로슬라이스를 구현해.
auth 슬라이스를 구조 그대로 참고하고 이름은 레지스트리 확정값만 써.
공통 ApiResponse, client.js, authStore, 기존 Query 패턴은 재사용해.
계약, DB DDL, 시크릿, 새 공통 클라이언트는 바꾸지 마.

막히면 원인을 Java/DB/의존성/계약불명 중 하나로 구분해 보고하고,
작업 후 git diff와 필수 검증 결과를 변경/검증/남은 점 세 줄로 보고해.
PR 본문 첫 줄에는 반드시 Closes #N을 넣어.
```
