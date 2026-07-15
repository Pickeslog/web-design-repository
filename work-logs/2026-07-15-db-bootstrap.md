# 2026-07-15 — DB 부트스트랩 (스키마 생성 · 정규화 보정 · 팀 배포 준비)

> **범위**: 프로덕션 DB를 실제로 띄우는 것까지. **API·프론트는 아직 착수 전이다.**
> **결과**: 공용 MySQL 서버에 스키마 `st4_clov` + **테이블 19개** 생성 완료. 팀원 배포 문서까지 준비됨.
> **기준 문서**: [../api-spec/05-db-unified-final.md](../api-spec/05-db-unified-final.md) (DB SSOT)

---

## 0. 한눈에

```
화면명세서 ✅ → API 명세 api-spec/ ✅ → DB 설계(05, 18테이블) ✅
   └─ 오늘 ─▶ 정규화 검토 → 19테이블로 보정 ✅
              └─ MySQL st4_clov 생성 + 테이블 19개 투입 ✅
                    └─ clov-api 연결 설정 + 팀원 가이드 ✅
                          └─ ⬜ 팀장 URL 수정 → ./gradlew test 초록 (남음)
                                └─ ⬜ 수직 슬라이스(방 만들기) — 다음 작업
```

---

## 1. 확정된 결정

| | 결정 | 이유 |
|---|---|---|
| **스키마 이름** | `st4_clov` | 처음엔 `clov`로 정했으나 `Error 1044 Access denied`. 기관 공용 MySQL이고 `student4` 계정에 `st4_` 접두어만 허용돼 있었다 |
| **DB 위치** | 기관 공용 원격 서버 (로컬 아님) | 팀원 다수가 비개발자라 각자 MySQL 설치는 진입장벽이 큼 |
| **계정 운영** | **팀 전체가 `student4` 계정·스키마 공유** | 설정 부담 최소화. 대가로 데이터 격리가 없음(아래 리스크) |
| **DDL 실행 방식** | `schema.sql` + `sql.init.mode: always` | 팀원이 clone 후 실행하면 테이블 자동 생성. `IF NOT EXISTS`라 반복 실행 안전 |
| **시크릿 관리** | `application-secret.yaml`은 gitignore, `.example`만 커밋 | 값은 팀장이 개별 전달 |

---

## 2. 정규화 검토 결과 (18 → 19 테이블)

19테이블 전부를 3NF 기준으로 대조했다. **전반적으로 정규화는 잘 돼 있었다** — `memory_participants`의 복합 PK, `plan_stage_photos`의 `UNIQUE(plan_id, stage)`처럼 도메인 규칙을 DB 제약으로 강제한 부분은 좋았다. 아래 2건만 고쳤다.

### 🔴 수정 1 — `LETTER_FAVORITES` 신설 (편지 즐겨찾기 분리)

**문제**: `lucky_letters.is_favorite`가 컬럼 한 칸인데, 백엔드 흐름도 1-6-05는 "**발신자 또는 수신자**" 둘 다 토글 가능이라고 정의돼 있었다. → A가 별을 달고 B가 떼면 **A의 별도 사라진다.** 즐겨찾기는 "보는 사람마다 다른 값"인데 편지 속성으로 들어가 있었다.

```sql
CREATE TABLE letter_favorites (
  letter_id BIGINT, user_id BIGINT, created_at DATETIME,
  PRIMARY KEY (letter_id, user_id)   -- 중복 즐겨찾기 원천 차단
);
-- lucky_letters.is_favorite 컬럼은 제거
```

> `room_members.is_favorite`은 **그대로 뒀다.** 이미 행 자체가 (방, 사람) 조합이라 성격이 다르다. 이름이 같아서 나중에 "일관성 없다"며 되돌릴 수 있어 [05 설계 노트](../api-spec/05-db-unified-final.md)에 근거를 박아뒀다.

### 🔴 수정 2 — `memory_tags`에 `UNIQUE(memory_id, tag)` 추가

**문제**: 같은 추억에 `#제주도`를 두 번 달 수 있었다. 바로 옆 `memory_participants`는 복합 PK로 막아뒀는데 **같은 성격의 테이블인데 한쪽만 뚫려 있었다.**

부수 효과로 `idx_memory_tags_memory`는 삭제했다 — `UNIQUE(memory_id, tag)`의 선두 컬럼이 `memory_id`라 완전히 중복되는 인덱스였다.

### 🟢 문제 아니라고 판단한 것 (의도된 비정규화)

- **`exp_logs.exp_delta`** — `action_type`만 알면 값이 정해져 엄밀히 3NF 위반이지만, **감사 로그로서 올바르다.** 규칙이 바뀌어도 과거 기록은 그대로 남아야 한다.
- **`lucky_letters` 전체발송 8중복** — 8명에게 보내면 내용이 8번 저장. 대신 받은편지함 쿼리에 분기가 사라지고, 편지는 수정 API가 없어 불일치도 안 생긴다.
- **`memory_tags`에 태그 사전 테이블 없음** — 문자열 반복 저장. 실무에서 흔하고 인덱스로 커버된다. 태그 일괄 변경이 필요해지면 그때.

---

## 3. 보류한 것 (지금 안 막아도 굴러감)

| | 항목 | 내용 |
|---|---|---|
| 🟡 | `users.oauth_provider`/`oauth_subject` | 컬럼이 한 쌍뿐이라 **한 사람이 구글+카카오 동시 연동 불가.** D6가 "이메일+소셜 둘 다"인데 소셜 여러 개는 안 된다. 1:N을 1:1로 눌러놓은 상태 |
| 🟡 | `memories.room_id` ↔ `plans.room_id` | `plan_id`가 있으면 `room_id`는 파생값인데 **일치 강제 제약이 없다.** A방 추억이 B방 약속을 참조하는 row가 가능 |
| 🟡 | `friendship_rooms.exp_point`/`friendship_level` | `exp_point` = `SUM(exp_logs.exp_delta)`, `level` = `f(exp_point)` — **2단 파생.** 갱신 주체 규칙이 문서에 없다. FE 03의 "레벨이 서버 값과 어긋나면 재동기화" 문구가 이미 신호 |

수직 슬라이스 진행 중 실제로 걸리면 그때 재검토한다.

---

## 4. 발견한 문서 불일치 (미해결 — API 착수 전 정리 필요)

DB와 무관하지만 **API를 짜기 시작하면 바로 터질 것들**이다.

| # | 항목 | 흐름도 | 실제 기준 |
|---|---|---|---|
| ① 🔴 | 4컷 단계 식별자 | `stage_no`(1~4) | 05-DDL: `stage` enum (`PROPOSAL/SCHEDULING/CONFIRMED/MEETING`) |
| ② 🔴 | 정원 초과 에러 | `ROOM_FULL` (6곳) | 코드 `ErrorCode.java`: **`ROOM_CAPACITY_EXCEEDED`** (이것 하나뿐) |
| ③ 🟡 | 백엔드 데이터 계층 | "**Spring Data** 계층(Repository/Service)" | **MyBatis** (AGENTS.md상 JPA 금지) |
| ④ 🟡 | 소셜 로그인 | FE 01-03 "미연동 placeholder" | BE 1-1-03에 OAuth 흐름 존재. D6 = 이메일+소셜 둘 다 |

②가 특히 위험하다. 프론트가 흐름도대로 `if (code === 'ROOM_FULL')`을 짜면 **영원히 안 걸린다.** 조용히 실패하는 종류라 QA에서도 놓치기 쉽다. 코드가 1곳이고 문서가 6곳이라 **코드를 고치는 게 싸다.**

> **`docs-archive/`는 더 이상 "보존 아카이브"가 아니다.** 화면흐름도 3종(FE/BE/에러처리)은 8명 정원·D1 가입승인이 전부 반영된 **살아있는 최신 명세**다. 폴더 이름 때문에 아무도 안 여는 게 문제 — `api-spec/`으로 옮기는 것을 검토할 것.

---

## 5. 프론트엔드 현황 (착수 전)

`clov-web/package.json`을 열어보니 실물은 이렇다.

```json
"dependencies": { "react": "^19.2.7", "react-dom": "^19.2.7" }
```

**라우터·쿼리·상태관리·HTTP 클라이언트가 하나도 없다.** 빈 Vite 스켈레톤이다. 게다가 문서 둘이 서로 다르다 — FE 흐름도는 `@emotion/react`, 핸드오프는 `TanStack Query v5 · react-router-dom v7 · Zustand · axios`. **스택 확정 후 설치가 프론트의 첫 작업**이다.

---

## 6. 리스크

**공유 DB** — 팀 전원이 `student4` 계정·`st4_clov` 스키마 하나를 쓴다. **한 명이 `DROP DATABASE`/`DROP TABLE`/`TRUNCATE`를 실행하면 전원 데이터가 사라진다.** [DB-SETUP.md](../docs/DB-SETUP.md) 0번 항목에 경고를 넣었지만, 말로도 한 번 못박을 것.

**스키마 변경 비용** — `IF NOT EXISTS`라 **컬럼 변경은 반영되지 않는다.** 구조를 바꾸려면 `DROP DATABASE` 후 재생성인데, 공유 DB라 팀 전원 합의가 필요하다. 데이터가 쌓이면 Flyway 도입을 검토할 시점이 온다.

**팀원 브랜치 드리프트(미해결)** — `chacha1650a`·`kimgyubi`·`lami2342` 세 브랜치가 모두 **main보다 28커밋 뒤처져 있다.** 그래서 팀원 브랜치에는 `api-spec/` 파일이 **0개**다. DB 설계도 API 규약도 팀원 화면에는 존재하지 않는다. 이 로그도 main에 있으면 팀원은 못 본다.

---

## 7. 바뀐 파일

### web-design-repository
| 파일 | 변경 |
|---|---|
| [api-spec/05-db-unified-final.md](../api-spec/05-db-unified-final.md) | **DB SSOT.** ERD 관계·엔티티, DDL, 변경요약(18→19), 설계 노트 2건 추가 |
| [../docs-archive/Clov_화면흐름도_백엔드.md](../../docs-archive/Clov_화면흐름도_백엔드.md) | 1-6-05의 "DB 변화"를 `LETTER_FAVORITES` 기준으로 |

### clov-api (별도 git 레포)
| 파일 | 변경 |
|---|---|
| `src/main/resources/schema.sql` | 신규. 05-DDL 19테이블 |
| `src/main/resources/application-secret.yaml.example` | 신규. 팀원용 템플릿(값 비움) |
| `src/main/resources/application.yaml` | `spring.config.import` + `sql.init.mode: always` |
| `.gitignore` | `application-secret.yaml`·`.env` 차단 |
| `docs/DB-SETUP.md` | 신규. 팀원용 5분 가이드 + 에러별 해결표 |
| `README.md` | DB-SETUP 링크. Spring Boot **3.5 → 4.0** 수정(실제 4.0.7) |

---

## 8. 정정 기록

작업 중 **"시크릿이 GitHub에 커밋돼 있다"고 오진**해 키 재발급을 검토했으나, **사실이 아니었다.** `application-secret.yaml`은 인덱스에 staged만 돼 있었고 **어떤 커밋에도 들어간 적이 없다**(`git log --all -- <path>` 결과 없음, `origin/main`에도 없음). `git ls-files`가 인덱스를 보여준다는 점을 놓친 것이 원인. **키 재발급·히스토리 정리는 불필요했다.** `git rm --cached`로 추적 해제만 하고 마무리.

> 교훈: 커밋 여부는 `git ls-files`가 아니라 `git log --all -- <path>` / `git cat-file -e HEAD:<path>`로 확인한다.

---

## 9. 다음 할 일

1. ⬜ **팀장 `application-secret.yaml`의 URL을 `st4_todo` → `st4_clov`로 수정** → `./gradlew test` 초록 확인 (**팀원 배포 전 필수** — 팀장 것도 안 되는 상태로 안내가 나가면 같은 질문이 4번 온다)
2. ⬜ 팀원에게 DB-SETUP.md 안내 + 접속 정보 개별 전달(공개 채널 금지)
3. ⬜ **팀원 브랜치 드리프트 해소** (28커밋) — 한 명씩 순서대로, 화면 공유하며. 이게 곧 Git 교육이 된다
4. ⬜ 문서 불일치 ①② 정리 (API 착수 전)
5. ⬜ **수직 슬라이스 1개**(방 만들기)를 React → API → MySQL까지 관통. `RoomMemberService`(정원 8명 검증, 테스트 통과 상태)가 출발점
