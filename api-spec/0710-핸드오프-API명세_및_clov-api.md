# API 명세 & clov-api — 이어서 작업용 핸드오프

> **작성**: 2026-07-10 (세션 종료, 집에서 이어가기용)
> **범위**: 화면명세 마스터 갱신 완료 이후 → **API 명세서 뽑기 → docs-archive 정합 → 인원 상한 8명 → clov-api 코드 착수**까지.
> **바로 읽을 순서**: 이 문서 → [README.md](README.md) → [02-db-api-reconciliation.md](02-db-api-reconciliation.md).

---

## 0. 지금 어디까지 왔나 (한눈에)

```
화면명세서(11 화면 + 마스터 00~09)  ✅ 완료
   └─ 역산 ─▶ API 명세서 api-spec/  ✅ 정합 확정본 완료 (00~04)
                 └─ docs-archive의 기존 DB/API 설계와 정합 ✅ (결정 D1~D6 확정)
                       └─ 인원 상한 8명 반영 ✅ (설계문서·계약문서 3계층)
                             └─ clov-api 코드: 정원 검증 슬라이스 ✅ (단위테스트 통과)
                                   └─ ⬜ openapi.yaml / 호출부 연결 / DB 부트스트랩 (다음)
```

---

## 1. 오늘 만든/바꾼 것

### 1-1. API 명세서 — `web-design-repository/api-spec/` (신규 폴더)
| 파일 | 내용 |
|---|---|
| [README.md](README.md) | 인덱스·진행 상태·도메인 불변식 |
| [00-conventions-and-security.md](00-conventions-and-security.md) | 규약·인증(JWT+OAuth)·2단 인가·에러모델·**정원 8명**·파일·XP 서버계산 |
| [01-resource-map.md](01-resource-map.md) | 전체 엔드포인트 인벤토리(`rooms`/`plans` 네이밍, ✨신규 표시) |
| [02-db-api-reconciliation.md](02-db-api-reconciliation.md) | **docs-archive 설계와 정합** + 결정표 **D1~D6 ✅확정** |
| [03-db-extensions.md](03-db-extensions.md) | archive DB에 얹을 신규 테이블·컬럼 델타 |
| [04-erd-and-ddl.md](04-erd-and-ddl.md) | **최종 통합 ERD(mermaid) + MySQL 8 DDL** (15 테이블) |

### 1-2. 인원 상한 8명 — 3계층 반영 (원칙: "인원 제한 없음" → **최대 8명**, 단일구조·방장없음·동등은 유지)
- **설계 문서**: `web-design-repository/` CLAUDE.md·AGENTS.md·README.md, screen-spec-source 00/07/08, test-web-design index/makerooms/join_room/notification
- **API 명세**: api-spec 00(정원 절+에러)·01(join 신청/수락)·04(노트)
- **실제 레포 계약**: `clov-api/docs/API-CONTRACT.md`, `clov-web/docs/API-CONTRACT.md`

### 1-3. clov-api 코드 — 정원 검증 슬라이스 (별도 git 레포 `project/clov-api`)
- `domain/room/service/RoomMemberService.java` — **`MAX_ROOM_MEMBERS=8`** + `assertCanAcceptNewMember(roomId)`
- `domain/room/mapper/RoomMemberMapper.java` + `resources/mapper/RoomMemberMapper.xml` — `countActiveMembers`(ACTIVE만)
- `global/exception/ErrorCode.java`(`ROOM_CAPACITY_EXCEEDED` 409) + `BusinessException.java`
- `test/.../RoomMemberServiceTest.java` — 7명 허용 / 8·9명 예외 (**통과**)
- `application.yaml` — MyBatis mapper-locations 설정 추가

---

## 2. 반드시 기억할 결정·제약

### 확정 결정 (api-spec 02 §3)
| | 결정 |
|---|---|
| D1 입장 | 가입 신청 → 멤버 1명 수락 → 5분 되돌리기 (JOIN_REQUESTS 신설) |
| D2 친구별 관점 | 작성자별 추억 row **+** 친구 한 줄 메시지 (둘 다) |
| D3 FREE MEMORY | 허용 (`plan_id` nullable) |
| D4 네이밍 | `rooms`/`plans` (archive DB 기준) |
| D5 수정/삭제 | 작성자 본인만 (`NOT_WRITER`) |
| D6 인증 | 이메일+비번 + 소셜 OAuth 둘 다 |

### 인원 상한
- `MAX_ROOM_MEMBERS = 8` (ACTIVE 기준, 생성자 포함, LEFT 제외). 정원 초과 시 신청 생성·수락 차단 `409 ROOM_CAPACITY_EXCEEDED`. **앱 로직 강제**(스키마 제약 아님).

### 실제 레포 스택 (git)
- **clov-api**: Spring Boot **4.0.7** · Java 21 · Security 6 + JWT(jjwt 0.12.x) · **MyBatis**(JPA 금지) · MySQL 8 · Gradle. 도메인형 패키지(`domain/*/{controller,service,mapper,dto,entity}`, `global/`). 응답 `{success, error{code,message}}`. **명세는 `docs/API-CONTRACT.md` 단일 기준(변경 시 먼저 수정), DB 스키마 변경은 승인 필요.**
- **clov-web**: React 19 + Vite · react-router-dom v7 · TanStack Query v5 · Zustand · axios. `src/{pages,components,api,stores,hooks}`.

### ⚠️ 미해결 divergence (중요)
**우리 api-spec은 "가입 신청→수락" 흐름**인데, **실제 레포 계약(clov-api/clov-web `API-CONTRACT.md`)은 아직 archive의 "코드→즉시 입장" 모델**이다. 오늘은 정원(8명)만 양쪽에 반영했고, **이 흐름 차이는 아직 정합 안 됨** → 언젠가 결정·통일 필요(D1을 실제 레포에도 반영할지).

### 손대지 않은 것 (의도적)
- `docs-archive/` 원본(보존 아카이브) — 아직 "인원 제한 없음" 문구 남아있음(원하면 갱신).
- `team-branches/`, `_archive/`, `_docs/` 작업기록 (포크·과거 기록).

---

## 3. clov-api 현재 상태 (집에서 실행 시)

- **repo는 스켈레톤**: 도메인·DB 설정 없음. `application.yaml`에 **datasource 미설정**.
- **`./gradlew test` 전체는 실패** — 단, `ClovApiApplicationTests.contextLoads()`의 **선재 실패**(datasource 없음 → `DataSourceBeanCreationException`). 내 코드 문제 아님.
- **내 정원 테스트는 통과**:
  ```bash
  cd clov-api
  ./gradlew test --tests "com.korit.clovapi.domain.room.service.RoomMemberServiceTest"
  ```
- **아직 호출부 없음**: 초대/가입 수락 엔드포인트가 미구현이라 `assertCanAcceptNewMember()`는 만들어만 둠. 수락 트랜잭션 구현 시 그 안에서 호출해야 실제 작동.

---

## 4. 다음 할 일 (우선순위 제안)

### clov-api (코드)
1. **DB 부트스트랩** — `application.yaml`에 MySQL datasource 설정(시크릿은 로컬/`.env`), [04-erd-and-ddl.md](04-erd-and-ddl.md)의 DDL로 스키마 생성. → `contextLoads()` 초록. (스키마 변경은 AGENTS상 승인 필요)
   - 대안: 테스트용 H2 추가(라이브러리라 팀 확인 후).
2. **가입/초대 수락 도메인 슬라이스** — JOIN_REQUESTS(또는 현 레포 모델 invites/accept) 컨트롤러·서비스·매퍼 구현하고, 수락 트랜잭션 안에서 `RoomMemberService.assertCanAcceptNewMember(roomId)` 호출.
3. **GlobalExceptionHandler** — `BusinessException` → `{success:false, error:{code,message}}` + `ErrorCode.status` 매핑(web 계층 추가 시).

### API 명세 (문서)
4. **`openapi.yaml`** — [04](04-erd-and-ddl.md) 스키마 기반 요청/응답 DTO. Auth·JoinRequests·Plans·Memories 우선.
5. **흐름 divergence 정합** — api-spec(가입승인) vs 실제 레포 계약(즉시입장) 통일 결정.
6. (선택) `docs-archive` 원본에도 인원 8명 반영할지.

### 참고 문서
- 화면 흐름 → [../screen-spec-source/07-user-flow.md](../screen-spec-source/07-user-flow.md)
- 화면별 명세 11개 → `../test-web-design/*/*.md`
- 기존 설계(보존) → [../../docs-archive/Clov_DB_설계.md](../../docs-archive/Clov_DB_설계.md) · [Clov_API_설계.md](../../docs-archive/Clov_API_설계.md)

---

## 5. openapi.yaml (클로드 디자인 생성본) — 리뷰 & 수정할 것

- 위치: [openapi.yaml](openapi.yaml) — 클로드 디자인(claude.ai)이 우리 `01-resource-map`·`00-conventions`·`04-erd-and-ddl` 근거로 생성.
- **평가: 완성도 높은 초안(~85%)**. 전 리소스 커버, `$ref`/공통 responses/예시 깔끔. 확정 결정(D1 가입승인·D3 FREE MEMORY·정원8명·작성자본인·page/size·도장4상태·XP서버계산) 반영됨.
- **단일 계약으로 승격 전 맞출 불일치 (중요도순):**

| # | 항목 | 조치 |
|---|---|---|
| ① 🔴 | **응답 봉투 불일치** — clov-api AGENTS는 `{success:true,data}` / `{success:false,error}` 강제인데 yaml은 엔티티 raw 반환 + `Error={error{...}}`(success 없음). 우리 00-conventions가 봉투 없이 쓴 탓. | **둘 중 하나로 통일**(구현 레포 기준 `{success,data}` 권장). yaml 전체 응답 래핑 + 00-conventions도 수정 |
| ② 🟡 | **DDL에 없는 필드** — `Room.vehicle`(plane/bus/ship/train), `Room.intro`(60자)가 yaml엔 있는데 04-DDL `friendship_rooms`엔 없음 | DDL에 컬럼 추가 or yaml에서 제거 결정 |
| ③ 🟡 | **`nullable: true`는 OpenAPI 3.1 비표준** (JSON Schema 2020-12 → `type:[string,"null"]`) | codegen 쓸 거면 치환 |
| ④ 🟡 | **소셜 OAuth 엔드포인트 누락** — D6은 이메일+소셜인데 `/oauth2/authorization/{provider}` 계열 없음 | 명시 추가(리다이렉트 플로우) |
| ⑤ 🟢 | **ID 타입 string vs DDL BIGINT** | 문자열화 vs 정수노출 결정 |

- 소소: `/users/{userId}` 공개프로필 누락, `Room.inviteCode`(방당1코드) ↔ `/invites`(발급목록) 모델 겹침.
- **다음**: ①(봉투)·②(vehicle/intro 컬럼)·④(OAuth) 정리 → openapi.yaml을 clov-api/clov-web 단일 계약으로 승격 → codegen(Spring DTO/Controller, React api/hooks).

## 6. 커밋 상태
- **아직 아무것도 커밋 안 함.** `web-design-repository`(git 아님), `clov-api`·`clov-web`(git repo)의 변경은 워킹트리에만 있음. 집에서 리뷰 후 커밋할 것.
