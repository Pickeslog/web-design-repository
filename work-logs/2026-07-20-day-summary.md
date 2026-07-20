# 2026-07-20 하루 정리 — governance 이슈 A~D + CI + 팀 온보딩

> **한 줄 요약**: 발산방지 governance 이슈 **A·B·C·D 전부 완료·머지**, 양쪽 repo **CI required** 적용, 팀원 3명 **온보딩 3/3 완주**. 팀이 3사 소셜 로그인까지 재현 → **M2 도메인 팬아웃 준비 완료**. 다음은 M2 배정.
> 상세 이력·근거: [`2026-07-20-governance-codex-review.md`](2026-07-20-governance-codex-review.md) · 온보딩 절차: [`../team-guides/16-onboarding-first-pr.md`](../team-guides/16-onboarding-first-pr.md)

---

## 1. 오늘 완료한 것

### 분리 이슈 A~E (Codex 리뷰 → 클로드 재검증 → 실행)
| 이슈 | 내용 | 결과 |
|---|---|---|
| **A** | clov-api CI `gradlew: Permission denied` → `git update-index --chmod=+x gradlew` | ✅ PR #17 **머지** (clov-api main `16c2d8a` 계열) |
| **A 후속** | 양쪽 repo ruleset에 CI `build` **required status check** | ✅ clov-api·clov-web 둘 다 (한 번 사라졌다 재적용, 이후 안정) |
| **B** | 계약 §4-3 공통 읽기 모델 + §5~§13 요청/응답·pagination 스키마 보강, §4 소셜 콜백 정정(consent-선행) | ✅ `e8a5154` |
| **C** | `AI-TEAM-HARNESS` 정본화(WORKFLOW·운영규칙 흡수→스텁), 레지스트리·규약 교정 | ✅ `3eca2ed` |
| **C+** | **역할 대체(fallback) 규칙** — 기본 담당 유지·토큰/가용성 시 대체·test/CI/인프라/문서는 경계예외 | ✅ `6a307f4` |
| **D** | Testcontainers(MySQL) 통합테스트 CI (schema.sql·싱글턴 컨테이너·ci.yml `gradlew test`) | ✅ PR #18 머지 (14 테스트 통과) |
| **E** | User를 domain/user로 이동? | ✅ **현 위치 유지** 결정, 레지스트리 §5 경계 명문화 |

### 그 외
- 계약 DB 테이블 수 **18 → 19** 정정 (`637ffbe`, letter_favorites 포함, README와 일치).
- **팀 로스터 확정**: 리더(Codex 백+Claude web·감사) · chacha1650a=Claude · kimgyubi1234=Gemini · lami2342=Claude. (리더 외 3명 비전공·온보딩)
- 팀원들 각자 환경 구축 후 **네이버·카카오·구글 3사 소셜 로그인 동작 확인** → M2 팬아웃 시작 기준 충족.

### 온보딩 3/3 완주 ✅
가이드 `team-guides/16-onboarding-first-pr.md`(clov-web `docs/team/<id>.md` 자기소개 추가). 세 명 모두 브랜치→PR→CI초록→리뷰→머지 완주.
| 팀원 | PR | 이슈 | 비고 |
|---|---|---|---|
| lami2342 | #16 ✅ | #15 CLOSED | `Closes` 정상 |
| chacha1650a | #17 ✅ | #13 CLOSED | PR 본문 `Closes` 누락 → 이슈 수동 닫음 |
| kimgyubi1234 | #18 ✅ | #14 CLOSED | 정상 |

---

## 2. 현재 프로젝트 위치
- **워킹 스켈레톤**(로그인→토큰→보호라우트) 브라우저 E2E + **팀 3사 로그인 재현** 검증됨.
- governance 문서(계약·HARNESS·레지스트리·규약) 정본화·정합.
- 양쪽 repo CI required로 main 보호 강화(직접 push 금지·PR 필수·CI 초록 필수).
- 온보딩 완료 → **M2 도메인 팬아웃 착수 가능**.
- 커밋 앵커: clov-api main = `16c2d8a`(#18 머지 후) · web-design main = 이 요약 커밋 기준 최신.

---

## 3. 다음 할 일 — M2 도메인 배정
1. **M2 도메인 배정 맵** — 레지스트리 §2 담당표에 실제 이름 매핑 + 난이도 균형
   - 쉬운 편(비전공 입문): **letter(§11) · notification(§13)**
   - 어려운 편(동시성·잠금): **invite/join-requests(§7 낙관적 락·5분 되돌리기) · plan 4컷(§8 stage 잠금)** → 리더/숙련자
2. **도메인별 착수 프롬프트** — 계약 §5~§13 스키마 + auth 골든레퍼런스 복사 지시(에이전트별).
3. ⏳ **리더 결정 대기(M2 선행)**: 팀원이 각 도메인의 **백엔드+프론트 세로슬라이스를 통째로** 맡나, **프론트/백을 나누나?** (auth 때는 Codex=백/Claude=프론트로 나눴음.) → 이 결정에 따라 배정 맵이 달라짐.

---

## 4. 열린 항목 / 다음 세션 참고
- **FREE MEMORY(planId NULL) 생성 엔드포인트 미확정** — 계약 §10-1에 갭 표시, 리더 확정 대기(발명 안 함).
- **Testcontainers 함정**(D에서 실제 겪음): Spring Boot 4.0.7→TC **2.0.5**(아티팩트 `testcontainers-mysql`/`-junit-jupiter`, 클래스 `org.testcontainers.mysql.MySQLContainer`), 다중 클래스 공유는 **싱글턴 컨테이너 패턴 필수**. 로컬 Docker 없음 → 백엔드 테스트는 CI에서만 검증.
- **온보딩 교훈**: PR 본문에 `Closes #N` 꼭 넣기(chacha 누락으로 수동 닫음). M2 프롬프트/이슈에 강조.
- 사용자 DB 잔여: 테스트계정 `e2e-...(id=10)` 삭제 SQL은 사용자 DB툴. 병합된 feature 브랜치 정리(선택).
- clov-web collaborator에 `code1218`(5번째) 존재 — 신원 확인 필요 시 체크.
