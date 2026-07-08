# memory_detail.html — 추억 게시글 상세 보기

## 개요

추억 피드의 게시글 한 건을 전체 내용으로 보여주는 상세 페이지다.  
`index.html` 추억피드 탭에서 게시글을 클릭하면 URL 파라미터 또는 `sessionStorage`로 데이터를 전달받아 렌더링한다.

> **참고**: 현재 `index.html`의 더보기 기능은 이 페이지로 이동하는 대신 **인라인 바텀시트**로 변경되었다. 이 파일은 독립 접근 또는 레거시 경로에서 사용된다.

---

## 데이터 수신 방식

URL 파라미터 또는 `sessionStorage`:

| 항목 | 내용 |
|---|---|
| `theme` | 다크모드 동기화 (`dark` / `light`) |
| 제목 | `font-size: 22px, font-weight: 700` |
| 날짜 | `.detail-date` |
| 본문 | `white-space: pre-wrap` 카드 형태 |
| 태그 | `rgba(74,222,128,0.1)` 배경 해시태그 목록 |
| 작성자 | 내 기록 / 친구 이름 |

---

## 화면 구성

- 작성자 레이블 (내 기록 / 친구 이름)
- 날짜 (`.detail-date`)
- 제목 (`font-size: 22px, font-weight: 700`)
- 본문 (`white-space: pre-wrap`, 카드)
- 해시태그 목록
- 액션 버튼: 수정 / 삭제 / 닫기 (`goBack()`)

---

## 진입 애니메이션

`fadeUp` (`translateY 20px → 0, 600ms`)

---

## 다크모드

URL 파라미터 `?theme=dark|light` 우선 적용, 없으면 `localStorage` 폴백

---

## 현재 상태

`index.html`에서 더보기 버튼은 현재 이 페이지로 이동하지 않고 인라인 바텀시트(`.memory-detail-sheet`)로 처리된다. 이 파일은 직접 URL로 접근하거나 향후 재활용 시 사용한다.

---

## 관련 파일

- [index.html](index.html) — 추억피드 탭에서 진입 (바텀시트 방식 우선)
