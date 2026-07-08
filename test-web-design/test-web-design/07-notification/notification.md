# notification.html — 알림

**최종 수정**: 2026-07-01  
**담당 파트**: `07-notification/`

---

## 화면 개요

서비스 공지와 친구 활동 알림을 탭으로 구분해 보여주는 독립 페이지.  
`02-main/index.html` 헤더의 🔔 버튼을 누르면 진입.

---

## 화면 구성 (2탭)

| 탭 | 내용 | 스타일 |
|---|---|---|
| 📢 관리진 공지 | 서비스 업데이트, 기능 공지 | 초록 왼쪽 보더 카드 형식 |
| 🔔 친구들 알림 | 친구의 게시글 작성, D-day 임박 등 활동 | 일반 카드 형식 |

---

## 탭 스타일

- 활성 탭: `--primary-green` 배경 + 흰 글자
- 비활성 탭: 아웃라인 스타일
- 빈 상태: 중앙 아이콘 + 안내 문구 (`.empty-state`)

---

## 다크모드

URL 파라미터 `?theme=dark|light` 우선 적용, 없으면 `localStorage` 폴백.

---

## 스타일 특징

- 외부 CSS 없이 `<style>` 블록 인라인 선언
- 단일 카드 레이아웃 (`max-width: 600px`)
- `fadeUp` 진입 애니메이션

---

## 페이지 이동

| 동작 | 이동 대상 |
|---|---|
| ✕ 닫기 | `../02-main/index.html?selectedGroup=${activeGroup}&theme=...` |

---

## 관련 파일

- [02-main/index.html](../02-main/index.html) — 🔔 아이콘에서 진입
