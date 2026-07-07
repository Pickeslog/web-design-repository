# join_room.html — 방 코드로 접속

## 개요

`CLOV-XXXX` 형식의 방 코드를 입력해 특정 우정공간에 접속하는 독립 페이지다.

---

## 화면 구성

데스크톱 브라우저 프레임 목업 구조로 되어 있다.

- 외부 프레임: `850×750px`, 초록 상단 바 + 3개 닷 (macOS 창 스타일)
- 내부 화면: Clov 앱 뷰가 브라우저 안에서 보이는 화면 속 화면(screen-in-screen) 구조
- 헤더: 로고 · 아이콘 · 아바타 버튼
- 중앙: 방 코드 입력창 + 입장 버튼

---

## 동작

1. `CLOV-XXXX` 형식의 방 코드 입력
2. 입장 버튼 클릭 시 해당 우정공간으로 이동
3. 뒤로가기 버튼으로 이전 화면 복귀

---

## invite.html과의 차이

| 구분 | invite.html | join_room.html |
|---|---|---|
| 입력 대상 | 개인 초대 코드 | 방 전용 코드 (`CLOV-XXXX`) |
| 레이아웃 | 단순 카드 | 브라우저 프레임 목업 |
| 용도 | 친구 코드로 연결 | 방 코드로 직접 접속 |

---

## 다크모드

URL 파라미터 `?theme=dark|light` 우선 적용, 없으면 `localStorage` 폴백.

**0703**: `body.dark-mode` 색상을 `02-main`과 동일한 미드나잇 올리브 팔레트로 교체 (`--body-bg: #14150e`, `--card-bg: #1e2016`, `--primary-green: #5a7a3e`, `--accent-green: #9ccc65`, `--title-color: #9ccc65`, `--btn-primary-bg: #7c9c52`). 자세한 배경은 `_docs/0703-사용자설정_다크모드_통일_작업기록.md` 참고.

---

## 관련 파일

- [index.html](index.html) — 진입 원점
- [invite.html](invite.html) — 개인 초대 코드 입력 흐름
