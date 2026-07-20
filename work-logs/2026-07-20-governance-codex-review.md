# 2026-07-20 — Governance 하드닝 & 이슈 A~E 실행 (핸드오프)

> 워킹 스켈레톤 완성 후 governance 문서(레지스트리·워크플로우·규약)를 Codex가 계약·코드와 대조 리뷰 → 클로드가 재검증 → **분리 이슈 A~E를 실행**한 기록. 다음 컨텍스트가 여기서 이어감.
> 관련: [`../docs/API-CONTRACT.md`](../docs/API-CONTRACT.md) · [`../docs/AI-TEAM-HARNESS.md`](../docs/AI-TEAM-HARNESS.md) · [`../docs/DOMAIN-NAMING-REGISTRY.md`](../docs/DOMAIN-NAMING-REGISTRY.md) · [`../docs/CODE-CONVENTION.md`](../docs/CODE-CONVENTION.md)

## 현재 위치
- 백엔드 #1~#6+#5 OAuth·CORS(#16) 머지. 프론트 #2 셸+#3 로그인/회원가입/OAuthRedirect 머지. **로그인 E2E 관통 검증됨.**
- ✅ **팀원들이 각자 환경 구축 후 네이버·카카오·구글 3사 소셜 로그인 동작 확인**(2026-07-20) — 클로드 단독 넘어 팀 레벨 재현. 환경 가이드+OAuth 콘솔+auth 슬라이스 검증 → **M2 팬아웃 시작 기준 충족**.
- Codex governance 리뷰 → 클로드 재검증(발견 8건 모두 사실, 1건 부분정정) → **이슈 A~E 실행 완료(D까지)**.

## 이슈 A~E 실행 결과
- **A ✅** clov-api CI `gradlew: Permission denied` → `git update-index --chmod=+x gradlew`. **PR #17 머지됨**(main=`5a5d955`).
- **A 후속(CI required) ✅** clov-api·clov-web **양쪽** ruleset에 `required_status_checks:[build]` 추가·검증 완료(사용자가 clov-web 실행). 주의: clov-api 규칙이 한 번 사라져 재적용함(원인 불명 — PR 머지 직후 재확인 권장).
- **B ✅** 계약 `§4-3 공통 읽기 모델`+`§5~§13 요청/응답·pagination 스키마` 보강, `§4` 소셜 콜백 `users` 생성 시점 정정(consent-선행, 실제 `OAuthAuthService` 정합). 커밋 `e8a5154`. FREE MEMORY(planId NULL) 생성 엔드포인트는 미기재 갭으로 **리더 확정 대기**(발명 안 함).
- **C ✅** `AI-TEAM-HARNESS.md` 정본화(WORKFLOW/운영규칙 흡수→포인터 스텁), 레지스트리(route family·`friendship_exp_logs`·DTO완화·User경계)·CONVENTION(OAuth가드=모듈레벨Map·pages 그룹) 교정. 커밋 `3eca2ed`. **역할 대체(fallback) 규칙** 추가 커밋 `6a307f4`(기본 담당 유지, 토큰·가용성 시 대체 허용, test/CI·인프라·문서는 경계 예외).
- **D ✅** Testcontainers(MySQL) 통합테스트 CI. `schema.sql`(05-db DDL 파생)·`IntegrationTestSupport`(싱글턴 컨테이너 `@ServiceConnection`)·`application-test.yaml`·ci.yml `./gradlew test`. **PR #18 CLEAN·`build` SUCCESS**(14 테스트 통과). Claude가 fallback 규칙 하 직접 구현(도커 로컬 부재로 컴파일만 로컬, 테스트는 CI 검증). **사용자 머지 대기.**
- **E(⚪)** User→domain/user 이동: **리더 결정=현 위치 유지**(레지스트리 §5에 경계 명문화). 미실행.

## 리더 결정(모두 확정)
1. User 위치=**유지**. 2. 계약 스키마 보강=**클로드 진행(완료)**. 3. governance 통합=**승인(완료)**. 4. CI required=**Yes(clov-api 완료, clov-web 사용자 대기)**. 5. DB 스키마 실행자산=**Yes(D 완료)**. + 역할 대체 규칙=**승인·추가**.

## 미결 / 사용자 액션 대기
- **PR [#18](https://github.com/Pickeslog/clov-api/pull/18) 머지**(clov-api Testcontainers CI, green·CLEAN) — 머지는 사람이(분류기 차단). **머지 후 clov-api ruleset의 `build` required가 유지되는지 재확인 권장**(이번에 한 번 사라진 이력).
- **CONVENTION/README 잔여**: 계약 §6 근거줄이 DB "18테이블"이라 하나 실제 19(letter_favorites 포함, README도 19) — 경미 불일치, 별도 정리 가능.
- 테스트 계정 `e2e-...(id=10)` DB 잔존(삭제 SQL은 사용자 DB툴). 병합된 feature 브랜치 다수 잔존(정리 선택).

## 환경 메모
- `web-design-repository` main = `6a307f4`(push됨). clov-api main = `5a5d955`(#17 머지 후). D 브랜치 `chore/testcontainers-ci`(PR #18).
- Testcontainers = **Spring Boot 4.0.7 → TC 2.0.5**(아티팩트 `testcontainers-mysql`/`-junit-jupiter`, 컨테이너 클래스 `org.testcontainers.mysql.MySQLContainer`). 여러 클래스 공유는 **싱글턴 컨테이너 패턴 필수**(`@Testcontainers`로 하면 클래스별 stop이 다음 클래스 연결을 끊음 — 이번에 실제로 겪음).
- 로컬 Docker 미설치 → 백엔드 Testcontainers 테스트는 CI에서만 검증 가능.
