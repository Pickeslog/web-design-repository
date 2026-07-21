# notification 백엔드 — 목록 봉투 정합 (계약 §13)

> 담당: kimgyubi(원 도메인) 또는 Codex. **리더 결정: "봉투 지금 + actor R2"**. 이 프롬프트는 **봉투만**. actor는 별도 R2 이슈.
> 배경: 2026-07-21 라이브 관통 검증에서 notification만 계약을 이탈함을 확인(프론트 #27은 양형태 방어로 이미 대응 — 이 수정 전후 무크래시).

## 문제 (계약 §13 이탈 2건, 백엔드)
라이브 응답:
```json
{ "success": true, "data": [ { "id":"1","roomId":"7","recipientId":"30","actorId":"30","type":"NOTICE","referenceId":null,"isRead":false,"createdAt":"..." } ] }
```
1. **목록 봉투 없음**: `GET /rooms/{roomId}/notifications`가 `data: [ ... ]`(**bare array**)를 반환. 계약 §13은 `data: { "items": Notification[] }` **봉투**. rooms/memories/letters 전부 봉투인데 notification만 다름.
2. **read-all 반환값**: `PATCH /rooms/{roomId}/notifications/read-all`가 `data: null`. 계약은 `{ "updatedCount": n }`.

## 고칠 것 (봉투만 — actor는 건드리지 마)

### 1. 목록 봉투
- `domain/notification/dto/NotificationsResponse.java` **신규**(room의 `RoomSummariesResponse` 그대로 본떠):
  ```java
  public record NotificationsResponse(List<NotificationResponse> items) {}
  ```
- `NotificationController.getNotifications` 반환타입을 `ApiResponse<List<NotificationResponse>>` → **`ApiResponse<NotificationsResponse>`**.
- `NotificationService.getNotifications`가 `List<NotificationResponse>` → **`NotificationsResponse`**(리스트를 `new NotificationsResponse(list)`로 감싸 반환).

### 2. read-all → updatedCount
- `NotificationService.markAllAsRead`가 매퍼 업데이트 건수(`int`)를 반환하도록.
- 반환 record 신규(예: `ReadAllResponse(int updatedCount)`), 컨트롤러가 `ApiResponse.success(new ReadAllResponse(count))`.
- 매퍼 `updateAll...`이 영향 행 수를 리턴하는지 확인(MyBatis update는 기본 int 반환).

### 3. 테스트
- 통합테스트: 알림 트리거(예: 방 PATCH로 팬아웃) 후 `GET`에서 `$.data.items`가 배열이고 length·필드(`id/type/isRead/createdAt`) 확인. read-all 후 `$.data.updatedCount` 확인.

## 건드리지 말 것
- **actor**: 현재 `actorId`(문자열)만 반환 → R2 이슈에서 `actor`=UserSummary(users JOIN)로 별도 처리. 이 PR에서 하지 마.
- 엔드포인트 경로·read 단건(`data:null`)은 그대로.

## 완료 기준
- `GET` 응답 = `{ "success":true, "data":{ "items":[...] } }`. read-all = `{ "updatedCount":n }`.
- CI `build` 초록. 프론트 #27은 이미 양형태 방어라 이 머지로 자동 정상 동작(봉투에서 items 추출).
