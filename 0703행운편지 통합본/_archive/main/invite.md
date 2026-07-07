# invite.html — 그룹 초대 코드 입력

## 개요

친구가 공유한 초대 코드를 입력해 그룹(우정공간)에 합류하는 독립 페이지다.

---

## 화면 구성

- 레이아웃: 중앙 정렬 카드 (`max-width: 480px`)
- 상단: 큰 아이콘
- 중앙: 초대 코드 입력창 (`letter-spacing: 4px`, 큰 폰트)
- 하단: 입장 버튼 + `✕ 닫기` 버튼

---

## 동작

1. 사용자가 초대 코드 입력
2. 입장 버튼 클릭 시 그룹 입장 처리
3. `✕ 닫기` 버튼으로 이전 화면 복귀 (`goBack()`)

---

## 다크모드

URL 파라미터 `?theme=dark|light` 우선 적용, 없으면 `localStorage` 폴백

---

## 스타일 특징

- 외부 CSS 파일 없이 `<style>` 블록에 전체 스타일 인라인 선언
- `fadeUp` 등장 애니메이션 (`translateY 20px → 0, 600ms`)
- CSS 변수(`--primary-green`, `--accent-green` 등)를 `index.html`과 동일하게 사용

---

## 관련 파일

- [index.html](index.html) — 진입 원점 (프로필 드롭다운 → 새로운 방 추가)
- [join_room.html](join_room.html) — 방 코드 직접 입력 방식 (별도 흐름)
