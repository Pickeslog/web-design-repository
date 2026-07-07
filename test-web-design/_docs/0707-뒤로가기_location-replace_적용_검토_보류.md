# 0707 — 뒤로가기 `location.replace` 적용 검토 (보류)

**작업일**: 2026-07-07
**상태**: 조사만 완료, 적용은 보류 — 재개 시 이 문서 기준으로 이어가면 됨

---

## 배경

"뒤로가기 리플레이스 함수가 호출되고 있는지" 질문을 계기로, 프로토타입 전체의 화면 전환 방식을 점검하고 `location.replace`/`history.replaceState` 적용 여부·필요성을 검토했다.

---

## 조사 결과

### 1. 현재 `replace` 계열 사용 여부

프로젝트 전체(활성 파일, `_archive/` 제외)에서 다음을 전수 검색:

| 패턴 | 결과 |
|---|---|
| `history.replaceState` / `pushState` / `back()` / `go()` | **0건** |
| `location.replace(` | **0건** |
| `popstate` / `hashchange` 리스너 | **0건** |

→ 모든 화면 이동은 `window.location.href = ...` (히스토리 누적 방식)이며, 대체(replace) 방식은 어디에도 쓰이지 않는다.

### 2. `goBack()` 함수 인벤토리

5개 파일에 `goBack()`이 정의돼 있으며 전부 동일하게 `location.href` 방식:

- `03-rooms/invite.html`
- `04-feed/memory_detail.html`
- `05-letter/letter_detail.html`
- `07-notification/notification.html`
- `08-profile/profile_edit.html`

### 3. ⚠️ 발견 — 이 5개 파일은 전부 진입 링크가 없는 orphan 파일

`02-main/` 등 현재 활성 앱 어디에서도 위 5개 파일을 링크/이동하지 않는다. 즉 현재 서비스에서는 **도달할 수 없는 화면**이며, 해당 기능(알림·프로필 수정·추억 상세·편지 상세·초대)은 전부 `02-main/index.html` 내부 탭·모달로 대체되어 있다. 이 파일들의 `goBack()`을 고쳐도 사용자 경험상 아무 변화가 없다.

### 4. 실제로 도달 가능한 이동 흐름

```
login ──▶ makerooms ──▶ index ──(헤더 ‹ 버튼)──▶ makerooms
  │
  └─ signup ──▶ login

로그아웃 ──▶ login   (헤더 드롭다운 · makerooms 양쪽에서 호출)
```

전부 `window.location.href` 방식(히스토리 누적).

---

## 검토 결론 — 전면 적용 비추천, 선별 적용이 적절

### `location.replace`가 실제로 이득인 지점 (인증 경계)

| 이동 | 이유 |
|---|---|
| `login → makerooms` | 로그인 후 뒤로가기로 로그인 화면 복귀 차단 (표준 패턴) |
| 로그아웃 → login (2곳: 헤더 드롭다운, makerooms) | 로그아웃 후 뒤로가기로 앱 화면 복귀 차단 |
| `signup 완료 → login` | 가입 완료 후 가입 폼 복귀 방지 (선택 사항) |

### 그대로 둬야 하는 지점

- **`makerooms ↔ index` 왕복** — 방 목록 ↔ 방 허브는 정당한 양방향 이동. 브라우저 뒤로가기 = 방 목록 복귀가 앱 내 "‹ 방 목록" 버튼과 자연스럽게 일치하므로, 여기에 replace를 걸면 오히려 기존 동작이 깨진다.

### 손댈 필요 없는 지점

- orphan 서브페이지 5개의 `goBack()` — 도달 경로 자체가 없어 효과 없음.

---

## 결정

**보류.** 사용자가 "일단 나중에 하자"고 결정. 재개 시:

1. 인증 경계 4곳(위 표)만 `location.href` → `location.replace`로 교체
2. `makerooms ↔ index` 왕복 이동은 손대지 않음
3. orphan 서브페이지는 별도 처리 불필요(진입 링크가 생기지 않는 한)
