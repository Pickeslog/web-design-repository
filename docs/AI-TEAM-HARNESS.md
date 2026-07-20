# AI Team Harness (정본 · SSOT)

이 문서는 Codex, Claude Code, Gemini 등 어떤 AI 에이전트를 쓰더라도 같은 작업
경계·입력 문서·검증 기준을 따르기 위한 **공통 하네스이자, 협업·워크플로우의
정본(canonical)**이다. 기존 `WORKFLOW.md`(슬라이스 라이프사이클)와
`AI-협업-운영규칙.md`(2-AI 루프)는 이 문서로 **흡수·통합**됐다(두 파일은 포인터만 남김).

> 근거 SSOT: [`API-CONTRACT.md`](API-CONTRACT.md) · [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md) · 화면 명세(`../test-web-design/*/*.md`)
> 이름 확정: [`DOMAIN-NAMING-REGISTRY.md`](DOMAIN-NAMING-REGISTRY.md) · 코드 규약: [`CODE-CONVENTION.md`](CODE-CONVENTION.md)

---

## 0. 팀 구성과 repo 경계

| 에이전트/사람 | 담당 | 산출물 |
|---|---|---|
| **Codex** | `clov-api` 백엔드 구현 | 동작하는 PR + 초록 CI |
| **Claude Code** | `clov-web` 이관 + `web-design-repository` 감사·리뷰(읽기) | 이관 PR·감사 리포트·리뷰 승인 |
| **Gemini + 팀원 2명** | M2 도메인 세로슬라이스 팬아웃 | 도메인 PR |
| **리더** | SSOT(계약·DB) 변경, 최종 머지 | 승인·머지 |

```
계약(SSOT) ─── 모든 에이전트가 함께 읽는 단일 진실
   ├─▶ Codex   : clov-api 구현 ──▶ PR ──▶ 리뷰(계약 기준) ──▶ 머지
   └─▶ Claude  : clov-web 이관 + PR을 머지 전 계약 기준으로 감사
```

- **한 에이전트 = 한 repo = 한 폴더.** 두 repo가 물리적으로 분리(`clov-api`/`clov-web`)돼 파일 충돌이 원천 봉쇄된다.
- `-collaboration` 폴더는 병합 완료된 잉여 클론 — **열지 않는다.**
- 핵심 명제: **효율은 능력이 아니라 "경계"와 "인수인계"에서 갈린다.** 마찰의 두 원인 = ① 같은 파일을 둘이 건드림 ② 서로의 작업 맥락 단절.

**역할 대체(fallback) — 담당은 기본값이지 고정이 아니다.** 토큰 예산·에이전트 가용성·긴급도에 따라 한 에이전트가 다른 영역을 **대신 맡을 수 있다**(예: Codex가 막히거나 토큰상 Claude가 이미 맥락을 쥐고 있으면 Claude가 백엔드 슬라이스를 처리). 대체 시 지키는 것:

- **"한 명이 짜면 다른 명이 검증"(§4) 게이트 유지** — 구현자와 리뷰어가 같아지면 **리더가 리뷰**한다.
- **한 에이전트 = 한 폴더**, 워킹트리 정리(§2) 규칙은 그대로.
- 대체를 쓴 이유(토큰·가용성·긴급)를 PR/`work-logs`에 남긴다.
- **test/CI·인프라·문서 정합성 작업은 도메인 feature가 아니므로 누가 하든 무방**(경계 예외).

## 1. SSOT와 읽는 순서

작업 전 아래 순서로 읽는다.

1. 대상 레포의 `AGENTS.md`(Claude면 `CLAUDE.md`)
2. `docs/API-CONTRACT.md`와 연결된 API 계약 SSOT
3. `api-spec/05-db-unified-final.md` (DB를 읽거나 API 데이터를 다룰 때)
4. `docs/DOMAIN-NAMING-REGISTRY.md`(이름) · `docs/CODE-CONVENTION.md`(규약)
5. 담당 화면 명세와 최근 `work-logs/`
6. GitHub 이슈 본문과 기존 유사 코드

충돌 시 우선순위: **계약/DB SSOT → 리더 승인 → 화면 명세 → 이슈 → 기존 코드.**
계약과 DB 스키마는 이슈·승인 없이 바꾸지 않는다.

## 2. 작업 단위

- **이슈 1개 = 브랜치 1개 = 집중된 PR 1개**(작게 유지).
- 브랜치: `feat/<issue>-<topic>`, `fix/<issue>-<topic>`, `chore/<topic>`.
- **`main`에 직접 커밋하지 않는다.**
- 다른 사람이 수정 중인 파일·공통 설정·마이그레이션은 병렬 수정하지 않는다. 범위를 나누거나 이슈 코멘트로 먼저 조율한다.
- 작업 전 기존 변경을 확인한다. 본인이 만들지 않은 변경은 되돌리거나 섞어서 커밋하지 않는다.
- **작업이 끝나면 워킹트리를 커밋/스태시로 비운다.** 미커밋으로 두면 브랜치 전환·다른 에이전트·폴더 정리가 그걸 날린다(2026-07-20 stash 사건의 교훈).

## 3. 한 슬라이스 라이프사이클 (이슈 → 머지 → 클로즈)

```
이슈 선택 → 브랜치 생성 → (AI 프롬프트로) 구현 → 로컬 검증(lint/build/test)
  → PR(Closes #N) → CI 초록 → 리뷰(계약·레지스트리 기준) → squash 머지 → 브랜치 삭제 → 이슈 자동 클로즈
```

1. **이슈 선택** — 레지스트리 §2에서 본인 담당 이슈 하나. 본문의 "확정 이름·완료 기준·반드시 지킬 것"을 읽는다. **이름은 레지스트리에서만.**
2. **브랜치** — `git checkout main && git pull --ff-only` → `git checkout -b feat/<#>-<topic>`.
3. **구현** — auth 슬라이스를 구조 그대로 복사, 이름만 레지스트리 확정값으로 치환(§9 프롬프트 블록).
4. **로컬 검증(PR 전 필수)** — 웹 `npm run lint && npm run build` / 백 `./gradlew.bat test`(로컬 DB) 또는 최소 컴파일. `git status`로 무관한 변경이 섞이지 않았는지 확인.
5. **PR 생성** — `git push -u origin feat/<#>-<topic>`. PR 본문 첫 줄에 **`Closes #<이슈번호>`**. 템플릿 체크리스트(레지스트리 준수·공통 재사용·무관 변경 없음·검증 실행)를 채운다.
6. **리뷰** — CI 초록이어야 리뷰로 넘어간다. 리뷰어(리더/Claude)가 §7 게이트로 확인.
7. **머지 & 클로즈** — `gh pr merge <PR#> --repo <owner/repo> --squash --delete-branch`. `Closes #N`이 이슈를 자동 클로즈.
   - ⚠️ **머지는 사람이 실행한다.** Claude Code 자동승인 분류기가 `gh pr merge`를 차단하므로 리뷰까지는 AI, 머지 버튼은 리더가 누른다.
8. **다음** — `git checkout main && git pull`로 최신화 후 다음 이슈로.

## 4. "한 명이 짜고, 한 명이 검증한다" (최고 레버리지)

구현자가 PR을 열면 **머지 전에 리뷰어가 계약 기준으로 검증**한다. 팀의 지뢰를 머지 전에 잡는 게 핵심.

```
구현(Codex/팀원): 이슈 → PR
   └─ 리뷰(리더/Claude): API-CONTRACT.md·05-db·레지스트리 기준 검토 → 위반 시 코멘트
        └─ 구현자: 수정 → 승인 → (리더가) 머지
```

인수인계는 사람의 기억이 아니라 **영속 아티팩트**로 한다 — GitHub 이슈·PR·`work-logs/`가 공유 메모리. 발견·결정은 그때그때 남겨 다음 에이전트가 읽게 한다.

## 5. 공통 금지 사항

- 실제 시크릿·`.env`·`application-secret.yaml`·토큰·비밀번호를 코드·PR·이슈·로그·테스트 데이터에 넣지 않는다. (두 repo 모두 **public**)
- API 계약·DB DDL·공통 응답 봉투·인증 방식·의존성을 임의로 변경하지 않는다.
- API에 JPA를 추가하지 않는다 — MyBatis + `#{}` 바인딩만(`${}` 금지).
- `role`·방장·관리자 개념을 만들지 않는다. 인가는 계약 §3을 따른다.
- 프론트 컴포넌트에서 직접 HTTP 호출하거나 두 번째 API 클라이언트/토큰 저장소를 만들지 않는다.

## 6. AI 에이전트 작업 절차

1. 이슈와 필수 문서를 읽고, 작업 범위·완료 기준을 한 문장으로 정리한다.
2. 기존 유사 구현을 검색해 이름·폴더·테스트 패턴을 따른다.
3. 필요한 최소 파일만 수정한다. 요구되지 않은 리팩터링은 분리 이슈로 남긴다.
4. 대상 레포의 검증 명령을 실행한다 — API `./gradlew.bat test`, Web `npm run lint`·`npm run build`.
5. `git diff`와 `git diff --check`로 변경 범위를 검토한다.
6. 커밋·PR에 이슈 번호를 연결하고, 완료는 아래 형식으로 보고한다.

```text
- 변경: 핵심 변경 파일과 동작
- 검증: 실행한 명령과 결과
- 남은 점: 미검증 항목 또는 외부 의존성 (막히면 원인을 Java/DB/의존성 등으로 구분)
```

## 7. 리뷰 게이트 (머지 전)

리뷰어는 머지 전 다음을 확인한다.

- 계약의 경로·요청/응답·에러 코드·JSON ID 문자열화가 맞는가
- DB 컬럼/SQL/MyBatis mapper가 계약과 맞는가
- 새 이름·폴더가 `DOMAIN-NAMING-REGISTRY.md`·`CODE-CONVENTION.md`와 인접 코드 패턴을 따르는가(새 구조·이름을 지어내지 않았는가)
- 시크릿·토큰·비밀번호·개인정보가 없는가
- 불필요한 파일·다른 이슈 변경이 섞이지 않았는가
- 요구된 테스트와 린트/빌드 결과가 첨부됐는가

**즉시 리젝 대상 계약 지뢰**: ❌`role` 컬럼/claim · ❌ base path `/api/v1` 누락 · ❌ 시크릿 커밋 · ❌ JPA 혼입(`@Entity`/`JpaRepository`) · ❌ SQL `${}` · ✅ 봉투 `{success,data}`/`{success,error{code,message}}` · ✅ ID JSON 문자열.

## 8. 단계별 병렬화

| 단계 | 백엔드(Codex) | 프론트(Claude) | 병렬? |
|---|---|---|---|
| M0 기반 | #2 DB → #3 봉투 → #4 Security/JWT | 각 PR 리뷰 + 계약 감사 | 순차 + 리뷰 |
| M1 스켈레톤 | #5 OAuth · #6 Auth | web #2 셸 · #3 로그인 연동 | 부분 병렬(api 선행) |
| M2 도메인 | api 도메인 슬라이스 | web 화면 이관 | **완전 병렬(팀원 팬아웃)** |

**팬아웃 시작 기준**: 로그인 워킹 스켈레톤이 프론트→API→DB까지 관통하고, 대표 PR의 구조·리뷰 기준이 확인된 뒤 M2 도메인을 병렬로 나눈다(현재 관통 검증 완료 → 팬아웃 OK). 그 전에는 환경 구축·문서 정합성·QA 외의 기능 코딩을 시작하지 않는다.

**main 보호 현황(2026-07-20)**: 양쪽 repo ruleset `Protect main` **active**(직접 push 금지·PR 필수). **CI required-check는 설정 예정**(clov-api·clov-web CI 초록화 완료 후 required로 승격 — A 후속 작업).

## 9. 충돌 방지 실무 규칙 + 공통 시작 프롬프트

1. **스켈레톤은 순차, 팬아웃은 병렬.** 로그인 관통 완성 전엔 한 방향으로.
2. **작업 끝나면 워킹트리를 비운다**(커밋/스태시).
3. **한 에이전트당 한 폴더.** `-collaboration` 폴더는 열지 않는다.
4. **계약은 SSOT 1곳만 수정.** 스펙 충돌은 코드부터 고치지 말고 `web-design-repository`의 계약을 먼저 고치고 양쪽이 따르게 한다.
5. **막히면 원인을 구분해 보고**(Java/DB URL/의존성 등) — 다음 에이전트가 같은 삽질을 안 하게.

작업 요청 첫 부분에 아래 블록을 붙인다.

```text
작업 전 대상 레포의 AGENTS.md(Claude면 CLAUDE.md),
web-design-repository/docs/AI-TEAM-HARNESS.md, DOMAIN-NAMING-REGISTRY.md,
CODE-CONVENTION.md와 관련 API 계약·화면 명세를 읽어.
이슈 #N을 구현해. auth 슬라이스를 구조 그대로 복사하고 이름은 레지스트리 확정값만 써(지어내지 마).
공통(ApiResponse·client.js·authStore)은 재사용하고, 계약·DB·시크릿은 바꾸지 마.
막히면 원인을 (Java/DB/의존성 등으로) 구분해 보고하고, 작업 후 git diff와 필수 검증 결과를
변경/검증/남은 점 세 줄로 보고한 뒤 워킹트리를 커밋/스태시로 비워.
```
