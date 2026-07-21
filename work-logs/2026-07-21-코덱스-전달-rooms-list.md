# 코덱스 전달 — GET /rooms(내 우정공간 목록) 백엔드 (계약 §6 신규)

> room 프론트 뼈대에서 드러난 갭. 계약 §6에 `GET /rooms` 추가됨. 이미 머지된 `domain/room` 슬라이스에 **목록 조회만** 덧붙인다(새 도메인 아님).

---

작업 전 `clov-api/AGENTS.md`, `web-design-repository/docs/DOMAIN-NAMING-REGISTRY.md`·`CODE-CONVENTION.md`, 계약 `docs/API-CONTRACT.md` §6(`GET /rooms` 신규)을 읽어.

## 목표
clov-api의 이미 머지된 `domain/room`에 `GET /api/v1/rooms`(내 우정공간 목록)를 추가한다.

## 엔드포인트 (계약 §6·§6-1)
- `GET /api/v1/rooms` — 내가 **ACTIVE 멤버인 ACTIVE 방** 목록. 인가=로그인.
- 응답: 목록 봉투 `{ items: RoomSummary[] }`. **즐겨찾기 우선·최근 생성순**. 빈 목록 `items: []`.
- `RoomSummary`: `id`·`name`·`description`·`themeColor`·`transportType`·`coverPhotoUrl`·`friendshipLevel`·`memberCount`·`isFavorite`·`status`·`createdAt` (RoomDetail 축약 — `expPoint`·`myStatusMessage`·`scheduledDeleteAt`·`coverTitle` 제외). **ID는 JSON 문자열.**

## 구현
- `RoomController`: `@GetMapping`(클래스가 `/api/v1/rooms`면 경로 없음) `list` 핸들러. `RoomService.findMyRooms(userId)`.
- `RoomMapper.findSummariesByMemberUserId(userId)` XML:
  ```sql
  SELECT r.id, r.name, r.description, r.theme_color, r.transport_type, r.cover_photo_url,
         r.friendship_level, r.status, r.created_at, me.is_favorite,
         (SELECT COUNT(*) FROM room_members a WHERE a.room_id = r.id AND a.status = 'ACTIVE') AS member_count
  FROM friendship_rooms r
  JOIN room_members me ON me.room_id = r.id AND me.user_id = #{userId} AND me.status = 'ACTIVE'
  WHERE r.status = 'ACTIVE'
  ORDER BY me.is_favorite DESC, r.created_at DESC
  ```
- `RoomSummaryResponse` DTO 신규(record, `from(Room)` 또는 resultMap). 이름은 레지스트리 §2 room 소유. MyBatis `#{}`만. role 개념 없음.

## 완료
- 계약 §6·§6-1 일치. **Testcontainers 통합 테스트**: 목록·즐겨찾기 정렬(is_favorite 우선)·빈 목록·비멤버 방 제외·LEFT 멤버 방 제외.
- `./gradlew.bat test`, CI `build` 초록. PR 본문에 계약 §6 `GET /rooms` 참조.
- (리더 안내) 이 작업용 이슈를 리더가 clov-api에 만들면 PR에서 `Closes` 연결. 없으면 PR 설명에 계약 §6 링크만.
- 보고: 변경/검증/남은 점 3줄.
