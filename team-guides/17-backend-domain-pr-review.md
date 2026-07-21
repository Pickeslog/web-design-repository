# 17. M2 백엔드 도메인 PR 리뷰 체크리스트

> **용도**: 리더(감사·리뷰)가 Codex/팀원의 도메인 백엔드 PR을 계약·레지스트리·규약과 대조. **공통 A**(모든 M2 백엔드 PR) + **도메인별 부록**. 팀원 자가점검에도 사용.
> 기준: [`../docs/API-CONTRACT.md`](../docs/API-CONTRACT.md) · [`../docs/DOMAIN-NAMING-REGISTRY.md`](../docs/DOMAIN-NAMING-REGISTRY.md) · [`../docs/CODE-CONVENTION.md`](../docs/CODE-CONVENTION.md)

---

## A. 공통 (모든 M2 백엔드 PR)

### A1. 계약 정합 (API-CONTRACT §번호)
- [ ] 경로·HTTP 메서드가 계약과 정확히 일치 (중첩 경로·`/api/v1` 프리픽스·단수/복수)
- [ ] 요청 필드명·타입 일치, 누락/추가 없음
- [ ] 응답 봉투 `{success,data}` / `{success,error}`, 필드명 계약과 일치
- [ ] 에러코드 = 계약의 HTTP status + code 문자열 (예: `409 ROOM_CAPACITY_EXCEEDED`)
- [ ] ID 등 Long은 JSON에서 **문자열** 직렬화
- [ ] 목록은 봉투 `items` 형태, 공통 읽기 모델·pagination(§4-3) 준수
- [ ] 인가 열(로그인/공간 멤버/본인/작성자)대로 접근 제어 구현

### A2. 레지스트리 이름 (DOMAIN-NAMING-REGISTRY §2)
- [ ] 패키지 `domain/<term>` 소문자 단수
- [ ] Controller/Service/Mapper 클래스명 = 표 확정값
- [ ] Entity = 표의 DB 테이블 매핑
- [ ] Mapper XML namespace = 인터페이스 FQN, SQL id = 메서드명
- [ ] **표에 없는 이름을 지어내지 않음** (필요 시 이슈에 제안 후 문서 갱신)

### A3. 코드 규약 (CODE-CONVENTION)
- [ ] auth 슬라이스 레이어링 복사(`controller/service/mapper/dto/entity`), 공유는 `global/`
- [ ] 공통 재사용(`ApiResponse`·`ErrorCode`·`GlobalExceptionHandler`·client) — **2번째 버전 안 만듦**
- [ ] MyBatis `#{}`만, `${}` 없음. resultMap 컬럼 `snake_case` ↔ 프로퍼티 `camelCase`
- [ ] DTO 명시적(`Dto`·`Data`·`Result` 접미사 금지), Mapper 메서드 액션명(`find…`·`insert`…)
- [ ] 새 공유 폴더/추상화/의존성/계약이름/DB이름 **무단 추가 없음** (있으면 PR에 설명)

### A4. 테스트·CI·PR 위생
- [ ] Testcontainers(MySQL) 통합 테스트 추가, **싱글턴 컨테이너**(`IntegrationTestSupport`·`@ServiceConnection`)
- [ ] `@Testcontainers` 클래스별 stop 함정 회피(다중 클래스 공유 시 연결 끊김)
- [ ] CI `build` 초록
- [ ] PR 본문 첫 줄 `Closes #N`
- [ ] 한 이슈 = 한 PR, 무관한 파일 안 섞임(`git add -A` 금지)

### A5. 서비스 원칙 (절대 — 위반 시 반려)
- [ ] **`role`/방장/관리자/대표자 개념 없음**
- [ ] 최대 8명 단일 구조, 모든 멤버 동등

---

## B. room 부록 (#19 · 계약 §6·§12)

### B1. §6 Rooms
- [ ] `POST /rooms`: 생성자 = 첫 멤버(**특별 권한 없음**)
- [ ] `DELETE /rooms/{id}/members/me`: **`status=LEFT` (row 삭제 아님)** ← 핵심
- [ ] 전원 LEFT → `status=INACTIVE` + `scheduled_delete_at`(+30일) 자동, **별도 방 삭제 API 없음**
- [ ] `PATCH /rooms/{id}`: `description`≤60 검증, 수정 시 **전 멤버 알림 팬아웃**(트리거)
- [ ] `PATCH /rooms/{id}/favorite`: `room_members.is_favorite` 토글(본인)
- [ ] `POST /rooms/{id}/revive`: INACTIVE/삭제예정 전 되살리기(과거 멤버)
- [ ] `RoomDetail` 응답 필드: `friendshipLevel`·`expPoint`·`memberCount`·`isFavorite`·`myStatusMessage`·`scheduledDeleteAt`
- [ ] `members` 목록: ACTIVE/LEFT `status` 구분, `membershipId` 등

### B2. §12 Exp/Level/Mascot (room-scoped, `domain/room` 내부 — 분리 안 함)
- [ ] `GET /rooms/{id}/level`: **서버 계산**(`friendshipLevel`·`expPoint`·`expForNextLevel`·`remainingToNextLevel`)
- [ ] `POST /rooms/{id}/mascot/interact`: +2, 하루 3회 초과 → `429 MASCOT_INTERACTION_LIMIT_REACHED`
- [ ] exp **직접 API 없음** — 서버 내부 부수효과로 적립(약속완료 +15 등)
- [ ] `FriendshipExpLog`(friendship_exp_logs) 서버계산. **마스코트 전용 테이블 없음**(`user_preferences.mascot_type` 참조)
- [ ] `RoomLevelController`·`MascotController`가 `domain/room`에 위치(`domain/mascot` 만들지 않음)

---

## 리뷰 판정
- **A5 위반 = 즉시 반려**(서비스 원칙). A1·A2 불일치 = 수정 요청.
- 계약에 없는 동작을 발명했으면 → 반려 후 계약 이슈로.
- 통과 시: PR 승인 → 리더 머지(squash). 머지 후 required `build` 유지 확인.

> 부록은 도메인별로 추가한다(letter §11 / notification §13 / memory §10 / invite §7 / plan §8·§9 …).
