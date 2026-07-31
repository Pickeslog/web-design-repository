# 🍀 Clov — API 계약 (단일 기준 · SSOT)

> **이 문서가 프론트·백 공통 API 계약의 유일한 기준(Single Source of Truth)이다.**
> `clov-api/docs/API-CONTRACT.md`·`clov-web/docs/API-CONTRACT.md`는 이 문서를 가리키는 포인터일 뿐이다.
> **계약 변경은 리더만** 이 문서를 수정한다. 다른 사람은 이슈로 제안한다.
> 근거: DB [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md)(20테이블) · 화면 명세(`../test-web-design/*/*.md`).
> 최종 갱신: 2026-07-30 — **§15 Shop(상점)·Wallet 신설**(#14) + §14 상점 에러 6종 + §5 `equippedItem` + **시작 골드 1,000 확정**(구현값 20,000은 테스트 데이터에 맞춘 값이라 폐기). 이전 2026-07-20 — §2 `details`·§14 공통 6종(#3) + §4-1 auth 스키마·인증 에러코드·비번 정책(#6) + §4-2 소셜 토큰 전달(일회성 코드)·동의(#5 준비) + **§4-3 공통 읽기 모델·§5~§13 요청/응답·pagination 스키마 보강**(발명 위험 제거, M2 팬아웃 선행) + §4 소셜 콜백 `users` 생성 시점 정정(consent-선행). 이전 2026-07-14 — 구 계약(즉시입장·OAuth-only·SB3.5) 대체.

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
// 실패 (검증) — error.details는 VALIDATION_FAILED, 그리고 계약에 명시된 도메인 에러에서만 채운다
// (명시 목록: ROOM_MEMBER_ALREADY_JOINED의 roomId. 그 외에는 생략)
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
| POST | `/api/v1/auth/password/forgot` | 비밀번호 재설정 메일 요청 — **결과와 무관하게 항상 200**(§4-4) |
| GET | `/api/v1/auth/password/reset` | 재설정 토큰 유효성 확인(화면 진입 시) |
| POST | `/api/v1/auth/password/reset` | 재설정 실행 — 성공 시 해당 사용자 Refresh 전부 revoke |
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

### 4-4. 비밀번호 재설정 (2026-07-29 신설)

> 이메일 가입 사용자의 유일한 열쇠가 비밀번호라, 복구 수단이 없으면 계정이 잠긴다. 소셜 전용 계정은 대상이 아니다(`password` NULL).

**POST `/auth/password/forgot`**
```jsonc
{ "email": "a@b.com" }
// → 200  data: null   (계정 유무·소셜 여부와 무관하게 동일)
```
- 이메일 계정이 존재하면 재설정 토큰을 발급하고 메일을 보낸다. **이전에 발급된 미사용 토큰은 모두 무효화**(`revoked_at`)한다 — 살아 있는 링크는 항상 최대 1개.
- 소셜 전용 계정은 토큰을 발급하지 않고 메일 본문에서 해당 소셜로 로그인하도록 안내한다. **응답은 동일.**
- 존재하지 않는 이메일은 아무 동작도 하지 않는다. **응답은 동일.**
- 메일 발송은 **비동기**다. 발송 실패도 응답을 바꾸지 않는다 — 응답 시간 차이로 계정 유무가 새는 것도 막는다.
- 속도 제한 초과 → `429 RATE_LIMITED`.
- 메일 링크의 베이스 주소는 서버 설정 `client.url`(dev `http://localhost:5173` / prod `https://clovlabcalss.store`)이다.

**GET `/auth/password/reset?token=...`**
```jsonc
// → 200  { "valid": true }
// → 400  PASSWORD_RESET_TOKEN_INVALID   무효·만료·사용됨
```
> 이 엔드포인트가 없으면 사용자가 새 비밀번호를 다 입력하고 제출한 **뒤에야** 만료를 알게 된다. 화면 진입 시점에 판정해 폼 대신 재요청 안내를 띄운다.

**POST `/auth/password/reset`**
```jsonc
{ "token": "...", "newPassword": "aB3!xyzq" }
// → 200  data: null
```
- 토큰 무효·만료·이미 사용됨 → `400 PASSWORD_RESET_TOKEN_INVALID`. **세 경우를 구분하지 않는다.**
- `newPassword`는 §4-1 비밀번호 정책(8~20자, 영문·숫자·특수문자 중 2종 이상)을 따른다. 위반 → `400 VALIDATION_FAILED`.
- 성공 시 토큰을 `used_at` 마킹하고 **해당 사용자의 refresh 토큰을 전부 revoke**한다(`PATCH /users/me/password`와 동일 규칙). 다른 기기 세션이 전부 끊긴다.

**★ 실패가 401이 아니라 400인 이유** — 프론트 `api/client.js`의 응답 인터셉터는 **401을 받으면 `/auth/refresh`를 시도**한다. 재설정 API가 401을 주면 비로그인 상태인데 갱신을 부르고, 실패해 토큰을 `clear()`하는 엉뚱한 경로로 빠진다. refresh 계열(`INVALID_TOKEN`·`TOKEN_EXPIRED`)이 401인 것과 다른 이유가 이것이다. **401로 바꾸지 말 것.**

**토큰을 URL 쿼리로 전달하는 예외** — §4-2는 URL 쿼리스트링에 `accessToken`/`refreshToken`을 담는 것을 금지한다(로그·Referer 유출). 재설정 토큰은 **메일 링크라 쿼리스트링 외 전달 수단이 없어 예외**로 둔다. 위험은 셋으로 상쇄한다: ① 수명 1시간·**1회용**·재요청 시 이전 토큰 즉시 폐기 ② 권한이 **비밀번호 재설정 하나뿐**(세션 토큰이 아니다) ③ 사용 즉시 소모되어 로그에 남은 값은 재사용 불가.

**가입 시 이메일 소유 확인이 없다는 점** — §4-1의 가입은 이메일 인증 없이 즉시 로그인시킨다. 따라서 남의 이메일로 가입된 계정이 있으면 **실제 이메일 주인이 재설정으로 그 계정의 통제권을 가져갈 수 있다.** 이는 취약점이 아니라 **의도된 동작**으로 둔다 — 원래 그 이메일 주인에게 통제권이 가는 것이 맞고, 재설정 기능이 사후 이메일 소유 확인 수단 역할을 한다. 가입 시 이메일 인증을 도입하면 이 항목을 재검토한다.

---

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
**GET `/users/me/preferences`** → `Preferences`. row가 없으면 **최초 조회 시 기본값으로 생성**되므로 응답 필드는 null이 아니다(아래 "기본값" 열).
```jsonc
{ "darkMode": false, "customColor": null, "wallpaperIcon": null, "dashboardBackground": null,
  "letterTheme": "postbox", "memoryCardTheme": "stack", "mascotType": "crobi",
  "equippedItem": null }
```
```jsonc
// 상점 코스튬을 장착한 경우 (§15)
{ /* …위와 동일… */ "mascotType": "robot",
  "equippedItem": { "itemId": "4", "name": "별빛 이펙트 코스튬", "imageUrl": "https://.../costume-starlight.svg" } }
```

| 필드 | 허용값 | 기본값 |
|---|---|---|
| `letterTheme` | `postbox` | `postbox` |
| `memoryCardTheme` | `stack`(겹침 카드) · `clothesline`(빨랫줄) · `diary`(일기장) | **`stack`** |
| `mascotType` | `crobi` · `rob` · `burgerOldman` | `crobi` |
| `equippedItem` | `EquippedItem` 또는 `null` | `null` |

> ⚠️ **`mascotType`은 서버가 검증하지 않는다.** `UpdatePreferencesRequest.mascotType`이 제약 없는 `String`이라 **표에 없는 값도 그대로 저장된다**(컬럼 `VARCHAR(20)`만 제약). 프론트는 아는 값이 아니면 `crobi`로 떨어뜨린다. 검증 추가는 별건(2026-07-31 확인).
>
> 롭의 값은 **`rob`**이다 — 계약에 `robot`으로 적혀 있었으나 프로덕션·DB·프론트 모두 `rob`을 쓴다(2026-07-31 정정). `robot`은 프로토타입 위젯(`croby-mascot.js`의 `CHARACTERS`)에서만 쓰는 이름이다.

> **`equippedItem`은 읽기 전용이다.** `PATCH /users/me/preferences`로 바꾸지 않는다 — 보유 검증과 카테고리 제약이 필요해서 §15의 `equip`/`unequip` 전용 엔드포인트를 쓴다. 여기 실리는 이유는 **마스코트를 그리는 화면이 설정 한 번으로 필요한 값을 다 받게** 하려는 것이다(장착 정보만 따로 조회하지 않는다).

> `memoryCardTheme` 기본값은 명세 정본(`09-component-inventory.md` §증거 카드 테마 3종 = "겹침 카드(coverflow, 기본)")을 따른다. 프로토타입의 내부 값 이름은 `coverflow`지만 **프로덕션 값 이름은 `stack`** 이다(같은 테마, 이름만 다르다 — DB에 이미 `stack`으로 저장된 row가 있어 이름은 바꾸지 않는다). 서버가 기본값 row를 만들어 주므로 프론트 fallback은 도달하지 않는다 — **기본값을 바꾸려면 서버를 고쳐야 한다**(clov-api #70).

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

**입력 제약** (`POST`·`PATCH` 공통 — 위반 시 `400 VALIDATION_FAILED`)

| 필드 | 제약 | 비고 |
|---|---|---|
| `name` | **필수 · 앞뒤 공백 제거 후 2~20자** | 아래 "이름 제약" 참고 |
| `description` | 0~60자 | |
| `themeColor`·`transportType` | ≤20자 | 허용값 열거는 후속(현재 자유 문자열) |
| `coverTitle` | ≤100자 | |
| `coverPhotoUrl` | ≤512자 | presign 업로드 후 커밋 |

> **이름 제약 — 길이만 강제하고 문자 종류는 제한하지 않는다.**
> 목업(`makerooms.html:2023`)은 `/^[가-힣a-zA-Z0-9\s]{2,20}$/`로 **한글·영문·숫자·공백만** 허용한다. 길이 2~20은 그대로 채택하지만 **문자 종류 화이트리스트는 채택하지 않는다** — 그대로 가져오면 `제주 가자!`·`캠핑 크루 🏕️` 같은 자연스러운 방 이름이 거부된다(목업 샘플이 전부 한글이라 규칙이 일관돼 보이지만 큐레이팅된 예시다). 사용자가 쓰는 콘텐츠는 우리가 만드는 UI 크롬과 기준이 다르다.
> **느슨→엄격은 기존 방 이름을 깨고, 엄격→느슨은 무해하다.** 되돌릴 수 있는 쪽으로 먼저 간다. 나중에 문자 종류를 조이려면 기존 데이터 점검이 선행돼야 한다.
> DB 컬럼은 `VARCHAR(100)`이라 상한을 20으로 좁혀도 스키마 변경은 필요 없다.
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
  "joinedAt": "2026-06-30T10:00:00", "leftAt": null,
  "birthMonthDay": "03-21" }
```
- `birthMonthDay` — 생일의 **월·일만**(`"MM-DD"`, 제로 패딩). 생일 미입력이거나 익명화(탈퇴) 계정이면 `null`.
- **연도를 빼는 이유**: 방 멤버 전원에게 생년(나이 추정 가능 정보)을 노출하지 않기 위해서.
- **서버가 "오늘 생일인가"를 계산해 주지 않는 이유**: 백엔드는 UTC 기준으로 동작해서 한국 시각 00:00~09:00 사이엔 서버의 "오늘"이 아직 어제다. 월·일만 내려주고 **브라우저가 사용자 로컬 날짜로 판단**하게 해서 이 문제를 원천 차단한다.

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
- **이미 참여 중인 방의 코드를 입력한 경우(2026-07-27 정정)**: `409 ROOM_MEMBER_ALREADY_JOINED` + `error.details`에 그 방의 `roomId`를 실어 보낸다. 프론트는 이 값으로 해당 방으로 이동시킨다.
  ```jsonc
  { "success": false, "error": { "code": "ROOM_MEMBER_ALREADY_JOINED",
      "message": "이미 참여 중인 우정공간입니다.",
      "details": [ { "field": "roomId", "reason": "31" } ] } }
  ```
  > 이전에는 이 조건에서 `403 ROOM_MEMBER_NOT_FOUND`("멤버가 아닙니다")를 던졌다 — **조건과 코드의 의미가 정반대**여서 프론트가 "이미 참여 중이거나 참여할 수 없습니다"처럼 뭉뚱그릴 수밖에 없었다. `details`를 쓰는 이유는 §2 참고(계약에 명시된 도메인 에러만 허용).
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
| POST | `/api/v1/plans/{planId}/memories` | 내 추억 작성(`title`≤40·`content`≤100·`tags[]`·`participantUserIds[]`) → plan `memory_status=WRITTEN`. `CANDIDATE`/`WRITTEN`만 허용(`NONE`→`PLAN_NOT_COMPLETED`). `UNIQUE(plan_id,writer_id)` 위반 → `409 MEMORY_ALREADY_WRITTEN`(PATCH로) | 공간 멤버 |
| POST | `/api/v1/rooms/{roomId}/memories` | **FREE MEMORY** 작성(`plan_id` NULL, D3) — plan 없이 방 단위 추억. body는 `/plans/{planId}/memories`와 동일(단 `planId` 없음). plan `memory_status` 전이·`PLAN_NOT_COMPLETED`·`MEMORY_ALREADY_WRITTEN` 검증 **미적용** | 공간 멤버 |
| GET | `/api/v1/rooms/{roomId}/memories` | 피드(월별·`writer_id`·`tag`·`participantUserId` 필터) | 공간 멤버 |
| GET | `/api/v1/memories/{memoryId}` | 상세(이미지·태그·참여자·댓글수) | 공간 멤버 |
| PATCH · DELETE | `/api/v1/memories/{memoryId}` | 수정(태그/참여자 전체교체)·삭제(soft) | 작성자 본인 |
| POST | `/api/v1/memories/{memoryId}/images/presign` | 이미지 presign(쿼터 초과 `507 STORAGE_QUOTA_EXCEEDED`) | 작성자 |
| POST | `/api/v1/memories/{memoryId}/images` | 업로드 커밋(`image_url`·`sort_order`) | 작성자 |
| DELETE | `/api/v1/memory-images/{imageId}` | 이미지 삭제 | 작성자 |
| PATCH | `/api/v1/memories/{memoryId}/images/order` | 순서 재정렬 | 작성자 |
| POST · GET | `/api/v1/memories/{memoryId}/comments` | 친구 한 줄 댓글 작성·목록. **한 추억당 작성자 1인 1개** — 이미 있으면 `409 COMMENT_ALREADY_EXISTS` | 공간 멤버 |
| PATCH · DELETE | `/api/v1/comments/{commentId}` | 댓글 수정·삭제 | 작성자 본인 |

- `plan_id` 없이도 작성 가능 = **FREE MEMORY**(`plan_id` NULL, D3) → `POST /rooms/{roomId}/memories`.

### 10-1. 요청/응답

**POST `/plans/{planId}/memories`** (201) → `MemoryDetail`
```jsonc
{ "title": "인생 첫 한라산",        // ≤ 40 — 목업 space.js:169 기준(2026-07-31). 이전 25는 설계값이 아니라 DTO에 박힌 값을 계약으로 옮긴 것이었다
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
**PATCH `/comments/{commentId}`** → 갱신된 `Comment`(본문은 POST와 동일 `{ "content": … }`)
**DELETE `/comments/{commentId}`** → `data: null`

- **한 추억당 작성자 1인 1개**(2026-07-26 리더 결정) — 프로토타입의 "친구 한 줄 메시지"가 멤버마다 한 줄인 구조라 화면과 데이터를 맞춘다. DB는 `memory_comments UNIQUE (memory_id, writer_id)`로 강제하고, 중복 작성은 `409 COMMENT_ALREADY_EXISTS`. 고쳐 쓰려면 `PATCH`, 지웠으면 다시 쓸 수 있다. 구현: clov-api [#68](https://github.com/Pickeslog/clov-api/issues/68)

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
| `MEMORY_WRITE` | 추억 작성 | 25 + 글자 보너스 | memoryId |
| `MEMORY_IMAGE_BONUS` | 추억 이미지 **커밋**(`POST /memories/{id}/images`) | 1 (장당) | memoryId |
| `PLAN_CREATE` | 약속 등록 | 3 | planId |
| `PLAN_COMPLETE` | 약속 완료 | 15 | planId |
| `MASCOT_INTERACT` | 마스코트 교감 | 2 (하루 3회) | null |

- **글자 보너스**: 본문 100자 이상 +10 / 50자 이상 +5 — **도달한 최고 구간 1개만**(중첩 없음). `MEMORY_WRITE` 한 행에 합산해 기록한다.
- **사진 보너스는 커밋 시 증분 적립**(리더 확정 2026-07-24). 프로덕션은 추억 생성 → presign → R2 PUT → 커밋 순서라 **작성 시점엔 사진 수를 알 수 없다**(`CreateMemoryRequest`에 이미지 필드 없음). 그래서 이미지가 실제로 커밋될 때마다 `MEMORY_IMAGE_BONUS` +1을 적립한다.
  - **추억당 상한 10** — 해당 `memoryId`의 `MEMORY_IMAGE_BONUS` 합이 이미 10이면 더 적립하지 않는다(11번째 사진부터 XP 없음).
  - 업로드가 실패해 커밋이 안 되면 XP도 오르지 않는다. 나중에 사진을 추가하면 그때 적립된다.
  - 이미지 **삭제 시 회수하지 않는다**(MVP 범위 밖 XP 회수 규칙과 동일).

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

**탭(`type`)과 이벤트(`subType`) 분리 (리더 확정 2026-07-24)**

- **`type` = 어느 탭에 보일지.** `NOTICE` / `FRIEND` / `JOIN` 세 값 고정. 목록 조회의 `?type=` 필터가 이 값을 쓴다.
- **`subType` = 무슨 일이 일어났는지.** 화면 문구를 고르는 기준.
- 둘을 나눈 이유: `type` 하나가 두 역할을 겸하면 새 이벤트를 넣을 때마다 탭 필터가 깨진다. `LEVEL_UP`을 `type`에 넣으면 **어느 탭 조회에도 안 걸리는 알림**이 된다.
- **문구는 프론트가 만든다.** 서버는 사실(누가·무엇을·어떤 값)만 주고 문장은 조립하지 않는다 — 문구를 바꾸려고 백엔드를 건드리지 않게.

**이벤트 카탈로그**

| type(탭) | subType | 트리거 | actor | referenceId | payload |
|---|---|---|---|---|---|
| FRIEND | `ROOM_UPDATE` | 방 정보 수정 | 수정자 | roomId | — |
| FRIEND | `MEMORY_WRITE` | 추억 작성 | 작성자 | memoryId | — |
| FRIEND | `LETTER_RECEIVE` | 편지 수신 | 보낸이 | letterId | — |
| FRIEND | `PLAN_CREATE` | 약속 등록 | 등록자 | planId | — |
| FRIEND | `PLAN_COMPLETE` | 약속 완료 | 완료자 | planId | — |
| FRIEND | `LEVEL_UP` | 우정 레벨업 | **null** | roomId | `{"level": 3}` |
| JOIN | `JOIN_REQUEST` | 가입 신청 | 신청자 | joinRequestId | — |
| JOIN | `JOIN_ACCEPTED` | 신청 수락 → **신청자 본인에게** | 수락자 | joinRequestId | — |
| JOIN | `MEMBER_JOINED` | 신청 수락 → **기존 멤버 전원에게**(합류자 제외) | **합류자** | joinRequestId | — |
| NOTICE | `ADMIN_NOTICE` | 운영 공지 | null | null | `{"title":…,"content":…}` |

- **레벨업만 `actor`가 없다**(방 전체 이벤트). `actor_id`는 nullable이라 스키마 변경 불필요.
- **★ `MEMBER_JOINED`를 따로 둔 이유 (리더 확정 2026-07-31, clov-api #91)** — 수락 시점에는 **성격이 다른 알림 두 개**가 나간다. `JOIN_ACCEPTED`는 **신청자 본인에게** "수락됐어요"(actor=수락자), `MEMBER_JOINED`는 **기존 멤버 전원에게** "X님이 합류했어요"(actor=합류자)다. **수신자도 actor도 다르므로 한 subType으로 겸할 수 없다.** 특히 `JOIN_REQUEST`(가입 신청)를 재사용하면 "가입 신청 N건"을 세는 순간 **이미 수락된 합류까지 신청으로 센다.**
- **`MEMBER_JOINED`의 수신자에서 합류자 본인은 뺀다.** 공용 팬아웃(`NotificationMapper.insertMany`)이 `actor_id`와 같은 수신자를 제외하는 규칙과 같다 — 도메인이 자체 SQL로 팬아웃을 다시 쓰면 이 조건을 빠뜨리기 쉽다(clov-api #90).
- 기존에 `JOIN_REQUEST`로 쌓인 합류 알림 row는 **마이그레이션하지 않는다.** 데모 전 테스트 데이터뿐이라 `@test.local` 정리와 함께 지운다. 새 값부터 적용한다.
- **방 설정 변경은 `FRIEND`다.** 친구 활동이므로 '관리진 공지' 탭이 아니다(2026-07-24 이동).
- `NOTICE` 탭은 운영 공지 발행 기능이 생길 때까지 비어 있다. **프론트는 정직한 빈 상태를 보여준다**(가짜 공지를 하드코딩하지 않는다).
- `payload`는 문구에 필요한 부가 정보만 담는 자유 형식 JSON. 없으면 `null`.

### 13-1. 요청/응답

**GET `/rooms/{roomId}/notifications?type=NOTICE|FRIEND|JOIN`** → 목록 봉투, `items` = `Notification[]`
```jsonc
{ "id": "700", "type": "FRIEND", "subType": "LEVEL_UP",
  "actor": null, "referenceId": "31", "payload": { "level": 3 },
  "isRead": false, "createdAt": "2026-07-24T11:00:00" }
```
```jsonc
// actor가 있는 일반 케이스
{ "id": "701", "type": "FRIEND", "subType": "MEMORY_WRITE",
  "actor": { /* UserSummary */ }, "referenceId": "88", "payload": null,
  "isRead": false, "createdAt": "2026-07-24T11:05:00" }
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
| `ROOM_MEMBER_ALREADY_JOINED` | 409 | 이미 참여 중인 방의 초대 코드 입력(§7). `error.details`에 `roomId` 동봉 |
| `NOT_WRITER` | 403 | 작성자 본인 아님 |
| `ROOM_CAPACITY_EXCEEDED` | 409 | 정원 8명 초과 |
| `INVITE_EXPIRED` | 409 | 초대 코드 무효(취소=`CANCELED` 또는 만료) |
| ~~`INVITE_ALREADY_USED`~~ | 409 | **더 이상 반환하지 않음** — 초대 코드 A안(다회용) 이후 사문. 클라이언트에서 분기 제거할 것 |
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
| `PASSWORD_RESET_TOKEN_INVALID` | **400** | 재설정 토큰 무효·만료·이미 사용됨(§4-4). **세 경우를 구분하지 않는다.** 401이 아닌 이유는 §4-4 — 프론트 401 인터셉터가 refresh를 시도한다 |
| **상점 (§15)** | | |
| `SHOP_ITEM_NOT_FOUND` | 404 | 존재하지 않는 아이템 |
| `INSUFFICIENT_BALANCE` | 409 | 골드 부족 |
| `ITEM_ALREADY_OWNED` | 409 | 이미 보유 중 — 재구매 차단(`(user_id, item_id)` 유니크) |
| `ITEM_NOT_PURCHASABLE` | 409 | `status`가 `ACTIVE`가 아님(판매 종료). **목록에는 보이지만 구매만 막힌다** |
| `ITEM_NOT_OWNED` | **403** | 보유하지 않은 아이템 장착 시도. 404가 아닌 이유는 **아이템은 존재하고 권한이 없는 것**이라서다 |
| `ITEM_NOT_EQUIPPABLE` | 409 | `COSTUME`이 아닌 카테고리 장착 시도(§15-1 (3)) |

> 규약: 에러코드는 **UPPER_SNAKE_CASE**. `VALIDATION_FAILED`의 `error.details`는 `[{field, reason}]` 배열(§2).

---

## 15. Shop (상점) & Wallet

| Method | Path | 설명 | 인가 |
|---|---|---|---|
| GET | `/api/v1/shop/items` | 상점 목록(`category`·`rarity` 필터) | 로그인 |
| GET | `/api/v1/shop/wallet` | 내 골드 잔액 | 본인 |
| GET | `/api/v1/shop/inventory` | 내 보유 아이템 | 본인 |
| POST | `/api/v1/shop/items/{itemId}/purchase` | 구매 | 본인 |
| POST | `/api/v1/shop/items/{itemId}/equip` | 마스코트에 장착 | 본인·보유자 |
| DELETE | `/api/v1/shop/equipped` | 장착 해제 | 본인 |

**재화는 사용자 단위다 — 방과 무관하다.** 경로에 `roomId`가 없다. 골드·보유 아이템·장착 상태는 전부 사용자에게 붙는다. §3의 2단 인가에서 **1단(로그인)만 적용되는** 몇 안 되는 도메인이고, 그래서 `/rooms/{roomId}/shop/...` 형태로 바꾸지 않는다.

### 15-1. 되돌리면 안 되는 결정 4개

#### ★ (1) 청구액은 서버가 계산한다 — 구매 요청에 본문이 없다

`POST /shop/items/{itemId}/purchase`는 **본문이 비어 있다.** 가격·수량·할인율을 클라이언트가 보내지 않는다. 최종가는 서버가 계산한다.

```
finalPrice = price - (price * discountRate / 100)
```

클라이언트가 금액을 실으면 그것을 검증하는 코드가 필요해지고, **검증을 한 번 빠뜨리는 순간 가격 조작이 된다.** 보낼 수 없게 만드는 것이 검증보다 강하다. **"요청 본문에 금액을 추가하자"는 제안은 받지 않는다.**

#### ★ (2) 시작 골드는 **1,000**이다 — 카탈로그를 사게 하는 돈이 아니다

지갑 최초 생성 시 `SIGNUP_GRANT`로 **1,000골드**를 지급한다.

이 값은 **가장 싼 코스튬 하나를 즉시 사고, 두 번째는 못 사는** 금액이다.

| | |
|---|---|
| 카탈로그 전체(할인 반영) | **42,260 G** |
| 가장 싼 코스튬(클로버 배지) | 600 G |
| 시작 골드 | **1,000 G** |

장착 대상이 `COSTUME`뿐이라((3) 참조) 신규 사용자의 첫 의미 있는 구매는 코스튬이다. 1,000이면 **구매 → 장착 → 마스코트가 바뀌는 루프를 한 번 완주**하고 400골드가 남는다. 다음 것을 사려면 모아야 한다.

> ⚠️ **이 값을 카탈로그 총액에 가깝게 올리지 말 것.** 시작 골드가 카탈로그의 절반을 덮으면 획득 수단(§15-4)이 무의미해진다. 실제로 초기 구현값은 20,000이었는데, 그건 설계값이 아니라 **개발 DB의 테스트 원장 데이터에 코드를 맞춘 숫자**였다.

#### (2-1) 지갑은 회원가입이 아니라 **첫 접근**에서 만들어진다

`user_wallets` 행은 가입 시점에 생기지 않는다. `GET /shop/wallet` 또는 첫 구매에서 없으면 그때 만들면서 위 지급이 일어난다.

- 그래서 `GET /shop/wallet`은 **읽기 전용이 아니다**(행을 만들 수 있다). 캐시나 리트라이를 걸 때 이 점을 감안한다.
- **가입 로직에 상점 의존을 넣지 않으려는 선택이다.** 상점이 나중에 비활성화되거나 빠져도 가입이 깨지지 않는다. 상점을 한 번도 안 여는 사용자에게는 지갑 행도 만들지 않는다.
- 잔액이 정확히 `1000`으로 오는 것은 **아직 아무것도 안 산 사용자**라는 뜻이다. 프론트가 "신규 가입 보너스" 같은 문구를 띄우려면 이 시점 차이를 알고 있어야 한다.

#### (3) 장착은 **COSTUME만** 가능하다

`SKIN`·`EVENT`는 보유할 수 있지만 장착 대상이 아니다. 장착은 **마스코트 이미지 자체를 교체**하는 동작이라 의미가 있는 카테고리가 코스튬뿐이다. 다른 카테고리로 `equip`을 부르면 `409 ITEM_NOT_EQUIPPABLE`.

- 장착 슬롯은 **하나**다. 새로 장착하면 이전 것이 교체된다(별도 해제 호출 불필요).
- 해제는 `DELETE /shop/equipped` — **itemId를 받지 않는다.** 슬롯이 하나라 지정할 것이 없다.

#### (4) 구매가는 **구매 시점 가격으로 고정**된다

`user_inventory_items.paid_price`에 그때의 최종가를 박아둔다. 이후 정가나 할인율이 바뀌어도 과거 구매 기록은 변하지 않는다. **환불·재판매 기능이 생기면 이 값을 기준으로 삼는다.**

### 15-2. 요청/응답

**GET `/shop/items?category=COSTUME&rarity=RARE`** → 목록 봉투, `items` = `ShopItem[]`

```jsonc
{ "id": "4", "name": "별빛 이펙트 코스튬", "description": "마스코트 주위로 별이 흩날린다",
  "category": "COSTUME", "rarity": "UNCOMMON",
  "price": 1200, "discountRate": 20, "finalPrice": 960,
  "imageUrl": "https://.../costume-starlight.svg", "owned": false }
```

- **`category`·`rarity`는 생략 가능**하다. 미지정 · 빈 문자열 · `all`(대소문자 무관) 셋 다 **필터 없음**으로 처리된다. 프론트가 `all`을 보내도 된다.
- 정렬은 `sort_order` → `id` 순. 클라이언트가 정렬 기준을 지정하는 파라미터는 없다.
- **`RETIRED` 아이템도 목록에는 나온다**(보유자 화면에서 이름·이미지가 필요하다). 구매만 막힌다 → `409 ITEM_NOT_PURCHASABLE`.
- `owned`는 **호출자 기준**이다. 같은 아이템이 사람마다 다른 값으로 온다.

**GET `/shop/wallet`** → `{ "balance": 1000 }` (아무것도 안 산 신규 사용자)

**GET `/shop/inventory`** → 목록 봉투, `items` = `ShopItem[]`. `owned`는 항상 `true`. 정렬은 **구매 최신순**.

**POST `/shop/items/{itemId}/purchase`** — 본문 없음 → `PurchaseResponse`

```jsonc
// 위 별빛 코스튬(finalPrice 960)을 시작 골드 1,000으로 구매한 직후
{ "item": { /* ShopItem, owned=true */ }, "balance": 40 }
```

> **차감 후 잔액을 같이 준다.** 프론트가 헤더 골드를 다시 조회하지 않아도 되게 한 것이다. 다만 다른 탭에서 구매했을 수 있어, 헤더는 `wallet` 쿼리를 무효화하는 방식도 함께 쓴다.

**POST `/shop/items/{itemId}/equip`** → `EquippedItem`

```jsonc
{ "itemId": "4", "name": "별빛 이펙트 코스튬", "imageUrl": "https://.../costume-starlight.svg" }
```

**DELETE `/shop/equipped`** → `data: null`

### 15-3. 필드 허용값

| 필드 | 허용값 | 비고 |
|---|---|---|
| `category` | `COSTUME` · `SKIN` · `EVENT` | 장착 가능한 것은 `COSTUME`뿐(§15-1 (3)) |
| `rarity` | `COMMON` · `UNCOMMON` · `RARE` · `EPIC` · `LEGENDARY` | **5등급 전부 실사용 중**(시드 12종 분포: 2·2·3·3·2). 등급색은 라이트/다크 공통 고정 |
| `discountRate` | `0`~`100` | 주간 할인용. **운영 주체·주기는 아직 미정** |

**응답에 없는 내부 필드** — `code`(내부 식별자) · `status`(`ACTIVE`/`RETIRED`) · `sortOrder` · `createdAt`/`updatedAt`. 클라이언트가 판단에 쓸 일이 없어 노출하지 않는다. `status`가 필요해 보이면 그건 `ITEM_NOT_PURCHASABLE` 에러로 다루는 것이 맞다.

### 15-4. 원장(`wallet_transactions`)

모든 잔액 변동은 원장에 남는다. `balance_after`와 `reference_id`를 함께 기록한다.

| `reason` | 부호 | `reference_id` | 설명 |
|---|---|---|---|
| `SIGNUP_GRANT` | + | `null` | 시작 골드 1,000 (§15-1 (2)) |
| `PURCHASE` | − | 아이템 id | 구매 |
| `EARN_MASCOT` | + | `null` | 마스코트 교감 |
| `EARN_MEMORY` | + | 추억 id | 추억 등록 |

#### 골드 획득 (리더 확정 2026-07-31, #16/#17)

| 사유 | 금액 | 자체 제한 |
|---|---|---|
| `EARN_MASCOT` | **100** | 하루 **3회**(§12 교감 횟수와 같은 횟수) |
| `EARN_MEMORY` | **50** | **약속에 연결된 추억만** |

**★ 그 위에 유저 단위 하루 총 상한 `500`이 걸린다.** 사유와 무관하게 하루 누적 획득량을 합산해 판정한다.

세 가지를 반드시 지킨다.

- **캡은 유저 단위다.** 방 단위로 잡으면 캡이 되지 않는다 — 한 사람이 가입할 수 있는 방 수에 상한이 없고 혼자서도 만들 수 있어서, 하루 획득량이 방 개수에 비례해 늘어난다.
- **`EARN_MEMORY`는 FREE MEMORY(`plan_id` NULL, D3)에 지급하지 않는다.** 자유 기록은 약속·완료·다른 참여자가 필요 없어 혼자 무한히 쓸 수 있다. `MEMORY_ALREADY_WRITTEN`의 `UNIQUE(plan_id, writer_id)`도 **NULL은 중복을 허용**하므로 막지 못한다.
- **§12의 XP 캡 구조를 그대로 쓰지 않는다.** XP는 만렙 777에서 멈추고 우정 레벨 표시에만 쓰여 많아도 무해하지만, 골드는 상한이 없고 아이템을 산다. 같은 캡 구조를 공유하면 상점 경제가 깨진다.

> **총 상한은 "하한 판정"이라 마지막 1회는 온전히 지급된다.** 누적이 `500` 미만이면 그 지급을 통째로 준다 — 잘라서 주지 않는다. 그래서 **하루 실질 최대는 550**이다(누적 450에서 마스코트 100을 받는 경우). 의도된 동작이다: 부분 지급은 "50인데 30만 들어왔다"를 만들고 그걸 설명할 화면이 없다. 골드 경제 규모(카탈로그 총액 42,260)에서 50~100 차이는 무의미하다.

> ⚠️ **새 획득 사유를 추가할 때 총 상한 합산에 포함시킬 것.** 합산 대상을 사유 이름으로 나열하면 새 사유가 조용히 캡 밖으로 빠진다. **`EARN_` 접두사 전체**를 대상으로 삼는다. 이 규칙이 있어야 "새 경로가 생겨도 총량을 재계산하지 않는다"는 설계가 성립한다.

> **속도 감각** — 시작 1,000 + 하루 최대 500. 가장 싼 코스튬 600G는 첫날 바로 살 수 있고, 카탈로그 전체(42,260)는 약 85일이다. **구매 → 장착 → 마스코트 변경 루프를 하루 안에 한 번 완주**시키되 카탈로그를 빠르게 비우지 못하게 하는 값이다.

**조회 API는 없다.** 현재 화면에 거래 내역이 없어서다. 필요해지면 `GET /shop/transactions`로 추가하되, 그때 §15에 함께 적는다.

> ⚠️ 동시 구매를 막기 위해 구매는 **지갑 행을 잠그고**(`SELECT ... FOR UPDATE`) 읽는다. 단일 인스턴스 전제가 아니어도 안전하다.

---

## 관련 문서
- DB 스키마(20테이블) → [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md)
- 개발 로드맵 → [`roadmap.md`](roadmap.md) · 팀 시작 → [`팀-시작가이드.md`](팀-시작가이드.md)
- 화면 명세(동작 기준) → `../test-web-design/*/*.md`
