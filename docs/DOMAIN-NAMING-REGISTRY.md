# 🧭 도메인 네이밍 레지스트리 (SSOT)

> **목적**: 도메인마다 패키지·클래스·파일·API경로·프론트 폴더/모듈/쿼리키 이름을 **미리 확정**해, 사람이든 AI든 "이름을 고를 일"을 없앤다. 발산(RoomSvc vs roomController vs pages/room…)의 원천 차단.
> **사용법**: 새 슬라이스 착수 = ① 이 표에서 도메인 행을 찾고 ② [auth 본보기](#0-본보기-golden-reference)를 복사해 ③ 이름만 이 표대로 치환. **표에 없는 이름을 지어내면 안 된다.** 부족하면 이슈/PR에서 제안 → 이 문서 갱신 후 진행.
> 규칙 근거: [`CODE-CONVENTION.md`](CODE-CONVENTION.md) · 경로: [`API-CONTRACT.md`](API-CONTRACT.md) · 화면: [`이관-매핑.md`](이관-매핑.md) · DB: [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md)

---

## 0. 본보기 (Golden Reference)

**모든 새 도메인은 이미 머지된 `auth` 슬라이스를 복사한다.** 구조·패턴은 그대로, 이름만 아래 표대로 바꾼다.

- 백엔드: `clov-api/src/main/java/com/korit/clovapi/domain/auth/{controller,service,mapper,dto,entity}` + `resources/mapper/auth/UserMapper.xml`
- 프론트: `clov-web/src/pages/auth/Login/{Login.jsx, Login.style.js}` + `src/api/auth.js` + `src/stores/authStore.js`
- 공통: 응답 봉투 `ApiResponse`, `ErrorCode`, `GlobalExceptionHandler`, axios `client.js`(봉투 언래핑 1곳) — **재사용, 재생성 금지**

---

## 1. 파생 규칙 (이름 만드는 공식)

| 레이어 | 규칙 | 예 (`room` 도메인) |
|---|---|---|
| API 패키지 | `domain/<term>` (소문자 단수) | `domain/room` |
| Controller/Service | `<Term>Controller`, `<Term>Service` | `RoomController`, `RoomService` |
| Mapper | `<Term>Mapper`(.java) + `mapper/<term>/<Term>Mapper.xml`(동일 namespace) | `RoomMapper` |
| Entity | `<Term>`(단수, PascalCase) | `Room` |
| DTO | `<Action><Term>Request` / `<Term>Response` (`Dto`·`Data`·`Result` 금지) | `CreateRoomRequest`, `RoomResponse` |
| 프론트 page 폴더 | `src/pages/<plural>/<Component>/{<Component>.jsx, <Component>.style.js}` | `pages/rooms/RoomList/` |
| 프론트 api 모듈 | `src/api/<term>.js` (액션명 함수) | `api/room.js` → `createRoom`, `getRoom` |
| 프론트 store | `src/stores/<term>Store.js` (**클라 UI 상태만**) | `stores/roomStore.js` |
| TanStack Query key | `['<plural>', ...params]` | `['rooms']`, `['room', roomId]` |

> 서버 데이터는 Query, 클라 UI 상태만 Zustand. 화면당 `Xxx.jsx` + `Xxx.style.js`(Emotion). ID는 JSON 문자열.

---

## 2. 도메인별 확정 이름표

> 백엔드 base path·엔드포인트는 계약 §번호 참조. 프론트 담당은 [이관-매핑 §6](이관-매핑.md).

| # | 도메인(term) | API 패키지 | 핵심 클래스 | base path (계약) | Entity(=DB테이블) | 프론트 page/컴포넌트 | api 모듈 | query key | 담당 |
|---|---|---|---|---|---|---|---|---|---|
| §4 | **auth** ✅ | `domain/auth` | `AuthController`·`AuthService`·`OAuthAuthService`·`UserMapper` | `/api/v1/auth` | `User`(users) | `pages/auth/{Login,Signup}` | `api/auth.js` | — | 리더(완료) |
| §5 | **user** | `domain/user` | `UserController`·`PreferenceController`·`UserService`·`UserPreferenceMapper` | `/api/v1/users/me` | `User`(재사용)·`UserPreference`(user_preferences) | `components/SettingsModal` | `api/user.js`·`api/preference.js` | `['me']`·`['preferences']` | 리더 |
| §6 | **room** | `domain/room` | `RoomController`·`RoomService`·`RoomMapper`·`RoomMemberMapper` | `/api/v1/rooms` | `Room`(friendship_rooms)·`RoomMember`(room_members) | `pages/rooms/RoomList`·`pages/Dashboard` | `api/room.js` | `['rooms']`·`['room',id]` | 팀원1 |
| §7 | **invite** | `domain/invite` | `InviteController`·`JoinRequestController`·`InviteService`·`InviteMapper`·`JoinRequestMapper` | `/api/v1/invites`·`/join-requests` | `RoomInvite`(room_invites)·`RoomJoinRequest`(room_join_requests) | `pages/rooms/{Invite,JoinRoom}` | `api/invite.js` | `['joinRequests',roomId]` | 팀원1 |
| §8 | **plan** | `domain/plan` | `PlanController`·`PlanService`·`PlanMapper`·`StagePhotoMapper` | `/api/v1/plans`·`/rooms/{id}/plans` | `Plan`(plans)·`PlanStagePhoto`(plan_stage_photos) | `pages/schedule/Schedule`·`components/FourCutTheater` | `api/plan.js` | `['plans',roomId]`·`['plan',id]` | 팀원2 |
| §9 | **checklist** | `domain/plan` (plan에 포함) | `ChecklistController`·`ChecklistMapper` | `/api/v1/plans/{id}/checklists`·`/checklists` | `PlanChecklist`(plan_checklists) | (Schedule 내부) | `api/plan.js` | `['plan',id]` | 팀원2 |
| §10 | **memory** | `domain/memory` | `MemoryController`·`CommentController`·`MemoryService`·`MemoryMapper`·`MemoryImageMapper`·`CommentMapper` | `/api/v1/memories` | `Memory`(memories)·`MemoryImage`·`MemoryComment`·`MemoryTag`·`MemoryParticipant` | `pages/feed/Feed` | `api/memory.js` | `['memories',roomId]`·`['memory',id]` | 팀원3 |
| §11 | **letter** | `domain/letter` | `LetterController`·`LetterService`·`LetterMapper` | `/api/v1/rooms/{id}/letters`·`/letters` | `LuckyLetter`(lucky_letters)·`LetterFavorite`(letter_favorites) | `pages/letters/Letters` | `api/letter.js` | `['letters',roomId,box]` | 팀원3 |
| §12 | **exp / mascot** | `domain/room` (exp/level)·`domain/mascot` (interact) | `RoomLevelController`(또는 Room에 포함)·`MascotController`·`MascotService` | `/api/v1/rooms/{id}/level`·`/exp-logs`·`/mascot/interact` | `exp_logs` 등(서버계산) | `components/{SceneBanner,Mascot}` | `api/room.js`·`api/mascot.js` | `['level',roomId]` | 팀원1 |
| §13 | **notification** | `domain/notification` | `NotificationController`·`NotificationService`·`NotificationMapper` | `/api/v1/notifications`·`/rooms/{id}/notifications` | `Notification`(notifications) | `pages/notifications/Notifications` | `api/notification.js` | `['notifications',roomId]` | 리더 |

### 반드시 지킬 예외/주의
- **`User` 엔티티·`UserMapper`는 `domain/auth`에 이미 있다(#6).** §5 user 도메인은 **재사용**하고 메서드만 추가한다. **`User`를 다시 만들지 말 것.**
- 소문자 단수 패키지(`domain/room`), 복수 프론트 폴더(`pages/rooms`) — 혼용 금지.
- Mapper XML namespace = Mapper 인터페이스 FQN, SQL id = 메서드명, `#{}`만.
- 새 공유 추상화(2번째 axios client·토큰 store·봉투 파서·디자인토큰)를 만들지 말고 기존 것 확장.

---

## 3. 새 도메인 착수 체크(복붙 프롬프트에 포함)
```
이 도메인의 이름은 web-design-repository/docs/DOMAIN-NAMING-REGISTRY.md 표에서 확정된 값만 쓴다.
auth 슬라이스(domain/auth, pages/auth/Login)를 구조 그대로 복사하고 이름만 표대로 치환한다.
표에 없는 이름은 지어내지 말고 이슈에 제안한다. 공통(ApiResponse·client.js·authStore)은 재사용한다.
```

## 관련 문서
- 코드 규약 → [`CODE-CONVENTION.md`](CODE-CONVENTION.md) · 계약 → [`API-CONTRACT.md`](API-CONTRACT.md)
- 프론트 이관 담당/매핑 → [`이관-매핑.md`](이관-매핑.md) · 협업 루프 → [`AI-협업-운영규칙.md`](AI-협업-운영규칙.md)
