# Clov API — 공통 규약 & 보안 정책

> **대상 스택**: 백엔드 Spring Boot(Java/Kotlin), 프론트 React.
> **기준**: 화면 명세서(`test-web-design/*/*.md`) + 데이터/상태(`screen-spec-source/08-data-and-state.md`).
> 이 문서는 모든 엔드포인트에 공통으로 적용되는 규약이다. 리소스별 경로는 [01-resource-map.md](01-resource-map.md), 스키마는 `openapi.yaml`(예정).

---

## 1. 기본 규약

| 항목 | 값 |
|---|---|
| Base URL | `https://api.clov.app/api/v1` |
| 버전 | URL 경로 버전(`/v1`). 하위호환 깨질 때만 `/v2` |
| 포맷 | 요청/응답 `application/json; charset=utf-8` (파일 업로드만 `multipart/form-data`) |
| 시간 | ISO-8601 UTC (`2026-07-10T09:00:00Z`). 날짜만 필요한 필드는 `date`(`2026-07-12`) |
| ID | 서버 발급. 외부 노출 ID는 **UUID 또는 불투명 문자열**(auto-increment 정수 직접 노출 지양) |
| 네이밍 | JSON 필드 `camelCase`, 경로 `kebab/소문자`, 리소스 복수형(`/spaces`, `/memories`) |

### 페이지네이션 (목록 공통)

**offset 기반**(`page`/`size`) — archive 설계·MyBatis/MySQL 관례에 맞춤.

```
GET /rooms/{roomId}/memories?page=0&size=20
→ { "content": [...], "page": 0, "size": 20, "totalElements": …, "totalPages": … }
```

### 필터/정렬 쿼리 (추억피드 기준 — feed.md)

- `q` : 검색(제목·본문·태그·친구)
- `sort` : `new`(기본) | `old`
- `filter` : `all` | `mine` | `others`
- `month` : `all` | `YYYY-MM`

> 네이밍은 `rooms`(우정공간)·`plans`(약속)로 통일(archive DB 테이블 기준). 이 문서의 옛 예시가 `spaces`/`schedules`면 `rooms`/`plans`로 읽는다.

---

## 2. 인증 (Authentication)

### 방식

- **JWT Bearer**: `Authorization: Bearer <accessToken>`
- **Access + Refresh 토큰** 분리. accessToken 만료 시 `/auth/token/refresh`로 재발급.
- 프로토타입의 단일 `accessToken`(localStorage/sessionStorage) → 프로덕션은 **accessToken(메모리/짧은 수명) + refreshToken(HttpOnly Secure 쿠키 권장)**.
  - "로그인 유지"(login.md) = refreshToken 발급 여부/수명으로 구현.

### 로그인 수단 (login.md / signup.md)

- **이메일 + 비밀번호**
- **소셜 OAuth2**: 카카오 · 네이버 · 구글 (`/auth/oauth/{provider}`, Authorization Code 교환)
- 비밀번호: 서버 저장은 **BCrypt/Argon2 해시**. 최소 8자(signup 정책).

### 토큰 페이로드(권장 클레임)

```json
{ "sub": "<userId>", "iat": …, "exp": …, "type": "access" }
```
- **공간 멤버십/레벨을 토큰에 넣지 않는다** — 가입 수락·탈퇴로 자주 바뀌므로 요청 시 서버가 조회·검사.

---

## 3. 인가 (Authorization) — Clov 특성

> 핵심 원칙(CLAUDE.md): 우정공간은 **최대 8명 단일 구조 · 방장/관리자/역할 없음 · 모든 멤버 동등**. 따라서 인가 모델이 매우 단순하다.

### 정원 (최대 8명)

- **`MAX_ROOM_MEMBERS = 8`** — `ROOM_MEMBERS`의 `status=ACTIVE` 수 기준(생성자 포함). `LEFT` 멤버는 카운트 제외.
- 정원이 찬 방은 **가입 신청 생성·수락 모두 차단** → `409 ROOM_CAPACITY_EXCEEDED`.
  - `POST /join-requests`: 대상 방이 이미 8명이면 신청 거부.
  - `.../accept`: 수락 시점에 재확인(경합/대기 중 다른 신청이 채웠을 수 있음).
- 자리가 나면(멤버 `LEFT`) 다시 신청·수락 가능. **단일 구조·동등 원칙은 유지**(정원만 추가).

### 규칙

**2단 인가 규칙**(archive API 설계와 동일):

1. **역할(role) 없음**: `owner_id`/`host_id`/`leader_id`/`role` 같은 필드를 만들지 않는다. (`created_by`는 감사 로그·이력용으로만, 권한 의미 부여 금지)
2. **① 공간 멤버십 검사**: 요청자가 그 `roomId`의 `ROOM_MEMBERS`에 `status=ACTIVE`로 있는가? `roomId` 경로가 있는 모든 엔드포인트 → **RoomMembershipGuard**(Spring `@PreAuthorize`/인터셉터), 아니면 `403 ROOM_MEMBER_NOT_FOUND`.
3. **② 작성자 본인 검사(확정 — D5)**: **수정/삭제는 그 row의 작성자 본인만**(`403 NOT_WRITER`). 역할이 높아서 남의 글을 지우는 경로는 없다. 열람·작성은 멤버 누구나(동등).
   - **예외**: 약속 `complete`(다녀온 사람 누구나), 체크리스트(공동 준비물)는 멤버 누구나.
4. **삭제 방식**: 하드 삭제 대신 소프트 삭제/익명화(아래 §4).

### 가입 승인 — 방장 없는 입장 (join_room.md / notification.md)

Clov에서 가장 신경 쓸 인가/동시성 지점.

- 코드로 **가입 신청**(`join-requests`, status `pending`) 생성.
- **공간의 멤버 누구나 1명**이 수락하면 입장 확정(방장 개념 없음).
- **동시성**: 두 멤버가 같은 신청을 동시에 처리 → **낙관적 락/유니크 제약**으로 한 번만 반영, 늦은 요청은 `409 Conflict`("이미 처리된 신청").
- **5분 되돌리기**: 수락 후 `acceptedAt` 기록. `acceptedAt + 5분` 이내에만 `undo` 허용(서버 시간 기준). 만료 후 요청은 `410 Gone`/`409`.
- **거절 비영속**: 프로토타입은 세션 메모리(새로고침 시 대기 복원). 프로덕션은 `rejected` 저장하되 **파괴적 삭제 아님**(재신청/복원 정책은 도메인 확정).

---

## 4. 데이터 보존 · 삭제 정책 (Clov 원칙: 기록 보존)

- **계정 탈퇴 = 삭제가 아니라 익명화**(profile_edit.md / feed.md).
  - `DELETE /me` 는 하드 삭제가 아니라 **소프트 삭제 + 익명화**: 유저를 "언노운"으로 치환, **작성한 추억·편지·메시지·사진은 보존**.
  - ⚠️ **구현 기준은 여기가 아니라 [`docs/API-CONTRACT.md` §5-2](../docs/API-CONTRACT.md)다.** 이 문서는 설계 단계(2026-07-10)에 `users.withdrawnAt` + 표시명 익명화를 상정했으나, 확정 스키마는 **`is_anonymized`·`anonymized_at`**(`05-db-unified-final.md`)이고 실제 처리 범위도 표시명에 그치지 않는다 — 이메일·비밀번호·소셜 식별자까지 파기해야 로그인이 실제로 막힌다(clov-api#157). 외래 참조를 살아있는 익명 유저로 유지한다는 원칙만 그대로다.
- **추억/편지 삭제**: 소프트 삭제(`deletedAt`) 권장 — 되돌리기/감사 여지. (도메인 확정)
- 개인정보(이메일·생일 등)는 익명화 시 마스킹/파기 대상 — 개인정보 정책과 함께 확정. → **확정됨**: 이메일은 파기(치환), 생일은 row 보존 + 응답 차단(§5-2 표).

---

## 5. 파일 · 이미지 (프로토타입 → 프로덕션 필수 변경)

프로토타입은 사진을 **압축 base64로 localStorage**에 저장(feed.md/memory_detail.md) — 용량 한계로 재압축·롤백 로직까지 있었다. **프로덕션은 오브젝트 스토리지로 전환**한다.

- **업로드**: `POST /media/uploads` → **presigned URL 발급** → 클라가 스토리지(S3 등)로 직접 업로드 → 반환된 `mediaId`/URL을 리소스에 연결.
- 서버는 URL만 저장(추억 `photos[]`, 아바타, 대표사진, 4컷 인증사진).
- **제약**(화면 기준): 추억 사진 **≤15장**, 이미지 타입/용량 검증, EXIF 방향 보정.
- **인증사진(인생4컷)**: 업로드 후 **변경 불가(잠금)** — "증거" 성격(05-schedule-screen.md). 서버에서 재업로드 거부.

---

## 6. XP · 레벨 (서버 계산 — 클라 신뢰 금지)

프로토타입은 클라에서 XP를 계산·저장(`clov_groupsData.level`). 프로덕션은 **서버가 부수효과로 적립·계산**한다.

| 이벤트 | XP | 트리거 엔드포인트 |
|---|---|---|
| 약속 추가 | +3 | `POST …/schedules` |
| 약속 완료(인증) | +15 | 4컷 `meeting` 사진 업로드 |
| 게시글 작성 | 기본 25 + 사진 + 정성 보너스 | `POST …/memories` |
| 마스코트 교감 | +2 (하루 3회 상한) | `POST …/mascot/interact` |

- 100% 초과 시 **연속 레벨업(초과분 이월)**, 만렙 777 — 서버에서 계산.
- 레벨은 **공간별**(`GET /spaces/{spaceId}/level`). 클라가 보낸 XP 값은 신뢰하지 않는다.

---

## 7. 에러 모델 (공통)

```json
{
  "error": {
    "code": "JOIN_REQUEST_ALREADY_HANDLED",
    "message": "이미 처리된 가입 신청입니다.",
    "details": { "requestId": "…" }
  }
}
```

| HTTP | 사용 |
|---|---|
| 400 | 유효성 실패(제목/날짜 미입력, 형식 오류) |
| 401 | 미인증/토큰 만료 |
| 403 | 비멤버의 공간 리소스 접근 |
| 404 | 리소스 없음(삭제된 일정 등) |
| 409 | 경합(가입 신청 중복 처리), 중복 이메일, **정원 초과(`ROOM_CAPACITY_EXCEEDED`)** |
| 410 | 되돌리기 만료 |
| 413 | 파일 용량 초과 |
| 422 | 도메인 규칙 위반(인증사진 재업로드 등) |
| 429 | 레이트리밋(마스코트 교감 상한 등) |

- `code`는 **안정적 문자열 상수**(프론트 분기용). `message`는 사용자 노출 한국어.

---

## 8. 기타

- **CORS**: 프론트 오리진 화이트리스트.
- **Rate limit**: 인증·업로드·마스코트 교감 등에 적용.
- **Idempotency**: 결제성 액션은 없으나, 가입 수락/사진 업로드는 서버 상태로 멱등 보장(중복 요청 안전).
- **감사 로그**: `createdBy`/`updatedBy`는 로그·표시용, 권한 판단에 쓰지 않는다.

---

## 관련 문서

- 엔드포인트 인벤토리 → [01-resource-map.md](01-resource-map.md)
- 도메인 엔티티/상태 → [../screen-spec-source/08-data-and-state.md](../screen-spec-source/08-data-and-state.md)
- 화면 흐름 → [../screen-spec-source/07-user-flow.md](../screen-spec-source/07-user-flow.md)
