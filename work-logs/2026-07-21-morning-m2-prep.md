# 2026-07-21 오전 준비 — M2 도메인 팬아웃 (리더 결정 확정)

> **상태**: 리더 결정 확정(2026-07-21). 이 문서 = **결정 요약·체크리스트**.
> 팀원별 실행 상세·복붙 프롬프트는 → [`2026-07-21-M2-착수-프롬프트.md`](2026-07-21-M2-착수-프롬프트.md).
> 기준: `2026-07-20-day-summary.md` · `2026-07-20-governance-codex-review.md` · `docs/API-CONTRACT.md` · `docs/DOMAIN-NAMING-REGISTRY.md`.
>
> ⚠️ **개정 이력**: 이 문서 초안(세로슬라이스 추천·lami=plan·memory 보류)은 리더 결정으로 **도메인별 혼합·lami=memory 축소·FREE MEMORY 확정**으로 대체됨.

## 0. 현재 결론

- governance 이슈 A~E 완료(E = **User 현 위치 유지**). `clov-api`·`clov-web` 양쪽 main 보호 + CI `build` required.
- 팀원 3명 온보딩 PR 완주. **clov-api PR #18 머지 완료**(Testcontainers). M2 팬아웃 시작 가능.
- 팀 로스터: 리더(Codex=백 / Claude=프론트·감사) · chacha1650a=Claude · kimgyubi1234=Gemini · lami2342=Claude.
- ✅ **FREE MEMORY 확정**: `POST /rooms/{roomId}/memories`(`plan_id` NULL). 계약 §10 반영 완료.

## 1. 오전 첫 결정 (확정)

**M2 슬라이스 형태 = 도메인별 혼합.**

- **쉬운 도메인**(letter §11 · notification §13 · 축소 memory §10) = 비전공 **세로 통째**(auth 골든레퍼런스 복사). 핸드오프·대기 최소, PR·QA 단순.
- **어려운·기반 도메인**(room §6 · invite §7 · plan §8) = **백/프론트 분리**. 백엔드를 **리더가 선행** → 프론트는 R2에서 비전공에 분배.
- 근거: 비전공은 세로슬라이스의 단순함을 유지하고, 동시성·잠금(낙관적 락·stage 잠금)은 리더가 흡수한다.

## 2. 배정 (확정 — 레지스트리 §2 실명 반영 완료)

| R | 담당 | 도메인 | 범위 | 방식 |
|---|---|---|---|---|
| R1 | **리더/Codex** | room §6 (+exp/mascot §12) | 생성/목록/상세 골격 — **최우선**(모든 도메인의 `roomId` 부모) | 백엔드 선행 |
| R1 | **chacha1650a** | letter §11 | 발송/받은·보낸함/읽음/즐겨찾기 | 세로 통째 |
| R1 | **kimgyubi1234** | notification §13 | 목록/읽음/전체읽음 (생성 API 없음) | 세로 통째 |
| R1 | **lami2342** | memory §10 (축소) | 작성/피드/상세 — **이미지·댓글은 R2** | 세로 |
| R1 | **리더/Codex** | user §5 | `/users/me`·preferences (User=auth 재사용) | 세로(백 Codex/프론트 Claude) |
| R1 | **리더/Codex** | invite §7 · plan §8 (+§9) | 백엔드 선행(낙관적 락·stage 잠금) | 백만, 프론트 R2 |

**R2**: invite·plan·room의 **프론트**를 비전공 3명에 분배 + memory **이미지 업로드·댓글**.

**보류/주의**
- `exp/mascot` §12는 room-scoped 서버 계산 → room 골격 후 착수(별도 분리 안 함).
- clov-web collaborator `code1218` 신원 필요 시 확인.

## 3. 오늘 오전 체크리스트

1. GitHub 양쪽 repo ruleset의 `build` required **유지 확인** (clov-api PR #18 머지 후 재확인 — 한 번 사라진 이력).
2. ✅ M2 담당 방식 = **도메인별 혼합** 확정.
3. ✅ 레지스트리 §2 담당표 **실명 갱신 완료**.
4. M2 이슈 작게 생성: `room-core` · `letter` · `notification` · `memory-core(축소)` · `user` + `invite`/`plan` 백엔드. 본문 = 착수 프롬프트.
5. 각 이슈에 계약 §번호 · 레지스트리 행 · 완료 조건 · PR 첫 줄 `Closes #N` 규칙.
6. ✅ FREE MEMORY 확정 → memory(축소) 배정 가능(더 이상 보류 아님).

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

이슈 #N에 배정된 M2 도메인 슬라이스를 구현해.
auth 슬라이스를 구조 그대로 참고하고 이름은 레지스트리 확정값만 써.
공통 ApiResponse, client.js, authStore, 기존 Query 패턴은 재사용해.
계약, DB DDL, 시크릿, 새 공통 클라이언트는 바꾸지 마.

막히면 원인을 Java/DB/의존성/계약불명 중 하나로 구분해 보고하고,
작업 후 git diff와 필수 검증 결과를 변경/검증/남은 점 세 줄로 보고해.
PR 본문 첫 줄에는 반드시 Closes #N을 넣어.
```
