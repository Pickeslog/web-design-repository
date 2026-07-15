# 🍀 Clov — API 계약 (단일 기준 · SSOT)

> **이 문서가 프론트·백 공통 API 계약의 유일한 기준(Single Source of Truth)이다.**
> `clov-api/docs/API-CONTRACT.md`·`clov-web/docs/API-CONTRACT.md`는 이 문서를 가리키는 포인터일 뿐이다.
> **계약 변경은 리더만** 이 문서를 수정한다. 다른 사람은 이슈로 제안한다.
> 근거: DB [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md)(18테이블) · 화면 명세(`../test-web-design/*/*.md`).
> 최종 갱신: 2026-07-14 — **구 계약(즉시입장·OAuth-only·SB3.5)을 대체함.**

---

## 0. 이번 통일에서 바뀐 것 (구 계약 대비)

| 항목 | 구 계약 (폐기) | ✅ 신 계약 (이 문서) |
|---|---|---|
| 입장 흐름 | 코드 넣으면 **즉시 입장** | **가입 신청 → 멤버 1명 수락 → 5분 되돌리기** (D1) |
| 인증 | 소셜(OAuth2)만 | **이메일+비밀번호 + 소셜 OAuth 둘 다** (D6) |
| 응답 형식 | `{code,message,status}` (봉투 없음) | **`{success, data}` / `{success, error}` 봉투** |
| 스택 | Spring Boot 3.5 | **Spring Boot 4.0.x** |
| 누락 도메인 | 가입신청·인생4컷·알림·테마·댓글 없음 | **전 도메인 포함** |

---

## 1. 기술 스택

- **백엔드**: Java 21 · Spring Boot 4.0.x · Spring Security 6 + JWT(jjwt 0.12.x) · MyBatis(JPA 금지) · MySQL 8 · Gradle
- **프론트**: React 19 + Vite · react-router-dom v7 · TanStack Query v5 · Zustand · axios

## 2. 공통 규약

- **Base path**: `/api/v1`
- **포맷**: JSON · 날짜 ISO-8601(`yyyy-MM-dd`, `HH:mm:ss`)
- **페이지네이션**: `page`(0부터) · `size`(기본 20) · `sort`(예: `favorite`|`latest`|`oldest`)
- **인증 헤더**: 보호 요청은 `Authorization: Bearer <accessToken>`
- **ID 타입**: 서버 내부는 `BIGINT`, JSON 응답에서는 문자열로 직렬화(정밀도 안전)

### 응답 봉투 (모든 응답 공통)
```jsonc
// 성공
{ "success": true, "data": { /* payload */ } }
// 목록
{ "success": true, "data": { "items": [ ... ], "page": 0, "size": 20, "total": 137 } }
// 실패 (HTTP status + 봉투)
{ "success": false, "error": { "code": "ROOM_MEMBER_NOT_FOUND", "message": "해당 우정공간의 멤버가 아닙니다." } }
```

## 3. 인가 — 2단 규칙 (역할 없음)

1. **공간 멤버십 검사**: 요청자가 그 `room_id`의 `room_members`에 `status=ACTIVE`로 있는가? 아니면 차단. (공간 안 전원 동등)
2. **작성자 본인 검사**: 수정/삭제는 그 row의 `writer_id`/`sender_id` 본인만.

→ "방장/관리자가 강퇴" 같은 API는 **의도적으로 만들지 않는다.** 나가기는 본인만.

### 도메인 불변식 (반드시 지킴)
- **방장/역할 없음** — `owner_id`·`role` 없음. `created_by`·`triggered_by`는 이력일 뿐.
- **정원 8명** — `MAX_ROOM_MEMBERS=8`(ACTIVE 기준). 초과 시 `409 ROOM_CAPACITY_EXCEEDED`. 앱 로직 강제(가입 수락 트랜잭션에서 `FOR UPDATE` 카운트).
- **기록 보존** — 나가기=`status=LEFT`, 탈퇴=익명화, 추억삭제=soft delete.
- **친구별 관점** — 같은 `plan_id`에 `writer_id` 다른 추억 여러 개 + 한 줄 댓글. `UNIQUE(plan_id, writer_id)`.
- **XP 서버 계산** — 클라 값 신뢰 금지.

---

## 4. 인증 (Auth)

| Method | Path | 설명 |
|---|---|---|
| POST | `/api/v1/auth/signup` | 이메일/비번 회원가입(닉네임·프로필사진·생년월일·약관동의) |
| POST | `/api/v1/auth/login` | 이메일/비번 로그인 → Access(JWT, 단기) + Refresh(장기) 발급 |
| POST | `/api/v1/auth/refresh` | Refresh로 Access 재발급(`refresh_tokens`에서 `revoked_at IS NULL`·미만료 검증) |
| POST | `/api/v1/auth/logout` | 현재 세션 Refresh `revoked_at` 기록(무효화) |
| GET | `/oauth2/authorization/{provider}` | 소셜 로그인 시작(kakao/naver/google, Spring Security 제공) |
| GET | `/login/oauth2/code/{provider}` | 소셜 콜백 — 신규면 `users` row 생성 후 토큰 발급 |

- 비밀번호는 **BCrypt 해시** 저장. 소셜 전용 계정은 `password` NULL(`oauth_provider`/`oauth_subject`로 식별).
- Access Token 만료 짧게(예: 30분). 토큰 무효화는 Refresh `revoked_at`으로.

## 5. Users / Preferences

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| GET | `/api/v1/users/me` | 내 프로필 | 본인 |
| PATCH | `/api/v1/users/me` | 프로필 수정(`nickname`·`profile_image_url`·`birthdate`) | 본인 |
| PATCH | `/api/v1/users/me/password` | 비밀번호 변경(현재 비번 검증) | 본인 |
| POST | `/api/v1/users/me/profile-image/presign` | 프로필 사진 업로드 presigned URL | 본인 |
| GET | `/api/v1/users/me/rooms` | 내 우정공간 목록(`sort=favorite|latest|oldest`) | 본인 |
| DELETE | `/api/v1/users/me` | 계정 탈퇴 = **익명화**(`is_anonymized`·닉네임 "언노운"), Refresh 전부 무효화. 기록 FK 보존 | 본인 |
| GET | `/api/v1/users/me/preferences` | 테마/화면 설정 조회 | 본인 |
| PATCH | `/api/v1/users/me/preferences` | 설정 변경(즉시 적용·저장) | 본인 |

## 6. Rooms (우정공간)

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/rooms` | 생성(생성자=첫 멤버, 일반 멤버와 동일) | 로그인 |
| GET | `/api/v1/rooms/{roomId}` | 상세(이름·레벨·exp·멤버수) | 공간 멤버 |
| PATCH | `/api/v1/rooms/{roomId}` | 수정(`name`·`description`≤60·`theme_color`·`transport_type`·`cover_photo_url`·`cover_title`) → 전 멤버 알림 팬아웃 | 공간 멤버(누구나) |
| GET | `/api/v1/rooms/{roomId}/members` | 멤버 목록(ACTIVE/LEFT) | 공간 멤버 |
| DELETE | `/api/v1/rooms/{roomId}/members/me` | 나가기(row 삭제 아님, `status=LEFT`) | 본인 |
| PATCH | `/api/v1/rooms/{roomId}/members/me/status-message` | 이 방에서의 내 상태메시지 | 본인 |
| PATCH | `/api/v1/rooms/{roomId}/favorite` | 즐겨찾기 토글(`room_members.is_favorite`) | 본인 |
| POST | `/api/v1/rooms/{roomId}/revive` | "잠자는 방" 되살리기(`INACTIVE`+삭제예정 전) | 과거 멤버 |

- 전원 `LEFT` → 서버가 `status=INACTIVE` + `scheduled_delete_at`(+30일) 자동 설정. 별도 "방 삭제" API 없음.

## 7. Invites & Join Requests (가입 신청·승인 — D1)

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/rooms/{roomId}/invites` | 초대 코드 생성(`created_by`=이력) | 공간 멤버 |
| GET | `/api/v1/rooms/{roomId}/invites` | 발급된 코드 목록 | 공간 멤버 |
| DELETE | `/api/v1/invites/{inviteId}` | 코드 취소(`CANCELED`) | 만든 본인 |
| POST | `/api/v1/invites/accept` | 코드로 **입장 신청** → `room_join_requests`(PENDING) 생성, 코드 `USED`. **입장 확정 아님** | 로그인(비멤버·정원 미만) |
| GET | `/api/v1/rooms/{roomId}/join-requests` | 대기 신청 목록(알림 배지) | 공간 멤버 |
| POST | `/api/v1/join-requests/{id}/accept` | **수락** → `room_members`(ACTIVE) 생성, `accepted_by`·`undo_deadline_at`(+5분) 기록, 전 멤버 알림 | 공간 멤버(누구나 1명), 정원 미만 |
| POST | `/api/v1/join-requests/{id}/reject` | 거절(`REJECTED`) | 공간 멤버 |
| POST | `/api/v1/join-requests/{id}/undo` | **5분 되돌리기** — `undo_deadline_at` 이전만. 멤버 row 제거, 신청 `PENDING` 복원 | 수락한 본인만 |

- **동시성**: `accept`/`reject`/`undo`는 `room_join_requests.version` 낙관적 락. 이미 처리됨 → `409 JOIN_REQUEST_ALREADY_PROCESSED`. 되돌리기 만료 → `409 JOIN_REQUEST_UNDO_EXPIRED`.
- **정원**: `accept` 트랜잭션에서 ACTIVE 멤버 수 `FOR UPDATE` 카운트 ≤ 8 확인. 초과 → `409 ROOM_CAPACITY_EXCEEDED`(신청은 PENDING 유지).

## 8. Plans (약속) & 인생4컷

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/rooms/{roomId}/plans` | 등록(`SCHEDULED`/`memory_status=NONE`) | 공간 멤버 |
| GET | `/api/v1/rooms/{roomId}/plans` | 목록(필터 `status`·날짜) | 공간 멤버 |
| GET | `/api/v1/plans/{planId}` | 상세(체크리스트 포함) | 공간 멤버 |
| PATCH · DELETE | `/api/v1/plans/{planId}` | 수정·삭제 | 작성자 본인 |
| POST | `/api/v1/plans/{planId}/complete` | 완료 → `COMPLETED`·`memory_status=CANDIDATE` (추억 전환 유일 트리거) | 공간 멤버(누구나) |
| POST | `/api/v1/plans/{planId}/cancel` | 취소(`CANCELED`) | 작성자 본인 |
| POST | `/api/v1/plans/{planId}/skip-memory` | 추억 스킵(`SKIPPED`) | 공간 멤버 |
| GET | `/api/v1/plans/{planId}/stage-photos` | 4단계 인증현황(잠김/활성/완료는 서버 계산) | 공간 멤버 |
| POST | `/api/v1/plans/{planId}/stage-photos/presign` | 단계 업로드 presign(직전 단계 없으면 `423 STAGE_LOCKED`) | 공간 멤버 |
| POST | `/api/v1/plans/{planId}/stage-photos` | 업로드 등록(`stage`=PROPOSAL/SCHEDULING/CONFIRMED/MEETING). **수정/삭제 없음(증거)**. 재업로드 → `409 STAGE_ALREADY_UPLOADED` | 공간 멤버 |

## 9. Plan Checklists

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/plans/{planId}/checklists` | 항목 추가 | 공간 멤버 |
| PATCH | `/api/v1/checklists/{checklistId}` | 수정·`checked` 토글 | 공간 멤버(공동) |
| DELETE | `/api/v1/checklists/{checklistId}` | 삭제 | 공간 멤버 |

## 10. Memories (추억) & Comments

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/plans/{planId}/memories` | 내 추억 작성(`title`≤25·`content`≤100·`tags[]`·`participantUserIds[]`) → plan `memory_status=WRITTEN`. `CANDIDATE`/`WRITTEN`만 허용(`NONE`→`PLAN_NOT_COMPLETED`). `UNIQUE(plan_id,writer_id)` 위반 → `409 MEMORY_ALREADY_WRITTEN`(PATCH로) | 공간 멤버 |
| GET | `/api/v1/rooms/{roomId}/memories` | 피드(월별·`writer_id`·`tag`·`participantUserId` 필터) | 공간 멤버 |
| GET | `/api/v1/memories/{memoryId}` | 상세(이미지·태그·참여자·댓글수) | 공간 멤버 |
| PATCH · DELETE | `/api/v1/memories/{memoryId}` | 수정(태그/참여자 전체교체)·삭제(soft) | 작성자 본인 |
| POST | `/api/v1/memories/{memoryId}/images/presign` | 이미지 presign(쿼터 초과 `507 STORAGE_QUOTA_EXCEEDED`) | 작성자 |
| POST | `/api/v1/memories/{memoryId}/images` | 업로드 커밋(`image_url`·`sort_order`) | 작성자 |
| DELETE | `/api/v1/memory-images/{imageId}` | 이미지 삭제 | 작성자 |
| PATCH | `/api/v1/memories/{memoryId}/images/order` | 순서 재정렬 | 작성자 |
| POST · GET | `/api/v1/memories/{memoryId}/comments` | 친구 한 줄 댓글 작성·목록 | 공간 멤버 |
| DELETE | `/api/v1/comments/{commentId}` | 댓글 삭제 | 작성자 본인 |

- `plan_id` 없이도 작성 가능 = **FREE MEMORY**(`plan_id` NULL, D3).

## 11. Lucky Letters (행운편지)

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/rooms/{roomId}/letters` | 발송(`receiverUserId` 지정 **또는** `broadcast=true`, `content`, `emoji?`) | 공간 멤버 |
| GET | `/api/v1/rooms/{roomId}/letters?box=received` | 받은 편지함 | 본인 수신분 |
| GET | `/api/v1/rooms/{roomId}/letters?box=sent` | 보낸 편지함 | 본인 발신분 |
| PATCH | `/api/v1/letters/{letterId}/read` | 읽음(`read_at`) | 수신자 |
| PATCH | `/api/v1/letters/{letterId}/favorite` | 즐겨찾기 토글 | 발신/수신자 |

- **"모두에게"**: `broadcast=true` → 서버가 ACTIVE 멤버(본인 제외) 수만큼 `receiver_id` 채운 row 팬아웃(받은편지함 쿼리 분기 없음).

## 12. Exp / Level / Mascot (서버 계산)

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| GET | `/api/v1/rooms/{roomId}/exp-logs` | 경험치 이력 | 공간 멤버 |
| GET | `/api/v1/rooms/{roomId}/level` | 현재 레벨·exp·다음까지 | 공간 멤버 |
| POST | `/api/v1/rooms/{roomId}/mascot/interact` | 마스코트 교감 → `MASCOT_INTERACT` +2. 하루 3회 초과 `429 MASCOT_INTERACTION_LIMIT_REACHED` | 공간 멤버 |

- 그 외 exp는 **직접 API 없음** — 약속등록(+3)·완료(+15)·추억작성·편지 등이 서버 내부 부수효과로 적립.

## 13. Notifications (알림)

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| GET | `/api/v1/rooms/{roomId}/notifications` | 알림 목록(탭 `type`=NOTICE/FRIEND/JOIN) | 본인 수신분 |
| PATCH | `/api/v1/notifications/{id}/read` | 읽음 | 수신자 |
| PATCH | `/api/v1/rooms/{roomId}/notifications/read-all` | 전체 읽음 | 본인 |

- 서버가 멤버 입·퇴장·방 설정 변경·가입 신청 등을 트리거로 생성(클라 생성 API 없음).

---

## 14. 주요 에러 코드

| code | HTTP | 의미 |
|---|---|---|
| `ROOM_MEMBER_NOT_FOUND` | 403 | 공간 멤버 아님 |
| `NOT_WRITER` | 403 | 작성자 본인 아님 |
| `ROOM_CAPACITY_EXCEEDED` | 409 | 정원 8명 초과 |
| `INVITE_EXPIRED` / `INVITE_ALREADY_USED` | 409 | 초대 코드 |
| `JOIN_REQUEST_ALREADY_PROCESSED` | 409 | 낙관적 락 경합(다른 멤버가 먼저 처리) |
| `JOIN_REQUEST_UNDO_EXPIRED` | 409 | 5분 되돌리기 만료 |
| `PLAN_NOT_COMPLETED` | 409 | 완료 전 추억 작성 |
| `MEMORY_ALREADY_WRITTEN` | 409 | `(plan_id, writer_id)` 중복 |
| `STAGE_LOCKED` | 423 | 인생4컷 이전 단계 미완료 |
| `STAGE_ALREADY_UPLOADED` | 409 | 단계 재업로드 |
| `STORAGE_QUOTA_EXCEEDED` | 507 | 저장 공간 부족(롤백) |
| `MASCOT_INTERACTION_LIMIT_REACHED` | 429 | 마스코트 하루 3회 초과 |
| `RATE_LIMITED` | 429 | 발송/코드생성 속도 제한 |

---

## 관련 문서
- DB 스키마(18테이블) → [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md)
- 개발 로드맵 → [`roadmap.md`](roadmap.md) · 팀 시작 → [`팀-시작가이드.md`](팀-시작가이드.md)
- 화면 명세(동작 기준) → `../test-web-design/*/*.md`
