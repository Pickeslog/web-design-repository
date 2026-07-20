# AGENTS.md

## Shared Code Convention

Before naming or structuring any API or web code, read `docs/CODE-CONVENTION.md`.
It is the shared naming and folder-structure SSOT for all team agents.

Before starting an issue, read `docs/AI-TEAM-HARNESS.md` for the shared
workflow, safety rules, review gate, and completion format.

이 문서는 Codex가 Clov Web Design Repository에서 작업할 때 따라야 할 프로젝트 지침이다.

## 프로젝트 개요

- 이 저장소는 Clov 프로젝트의 화면 명세서, UI/UX 설계, HTML 프로토타입을 관리한다.
- 주요 문서 소스는 `screen-spec-source/`, 팀 작업 가이드는 `team-guides/`, 실제 화면 프로토타입은 `test-web-design/`에 있다.
- 작업 기록은 `work-logs/` 또는 `test-web-design/_docs/`에 남긴다.

## 핵심 서비스 원칙

화면이나 코드를 수정할 때 아래 원칙을 임의로 바꾸면 안 된다.

- 우정공간은 **최대 8명**까지 참여하는 단일 구조다.
- 1:1 전용/1:N 전용 화면으로 나누지 않는다.
- 방장, 대표자, 관리자, 초대한 사람의 특별 권한 개념을 추가하지 않는다.
- 모든 멤버는 동등하다.
- 핵심 흐름은 약속 완료 후 추억 작성 후보로 전환되는 구조다.
- 같은 약속에 대해 친구별로 다른 관점의 기록을 남길 수 있다.

## 주요 경로

- `screen-spec-source/00-service-summary.md`: 서비스 개요와 구조 원칙
- `screen-spec-source/01-design-system.md`: 공통 디자인 시스템
- `screen-spec-source/02-dashboard-screen.md`: 우정공간 대시보드
- `screen-spec-source/03-memory-feed-screen.md`: 추억피드
- `screen-spec-source/04-lucky-letter-screen.md`: 행운편지
- `screen-spec-source/05-schedule-screen.md`: 일정계획
- `screen-spec-source/06-modal-and-interaction.md`: 공통 모달/인터랙션
- `screen-spec-source/07-user-flow.md`: 화면 간 흐름
- `screen-spec-source/08-data-and-state.md`: 데이터/상태
- `screen-spec-source/09-component-inventory.md`: 컴포넌트 목록
- `team-guides/12-ai-agent-team-workflow.md`: AI 에이전트 작업 흐름
- `team-guides/14-html-prototype-review-checklist.md`: HTML 검수 체크리스트
- `team-guides/15-ai-design-work-guide.md`: AI 디자인 작업 절차
- `test-web-design/`: 실제 HTML/CSS/JS 화면 프로토타입

## 작업 전 확인

- 요청 범위를 먼저 좁힌다. 한 번에 한 화면, 한 기능을 원칙으로 한다.
- 관련 문서를 읽고 나서 구현한다.
- 공통으로 `screen-spec-source/00-service-summary.md`와 `screen-spec-source/01-design-system.md`를 확인한다.
- 화면별로 아래 문서를 추가 확인한다.
  - 대시보드: `screen-spec-source/02-dashboard-screen.md`
  - 추억피드: `screen-spec-source/03-memory-feed-screen.md`
  - 행운편지: `screen-spec-source/04-lucky-letter-screen.md`
  - 일정계획: `screen-spec-source/05-schedule-screen.md`
  - 모달/인터랙션: `screen-spec-source/06-modal-and-interaction.md`
- 흐름/상태가 필요하면 `07-user-flow.md`, `08-data-and-state.md`도 함께 확인한다.

## 코드 작업 규칙

- 기존 구조와 스타일을 우선한다.
- HTML/CSS/JS 전체를 재작성하지 말고 필요한 영역만 수정한다.
- 기준본과 참고본을 섞을 때는 기준본의 기존 기능을 삭제하지 않는다.
- `test-web-design/_archive/`는 참고용 보관소이므로 수정하지 않는다.
- 현재 프로토타입은 순수 HTML/CSS/JavaScript 기반이다.
- `file://`로 직접 여는 테스트 흐름이 있으므로 HTML 조각을 `fetch()`로 불러오는 방식은 피한다.
- 컴포넌트 분리가 필요하면 기존처럼 JS 템플릿 문자열을 런타임에 주입하는 패턴을 우선한다.
- 기존 CSS 변수와 디자인 토큰을 우선 사용한다.
- 라이트 모드, 다크 모드, 모바일 화면을 함께 고려한다.
- JS 파일 추가나 수정 시 로드 순서를 확인한다. `data.js`/`utils.js`는 앞쪽, `nav.js`/`init.js`는 뒤쪽이어야 한다.
- 없는 DOM을 확인할 때 `document.getElementById()`만 믿지 말고 `document.querySelector()`로 실제 존재 여부를 확인한다.
- CSS/JS 파일을 수정하면 해당 HTML의 캐시 버전(`?v=`)을 고친 파일만 올린다.

## Codex 작업 방식

- 검색은 `rg` 또는 `rg --files`를 우선 사용한다.
- 수정 전 `git status`로 사용자 변경사항을 확인한다.
- 사용자가 만든 변경을 되돌리지 않는다.
- 직접 편집은 `apply_patch`를 사용한다.
- 작업 후 `git diff`로 변경 범위가 요청과 맞는지 확인한다.
- 한국어 문서를 PowerShell에서 읽을 때 깨지면 `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`와 `Get-Content -Encoding UTF8`를 사용한다.

## 검수 기준

수정 후 최소한 아래를 확인한다.

- 중복 ID가 없는지
- 같은 함수명이 중복 선언되지 않았는지
- `window.onclick` 또는 `keydown` 이벤트가 기존 닫기/탭 동작을 덮어쓰지 않는지
- 모달 ID와 열기/닫기 호출이 일치하는지
- 데스크톱과 모바일 레이아웃이 모두 깨지지 않는지
- 다크 모드에서 텍스트 대비가 유지되는지
- 기존 탭, 팝오버, 모달, 즐겨찾기, 일정 카드 동작이 삭제되지 않았는지

자세한 검수 항목은 `team-guides/14-html-prototype-review-checklist.md`를 따른다.

## 응답 방식

- 기본 응답은 한국어로 작성한다.
- 최종 응답에는 변경 파일과 검수 결과를 간단히 포함한다.
- 실행하지 못한 검수가 있으면 숨기지 말고 명확히 말한다.
