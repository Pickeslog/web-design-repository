# letter_detail.html — 행운 편지 상세 보기

## 개요

행운 편지 한 통의 전체 내용을 보여주는 상세 페이지다.  
`index.html` 행운편지 탭에서 편지를 클릭하면 URL 파라미터를 통해 진입한다.

---

## 데이터 수신 방식

`index.html`에서 URL 파라미터로 전달:

| 파라미터 | 내용 |
|---|---|
| `from` | 발신자 이름 |
| `text` | 편지 본문 |
| `date` | 작성 날짜 |
| `star` | 즐겨찾기 여부 |
| `theme` | 다크모드 동기화 (`dark` / `light`) |

---

## 화면 구성

- 발신자 레이블: `내 기록` 또는 친구 이름 표시
- 편지 본문: `white-space: pre-wrap`, `font-size: 18px` (줄바꿈 보존)
- 액션 버튼
  - ⭐ 즐겨찾기 토글
  - 🗑 편지 삭제
  - 목록으로 닫기 (`goBack()`)

---

## 다크모드

URL 파라미터 `?theme=dark|light` 우선 적용, 없으면 `localStorage` 폴백

---

## 스타일 특징

- 외부 CSS 없이 `<style>` 블록 인라인 선언
- 단일 카드 레이아웃 (`max-width: 600px`)
- `fadeUp` 진입 애니메이션 (`translateY 20px → 0, 600ms`)

---

## 관련 파일

- [index.html](index.html) — 행운편지 탭에서 진입
