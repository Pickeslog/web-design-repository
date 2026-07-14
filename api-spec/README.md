# 🍀 Clov — API 명세서

> 화면 프로토타입(`test-web-design/`)과 화면 명세서를 **프로덕션 백/프론트 계약(API)**으로 옮기기 위한 문서 묶음.
> **스택**: 백엔드 Spring Boot(Java/Kotlin) · 프론트 React · REST/OpenAPI.
> **작성 시작**: 2026-07-10.

---

## 왜 이 문서가 필요한가

`test-web-design/`은 localStorage 기반 **바이브코딩 프로토타입**이다 — 화면 동작은 증명됐지만, 데이터는 브라우저에만 있고 백/프론트 분리가 없다. 프로덕션으로 가려면:

- 데이터를 **DB + 백엔드 API**로, 사진을 **오브젝트 스토리지**로 옮기고
- XP·가입 승인·되돌리기 같은 로직을 **서버가 계산·검증**하며
- 프론트는 **컴포넌트/훅/페이지/서비스**로, 백엔드는 **controller/service/repository/security**로 나눈다.

그 첫 계약이 이 **API 명세서**다.

---

## 문서 구성

| 문서 | 내용 |
|---|---|
| [00-conventions-and-security.md](00-conventions-and-security.md) | 공통 규약(Base URL·포맷·페이지네이션) + **인증(JWT/OAuth)·인가·보안 정책**(평평한 멤버십·익명화·파일·XP 서버계산·가입 동시성·5분 되돌리기) |
| [01-resource-map.md](01-resource-map.md) | **전체 엔드포인트 인벤토리** — 리소스별 메서드/경로/설명/인증, 화면 명세 링크 |
| [02-db-api-reconciliation.md](02-db-api-reconciliation.md) | **`docs-archive`의 기존 DB/API 설계와 정합** — 채택/확장/충돌·결정(D1~D6 ✅확정) ⭐먼저 읽기 |
| [03-db-extensions.md](03-db-extensions.md) | archive DB 스키마에 반영할 **신규 테이블·컬럼 델타**(JOIN_REQUESTS·PLAN_STAGE_PHOTOS·NOTIFICATIONS·MEMORY_MESSAGES 등) |
| [04-erd-and-ddl.md](04-erd-and-ddl.md) | ⚠️ (구버전, 15테이블) — **[05](05-db-unified-final.md)로 대체됨** |
| [05-db-unified-final.md](05-db-unified-final.md) | ⭐**구현 기준** — 두 설계 갈래 통일한 최종 ERD + MySQL 8 DDL(**18개 테이블**) |
| `openapi.yaml` | (다음 단계) 요청/응답 스키마·에러·예시가 담긴 기계용 OpenAPI 3.1 |

> ⚠️ **중요**: `docs-archive/`에 **기획안 기반 DB/API 설계(스택·MySQL 스키마 확정)**가 이미 있다. 이 폴더의 리소스 맵은 프로토타입 역산본이라 네이밍(`spaces`↔`rooms`)·입장 흐름 등에서 그것과 어긋나므로, **[02-db-api-reconciliation.md](02-db-api-reconciliation.md)의 정합 결과를 기준**으로 확정한다.

---

## 입력이 된 자료 (역산 출처)

이 API 명세는 **새로 상상한 게 아니라** 아래에서 역산했다.

- 도메인 엔티티·상태·후보 API → [../screen-spec-source/08-data-and-state.md](../screen-spec-source/08-data-and-state.md)
- 화면별 "데이터/저장 + 액션·상태 전이" → `../test-web-design/*/*.md` (11개 화면 명세서)
- 화면 간 흐름 → [../screen-spec-source/07-user-flow.md](../screen-spec-source/07-user-flow.md)

---

## Clov 도메인에서 꼭 지킬 것 (설계 불변식)

1. **역할/권한 없음** — `ownerId`·`hostId`·`role` 만들지 않는다. 인가는 "이 공간의 멤버인가"만.
2. **방장 없는 입장** — 가입 신청 → **멤버 누구나 1명 수락**. 중복 수락은 경합 처리(409), 수락 후 **5분 되돌리기**.
3. **기록 보존** — 탈퇴는 삭제가 아니라 **익명화**("언노운"), 추억·편지·사진 유지.
4. **친구별 관점 기록** — 같은 약속(`scheduleId` 참조)에 친구별 메시지·기록.
5. **XP/레벨은 서버 계산** — 클라 값 신뢰 금지.

---

## 진행 상태

- ✅ 규약·보안([00](00-conventions-and-security.md)) / 리소스 맵([01](01-resource-map.md)) / 정합·결정([02](02-db-api-reconciliation.md)) / DB 델타([03](03-db-extensions.md)) / **ERD+DDL([04](04-erd-and-ddl.md))** — 정합 확정본 완료(D1~D6 반영).
- ⬜ **`openapi.yaml`** — 리소스별 요청/응답 스키마·에러·예시(Auth·JoinRequests·Plans·Memories 우선).
- ⬜ **코드 스캐폴딩** — MyBatis 매퍼/도메인 + React api 서비스·훅, 화면별 `.md` ↔ 페이지/컴포넌트 매핑.
