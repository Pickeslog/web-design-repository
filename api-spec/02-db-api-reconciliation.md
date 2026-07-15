# Clov API — DB/API 설계 정합 (docs-archive ↔ 프로토타입)

> `docs-archive/`에 **기획안 기반 DB/API 설계**가 이미 있다. 이 문서는 그것과 **프로토타입 기반 리소스 맵**([01-resource-map.md](01-resource-map.md))을 맞대어, 무엇을 **기반으로 채택**하고 무엇을 **확장·결정**해야 하는지 정리한다.
> 출처: [../../docs-archive/Clov_API_설계.md](../../docs-archive/Clov_API_설계.md) · [../../docs-archive/Clov_DB_설계.md](../../docs-archive/Clov_DB_설계.md) · [../../docs-archive/Clov_화면명세서.md](../../docs-archive/Clov_화면명세서.md)

---

## 0. 핵심 상황

두 설계 소스가 있고, **한쪽이 다른 쪽보다 오래됐다.**

| 소스 | 성격 | 상태 |
|---|---|---|
| **docs-archive DB/API 설계** | 기획안 기반. **스택·테이블 스키마 확정**(Spring Boot 3.5·Java 21·Security+OAuth2·MyBatis·MySQL) | 프로토타입이 나중에 추가한 기능 **미반영** |
| **화면 명세서**(archive의 `Clov_화면명세서.md` + `test-web-design/*/*.md`) | 프로토타입 기반, 2026-07-10 | 실제 동작 화면 = **최신 진실** |

→ archive 안에서도 **화면명세서 ↔ DB/API 설계가 어긋나 있다.** (예: 화면은 "가입 신청→수락→5분 되돌리기"인데 API 설계는 "코드→즉시 입장")

**결론(제안)**: **archive의 DB/API 설계를 백엔드 기반으로 채택**하되(스택·네이밍·테이블·인가 규칙), **확정된 화면 동작을 반영하도록 확장**한다. 아래는 그 갭 목록이다.

---

## 1. 그대로 채택할 것 (archive → 우리 기준)

archive 설계가 더 정돈돼 있고 스택에 맞으므로 아래는 **archive를 따른다**. 프로토타입 역산본([01](01-resource-map.md))의 표현을 여기에 맞춰 정렬한다.

| 항목 | 채택 결정 | 비고(내 리소스맵과 차이) |
|---|---|---|
| **네이밍** | `rooms`(우정공간) · `plans`(약속) · `letters` · `members` | 내 맵의 `spaces`/`schedules` → **`rooms`/`plans`로 통일** |
| **스택** | Spring Boot 3.5 · Java 21 · Spring Security+OAuth2 Client · MyBatis · MySQL | — |
| **인가 2단 규칙** | ① 공간 멤버십(ACTIVE) ② **수정/삭제는 작성자 본인만**(`NOT_WRITER` 403) | 내가 열어둔 "수정/삭제 권한 범위" 질문 → **archive가 이미 답함: 작성자 본인만** |
| **나가기** | `DELETE /rooms/{id}/members/me` = row 삭제 아님 `status=LEFT` | 익명화/보존 원칙과 일치 |
| **경험치** | `FRIENDSHIP_EXP_LOGS` + `GET /rooms/{id}/exp-logs`·`/level`. 클라 직접 조작 경로 없음 | 내 맵의 "XP 서버 계산"과 동일. `action_type`에 마스코트 추가만 |
| **페이지네이션** | `page`(0부터)·`size`(기본 20) | 내 맵의 커서 방식 → **page/size로 통일**(MyBatis/MySQL 관례) |
| **약속→추억 게이팅** | `PLANS.memory_status`(NONE→CANDIDATE→WRITTEN/SKIPPED), `complete`가 유일 트리거 | 아래 §3에서 FREE MEMORY와 충돌 → 결정 필요 |
| **에러코드 컨벤션** | `ROOM_MEMBER_NOT_FOUND`·`NOT_WRITER`·`INVITE_EXPIRED`·`PLAN_NOT_COMPLETED` 등 | 내 00-conventions 에러모델과 병합 |

---

## 2. DB/API에 **없어서 추가해야 할 것** (화면엔 있는데 설계엔 없음)

프로토타입/화면명세서엔 있으나 archive DB/API엔 **테이블·엔드포인트가 없는** 기능. 각각 제안을 붙였다.

### 2-1. 가입 신청·승인 흐름 (JOIN_REQUESTS) — ⭐ 가장 큰 갭

- **화면**: 코드로 **가입 신청**(pending) → 알림에서 **멤버 누구나 1명 수락** → **5분 되돌리기** / 거절. ([join_room.md](../test-web-design/03-rooms/join_room.md), [notification.md](../test-web-design/07-notification/notification.md))
- **archive API**: `POST /invites/accept` = 코드 넣으면 **즉시 멤버**(승인 단계 없음).
- **충돌**: 승인 단계 유무가 근본적으로 다름.
- **제안**: `JOIN_REQUESTS` 테이블 신설.
  ```
  JOIN_REQUESTS(id, room_id, applicant_id, invite_code, status[PENDING/ACCEPTED/REJECTED],
                invite_path[INVITED/DIRECT], created_at, accepted_at, accepted_by, canceled_at)
  ```
  엔드포인트: `POST /join-requests`(신청) · `GET /rooms/{id}/join-requests` · `.../accept`(멤버 생성 + acceptedAt) · `.../reject` · `.../undo`(accepted_at+5분 이내). 동시성=유니크/낙관적 락(중복 수락 409), 되돌리기 만료 410.
- 기존 `ROOM_INVITES`(코드 발급/취소)는 유지, `invites/accept`는 **가입 신청 생성**으로 의미 변경.

### 2-2. 인생4컷 단계 인증사진 (PLAN_STAGE_PHOTOS)

- **화면**: 약속마다 4단계(제안→일정→확정→만남), **만남 단계 인증사진 업로드**, 업로드 후 **잠금(변경 불가)**, 4컷 완성. ([05-schedule-screen.md](../screen-spec-source/05-schedule-screen.md))
- **archive**: `PLANS`에 stage 개념 없음.
- **제안**: `PLAN_STAGE_PHOTOS(id, plan_id, stage[PROPOSAL/SCHEDULING/CONFIRMED/MEETING], image_url, uploaded_by, uploaded_at)` + `PUT /plans/{id}/stages/{stage}/photo`(업로드 후 재업로드 거부 422). `meeting` 완료 시 EXP +15.

### 2-3. 알림 (NOTIFICATIONS)

- **화면**: 관리진 공지 / 친구들 활동(입·퇴장) / 가입 신청. ([notification.md](../test-web-design/07-notification/notification.md))
- **archive**: 없음.
- **제안**: `NOTIFICATIONS(id, room_id, user_id, type[NOTICE/FRIEND/JOIN], payload, read_at, created_at)`. "가입 신청" 탭은 §2-1 `JOIN_REQUESTS`를 그대로 노출(중복 저장 X). `GET /rooms/{id}/notifications`.

### 2-4. 친구 한 줄 메시지 (MEMORY_MESSAGES) — §3 모델 결정과 연동

- **화면(프로토타입)**: 추억 하나에 친구들이 **한 줄 메시지**(💬 N). ([memory_detail.md](../test-web-design/04-feed/memory_detail.md))
- **archive**: `MEMORIES`를 **작성자별 별도 row**(같은 plan_id, 다른 writer_id)로 두어 "친구별 관점"을 표현. 한 줄 메시지 개념은 없음.
- → 두 방식이 **"친구별 관점"을 다르게 모델링**. §3에서 결정.

### 2-5. 프로필·공간·멤버 확장 컬럼

- **USERS**: `email`(현 `login_id`), `avatar_url`, `birth_date`, `status_message`(내 상태메시지 `clov_my_status_msg`), OAuth 식별자. `password`는 소셜 전용이면 nullable.
- **FRIENDSHIP_ROOMS**: `cover_image_url`, `cover_title`, `theme_color`(보딩패스/대표커버).
- **ROOM_MEMBERS**: `status_message`가 유저 전역인지 방별인지 확정(화면은 멤버 리스트에서 상태메시지 노출 → 유저 전역 권장).

### 2-6. 편지 모델 차이 (LUCKY_LETTERS)

- **archive**: `sender_id`+`receiver_id`(필수), 받은/보낸 편지함, `read_at`, `is_favorite`.
- **화면(프로토타입)**: `to`(없으면 **전체**)·`from`·`content`·**`emoji`**·`favorite`. 필터는 전체/즐겨찾기(받은/보낸함·읽음 개념 없음). ([letter_detail.md](../test-web-design/05-letter/letter_detail.md))
- **제안**: `receiver_id` **nullable**(전체 발송 허용) + `emoji` 컬럼 추가. `read_at`/보낸함·받은함은 유지하되 화면 필터는 전체/즐겨찾기만 우선 노출(추후 확장).

---

## 3. 충돌 결정 — ✅ 확정 (2026-07-10)

| # | 쟁점 | ✅ 확정 |
|---|---|---|
| **D1** | 입장 방식 | **가입 신청 → 멤버 1명 수락 → 5분 되돌리기.** `JOIN_REQUESTS` 신설, `invites/accept`는 신청 생성으로 의미 변경 |
| **D2** | "친구별 관점" 모델 | **둘 다 지원.** ① plan당 작성자별 `MEMORIES` row(writer_id) ② 그 추억에 친구 한 줄 메시지 `MEMORY_MESSAGES` |
| **D3** | FREE MEMORY | **허용.** `MEMORIES.plan_id` **nullable**. 약속 없이도 자유 기록 가능 |
| **D4** | 네이밍 | **`rooms`/`plans` 통일**(archive DB 테이블 기준). 문서·프론트 용어도 정렬 |
| **D5** | 수정/삭제 권한 | **작성자 본인만**(`NOT_WRITER` 403). 단 약속 `complete`·체크리스트는 멤버 누구나 |
| **D6** | 인증 | **이메일+비밀번호 + 소셜 OAuth 둘 다** 지원 |

---

## 4. 정합 후 목표 구조 (요약)

```
[백엔드 기반]  docs-archive DB/API 설계 (rooms/plans/members/letters/exp-logs, 2단 인가, MyBatis/MySQL)
       │
       └─(확장)──▶ JOIN_REQUESTS · PLAN_STAGE_PHOTOS · NOTIFICATIONS · MEMORY_MESSAGES(선택)
                    + USERS/ROOMS/MEMBERS/LETTERS 컬럼 보강
       │
[화면 계약]   test-web-design/*/*.md (11 화면) — 확정된 동작의 진실 소스
       │
[API 명세]    api-spec/ (이 폴더) — 위 둘을 잇는 REST 계약 → 최종 openapi.yaml
```

---

## 5. 다음 작업 순서 (수정)

1. **§3 D1~D6 결정** ← 사용자 확정 필요(특히 D1·D2·D3).
2. 결정 반영해 **`01-resource-map.md`를 archive 네이밍/규칙으로 재정렬** + §2 확장 엔드포인트 추가.
3. archive DB 설계에 **§2 신규 테이블/컬럼 반영한 갱신 ERD** 작성(또는 archive 원본 갱신).
4. `openapi.yaml` 작성.

---

## 관련 문서

- 리소스 맵 → [01-resource-map.md](01-resource-map.md) · 규약/보안 → [00-conventions-and-security.md](00-conventions-and-security.md)
- archive: [DB 설계](../../docs-archive/Clov_DB_설계.md) · [API 설계](../../docs-archive/Clov_API_설계.md) · [화면명세서](../../docs-archive/Clov_화면명세서.md)
