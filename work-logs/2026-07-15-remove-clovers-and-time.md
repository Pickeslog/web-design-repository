# 2026-07-15: 클로버밭 및 시간대 관련 코드 전면 제거 작업

## 목적
- 과거 절차적 생성 방식(클로버밭, 별, 산, 하늘 등) 배경 코드 완전 삭제
- 시간대(아침, 낮, 저녁, 밤) 변화에 따른 배경 및 색상 변경 코드 완전 삭제
- LP 턴테이블 배너 테마 단일화 및 계절/이벤트(생일) 효과만 유지

## 수정 파일
- `test-web-design/02-main/js/v5-banner.js`
  - 상태 변수 `v5state.time` 제거
  - `v5detectNow()` 및 `v5render()`에서 시간대 감지/적용 로직 제거
  - `GROUND_COLORS`, `MTN_COLORS`, `CEL` 테이블 및 렌더링 함수(`v5updateGround`, `v5updateMountains`, `v5updateCelestial`, `v5buildStars`, `v5buildClovers`) 통째로 제거
  - `v5-test-panel` UI에서 "시간대" 행 삭제
- `test-web-design/02-main/css/desktop.css`
  - `.dashboard-card[data-time="..."]` 관련 스타일 블록 전면 삭제

## 검수 결과
- `v5-banner.js` 렌더링 오류 없음 (LP 배너만 단일 렌더링 됨)
- 계절(봄/여름/가을/겨울) 및 이벤트(생일) 효과 정상 렌더링 유지 확인
- 모바일(410px), 데스크톱(850px) 뷰 문제 없음
- 불필요한 DOM(DOM 노드) 참조 및 렌더링 오버헤드 감소 확인
