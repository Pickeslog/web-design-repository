# 🍀 Clov — API 계약 (단일 기준 · SSOT)

> **이 문서가 프론트·백 공통 API 계약의 유일한 기준(Single Source of Truth)이다.**
> `clov-api/docs/API-CONTRACT.md`·`clov-web/docs/API-CONTRACT.md`는 이 문서를 가리키는 포인터일 뿐이다.
> **계약 변경은 리더만** 이 문서를 수정한다. 다른 사람은 이슈로 제안한다.
> 근거: DB [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md)(19테이블) · 화면 명세(`../test-web-design/*/*.md`).
> 최종 갱신: 2026-07-20 — §2 `details`·§14 공통 6종(#3) + §4-1 auth 스키마·인증 에러코드·비번 정책(#6) + §4-2 소셜 토큰 전달(일회성 코드)·동의(#5 준비) + **§4-3 공통 읽기 모델·§5~§13 요청/응답·pagination 스키마 보강**(발명 위험 제거, M2 팬아웃 선행) + §4 소셜 콜백 `users` 생성 시점 정정(consent-선행). 이전 2026-07-14 — 구 계약(즉시입장·OAuth-only·SB3.5) 대체.

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
// 실패 (검증) — error.details는 VALIDATION_FAILED에서만 채운다(그 외 생략)
{ "success": false, "error": { "code": "VALIDATION_FAILED", "message": "입력값을 확인해주세요.",
    "details": [ { "field": "email", "reason": "형식 오류" } ] } }
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
| GET | `/login/oauth2/code/{provider}` | 소셜 콜백(Spring 처리) — 성공 시 **일회성 코드 발급 후 프론트로 리다이렉트**. 여기서 `users`를 만들지 않는다(신규 판정=exchange, 생성=consent → §4-2) |

- 비밀번호는 **BCrypt 해시** 저장. 소셜 전용 계정은 `password` NULL(`oauth_provider`/`oauth_subject`로 식별).
- Access Token 만료 짧게(예: 30분). 토큰 무효화는 Refresh `revoked_at`으로.

### 4-1. 요청/응답 본문 (2026-07-20 확정)

> 봉투는 §2. 아래는 성공 시 `data` 또는 요청 본문. **camelCase · ID는 문자열.**

**인증 성공 data (signup·login 공통)**
```jsonc
{ "accessToken": "eyJ...", "refreshToken": "eyJ...",
  "user": { "id": "1024", "email": "a@b.com", "nickname": "클로버",
            "profileImageUrl": null, "birthdate": "1998-03-21",
            "personalInviteCode": "CLV-7X2A9K" } }
```

**signup** `POST /api/v1/auth/signup` — **가입 즉시 로그인**(위 data 그대로 201)
```jsonc
// 요청
{ "email": "a@b.com", "password": "aB3!xyzq", "nickname": "클로버",
  "birthdate": "1998-03-21",            // 선택, 생략/null 허용
  "agreements": { "service": true, "privacy": true, "marketing": false } }
```
- `service`·`privacy`가 false면 `400 TERMS_REQUIRED`. 동의 시각을 `users`의 `terms_agreed_at`·`privacy_agreed_at`·`marketing_agreed_at`에 기록.
- 프로필 이미지는 **가입 시 받지 않는다**(기본 이미지). 가입 후 `POST /users/me/profile-image/presign`으로 업로드.
- `personal_invite_code`는 **서버 생성**(예: `CLV-` + Base32 6자, UNIQUE 충돌 시 재생성).
- 이메일 중복 → `409 EMAIL_DUPLICATED`.

**login** `POST /api/v1/auth/login`
```jsonc
{ "email": "a@b.com", "password": "aB3!xyzq" }   // → 위 인증 성공 data (200)
```
- 실패는 이메일 존재 여부를 노출하지 않도록 **동일** `401 INVALID_CREDENTIALS`.

**refresh** `POST /api/v1/auth/refresh` — refreshToken은 **요청 본문**으로 전송(URL 쿼리스트링 금지)
```jsonc
{ "refreshToken": "eyJ..." }
// → { "accessToken": "eyJ...", "refreshToken": "eyJ..." }   회전: 기존 revoke, 신규 발급
```
- 위조/형식 오류 `401 INVALID_TOKEN`, 만료 또는 `revoked_at` 존재 `401 TOKEN_EXPIRED`.

**logout** `POST /api/v1/auth/logout`
```jsonc
{ "refreshToken": "eyJ..." }   // → data: null, 해당 refresh의 revoked_at 기록
```

**비밀번호 정책**: 8~20자, 영문·숫자·특수문자 중 **2종 이상**. 백엔드 `@Valid`와 프론트 규칙을 동일하게 맞춘다.

### 4-2. 소셜 로그인 — 토큰 전달·약관 동의 (2026-07-20 확정)

브라우저 리다이렉트 흐름이라 토큰을 JSON 본문으로 못 준다. **일회성 교환 코드**로 넘긴다. ❌ URL 쿼리스트링에 `accessToken`/`refreshToken` 직접 담기 금지(로그·Referer 유출).

1. 프론트: 소셜 버튼 → `GET /oauth2/authorization/{provider}` 로 이동
2. 소셜 콜백 `GET /login/oauth2/code/{provider}`(Spring 처리) → 성공 핸들러가 소셜 프로필로 **일회성 코드**(수명 ~60초·1회용) 발급 → 프론트로 리다이렉트: `{app.oauth2.redirect-url}?code={oneTimeCode}` (예: `http://localhost:5173/oauth2/redirect?code=...`). **신규/기존 판정과 `users` 조회·생성은 exchange·consent 단계**에서(콜백은 코드만 발급).
3. 프론트 `/oauth2/redirect`: URL의 `code`를 읽어 교환 요청

**exchange** `POST /api/v1/auth/oauth/exchange`
```jsonc
{ "code": "..." }   // 일회성 코드
// (A) 기존 사용자/동의 완료 → 인증 성공 data(§4-1과 동일)
{ "authenticated": true, "accessToken": "...", "refreshToken": "...", "user": { /* UserSummary */ } }
// (B) 신규 소셜 사용자(약관 동의 필요)
{ "authenticated": false, "registrationToken": "...",
  "profile": { "email": "a@b.com", "nickname": "카카오닉네임", "provider": "kakao" } }
```
- 코드 무효/만료/재사용 → `401 OAUTH_CODE_INVALID` · 이메일 미수신 → `400 OAUTH_EMAIL_REQUIRED`

**consent** `POST /api/v1/auth/oauth/consent` — 위 (B) 신규 소셜 사용자만
```jsonc
{ "registrationToken": "...", "agreements": { "service": true, "privacy": true, "marketing": false } }
// → users 생성(동의 시각 기록) 후 인증 성공 data(§4-1)
{ "accessToken": "...", "refreshToken": "...", "user": { /* UserSummary */ } }
```
- 필수 약관(`service`·`privacy`) false → `400 TERMS_REQUIRED` · `registrationToken` 무효/만료 → `401 OAUTH_CODE_INVALID`
- 소셜 계정은 `password` NULL, `oauth_provider`/`oauth_subject`로 식별. 이메일 로그인 불가(§4-1 login은 password NULL 계정 거부).

### 4-3. 공통 읽기 모델 (§5~§13 공유 DTO)

> §5~§13 응답에서 반복되는 표현. 봉투·페이지네이션·목록 봉투(`items`/`page`/`size`/`total`)는 §2. **camelCase · ID는 문자열 · snake_case 컬럼은 camelCase로 직렬화.** DTO 클래스명은 구현 재량(이름 강제 아님) — **JSON 필드 형태만 계약**.

**UserSummary** — 멤버·참여자·댓글·편지·알림 등에서 사람을 가리킬 때
```jsonc
{ "id": "1024", "nickname": "클로버", "profileImageUrl": null }
```
**RoomSummary** — 방 목록/카드
```jsonc
{ "id": "31", "name": "제주 가치가자", "themeColor": "#7CC6A6", "transportType": "airplane",
  "coverPhotoUrl": null, "coverTitle": null, "friendshipLevel": 3, "expPoint": 420,
  "status": "ACTIVE", "memberCount": 5, "isFavorite": true, "scheduledDeleteAt": null }
```
**Presign 응답** — 모든 `*/presign`(프로필·인생4컷·추억 이미지) 공통. 클라가 `uploadUrl`로 PUT 후 커밋 API 호출
```jsonc
{ "uploadUrl": "https://.../put?...", "imageUrl": "https://cdn.../abc.jpg", "expiresIn": 300 }
```

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

### 5-1. 요청/응답

**GET `/users/me`** → `UserProfile`
```jsonc
{ "id": "1024", "email": "a@b.com", "nickname": "클로버", "profileImageUrl": null,
  "birthdate": "1998-03-21", "personalInviteCode": "CLV-7X2A9K",
  "isSocial": false, "createdAt": "2026-07-01T09:12:00" }
```
**PATCH `/users/me`** — 보낸 필드만 수정 → `UserProfile`
```jsonc
{ "nickname": "새클로버", "profileImageUrl": "https://cdn.../me.jpg", "birthdate": "1998-03-21" }
```
**PATCH `/users/me/password`** → `data: null`. 현재 비번 불일치 → `401 INVALID_CREDENTIALS`. 성공 시 기존 refresh 전부 revoke
```jsonc
{ "currentPassword": "aB3!xyzq", "newPassword": "cD5!wxyz" }
```
**POST `/users/me/profile-image/presign`** → Presign 응답(§4-3)
```jsonc
{ "contentType": "image/jpeg", "fileSize": 812345 }
```
**GET `/users/me/rooms?sort=favorite|latest|oldest`** → 목록 봉투, `items` = `RoomSummary[]`(§4-3)
**DELETE `/users/me`** → `data: null` (익명화 = `isAnonymized` true·닉네임 "언노운", refresh 전부 revoke)
**GET `/users/me/preferences`** → `Preferences`
```jsonc
{ "darkMode": false, "customColor": null, "wallpaperIcon": null, "dashboardBackground": null,
  "letterTheme": "postbox", "memoryCardTheme": "clothesline", "mascotType": "crobi" }
```
**PATCH `/users/me/preferences`** — 보낸 필드만 → 갱신된 `Preferences`

## 6. Rooms (우정공간)

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| GET | `/api/v1/rooms` | 내가 **ACTIVE 멤버인** 우정공간 목록(즐겨찾기 우선·최근 생성순). "잠자는 방"(INACTIVE) 목록은 후속 분리 | 로그인 |
| POST | `/api/v1/rooms` | 생성(생성자=첫 멤버, 일반 멤버와 동일) | 로그인 |
| GET | `/api/v1/rooms/{roomId}` | 상세(이름·레벨·exp·멤버수) | 공간 멤버 |
| PATCH | `/api/v1/rooms/{roomId}` | 수정(`name`·`description`≤60·`theme_color`·`transport_type`·`cover_photo_url`·`cover_title`) → 전 멤버 알림 팬아웃 | 공간 멤버(누구나) |
| POST | `/api/v1/rooms/{roomId}/cover-image/presign` | 대표 커버 이미지 업로드용 presigned PUT URL 발급(§4-3, `PresignRequest`→`PresignResponse`). 업로드 후 PATCH `cover_photo_url`로 커밋 | 공간 멤버 |
| GET | `/api/v1/rooms/{roomId}/members` | 멤버 목록(ACTIVE/LEFT) | 공간 멤버 |
| DELETE | `/api/v1/rooms/{roomId}/members/me` | 나가기(row 삭제 아님, `status=LEFT`) | 본인 |
| PATCH | `/api/v1/rooms/{roomId}/members/me/status-message` | 이 방에서의 내 상태메시지 | 본인 |
| PATCH | `/api/v1/rooms/{roomId}/favorite` | 즐겨찾기 토글(`room_members.is_favorite`) | 본인 |
| POST | `/api/v1/rooms/{roomId}/revive` | "잠자는 방" 되살리기(`INACTIVE`+삭제예정 전) | 과거 멤버 |

- 전원 `LEFT` → 서버가 `status=INACTIVE` + `scheduled_delete_at`(+30일) 자동 설정. 별도 "방 삭제" API 없음.

### 6-1. 요청/응답

**GET `/rooms`** → 목록 봉투, `items` = `RoomSummary[]` (즐겨찾기 우선·최근 생성순). 내가 **ACTIVE 멤버인 ACTIVE 방만**. 빈 목록이면 `items: []`. (전원 LEFT로 INACTIVE된 "잠자는 방" 되살리기 목록은 후속 엔드포인트로 분리.)
```jsonc
{ "id": "31", "name": "제주 가치가자", "description": "졸업 여행 준비방",
  "themeColor": "#7CC6A6", "transportType": "airplane", "coverPhotoUrl": null,
  "friendshipLevel": 3, "memberCount": 5, "isFavorite": true,
  "status": "ACTIVE", "createdAt": "2026-06-30T10:00:00" }
```
> `RoomSummary` = 목록 카드용 축약(RoomDetail에서 `expPoint`·`myStatusMessage`·`scheduledDeleteAt`·`coverTitle` 제외). 상세는 `GET /rooms/{roomId}`.

**POST `/rooms`** (201) → `RoomDetail`
```jsonc
{ "name": "제주 가치가자", "description": "졸업 여행 준비방",
  "themeColor": "#7CC6A6", "transportType": "airplane",
  "coverPhotoUrl": null, "coverTitle": null }
```
**GET `/rooms/{roomId}`** → `RoomDetail`(RoomSummary + 상세)
```jsonc
{ "id": "31", "name": "제주 가치가자", "description": "졸업 여행 준비방",
  "themeColor": "#7CC6A6", "transportType": "airplane", "coverPhotoUrl": null, "coverTitle": null,
  "friendshipLevel": 3, "expPoint": 420, "status": "ACTIVE",
  "memberCount": 5, "isFavorite": true, "myStatusMessage": "다이어트 중",
  "scheduledDeleteAt": null, "createdAt": "2026-06-30T10:00:00" }
```
**PATCH `/rooms/{roomId}`** — 보낸 필드만(`name`·`description`≤60·`themeColor`·`transportType`·`coverPhotoUrl`·`coverTitle`) → `RoomDetail`, 전 멤버 알림 팬아웃
**GET `/rooms/{roomId}/members`** → 목록 봉투, `items` = `RoomMember[]`
```jsonc
{ "membershipId": "88", "userId": "1024", "nickname": "클로버", "profileImageUrl": null,
  "status": "ACTIVE", "statusMessage": "다이어트 중",
  "joinedAt": "2026-06-30T10:00:00", "leftAt": null }
```
**DELETE `/rooms/{roomId}/members/me`** → `data: null` (`status=LEFT`)
**PATCH `/rooms/{roomId}/members/me/status-message`** → `{ "statusMessage": "..." }`
```jsonc
{ "statusMessage": "다이어트 중" }
```
**PATCH `/rooms/{roomId}/favorite`** → `{ "isFavorite": true }`
```jsonc
{ "isFavorite": true }
```
**POST `/rooms/{roomId}/revive`** → `RoomDetail` (`status` ACTIVE 복원, `scheduledDeleteAt` NULL)

## 7. Invites & Join Requests (가입 신청·승인 — D1)

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/rooms/{roomId}/invites` | 초대 코드 생성/**재발급**(방당 1개 고정 — 재발급=제자리 회전, `created_by`=이력) | 공간 멤버 |
| GET | `/api/v1/rooms/{roomId}/invites` | 현재 활성 코드(방당 0/1개) — `items` 봉투 유지 | 공간 멤버 |
| DELETE | `/api/v1/invites/{inviteId}` | 코드 취소(`CANCELED`) | 만든 본인 |
| POST | `/api/v1/invites/accept` | 코드로 **입장 신청** → `room_join_requests`(PENDING) 생성. 코드는 **다회용**(소모 안 됨). **입장 확정 아님** | 로그인(비멤버·정원 미만) |
| GET | `/api/v1/rooms/{roomId}/join-requests` | 대기 신청 목록(알림 배지) | 공간 멤버 |
| POST | `/api/v1/join-requests/{id}/accept` | **수락** → `room_members`(ACTIVE) 생성, `accepted_by`·`undo_deadline_at`(+5분) 기록, 전 멤버 알림 | 공간 멤버(누구나 1명), 정원 미만 |
| POST | `/api/v1/join-requests/{id}/reject` | 거절(`REJECTED`) | 공간 멤버 |
| POST | `/api/v1/join-requests/{id}/undo` | **5분 되돌리기** — `undo_deadline_at` 이전만. 멤버 row 제거, 신청 `PENDING` 복원 | 수락한 본인만 |

- **동시성**: `accept`/`reject`/`undo`는 `room_join_requests.version` 낙관적 락. 이미 처리됨 → `409 JOIN_REQUEST_ALREADY_PROCESSED`. 되돌리기 만료 → `409 JOIN_REQUEST_UNDO_EXPIRED`.
- **정원**: `accept` 트랜잭션에서 ACTIVE 멤버 수 `FOR UPDATE` 카운트 ≤ 8 확인. 초과 → `409 ROOM_CAPACITY_EXCEEDED`(신청은 PENDING 유지).
- **초대 코드 구조(A안, 2026-07-23)**: 방마다 초대 코드는 **한 행**(`room_invites` `UNIQUE(room_id)`). POST(재발급)는 새 행이 아니라 **제자리 회전**(upsert: 코드·만료 갱신, `status='ACTIVE'`) → USED/CANCELED 행이 누적되지 않는다. 코드는 **다회용**(수락해도 `USED`로 소모하지 않음 → 여러 친구가 한 코드로 신청). 유효하지 않은 코드(취소=`CANCELED`/만료)는 `409 INVITE_EXPIRED`로 통일(다회용이라 `INVITE_ALREADY_USED`는 더 이상 반환하지 않음). 상태 도메인=`ACTIVE`/`CANCELED`.

### 7-1. 요청/응답

**POST `/rooms/{roomId}/invites`** → `Invite`
```jsonc
{ "expiresInHours": 72 }   // 선택, 생략 시 서버 기본
// →
{ "id": "5", "inviteCode": "CLV-JOIN-8H2K", "status": "ACTIVE",
  "expiresAt": "2026-07-23T10:00:00", "createdAt": "2026-07-20T10:00:00" }
```
**GET `/rooms/{roomId}/invites`** → 목록 봉투, `items` = `Invite[]`
**DELETE `/invites/{inviteId}`** → `data: null` (`status=CANCELED`)
**POST `/invites/accept`** → `JoinRequest`(신청 생성 = 입장 아님)
```jsonc
{ "inviteCode": "CLV-JOIN-8H2K" }
// →
{ "id": "40", "roomId": "31", "status": "PENDING", "requestedAt": "2026-07-20T11:00:00" }
```
**GET `/rooms/{roomId}/join-requests`** → 목록 봉투, `items` = `JoinRequest`(신청자 포함)
```jsonc
{ "id": "40", "roomId": "31", "applicant": { /* UserSummary */ },
  "status": "PENDING", "requestedAt": "2026-07-20T11:00:00" }
```
**POST `/join-requests/{id}/accept`** → 수락 결과. 정원 초과 → `409 ROOM_CAPACITY_EXCEEDED`, 경합 → `409 JOIN_REQUEST_ALREADY_PROCESSED`
```jsonc
{ "membershipId": "89", "roomId": "31", "userId": "2048", "undoDeadlineAt": "2026-07-20T11:05:00" }
```
**POST `/join-requests/{id}/reject`** → `data: null` (`status=REJECTED`)
**POST `/join-requests/{id}/undo`** → `data: null` (멤버 제거·신청 `PENDING` 복원). 만료 → `409 JOIN_REQUEST_UNDO_EXPIRED`

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

### 8-1. 요청/응답

**POST `/rooms/{roomId}/plans`** (201) → `PlanDetail`
```jsonc
{ "title": "제주 도착 첫날", "planDate": "2026-08-10", "description": "공항 10시 집합" }
```
**GET `/rooms/{roomId}/plans?status=SCHEDULED&from=2026-08-01&to=2026-08-31`** → 목록 봉투, `items` = `PlanSummary[]`
```jsonc
{ "id": "77", "title": "제주 도착 첫날", "planDate": "2026-08-10",
  "status": "SCHEDULED", "memoryStatus": "NONE", "writer": { /* UserSummary */ } }
```
**GET `/plans/{planId}`** → `PlanDetail`(체크리스트 포함)
```jsonc
{ "id": "77", "roomId": "31", "writer": { /* UserSummary */ }, "title": "제주 도착 첫날",
  "planDate": "2026-08-10", "description": "공항 10시 집합", "status": "SCHEDULED",
  "memoryStatus": "NONE", "completedAt": null,
  "checklists": [ { "id": "9", "content": "항공권 예매", "checked": true } ],
  "createdAt": "2026-07-20T12:00:00" }
```
**PATCH `/plans/{planId}`** — 보낸 필드만(`title`·`planDate`·`description`) → `PlanDetail`
**POST `/plans/{planId}/complete`** → `PlanDetail`(`status=COMPLETED`·`memoryStatus=CANDIDATE`)
**POST `/plans/{planId}/cancel`** → `PlanDetail`(`status=CANCELED`)
**POST `/plans/{planId}/skip-memory`** → `PlanDetail`(`memoryStatus=SKIPPED`)
**GET `/plans/{planId}/stage-photos`** → `items` = `StagePhoto[]`(4단계 고정, `state`는 서버 계산)
```jsonc
// 완료 단계
{ "stage": "PROPOSAL", "state": "DONE", "imageUrl": "https://cdn.../s1.jpg",
  "uploadedBy": { /* UserSummary */ }, "createdAt": "2026-07-20T12:10:00" }
// 잠긴 단계
{ "stage": "MEETING", "state": "LOCKED", "imageUrl": null, "uploadedBy": null, "createdAt": null }
```
**POST `/plans/{planId}/stage-photos/presign`** → Presign 응답(§4-3). 직전 단계 미완료 → `423 STAGE_LOCKED`
```jsonc
{ "stage": "SCHEDULING", "contentType": "image/jpeg" }
```
**POST `/plans/{planId}/stage-photos`** → 등록된 `StagePhoto`. 재업로드 → `409 STAGE_ALREADY_UPLOADED`
```jsonc
{ "stage": "SCHEDULING", "imageUrl": "https://cdn.../s2.jpg" }
```

## 9. Plan Checklists

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/plans/{planId}/checklists` | 항목 추가 | 공간 멤버 |
| PATCH | `/api/v1/checklists/{checklistId}` | 수정·`checked` 토글 | 공간 멤버(공동) |
| DELETE | `/api/v1/checklists/{checklistId}` | 삭제 | 공간 멤버 |

### 9-1. 요청/응답

**POST `/plans/{planId}/checklists`** → `Checklist`
```jsonc
{ "content": "항공권 예매" }
// →  { "id": "9", "content": "항공권 예매", "checked": false }
```
**PATCH `/checklists/{checklistId}`** — `content`·`checked` 중 보낸 것만 → `Checklist`
```jsonc
{ "checked": true }
```
**DELETE `/checklists/{checklistId}`** → `data: null`

## 10. Memories (추억) & Comments

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/plans/{planId}/memories` | 내 추억 작성(`title`≤25·`content`≤100·`tags[]`·`participantUserIds[]`) → plan `memory_status=WRITTEN`. `CANDIDATE`/`WRITTEN`만 허용(`NONE`→`PLAN_NOT_COMPLETED`). `UNIQUE(plan_id,writer_id)` 위반 → `409 MEMORY_ALREADY_WRITTEN`(PATCH로) | 공간 멤버 |
| POST | `/api/v1/rooms/{roomId}/memories` | **FREE MEMORY** 작성(`plan_id` NULL, D3) — plan 없이 방 단위 추억. body는 `/plans/{planId}/memories`와 동일(단 `planId` 없음). plan `memory_status` 전이·`PLAN_NOT_COMPLETED`·`MEMORY_ALREADY_WRITTEN` 검증 **미적용** | 공간 멤버 |
| GET | `/api/v1/rooms/{roomId}/memories` | 피드(월별·`writer_id`·`tag`·`participantUserId` 필터) | 공간 멤버 |
| GET | `/api/v1/memories/{memoryId}` | 상세(이미지·태그·참여자·댓글수) | 공간 멤버 |
| PATCH · DELETE | `/api/v1/memories/{memoryId}` | 수정(태그/참여자 전체교체)·삭제(soft) | 작성자 본인 |
| POST | `/api/v1/memories/{memoryId}/images/presign` | 이미지 presign(쿼터 초과 `507 STORAGE_QUOTA_EXCEEDED`) | 작성자 |
| POST | `/api/v1/memories/{memoryId}/images` | 업로드 커밋(`image_url`·`sort_order`) | 작성자 |
| DELETE | `/api/v1/memory-images/{imageId}` | 이미지 삭제 | 작성자 |
| PATCH | `/api/v1/memories/{memoryId}/images/order` | 순서 재정렬 | 작성자 |
| POST · GET | `/api/v1/memories/{memoryId}/comments` | 친구 한 줄 댓글 작성·목록 | 공간 멤버 |
| DELETE | `/api/v1/comments/{commentId}` | 댓글 삭제 | 작성자 본인 |

- `plan_id` 없이도 작성 가능 = **FREE MEMORY**(`plan_id` NULL, D3) → `POST /rooms/{roomId}/memories`.

### 10-1. 요청/응답

**POST `/plans/{planId}/memories`** (201) → `MemoryDetail`
```jsonc
{ "title": "인생 첫 한라산",        // ≤ 25
  "content": "정상에서 라면...",    // ≤ 100
  "memoryDate": "2026-08-11",
  "tags": ["한라산", "라면"],
  "participantUserIds": ["1024", "2048"] }
```
- `CANDIDATE`/`WRITTEN`만 허용(`NONE` → `409 PLAN_NOT_COMPLETED`), `(plan_id, writer_id)` 중복 → `409 MEMORY_ALREADY_WRITTEN`.
- ✅ **FREE MEMORY(planId NULL) 생성** = `POST /rooms/{roomId}/memories`(리더 확정 2026-07-21). body는 위 `POST /plans/{planId}/memories`와 동일하되 `planId` 없음 → `plan_id` NULL 저장, plan `memory_status` 전이 없음, `PLAN_NOT_COMPLETED`·`MEMORY_ALREADY_WRITTEN` 검증 미적용.

**GET `/rooms/{roomId}/memories?month=2026-08&writerId=1024&tag=한라산&participantUserId=2048`** → 목록 봉투, `items` = `MemorySummary[]`
```jsonc
{ "id": "301", "planId": "77", "title": "인생 첫 한라산", "content": "정상에서 라면...",
  "memoryDate": "2026-08-11", "thumbnailUrl": "https://cdn.../m1.jpg", "imageCount": 3,
  "writer": { /* UserSummary */ }, "participants": [ { /* UserSummary */ } ],
  "tags": ["한라산"], "commentCount": 3 }
```
카드 리치 표시용: `content`(본문 미리보기)·`thumbnailUrl`(대표 이미지, 최소 sort_order)·`imageCount`(총 이미지 수)·`participants`(참여 멤버) 포함.
**GET `/memories/{memoryId}`** → `MemoryDetail`
```jsonc
{ "id": "301", "roomId": "31", "planId": "77", "writer": { /* UserSummary */ },
  "title": "인생 첫 한라산", "content": "정상에서 라면...", "memoryDate": "2026-08-11",
  "images": [ { "id": "9", "imageUrl": "https://cdn.../m1.jpg", "sortOrder": 0 } ],
  "tags": ["한라산", "라면"],
  "participants": [ { /* UserSummary */ } ],
  "commentCount": 3, "createdAt": "2026-08-12T09:00:00" }
```
**PATCH `/memories/{memoryId}`** — 보낸 필드만. `tags`·`participantUserIds`는 **전체 교체** → `MemoryDetail`
**POST `/memories/{memoryId}/images/presign`** → Presign 응답(§4-3). 쿼터 초과 → `507 STORAGE_QUOTA_EXCEEDED`
**POST `/memories/{memoryId}/images`** → `{ "id": "9", "imageUrl": "...", "sortOrder": 0 }`
**DELETE `/memory-images/{imageId}`** → `data: null`
**PATCH `/memories/{memoryId}/images/order`** → 갱신된 `images[]`
```jsonc
{ "imageIds": ["11", "9", "10"] }   // 이 순서대로 sortOrder 재부여
```
**POST `/memories/{memoryId}/comments`** → `Comment`; **GET** → 목록 봉투 `items` = `Comment[]`
```jsonc
{ "content": "너 진짜 웃겼어" }
// →
{ "id": "55", "writer": { /* UserSummary */ }, "content": "너 진짜 웃겼어", "createdAt": "2026-08-12T10:00:00" }
```
**DELETE `/comments/{commentId}`** → `data: null`

## 11. Lucky Letters (행운편지)

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/rooms/{roomId}/letters` | 발송(`receiverUserId` 지정 **또는** `broadcast=true`, `content`, `emoji?`) | 공간 멤버 |
| GET | `/api/v1/rooms/{roomId}/letters?box=received` | 받은 편지함 | 본인 수신분 |
| GET | `/api/v1/rooms/{roomId}/letters?box=sent` | 보낸 편지함 | 본인 발신분 |
| PATCH | `/api/v1/letters/{letterId}/read` | 읽음(`read_at`) | 수신자 |
| PATCH | `/api/v1/letters/{letterId}/favorite` | 즐겨찾기 토글 | 발신/수신자 |

- **"모두에게"**: `broadcast=true` → 서버가 ACTIVE 멤버(본인 제외) 수만큼 `receiver_id` 채운 row 팬아웃(받은편지함 쿼리 분기 없음).

### 11-1. 요청/응답

**POST `/rooms/{roomId}/letters`** → 지정 발송이면 `Letter`, `broadcast=true`면 `{ "sentCount": n }`
```jsonc
// 지정
{ "receiverUserId": "2048", "content": "고마웠어", "emoji": "💌" }
// 모두에게(팬아웃)
{ "broadcast": true, "content": "다들 고마워", "emoji": "🍀" }
```
- `receiverUserId`와 `broadcast`는 **배타적**(둘 다/둘 다 아님 → `400 VALIDATION_FAILED`). `emoji` 생략 시 프론트 기본값 💌.

**GET `/rooms/{roomId}/letters?box=received|sent`** → 목록 봉투, `items` = `Letter[]`
```jsonc
{ "id": "120", "sender": { /* UserSummary */ }, "receiver": { /* UserSummary */ },
  "content": "고마웠어", "emoji": "💌", "readAt": null, "isFavorite": false, "sentAt": "2026-08-12T11:00:00" }
```
**PATCH `/letters/{letterId}/read`** → `{ "readAt": "2026-08-12T11:30:00" }` (수신자만)
**PATCH `/letters/{letterId}/favorite`** → `{ "isFavorite": true }` (발신/수신자 각각, `letter_favorites`)
```jsonc
{ "isFavorite": true }
```

## 12. Exp / Level / Mascot (서버 계산)

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| GET | `/api/v1/rooms/{roomId}/exp-logs` | 경험치 이력 | 공간 멤버 |
| GET | `/api/v1/rooms/{roomId}/level` | 현재 레벨·exp·다음까지 | 공간 멤버 |
| POST | `/api/v1/rooms/{roomId}/mascot/interact` | 마스코트 교감 → `MASCOT_INTERACT` +2. 하루 3회 초과 `429 MASCOT_INTERACTION_LIMIT_REACHED` | 공간 멤버 |

- 그 외 exp는 **직접 API 없음** — 약속등록·완료·추억작성이 서버 내부 부수효과로 적립.

**레벨 규칙 (리더 확정 2026-07-24)**

- **`exp_point` = 현재 레벨 안에서의 진행 XP**(누적 총량 아님). 누적 이력은 `friendship_exp_logs`로 본다.
- **레벨당 100 XP**(`expForNextLevel` = 100). 프로토타입 `space.js`의 `levelProgress`(0~100)와 같은 체감으로 맞춘 값 — 기존 백엔드 상수 500은 폐기.
- **레벨업은 연속 처리**: 한 번에 큰 XP가 들어와 100을 여러 번 넘기면 넘긴 만큼 레벨이 오른다(`while (exp >= 100 && level < 777) { level++; exp -= 100 }`). 초과분이 진행도로 남는다.
- **만렙 777**: 도달 후에는 XP를 적립하지 않고 `exp_point`를 0으로 고정한다.
- 모든 적립은 `friendship_exp_logs`에 **한 행씩 기록**하고(`action_type`·`exp_delta`·`reference_id`·`triggered_by`), 같은 트랜잭션에서 `friendship_rooms`를 갱신한다.

**XP 적립 지점 (MVP 범위 — 리더 확정 2026-07-24)**

| action_type | 트리거 | exp_delta | reference_id |
|---|---|---|---|
| `MEMORY_CREATE` | 추억 작성 | 25 + 사진 보너스 + 글자 보너스 | memoryId |
| `PLAN_CREATE` | 약속 등록 | 3 | planId |
| `PLAN_COMPLETE` | 약속 완료 | 15 | planId |
| `MASCOT_INTERACT` | 마스코트 교감 | 2 (하루 3회) | null |

- **사진 보너스**: 첨부 1장당 +1, **최대 +10**(10장 초과해도 10에서 고정)
- **글자 보너스**: 본문 100자 이상 +10 / 50자 이상 +5 — **도달한 최고 구간 1개만**(중첩 없음)
- 추억 1건은 위 세 값을 합쳐 **한 행(`MEMORY_CREATE`)으로 기록**한다(보너스를 별도 행으로 쪼개지 않는다).

**MVP 범위 밖(후속 과제)** — 이벤트정의서 §9.2·§9.3·§9.5 참조

- XP 가속도(누적 게시글 30/50/70/100 → ×1.2/1.5/2/3)
- 기억의 샘(매일 첫 접속 패시브 지급)
- 편지 XP — §9.1 표에 없어 **MVP에서는 적립하지 않는다**(도입하려면 이벤트정의서 §9.1에 먼저 추가)
- XP 회수(게시글 삭제 시 반환) — 프로토타입 `revokeXP`에는 있으나 명세 미정의. **MVP는 회수하지 않는다**(로그는 남고 레벨은 내려가지 않음)

### 12-1. 요청/응답

**GET `/rooms/{roomId}/exp-logs`** → 목록 봉투, `items` = `ExpLog[]`
```jsonc
{ "id": "900", "actionType": "PLAN_COMPLETE", "expDelta": 15,
  "triggeredBy": { /* UserSummary */ }, "referenceId": "77", "createdAt": "2026-08-11T20:00:00" }
```
**GET `/rooms/{roomId}/level`** → 레벨 현황(서버 계산). `expPoint`는 **현재 레벨 안의 진행 XP**, `expForNextLevel`은 항상 100(만렙 777이면 `expPoint`=0·`remainingToNextLevel`=0)
```jsonc
{ "friendshipLevel": 3, "expPoint": 42, "expForNextLevel": 100, "remainingToNextLevel": 58 }
```
**POST `/rooms/{roomId}/mascot/interact`** → 교감 결과(+2). 하루 3회 초과 → `429 MASCOT_INTERACTION_LIMIT_REACHED`
```jsonc
{ "expDelta": 2, "remainingToday": 1, "friendshipLevel": 3, "expPoint": 422 }
```

## 13. Notifications (알림)

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| GET | `/api/v1/rooms/{roomId}/notifications` | 알림 목록(탭 `type`=NOTICE/FRIEND/JOIN) | 본인 수신분 |
| PATCH | `/api/v1/notifications/{id}/read` | 읽음 | 수신자 |
| PATCH | `/api/v1/rooms/{roomId}/notifications/read-all` | 전체 읽음 | 본인 |

- 서버가 멤버 입·퇴장·방 설정 변경·가입 신청 등을 트리거로 생성(클라 생성 API 없음).

### 13-1. 요청/응답

**GET `/rooms/{roomId}/notifications?type=NOTICE|FRIEND|JOIN`** → 목록 봉투, `items` = `Notification[]`
```jsonc
{ "id": "700", "type": "JOIN", "actor": { /* UserSummary */ },
  "referenceId": "40", "isRead": false, "createdAt": "2026-07-20T11:00:00" }
```
**PATCH `/notifications/{id}/read`** → `data: null`
**PATCH `/rooms/{roomId}/notifications/read-all`** → `{ "updatedCount": 12 }`

---

## 14. 주요 에러 코드

| code | HTTP | 의미 |
|---|---|---|
| **공통 (프레임워크)** | | |
| `VALIDATION_FAILED` | 400 | `@Valid` 입력 검증 실패(필드 상세는 `error.details`) |
| `UNAUTHORIZED` | 401 | 인증 토큰 없음/무효/만료 |
| `FORBIDDEN` | 403 | 인가 실패(도메인 코드 없을 때 fallback) |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `METHOD_NOT_ALLOWED` | 405 | 허용되지 않은 HTTP 메서드 |
| `INTERNAL_ERROR` | 500 | 처리되지 않은 예외 catch-all |
| **도메인** | | |
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
| **인증 (§4)** | | |
| `INVALID_CREDENTIALS` | 401 | 로그인 실패(이메일/비번). 계정 존재 여부 노출 금지 — 동일 응답 |
| `EMAIL_DUPLICATED` | 409 | 회원가입 이메일 중복 |
| `TERMS_REQUIRED` | 400 | 필수 약관(서비스·개인정보) 미동의 |
| `INVALID_TOKEN` | 401 | refresh 토큰 위조/형식 오류 |
| `TOKEN_EXPIRED` | 401 | refresh 토큰 만료 또는 `revoked_at` 존재 |
| `OAUTH_EMAIL_REQUIRED` | 400 | 소셜 로그인인데 이메일 미수신(`users.email` NOT NULL 방어) |
| `OAUTH_CODE_INVALID` | 401 | 소셜 일회성 코드/registrationToken 무효·만료·재사용(§4-2) |

> 규약: 에러코드는 **UPPER_SNAKE_CASE**. `VALIDATION_FAILED`의 `error.details`는 `[{field, reason}]` 배열(§2).

---

## 관련 문서
- DB 스키마(19테이블) → [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md)
- 개발 로드맵 → [`roadmap.md`](roadmap.md) · 팀 시작 → [`팀-시작가이드.md`](팀-시작가이드.md)
- 화면 명세(동작 기준) → `../test-web-design/*/*.md`
