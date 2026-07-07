# schedule.html — 일정계획

**최종 수정**: 2026-07-01  
**담당 파트**: `06-schedule/`

> 참고: 현재 메인 프로토타입의 일정계획 탭은 `02-main/index.html` 안에서 포토부스 4컷 카드 기반 `Clover Growth Path`로 구현되어 있다. 이 문서는 `06-schedule/schedule.html` 독립 페이지 명세이며, 4컷 인증 사진 흐름은 [02-main/index.md](../02-main/index.md)와 `_docs/web-design-repository/screen-spec-source/05-schedule-screen.md`를 기준으로 본다.

---

## 화면 개요

약속 D-day 카운트다운, 캘린더 뷰, 참여자별 약속 관리를 제공하는 독립 페이지.  
`02-main/index.html`의 **📅 일정계획 탭** → `➕ 새 D-day 만들기` 클릭 시 진입.

---

## 화면 구성

| 섹션 | 내용 |
|---|---|
| 헤더 | `‹ 우정공간` 뒤로가기 · 다크모드 토글 · 아바타 |
| D-day 배너 | 가장 임박한 다가오는 약속을 대형 카운트다운으로 강조 |
| 2열 구역 | 좌: 월별 캘린더 / 우: 다가오는 약속 미니 리스트 (최대 4개) |
| 전체 약속 목록 | 필터(전체·다가오는·지난 약속) + 약속 카드 |
| FAB | 우하단 `+` 버튼 → 약속 추가 모달 |

---

## 기능

### D-day 배너
- 오늘 이후 약속 중 날짜가 가장 가까운 약속을 자동 선택
- D-0(오늘), D-N(미래), D+N(과거) 표기
- 배너 클릭 → 해당 약속 카드로 스크롤

### 캘린더
- 월 이동(‹ ›) 지원
- 약속이 있는 날: 초록 점(⬤) 표시
- 날짜 클릭 → 해당 날의 약속만 필터

### 약속 카드 D-day 색상
| 범위 | 칩 색상 |
|---|---|
| 오늘 / 7일 이내 | 빨강 (urgent) |
| 8–30일 | 노랑 (soon) |
| 31일 이상 | 초록 (future) |
| 지난 약속 | 회색 (past) |

### 약속 추가 / 수정 모달
- **필드**: 제목(30자), 날짜, 시간, 장소, 참여자(복수 선택), 색상(6종), 메모
- **참여자**: 나🍀 · 솔🌿 · 민🌸 · 준🌊 — 칩 토글 선택
- 저장 시 배너·캘린더·목록 즉시 갱신
- 수정 시 기존 값 자동 채움

### 삭제
- 카드 내 `삭제` 버튼 → `confirm()` 후 제거 → 전체 재렌더

---

## 데이터 구조

```js
{
  id: Number,
  title: String,       // 약속 이름 (30자 이내)
  date: 'YYYY-MM-DD',
  time: 'HH:MM',      // 선택
  loc: String,         // 장소 (선택)
  parts: [String],     // 참여자 이름 배열
  color: '#hex',       // 6가지 색상 중 선택
  memo: String,        // 선택
}
```

> 현재 데이터는 JS 변수(`appts` 배열)에만 저장. 페이지 이동 시 초기화됨(백엔드 없음).

---

## 다크모드

URL 파라미터 `?theme=dark|light` 우선 적용, 없으면 `localStorage('clov_theme')` 폴백.

---

## 페이지 이동

| 동작 | 이동 대상 |
|---|---|
| ‹ 우정공간 / 저장 후 | `../02-main/index.html?selectedGroup=...&theme=...` |

---

## 관련 파일

- [02-main/index.html](../02-main/index.html) — 일정계획 탭 포함 메인 앱
- [02-main/css/desktop.css](../02-main/css/desktop.css) — 공통 디자인 토큰
- [02-main/js/desktop.js](../02-main/js/desktop.js) — `openScheduleModal()` → 이 페이지로 이동
