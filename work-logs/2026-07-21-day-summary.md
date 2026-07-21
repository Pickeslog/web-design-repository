# 2026-07-21 데이 서머리 — R1-B 프론트 마감 · 라이브 검증 · R2 착수

> 한 줄: **R1 전부(백+프론트) 완료**, 리더 프론트 6개 도메인 완성, 실백엔드 관통 검증 통과, R2 파이프라인 세팅. 남은 리더 백엔드 = **user #15**뿐(Codex 컴파일만).

## 오늘 머지된 PR (12)
**R1-B 프론트 마감**
- clov-web #23 memory(추억피드) 프론트 — lami
- clov-web #26 RoomList 연동 — Claude
- clov-web #25 letter(행운편지) 프론트 — chacha (+Claude rebase 대행)
- clov-web #27 notification(알림) 프론트 — kimgyubi (+Claude rebase·봉투 양형태 방어 대행)
- clov-web #29 plan(일정계획) 프론트 스캐폴드 — Claude (인생4컷 제외=스토리지 대기)

**백엔드**
- clov-api #32 GET /rooms — Codex
- clov-api #31 MyBatis 별칭 스코핑(entity-only) — Codex
- clov-api #27 plan 백엔드(재작업본) — Codex
- clov-api #36 notification 목록 봉투 정합(#13) — Claude(fallback)
- clov-api #40 DB 세션 UTC 고정(#34) — Codex
- clov-api #39 memory 댓글 API(#37, R2) — lami

**R2 착수**
- clov-web #30 invite(초대·가입신청) 프론트(#28) — chacha (R2)

## 감사 (Claude)
#23·#32·#27(2차: §9 checked:null 버그 발견→Codex 재작업→통과)·#25·#27noti(봉투/actor 편차 발견)·#39(모범적)·#40·#30(모범적, parseUtc 캐치). 셀프PR=코멘트, 팀원PR=APPROVE.

## 라이브 관통 검증
실백엔드(8080, 토큰=verify@test.local id30)로 RoomList·Dashboard·Feed·Letters **4슬라이스 정합 드리프트 0**. JWT sub=userId·UserSummary·봉투·필터·인터랙션 라이브 확인. **TZ 불일치 발견→#34**(#40으로 수정 완료).

## Claude 직접 구현
RoomList(#26)·plan 프론트 스캐폴드(#29)·notification 봉투 백엔드(#36)·letter/notification rebase 대행.

## 문서·이슈·프롬프트
- CODE-CONVENTION+REGISTRY: #33 별칭 교훈 명문화(공유 DTO→global/dto, entity-only 별칭 스캔[#31 채택]).
- R2 이슈: #28 invite(chacha)·#37 memory댓글(lami)·#35 actor(kimgyubi)·#38 스토리지·#34 TZ.
- Codex 프롬프트: plan 재작업·notification 봉투·**user #15**·**storage presign**.
- R2 착수 프롬프트(비전공용, 골든레퍼런스=본인 R1 슬라이스 복사).
- 디스코드 팀 공지(R2 배정+규칙) 작성.

## 교훈 (오늘)
- **모든 프론트 timestamp 파싱은 `Z` 붙여 UTC로**(백엔드가 오프셋 없는 UTC LocalDateTime 반환) — chacha invite `parseUtc`가 정석. **notification #27 `new Date(createdAt)`는 9h 밀림 버그** → actor R2(#35) 때 함께 수정.
- 봉투 한쪽만 바꾸면 창 발생 → 프론트 양형태 방어(`Array.isArray?data:data?.items??[]`)로 순서 무관.
- 비전공 팀원 PR 충돌 rebase는 리더가 merge 방식으로 대행(force-push보다 로컬 덜 흔듦).
- 백엔드도 트리 비고 소규모+스펙 확정이면 Claude가 compileTestJava 로컬체크+CI로 fallback 가능.

## 내일 이어가기 (상태)
- **R1 남은 리더 백엔드 = user #15**(Codex 컴파일만, 테스트/PR 다음). ← R1 마지막.
- **R2 진행 중**: lami 댓글 백✅→댓글 프론트 대기 / chacha invite✅ / kimgyubi actor #35 미착수 / Codex user #15 / 스토리지 #38(provider 미결정).
- 감사 큐 비었음. Codex #15·kimgyubi #35·lami 댓글 프론트 PR 오는 대로 감사.
- 스토리지 #38 프롬프트 준비됨(`코덱스-전달-storage-presign.md`) — provider 결정 시 착수.

---

## ★★ 집에서 이어서 (2026-07-21 밤 마감 — 이게 최종)

### 오후~저녁 추가 완료 (day-summary 위 목록 이후)
- **user #15 백엔드 = Claude가 Codex 인수·완성** → clov-api **#42 머지**. (Codex가 컴파일만·유실 반복 → 리더 승인하에 Claude가 Codex 미커밋 base 위에 controller/service/preferences+통합테스트+포맷/@Valid/'언노운' 마무리)
- **user 프론트(설정 모달) = Claude** → clov-web **#32 머지**. → **리더 도메인 100%(백+프론트) 종료.**
- **lami memory 댓글**: 백 #39 + 프론트 #31 **머지** → 댓글 완성.
- **kimgyubi notification actor 백엔드**: #41 **머지**(actor=UserSummary·LEFT JOIN, Codex가 main merge로 최신화). → **모든 도메인 백엔드 완료.**
- TZ #40 머지(세션 UTC 고정).

### 저녁 마감(집)에 완료된 것 — 위 "남은 3덩어리" 중 2개 소진

1. **스토리지 R2 셋업 ✅ 완료**: provider=**Cloudflare R2** 확정. 리더가 가입→버킷 `clov-media` 생성→**Public Development URL** 켜기(pub-xxx.r2.dev)→**R2 API 토큰**(Object R&W) 발급→`application-secret.yaml`(gitignore)에 `app.storage.*` 주입까지 **전부 완료**.
2. **presign 배선 (#38) ✅ = Claude 직접 구현(B안)** → clov-api **#43 머지**. (원래 Codex 배정이었으나 creds 확보·스펙 확정·소규모라 리더 승인하에 Claude가 배선.) `global/storage/`(StorageProperties·**StoragePresigner**·StorageConfig), AWS SDK v2 s3(BOM 2.31.6), `endpointOverride`+**path-style**(R2 호환), `PlanService.presign` placeholder 제거→서명 PUT URL. object key `rooms/{roomId}/plans/{planId}/{stage}-{uuid}.{ext}`. **CI Testcontainers 초록**(presign 응답 형태 검증) + 비-Spring `StoragePresignerTest`(오프라인 서명). 커밋에 실 자격증명 0.
3. **kimgyubi actor 프론트 ✅ = Claude** → clov-web **#33 머지**. 알림 문구 `actor.nickname` 개인화(actor null이면 제네릭 폴백) + **9h 밀림 수정**(`new Date` → invite `parseUtc`(Z 부착) 정석).

### 진짜 남은 것 (딱 1덩어리)
- **이미지 R2 프론트**: memory 이미지·plan 인생4컷·프로필 업로드(`presign→PUT→commit`). `StoragePresigner` 유틸이 main에 있어 **언블록**. 단, memory/profile presign **엔드포인트는 미구현**(plan만 있음) → 그 엔드포인트 배선 후 프론트. 팀원 분배 대상.

### 자격증명 주의 (유지)
R2 Access/Secret Key는 **`application-secret.yaml`(gitignore)에만** 있음 — 커밋/코드/채팅 금지. `application-secret.example.yaml`엔 키 형태만(값X) 반영됨. Secret Key는 R2에서 재확인 불가하니 리더가 별도 보관.

### 상태 앵커
- **양쪽 레포 열린 PR 0**. clov-api main=`3a67d77`(#43 반영)·clov-web main=`3fada74`(#33 반영).
- 팀 R2 상태: lami 댓글✅·chacha invite✅·kimgyubi actor(백✅·**프론트✅**)·user(리더 백+프론트✅)·스토리지 presign✅.
- **모든 도메인 백+프론트 완료. 스토리지 배선 완료.** 남은 기능 = 이미지 업로드 UI 하나.
