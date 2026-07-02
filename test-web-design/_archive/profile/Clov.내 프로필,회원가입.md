# Clov 내 프로필 및 추억 피드 작업 정리

## 작업 범위

이번 작업은 Clov 메인 화면의 사용자 프로필 관리 경험과 추억 피드 상세 보기 흐름을 개선하는 데 초점을 두었다.

주요 적용 영역은 다음과 같다.

- 우측 상단 프로필 드롭다운 및 내 프로필 모달
- 프로필 이미지, 닉네임, 상태 메시지, 이메일, 생년월일, 비밀번호 수정
- 계정 로그아웃 및 계정 탈퇴 동작
- 전체화면 레이아웃 및 카드 비율 조정
- 추억 피드 카드 구조 정리
- 추억 피드 더보기 기능의 현재 페이지 시트 전환

단, 사용자가 제외 요청한 추억 증거 카드의 배경 제거 작업은 되돌렸으므로 최종 반영 내용에서 제외한다.

## 내 프로필 기능

### 진입 방식 변경

기존에는 우측 상단 프로필 드롭다운에서 개인정보 수정 페이지로 이동하는 방식이었다.

변경 후에는 메인 화면 안에서 `내 프로필` 모달이 열린다.

- 진입 위치: 우측 상단 프로필 버튼 드롭다운
- 메뉴명: `내 프로필`
- 연결 방식: 별도 페이지 이동 대신 `openProfileSettingsModal()` 호출

React 전환 시에도 별도 HTML 페이지보다 컴포넌트 모달 구조로 옮기기 쉬운 형태다.

### 프로필 설정 모달

Discord 설정창처럼 좌측 사이드바와 우측 설정 패널로 나누었다.

좌측 영역:

- 현재 프로필 이미지 또는 기본 클로버 아이콘 표시
- 이름 / 닉네임 표시
- 상태 메시지 표시
- 개인정보 수정
- 비밀번호 변경
- 계정 로그아웃
- 계정 탈퇴

우측 영역:

- 이름 / 닉네임 수정
- 상태 메시지 수정
- 이메일 수정
- 생년월일 수정
- 기본 프로필 이모지 선택
- 프로필 이미지 업로드
- 비밀번호 변경

### 프로필 저장 방식

현재는 백엔드 연동 전 단계이므로 `localStorage` 기반으로 저장한다.

사용 키:

- `clov_profile`
- `clov_profile_nickname`
- `clov_profile_birthdate`
- `clov_profile_image`
- `clov_temp_email`
- `clov_temp_password`

프로필을 저장하면 메인 우측 상단 프로필 버튼에도 즉시 반영된다.

### 계정 로그아웃

로그아웃은 로그인 화면으로 이동하는 방식이다.

데모 계정 정보 자체를 삭제하지 않도록 설계하는 것이 안전하다.

### 계정 탈퇴

계정 탈퇴는 현재 localStorage의 프로필 관련 데이터를 삭제하는 데모 기능이다.

주의할 점:

- 예전 작업 중 `localStorage.clear()`가 들어간 버전이 있었기 때문에 임시 로그인 계정까지 삭제될 수 있었다.
- 최종 구조에서는 데모 계정과 프로필 데이터를 분리해서 관리하는 방향이 적절하다.
- 실제 백엔드 연동 시에는 서버 API 기준으로 탈퇴 로직을 다시 구성해야 한다.

## 전체화면 및 레이아웃 조정

### 전체화면 수정

기존에는 `.desktop-window`가 `70vw` 수준으로 제한되어 창모드처럼 보였다.

수정 후:

- 앱 전체는 `100vw / 100vh` 사용
- body, workspace, desktop-window 모두 전체화면 기준으로 확장
- 외곽 브라우저 프레임처럼 보이던 여백 제거

### 카드 비율 보정

전체화면 적용 후 카드들이 지나치게 가로로 늘어나는 문제가 발생했다.

이를 해결하기 위해 내부 콘텐츠 폭과 그리드 비율을 보정했다.

- 메인 콘텐츠 최대 폭 제한
- 큰 화면에서도 카드가 과도하게 늘어나지 않도록 조정
- 좁은 화면에서는 1열로 전환
- 대표 사진 카드, 피드 카드, 메인 그리드 비율 조정

## 스크롤바 스타일 정리

기본 브라우저 스크롤바가 Clov 디자인과 맞지 않아 메인 스크롤과 프로필 모달 스크롤을 정리했다.

수정 내용:

- 기본 회색 스크롤바와 화살표 버튼 제거
- 얇은 초록 계열 스크롤바 적용
- 다크모드에서도 어울리는 색상 적용

## 추억 피드 구조 정리

### 증거 카드 중첩 구조 개선

기존에는 다음처럼 카드가 중첩되어 보였다.

```html
memory-evidence-viewer
  evidence-track
    memory-card
      memory-image
      presence-board
      memory-body
```

수정 후 구조:

```html
evidence-track
  evidence-status-bar
  evidence-content
    memory-image
    presence-board
    memory-body
  evidence-timeline
```

즉, `memory-evidence-viewer`와 불필요한 `memory-card` 중첩을 제거하고, 실제 콘텐츠를 `evidence-content` 안에 직접 배치했다.

### 유지한 기능

구조를 정리하면서 다음 기능은 유지했다.

- 현재 / 과거 게시글 이동 화살표
- 하단 타임라인 버튼 이동
- 참여자별 기록 선택
- 참여자 카드 2열 정렬
- 각 참여자 기록의 더보기

### 테두리와 그림자 제거

사용자가 요청한 대로 추억 증거 카드의 과한 테두리와 그림자를 제거했다.

유지한 것:

- 배경 스타일
- 참여자 2열 정렬
- 좌우 화살표
- 타임라인

제외한 것:

- 배경 제거 작업은 요청에 따라 되돌림

## 더보기 기능 변경

### 기존 방식

추억 피드의 `더보기` 버튼은 기존에 `memory_detail.html`로 페이지 이동했다.

```js
window.location.href = `memory_detail.html?...`;
```

### 변경 방식

현재 페이지 안에서 하단 시트가 자연스럽게 열리도록 변경했다.

현재 구조:

- `memory-detail-backdrop`
- `memory-detail-sheet`
- `memory-detail-author`
- `memory-detail-title`
- `memory-detail-date`
- `memory-detail-body`
- `memory-detail-tags`
- `memory-detail-actions`

### 더보기 시트 기능

시트에서 제공하는 기능:

- 제목 표시
- 작성자 / 참여자 표시
- 날짜와 부제목 표시
- 본문 전체 표시
- 태그 표시
- 코멘트 수정
- 코멘트 삭제
- 추억 전체 수정 페이지 이동

즉, 상세 페이지로 이동하지 않아도 현재 화면 흐름 안에서 상세 내용을 확인하고 관리할 수 있다.

### 텍스트 깨짐 방지

`···더보기` 문자가 환경에 따라 깨질 수 있어 `...더보기`로 변경했다.

## 주요 수정 파일

- `Clov 0630 작업본.html`
- `css/desktop.css`
- `js/desktop.js`

## 향후 React 전환 메모

React로 전환할 때는 다음 단위로 컴포넌트화하는 것이 좋다.

- `ProfileSettingsModal`
- `ProfileSidebar`
- `ProfileAccountPanel`
- `ProfileSecurityPanel`
- `MemoryEvidenceTrack`
- `MemoryEvidenceContent`
- `MemoryDetailSheet`
- `MemoryParticipantGrid`

현재 구조는 HTML/CSS/JS 기반이지만, 모달과 시트 중심의 구조로 정리되어 React 컴포넌트로 분리하기 쉬운 상태다.