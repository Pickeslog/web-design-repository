# Clov API — 리소스 맵 (엔드포인트 인벤토리)

> **정합 확정본**(2026-07-10). [02-db-api-reconciliation.md](02-db-api-reconciliation.md)의 결정(D1~D6)과 `docs-archive`의 DB/API 설계를 반영했다.
> Base path `/api/v1`. 공통 규약·인증·에러는 [00-conventions-and-security.md](00-conventions-and-security.md).
> **네이밍**: `rooms`(우정공간) · `plans`(약속) — archive DB 테이블 기준(D4).
> **인가 열**: 🔓 공개 / 🔑 로그인 본인 / 🔑+M 로그인+공간 멤버(ACTIVE) / ✍️ **작성자 본인만**(D5).
> 표기 ✨=archive 설계에 없던 **신규**(화면 확정기능 반영). 스키마는 `openapi.yaml`(다음 단계).

---

## 1. Auth — 인증 · 계정 (`/auth`, `/oauth2`)

화면: [login.md](../test-web-design/01-auth/login.md) · [signup.md](../test-web-design/01-auth/signup.md) · archive [API §2](../../docs-archive/Clov_API_설계.md)

| 메서드 | 경로 | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/auth/signup` ✨ | 이메일 회원가입(email·password·nickname·birthDate?·agreements) | 🔓 |
| POST | `/api/v1/auth/login` ✨ | 이메일+비밀번호 로그인 → access·refresh (D6) | 🔓 |
| GET | `/oauth2/authorization/{provider}` | 소셜 로그인 시작(`kakao`/`naver`/`google`, Spring Security 기본) | 🔓 |
| GET | `/login/oauth2/code/{provider}` | 소셜 콜백 — 신규면 USERS 생성 후 토큰 발급 | 🔓 |
| POST | `/api/v1/auth/refresh` | refresh 토큰으로 access 재발급 | 🔓(refresh) |
| POST | `/api/v1/auth/logout` | 로그아웃(토큰 무효화) | 🔑 |
| POST | `/api/v1/auth/password/change` ✨ | 비밀번호 변경(현재·새) | 🔑 |
| POST | `/api/v1/auth/email/available` ✨ | 이메일 중복 확인 | 🔓 |

> 회원가입 5단계 위저드(signup.md)는 프론트 UX일 뿐, 서버는 최종 1건 `POST /auth/signup`으로 받는다. 소셜/이메일 **둘 다 지원**(D6).

---

## 2. Users — 내 프로필 (`/users`)

화면: [profile_edit.md](../test-web-design/08-profile/profile_edit.md) · archive [API §4-1](../../docs-archive/Clov_API_설계.md)

| 메서드 | 경로 | 설명 | 인가 |
|---|---|---|---|
| GET | `/api/v1/users/me` | 내 프로필(닉네임·이메일·생일·아바타·`personal_invite_code`) | 🔑 |
| PATCH | `/api/v1/users/me` | 닉네임·이메일·생일 수정 | 🔑 |
| PUT | `/api/v1/users/me/avatar` ✨ | 프로필 사진 업로드(연결) | 🔑 |
| PATCH | `/api/v1/users/me/status-message` ✨ | 내 상태메시지(`clov_my_status_msg`) | 🔑 |
| GET | `/api/v1/users/me/rooms` | 내가 `ACTIVE`로 속한 우정공간 목록(정렬순서 포함) | 🔑 |
| DELETE | `/api/v1/users/me` ✨ | **계정 탈퇴 = 익명화**(soft, "언노운", 기록 보존) | 🔑 |

> 테마·다크모드·바탕화면·커스텀색(`clov_darkMode`/`clov_appBackground`/…)은 기기 로컬 설정이라 서버 저장 필수 아님. 기기 간 동기화가 필요하면 `GET/PUT /users/me/preferences` 추가.

---

## 3. Friendship Rooms — 우정공간 (`/rooms`)

화면: [makerooms.md](../test-web-design/03-rooms/makerooms.md) · [index.md](../test-web-design/02-main/index.md) · archive [API §4-2](../../docs-archive/Clov_API_설계.md)

| 메서드 | 경로 | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/rooms` | 우정공간 생성(생성자=첫 멤버, 일반 멤버와 동일) | 🔑 |
| GET | `/api/v1/rooms/{roomId}` | 공간 상세(이름·레벨·exp·멤버 수·커버) | 🔑+M |
| PATCH | `/api/v1/rooms/{roomId}` | 이름·커버 제목·테마색 수정(멤버 누구나) | 🔑+M |
| PUT | `/api/v1/rooms/{roomId}/cover-photo` ✨ | 대표 사진 업로드(연결) | 🔑+M |
| PATCH | `/api/v1/users/me/rooms/order` ✨ | 방 목록 정렬 순서(사용자별, 드래그) | 🔑 |
| GET | `/api/v1/rooms/{roomId}/members` | 멤버 목록(`ACTIVE`/`LEFT` 포함, 보존 확인) | 🔑+M |
| DELETE | `/api/v1/rooms/{roomId}/members/me` | 공간 나가기(row 삭제 X, `status=LEFT`) | 🔑+M |
| GET | `/api/v1/rooms/{roomId}/level` | 우정 레벨·exp·다음 레벨까지 | 🔑+M |
| GET | `/api/v1/rooms/{roomId}/exp-logs` | 경험치 변화 이력(action_type·triggered_by) | 🔑+M |
| POST | `/api/v1/rooms/{roomId}/mascot/interact` ✨ | 마스코트 교감(EXP +2, 하루 3회 상한) | 🔑+M |

> 멤버 전원 `LEFT` → 서버가 `rooms.status=INACTIVE` 자동 전환. **"방 삭제"·"강퇴" API는 없다**(방장 없음).

---

## 4. Invites · Join Requests — 초대 · 가입 승인

화면: [invite.md](../test-web-design/03-rooms/invite.md) · [join_room.md](../test-web-design/03-rooms/join_room.md) · [notification.md](../test-web-design/07-notification/notification.md)

### 4-1. 초대 코드 (`ROOM_INVITES`, archive [API §4-3](../../docs-archive/Clov_API_설계.md))

| 메서드 | 경로 | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/rooms/{roomId}/invites` | 초대 코드 생성(`created_by`=요청자, 이력일 뿐) | 🔑+M |
| GET | `/api/v1/rooms/{roomId}/invites` | 발급된 초대 코드 목록 | 🔑+M |
| DELETE | `/api/v1/invites/{inviteId}` | 초대 코드 취소(`status=CANCELED`) | ✍️ 만든 본인 |

### 4-2. 가입 신청·승인 (`JOIN_REQUESTS` ✨ 신설 — D1)

| 메서드 | 경로 | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/join-requests` ✨ | 코드로 **가입 신청**(`inviteCode`·`invitePath`=INVITED/DIRECT) → `PENDING`. 정원(8명) 초과면 `409 ROOM_CAPACITY_EXCEEDED` | 🔑(아직 비멤버) |
| GET | `/api/v1/rooms/{roomId}/join-requests` ✨ | 대기 신청 목록(알림 배지 수) | 🔑+M |
| POST | `/api/v1/rooms/{roomId}/join-requests/{requestId}/accept` ✨ | **수락**(멤버 누구나 1명) → `ROOM_MEMBERS` 생성, `accepted_at`. 수락 시점 **정원(8명) 재확인**, 초과면 `409 ROOM_CAPACITY_EXCEEDED` | 🔑+M |
| POST | `/api/v1/rooms/{roomId}/join-requests/{requestId}/reject` ✨ | 거절(비파괴) | 🔑+M |
| POST | `/api/v1/rooms/{roomId}/join-requests/{requestId}/undo` ✨ | **5분 내 되돌리기**(수락 취소) | 🔑+M |

> 동시성: 중복 수락 `409`, 되돌리기 만료 `410`([00 §3](00-conventions-and-security.md)). archive의 즉시입장 `POST /invites/accept`는 **가입 신청 생성으로 의미 변경**.

---

## 5. Plans — 약속 · 인생4컷 (`/rooms/{roomId}/plans`)

화면: [index.md](../test-web-design/02-main/index.md)(일정계획) · archive [API §4-4·4-5](../../docs-archive/Clov_API_설계.md)

| 메서드 | 경로 | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/rooms/{roomId}/plans` | 약속 등록(`SCHEDULED`, `memory_status=NONE`) · **EXP +3** | 🔑+M |
| GET | `/api/v1/rooms/{roomId}/plans` | 약속 목록(필터: status·날짜 범위) | 🔑+M |
| GET | `/api/v1/plans/{planId}` | 약속 상세(영수증·체크리스트) | 🔑+M |
| PATCH | `/api/v1/plans/{planId}` | 약속 내용 수정 | ✍️ 작성자 |
| DELETE | `/api/v1/plans/{planId}` | 약속 삭제 | ✍️ 작성자 |
| POST | `/api/v1/plans/{planId}/complete` | 완료 → `COMPLETED`·`memory_status=CANDIDATE` | 🔑+M(다녀온 사람) |
| POST | `/api/v1/plans/{planId}/cancel` | 취소 → `CANCELED` | ✍️ 작성자 |
| POST | `/api/v1/plans/{planId}/skip-memory` | 추억 작성 안 함 → `memory_status=SKIPPED` | 🔑+M |
| PUT | `/api/v1/plans/{planId}/stages/{stage}/photo` ✨ | 인생4컷 단계 인증사진(`stage`=PROPOSAL/SCHEDULING/CONFIRMED/MEETING). **업로드 후 잠금(422 재업로드 거부)**. MEETING 완료 시 **EXP +15** | 🔑+M |
| POST | `/api/v1/plans/{planId}/checklists` | 체크리스트 항목 추가 | 🔑+M |
| PATCH | `/api/v1/checklists/{checklistId}` | 내용 수정·`checked` 토글(공동 준비물) | 🔑+M |
| DELETE | `/api/v1/checklists/{checklistId}` | 항목 삭제 | 🔑+M |

> D-day·현재 4컷 단계는 **서버 파생 계산**(plan_date vs now). 클라 값 신뢰 X.

---

## 6. Memories — 추억피드 (`/rooms/{roomId}/memories`)

화면: [feed.md](../test-web-design/04-feed/feed.md) · [memory_detail.md](../test-web-design/04-feed/memory_detail.md) · archive [API §4-6·4-7](../../docs-archive/Clov_API_설계.md)

| 메서드 | 경로 | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/rooms/{roomId}/memories` ✨ | 추억 작성. **`planId` 선택**(D3 FREE MEMORY 허용, null 가능). `planId` 있으면 `memory_status`가 CANDIDATE/WRITTEN이라야 함(아니면 `PLAN_NOT_COMPLETED`). title≤25·content≤100·mood_tag·participants · **EXP 지급** | 🔑+M |
| GET | `/api/v1/rooms/{roomId}/memories` | 추억 피드(`q`·`sort`·`filter`(all/mine/others)·`month`, page/size) | 🔑+M |
| GET | `/api/v1/memories/{memoryId}` | 추억 여권 상세(사진·약속 영수증·REMARKS·메시지) | 🔑+M |
| PATCH | `/api/v1/memories/{memoryId}` | 수정(약속 연결 편집 포함) | ✍️ 작성자 |
| DELETE | `/api/v1/memories/{memoryId}` | 삭제(소프트) | ✍️ 작성자 |
| POST | `/api/v1/memories/{memoryId}/images` | 이미지 업로드(`sort_order`) | ✍️ 작성자 |
| PATCH | `/api/v1/memories/{memoryId}/images/order` | 이미지 순서 재정렬 | ✍️ 작성자 |
| DELETE | `/api/v1/memory-images/{imageId}` | 이미지 삭제 | ✍️ 작성자 |
| POST | `/api/v1/memories/{memoryId}/messages` ✨ | **친구 한 줄 메시지** 추가(`MEMORY_MESSAGES`, D2) | 🔑+M |
| DELETE | `/api/v1/memory-messages/{messageId}` ✨ | 내 한 줄 메시지 삭제 | ✍️ 작성자 |
| GET | `/api/v1/rooms/{roomId}/photos` ✨ | 사진 모아보기(방 전체 사진 갤러리) | 🔑+M |

> **친구별 관점(D2)**: ① 같은 `plan_id`에 멤버별 `MEMORIES` row(writer_id 분리) + ② 그 추억에 `MEMORY_MESSAGES` 한 줄. `plan_id`는 참조(복제 X) — 여권의 영수증·도장·인생4컷이 한 소스 동기화. 사진은 오브젝트 스토리지 URL([00 §5](00-conventions-and-security.md)).

---

## 7. Lucky Letters — 행운편지 (`/rooms/{roomId}/letters`)

화면: [letter_detail.md](../test-web-design/05-letter/letter_detail.md) · archive [API §4-8](../../docs-archive/Clov_API_설계.md)

| 메서드 | 경로 | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/rooms/{roomId}/letters` | 편지 작성(`receiver_id` **nullable=전체발송** ✨·`content`·**`emoji`** ✨) | 🔑+M |
| GET | `/api/v1/rooms/{roomId}/letters` | 편지 목록(`filter`=all/favorite; `box`=received/sent 확장) | 🔑+M |
| GET | `/api/v1/letters/{letterId}` | 편지 상세 | 🔑+M(대상) |
| PATCH | `/api/v1/letters/{letterId}/read` | 읽음 처리(`read_at`) | ✍️ 수신자 |
| PATCH | `/api/v1/letters/{letterId}/favorite` | 즐겨찾기 토글 | ✍️ 발신·수신자 |
| DELETE | `/api/v1/letters/{letterId}` | 편지 삭제 | ✍️ 작성자 |

> archive는 sender/receiver+받은/보낸함 중심. 프로토타입은 전체발송·emoji·즐겨찾기 필터 → `receiver_id` nullable + `emoji` 추가, 받은/보낸함은 확장 여지로 유지.

---

## 8. Notifications — 알림 (`/rooms/{roomId}/notifications` ✨ 신설)

화면: [notification.md](../test-web-design/07-notification/notification.md)

| 메서드 | 경로 | 설명 | 인가 |
|---|---|---|---|
| GET | `/api/v1/rooms/{roomId}/notifications` ✨ | 알림 목록(`type`=NOTICE/FRIEND/JOIN) | 🔑+M |
| POST | `/api/v1/rooms/{roomId}/notifications/read` ✨ | 읽음 처리 | 🔑+M |

> "가입 신청" 탭 데이터는 §4-2 `join-requests`와 동일 소스(중복 저장 X). 실시간 필요 시 SSE/WebSocket 검토.

---

## 9. Media — 파일 업로드 (`/media` ✨)

| 메서드 | 경로 | 설명 | 인가 |
|---|---|---|---|
| POST | `/api/v1/media/uploads` ✨ | presigned 업로드 URL 발급 → 스토리지 직접 업로드 → `mediaId` 반환 | 🔑 |

> 프로토타입의 base64/localStorage 저장 폐기. 반환 URL을 아바타·대표사진·추억 이미지·4컷 인증사진에 연결([00 §5](00-conventions-and-security.md)).

---

## 신규 테이블 요약 (archive DB 확장 — [03 예정])

`JOIN_REQUESTS` · `PLAN_STAGE_PHOTOS` · `NOTIFICATIONS` · `MEMORY_MESSAGES` + 컬럼 보강(USERS: avatar/birth/status/email·oauth, ROOMS: cover/theme, MEMORIES: plan_id nullable·mood_tag, LETTERS: receiver_id nullable·emoji). 상세는 [02 §2](02-db-api-reconciliation.md).

---

## 다음 단계

1. **갱신 ERD/DDL** — archive DB 설계에 위 신규 테이블·컬럼 반영(`03-db-extensions.md` 또는 archive 원본 갱신).
2. **`openapi.yaml`** — 리소스별 요청/응답 스키마·에러·예시. Auth·JoinRequests·Plans·Memories 우선.
3. **코드 스캐폴딩** — MyBatis 매퍼/도메인 + React api 서비스·훅, 화면별 `.md` ↔ 페이지/컴포넌트 매핑.
