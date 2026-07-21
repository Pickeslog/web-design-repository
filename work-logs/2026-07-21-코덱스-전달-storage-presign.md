# 코덱스 전달 — 오브젝트 스토리지 presign 배선 (#38)

> **✅ 완료 (2026-07-21 밤) — clov-api #43 머지.** 원래 Codex 배정이었으나 creds 확보·스펙 확정·소규모라 리더 승인하에 **Claude가 직접 배선**(B안). `global/storage/StoragePresigner`(AWS SDK v2, path-style, R2) + `PlanService.presign` 실서명. CI Testcontainers 초록. **이 문서는 이력용 — 재배정 금지.** memory 이미지·프로필 presign 엔드포인트는 이 유틸 재사용해 이미지 R2 프론트 때 배선.

> 담당: Codex(인프라/백엔드). **전제: 리더가 스토리지 provider 결정·버킷 생성·자격증명을 `application-secret.yaml`(gitignore됨)에 주입한 뒤 착수.** 자격증명은 커밋되는 yaml/코드에 **절대** 넣지 마(키 이름만).
> **provider 확정 = Cloudflare R2**(무료·S3 호환, 2026-07-21 저녁 결정). 리더가 Cloudflare 가입 완료 → 남은 리더 작업 = 버킷 `clov-media` 생성 + Public Development URL(pub-xxx.r2.dev) 켜기 + R2 API 토큰(Object R&W) 발급 → secret 주입.
> 배경: 현재 presign이 placeholder(`"pending-storage-signature"`). 이 작업으로 실제 presigned PUT URL을 발급한다. 이미지 R2(memory 이미지·plan 인생4컷·프로필) 전체의 전제.

## 리더가 먼저 제공 (secret)
`application-secret.yaml`에 (R2 확정 값):
```yaml
app:
  storage:
    endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com   # R2 필수(계정 ID)
    region: auto              # R2는 반드시 auto (ap-northeast-2 아님)
    bucket: clov-media
    access-key: ...           # secret = R2 API 토큰 Access Key ID
    secret-key: ...           # secret = R2 API 토큰 Secret Access Key
    public-base-url: https://pub-<HASH>.r2.dev/   # R2 Public Development URL(끝 슬래시 포함)
```
- `application.yaml`(커밋본)엔 `app.storage.*` 키를 `${...}` 플레이스홀더나 secret include로만 두고 값은 secret에. (기존 OAuth/JWT가 secret include로 처리되는 방식 그대로.)
- **R2 주의**: region은 리터럴 `auto`, endpoint는 계정별 r2.cloudflarestorage.com. `pathStyleAccessEnabled(true)` 필수(아래 2번). 공개 조회는 버킷의 Public Development URL(pub-xxx.r2.dev) 기준 = `public-base-url`.

## 만들 것
1. **build.gradle**: AWS SDK v2 `s3` 의존성(`software.amazon.awssdk:s3`). (R2/MinIO도 SDK v2 + `endpointOverride`로 동작.)
2. **`global/storage/StoragePresigner`**(공용 유틸):
   - `S3Presigner` 빈 — region·자격증명(`StaticCredentialsProvider`)·`endpointOverride`(endpoint 있으면)·`pathStyleAccessEnabled(true)`(R2/MinIO 호환).
   - `PresignResult presignPut(String objectKey, String contentType)` → `presignPutObject`로 서명 PUT URL 생성(만료 예: 300초). 반환 = `uploadUrl`(서명 PUT URL)·`imageUrl`(`public-base-url + objectKey`)·`expiresIn`.
   - object key 규칙(도메인별 유일): 예 `rooms/{roomId}/plans/{planId}/{stage}-{uuid}.jpg`, `memories/{memoryId}/{uuid}.jpg`, `users/{userId}/profile-{uuid}.jpg`.
3. **기존 presign 서비스 교체**: `PlanService.presign`(그리고 user #15의 profile-image presign)이 placeholder 대신 `StoragePresigner.presignPut(...)` 사용. **계약 §4-3 Presign 응답 형태 유지**(`uploadUrl`·`imageUrl`·`expiresIn`).
   - memory 이미지 presign은 아직 엔드포인트 미구현 → 이 PR 범위 밖(유틸만 준비, memory 이미지 R2 때 재사용).

## 주의
- **자격증명 커밋 금지** — secret/env만. `application-secret.example.yaml`엔 키 이름·형식만(값 X), TZ PR(#40) 방식 그대로.
- 커밋 코드엔 provider별 분기 최소화 — endpointOverride 유무로 AWS/R2/MinIO 공통 처리.

## 테스트
- 실 업로드 E2E는 버킷 필요 → **CI에선 presign 응답 형태 검증**(`uploadUrl`이 http(s)·서명 쿼리 포함, `imageUrl`이 objectKey 포함, `expiresIn` 양수)로 충분. 자격증명 없는 CI에선 더미 config로 presigner가 URL을 만들 수 있는지(서명은 로컬 계산이라 네트워크 불필요)만 확인. 실 버킷 연동 확인은 로컬/스테이징에서 수동.
- 기존 plan 통합테스트가 presign 응답 필드 형태를 새로 검증하도록 보강.

## 완료 기준
- presign이 실제 서명 PUT URL 반환(placeholder 제거). CI `build` 초록. PR 본문 `Closes #38`.
- 보고: 변경/검증/남은 점 3줄(특히 실 버킷 E2E는 별도임을 명시).
