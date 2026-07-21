# memory 이미지 R2 착수 프롬프트 (lami) — 2026-07-22

> 방식: **골든레퍼런스 복붙**. presign 배선은 방금 머지된 **프로필 presign 슬라이스(clov-api #44)**를 그대로 본떠라. 도메인 패턴(작성자 확인·insert 후 재조회)은 **네 memory/댓글 슬라이스(#39)**가 정석. 새 구조·이름 발명 금지(막히면 이슈에 질문).
> 공통 규약: 응답 봉투 `{success,data}`, 목록은 `data.items`, **id는 문자열**. 공유 DTO는 `global/dto`(#33 교훈). presign 유틸·DTO는 **이미 있으니 재사용**(새로 만들지 마).

---

## 무엇을 (계약 §10, 이미지 4개 엔드포인트)

memory 이미지 업로드/관리 백엔드. **백엔드만** — 프론트는 이 PR 머지 후 별도.

| Method | Path | 인가 | 비고 |
|---|---|---|---|
| POST | `/api/v1/memories/{memoryId}/images/presign` | 작성자 | 쿼터 초과 → `507 STORAGE_QUOTA_EXCEEDED` |
| POST | `/api/v1/memories/{memoryId}/images` | 작성자 | 업로드 커밋 — `{imageUrl, sortOrder}` → `MemoryImageResponse` |
| DELETE | `/api/v1/memory-images/{imageId}` | 작성자 | `data:null` |
| PATCH | `/api/v1/memories/{memoryId}/images/order` | 작성자 | `{imageIds:[...]}` 순서대로 `sort_order` 재부여 → `images[]` |

## 재사용 (절대 새로 만들지 마)

- **`global/dto/PresignRequest`**(`{contentType, fileSize}`) / **`global/dto/PresignResponse`**(`{uploadUrl,imageUrl,expiresIn}`) — #44에서 이미 만듦.
- **`StoragePresigner`**(빈 주입) — `presignPut(objectKey, contentType)` + `StoragePresigner.extensionFor(contentType)`.
- **`roomService.assertActiveMember(roomId, userId)`** + **`assertWriter(memory, userId)`**(→ `NOT_WRITER`) — 네 MemoryService에 이미 있음.
- 테이블 **`memory_images`** 이미 있음(`id·memory_id·image_url·sort_order·created_at`). DDL 건드리지 마.
- **`MemoryImageResponse`**(`{id, imageUrl, sortOrder}`) 이미 있음(현재 shape-only) — 그대로 채워 반환.

## 만들 것 (MemoryService + 매퍼)

1. **presign**: `assertActiveMember` + `assertWriter` → **쿼터 검사** → object key `memories/{memoryId}/{uuid}{ext}`(`ext`=`StoragePresigner.extensionFor(contentType)`) → `PresignResponse.from(storagePresigner.presignPut(...))`. **파일 저장/행 생성 없음**(서명만).
2. **커밋(POST images)**: `assertWriter` → **쿼터 재검사**(최종 방어) → `memory_images` insert(`image_url`·`sort_order`) → insert된 행 재조회해 `MemoryImageResponse` 반환. (네 #39의 "insert 후 재조회" 패턴 그대로.)
3. **삭제**: `imageId` → 이미지의 `memory_id`로 memory 로드 → `assertWriter` → delete → `null`.
4. **순서 재정렬**: `imageIds` 순회하며 해당 memory 소속·작성자 확인 후 index를 `sort_order`로 update → 갱신된 `images[]` 반환.
5. **매퍼**: `memory_images` 접근용 메서드 추가(`insert`·`countByMemoryId`·`findByMemoryId`·`deleteById`·`updateSortOrder`). `MemoryMapper`에 넣든 새 `MemoryImageMapper`든 네 도메인 컨벤션대로. XML `namespace`/`id` 정확히.
6. **상세 정합**: `GET /memories/{memoryId}`의 `images[]`가 지금은 항상 빈 배열 → 커밋 후 실제 이미지가 나오도록 매퍼 조회 배선 확인.

## ★ 쿼터 상한 = 리더 결정 필요 (착수 전 확인)

계약엔 `507 STORAGE_QUOTA_EXCEEDED`만 있고 **장수 상한 숫자는 미정**. **리더 확정 전까지 상수 하나로 두고**(제안: **memory당 최대 10장**) `MemoryService`에 `private static final int MAX_IMAGES_PER_MEMORY = 10;`처럼 명시. presign·커밋 양쪽에서 `현재수 + 1 > MAX` → `507`. (숫자는 리더가 확정하면 상수만 교체.)

## 주의

- presign은 서명만(네트워크·행 생성 없음) → 쿼터의 최종 방어는 **커밋**에서. presign 쿼터는 사전 안내용.
- object key는 도메인별 유일하게(위 규칙). presign이 실제 자격증명으로 서명하지만 **CI엔 더미 config**(application-test.yaml `app.storage.*`)라 서명 형태 검증만 가능 — 실 버킷 E2E는 로컬/스테이징 수동.
- 자격증명은 이미 secret에 있음. 코드·yaml에 값 넣지 마.

## 테스트 (통합, CI Testcontainers)

- presign: 작성자 → 서명 URL 형태(`uploadUrl` http·`X-Amz-Signature`, `imageUrl`에 `memories/{id}/` 포함, `expiresIn` 양수).
- 쿼터: MAX까지 커밋 후 presign/커밋 → `507`.
- 커밋: 행 생성 + `MemoryImageResponse` 반환, 상세 `images[]`에 반영.
- 삭제/순서: 작성자 동작 + **비작성자 → `NOT_WRITER`(403)**.

## 완료

- 백 PR, 본문에 이슈 번호(**memory 이미지 이슈가 없으면 리더가 먼저 생성** — 스토리지 #38과 별개). CI `build` 초록.
- 보고: 변경/검증/남은 점 3줄(쿼터 상한값 무엇으로 뒀는지 명시).
