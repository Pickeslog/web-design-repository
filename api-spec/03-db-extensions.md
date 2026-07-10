# Clov DB — 확장 델타 (archive 설계 → 확정본)

> [../../docs-archive/Clov_DB_설계.md](../../docs-archive/Clov_DB_설계.md)의 스키마를 **기반**으로, [02-db-api-reconciliation.md](02-db-api-reconciliation.md)의 확정 결정(D1~D6)과 화면 확정기능을 반영한 **변경분(델타)**만 정리한다. archive 원본은 보존하고, 이 문서가 최신 기준이다.
> 컨벤션: MySQL · `BIGINT id PK AUTO_INCREMENT` · `snake_case` · `created_at`/`updated_at DATETIME`.

---

## A. 신규 테이블

### A-1. `JOIN_REQUESTS` — 가입 신청·승인 (D1) ✨

방장 없는 입장: 코드로 신청 → 멤버 1명 수락 → 5분 되돌리기.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| room_id | BIGINT FK → FRIENDSHIP_ROOMS | 신청 대상 공간 |
| applicant_id | BIGINT FK → USERS | 신청자 |
| invite_code | VARCHAR | 사용한 초대 코드(ROOM_INVITES.invite_code 참조 가능) |
| invite_path | VARCHAR | `INVITED`(초대받음) / `DIRECT`(코드 직접) |
| status | VARCHAR | `PENDING` / `ACCEPTED` / `REJECTED` |
| accepted_by | BIGINT FK → USERS NULL | 수락한 멤버 |
| accepted_at | DATETIME NULL | 수락 시각(되돌리기 5분 기준) |
| canceled_at | DATETIME NULL | 되돌리기/거절 시각 |
| created_at | DATETIME | |

- **제약**: `UNIQUE(room_id, applicant_id, status=PENDING)` 성격 — 동시 수락 경합 방지(낙관적 락 또는 유니크). 중복 수락 요청은 `409`.
- 수락 시 `ROOM_MEMBERS` row 생성(트랜잭션). 되돌리기 시 그 멤버 제거 + `status=PENDING` 복귀.

### A-2. `PLAN_STAGE_PHOTOS` — 인생4컷 단계 인증사진 ✨

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| plan_id | BIGINT FK → PLANS | |
| stage | VARCHAR | `PROPOSAL` / `SCHEDULING` / `CONFIRMED` / `MEETING` |
| image_url | VARCHAR | 오브젝트 스토리지 URL |
| uploaded_by | BIGINT FK → USERS | |
| uploaded_at | DATETIME | |

- **제약**: `UNIQUE(plan_id, stage)` — 단계당 1장, **업로드 후 변경 불가**(재업로드 `422`). `MEETING` 채워지면 EXP +15.

### A-3. `NOTIFICATIONS` — 알림 ✨

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| room_id | BIGINT FK → FRIENDSHIP_ROOMS | |
| user_id | BIGINT FK → USERS | 수신 대상(멤버) |
| type | VARCHAR | `NOTICE`(관리진) / `FRIEND`(입·퇴장 등) / `JOIN`(가입 신청) |
| payload | JSON | 표시용 데이터(대상·문구 등) |
| read_at | DATETIME NULL | |
| created_at | DATETIME | |

- `JOIN` 타입은 화면 표시용 링크일 뿐, 실제 신청 데이터는 `JOIN_REQUESTS`가 소스(중복 저장 금지).

### A-4. `MEMORY_MESSAGES` — 친구 한 줄 메시지 (D2) ✨

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | BIGINT PK | |
| memory_id | BIGINT FK → MEMORIES | |
| writer_id | BIGINT FK → USERS | 메시지 작성 친구 |
| content | VARCHAR | 한 줄 메시지 |
| created_at | DATETIME | |

- D2 "둘 다 지원": 작성자별 `MEMORIES` row(관점 기록) **+** 그 추억에 친구들 한 줄 메시지.

---

## B. 기존 테이블 컬럼 보강

### B-1. `USERS`

| 추가/변경 | 설명 |
|---|---|
| `email VARCHAR UK` | 이메일 로그인(D6). 기존 `login_id`를 email로 쓰거나 별도 추가 |
| `password VARCHAR NULL` | 소셜 전용 계정은 null 허용 |
| `oauth_provider VARCHAR NULL` · `oauth_subject VARCHAR NULL` | 소셜 식별(kakao/naver/google + subject) |
| `avatar_url VARCHAR NULL` | 프로필 사진 |
| `birth_date DATE NULL` | 생년월일(선택) |
| `status_message VARCHAR NULL` | 내 상태메시지(멤버 리스트 노출, 유저 전역) |
| `withdrawn_at DATETIME NULL` | **탈퇴=익명화**(soft). 표시명 "언노운", 기록 보존 |
| (유지) `personal_invite_code UK`, `nickname` | |

### B-2. `FRIENDSHIP_ROOMS`

| 추가 | 설명 |
|---|---|
| `cover_image_url VARCHAR NULL` | 대표 사진 |
| `cover_title VARCHAR NULL` | 대표 커버 제목 |
| `theme_color VARCHAR NULL` | 보딩패스/커버 테마 색 |
| (유지) `friendship_level`, `exp_point`, `status` | |

### B-3. `MEMORIES`

| 변경 | 설명 |
|---|---|
| `plan_id BIGINT FK NULL` | **nullable로 변경**(D3 FREE MEMORY 허용). null=자유 기록 |
| (유지) `room_id`, `writer_id`, `title`, `content`, `mood_tag`, `memory_date` | |

> 화면의 `participants`(함께한 멤버)는 다대다 → 필요 시 `MEMORY_PARTICIPANTS(memory_id, user_id)` 조인 테이블 추가 검토(현 archive엔 없음).

### B-4. `LUCKY_LETTERS`

| 변경 | 설명 |
|---|---|
| `receiver_id BIGINT FK NULL` | **nullable로 변경** — null=전체 발송(To. 전체) |
| `emoji VARCHAR NULL` | 편지 장식 이모지 |
| (유지) `sender_id`, `content`, `is_favorite`, `read_at`, `sent_at` | |

### B-5. `FRIENDSHIP_EXP_LOGS`

| 변경 | 설명 |
|---|---|
| `action_type` 값 확장 | `PLAN_COMPLETE`(+15) · `MEMORY_WRITE`(기본25+) · `LETTER_SEND` · **`MASCOT_INTERACT`(+2, 하루 3회)** · `PLAN_CREATE`(+3) |

---

## C. 반영 대상 문서

- 리소스 맵(엔드포인트) → [01-resource-map.md](01-resource-map.md)
- 규약/보안 → [00-conventions-and-security.md](00-conventions-and-security.md)
- 정합 결정 → [02-db-api-reconciliation.md](02-db-api-reconciliation.md)
- archive 원본(보존) → [DB 설계](../../docs-archive/Clov_DB_설계.md)

---

## 다음 단계

1. 위 델타를 반영한 **최종 ERD(mermaid) + DDL** 생성(원하면 archive 원본을 갱신하거나 별도 파일로).
2. `openapi.yaml` — 이 스키마를 요청/응답 DTO로.
