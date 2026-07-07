# letter_detail.html — 행운 편지 상세 보기

**최종 수정**: 2026-07-01  
**담당 파트**: `05-letter/`

---

## 화면 개요

행운 편지 한 통의 전체 내용을 보여주는 상세 페이지.  
`02-main/index.html` 행운편지 탭에서 편지를 클릭하면 URL 파라미터로 진입.

---

## 데이터 수신 (URL 파라미터)

| 파라미터 | 내용 |
|---|---|
| `from` | 발신자 이름 |
| `text` | 편지 본문 |
| `date` | 작성 날짜 |
| `star` | 즐겨찾기 여부 |
| `groupId` | 현재 그룹 ID (뒤로가기 시 복원용) |
| `theme` | 다크모드 동기화 (`dark` / `light`) |

---

## 화면 구성

- 발신자 레이블: `내 기록` 또는 친구 이름
- 편지 본문: `white-space: pre-wrap`, `font-size: 18px` (줄바꿈 보존)
- 액션 버튼
  - ⭐ 즐겨찾기 토글
  - 🗑 편지 삭제 (`goBack()` 자동 호출)
  - ✕ 닫기 → `goBack()`

---

## 다크모드

URL 파라미터 `?theme=dark|light` 우선 적용, 없으면 `localStorage` 폴백.

---

## 스타일 특징

- 외부 CSS 없이 `<style>` 블록 인라인 선언
- 단일 카드 레이아웃 (`max-width: 600px`)
- `fadeUp` 진입 애니메이션 (`translateY 20px → 0, 600ms`)

---

## 페이지 이동

| 동작 | 이동 대상 |
|---|---|
| ✕ 닫기 / 삭제 후 | `../02-main/index.html?selectedGroup=${groupId}&theme=...` |

---

## 관련 파일

- [02-main/index.html](../02-main/index.html) — 행운편지 탭에서 진입
