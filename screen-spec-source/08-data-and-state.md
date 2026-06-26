# Clov. 데이터 및 상태 명세 소스

## 문서 목적

이 문서는 기준 HTML 프로토타입에 등장하는 데이터 구조와 UI 상태를 화면명세서, API 설계, React 상태 설계에 연결하기 위한 소스다.

## 주요 엔티티

### User

사용자 계정.

필드 후보:

- userId
- nickname
- profileImageUrl
- email
- createdAt

### FriendshipSpace

우정공간.

필드 후보:

- spaceId
- name
- icon
- startedAt
- friendshipLevel
- levelName
- progressPercent
- coverPhotoUrl
- coverTitle
- members
- schedules
- memories
- letters

주의:

- 방장 필드는 만들지 않는다.
- ownerId, hostId, leaderId 같은 권한 차등 필드는 핵심 구조에 넣지 않는다.
- createdBy는 감사 로그로만 사용할 수 있고 권한 의미를 주면 안 된다.

### Member

우정공간 참여 멤버.

필드 후보:

- memberId
- userId
- nickname
- profileImageUrl
- joinedAt

주의:

- 모든 멤버는 동등하다.
- role은 기본 명세에 넣지 않는다.

### Schedule

약속 또는 D-day.

필드 후보:

- scheduleId
- spaceId
- title
- date
- content
- createdAt
- updatedAt

계산 상태:

- ddayText
- ddayDiffDays
- growthStage
- isPast
- isToday
- isUpcoming

### Memory

추억피드 게시글.

필드 후보:

- memoryId
- spaceId
- scheduleId
- title
- subtitle
- content
- memoryDate
- imageUrl
- tags
- participantRecords
- createdBy
- createdAt
- updatedAt

주의:

- scheduleId는 선택값일 수 있다.
- 약속에서 전환된 추억이면 scheduleId로 연결한다.

### ParticipantRecord

같은 추억에 대한 친구별 기록.

필드 후보:

- recordId
- memoryId
- memberId
- nickname
- shortText
- fullText
- createdAt
- updatedAt

역할:

- 같은 약속에 대해 친구별로 다른 시점의 기록을 남기는 구조를 구현한다.

### Letter

행운편지.

필드 후보:

- letterId
- spaceId
- toMemberId
- fromMemberId
- toLabel
- fromLabel
- content
- emoji
- favorite
- createdAt

주의:

- 기준본은 from/text/favorite 중심이다.
- 행운편지 분기 병합 후 to/emoji가 추가된다.

### Tag

추억 해시태그.

필드 후보:

- tagId
- name
- type

예시:

- 소중한순간
- 우리만의장소
- 웃긴날
- 다시보고싶은날

## 주요 UI 상태

### activeGroup

현재 선택된 우정공간.

관련 화면:

- 대시보드
- 추억피드
- 행운편지
- 일정계획

변경 시 갱신:

- 대표 사진
- D-day
- 우정 레벨
- 추억 목록
- 편지 목록
- 일정 목록

### activeDesktopTab / activeMobileTab

현재 활성 탭.

값 후보:

- space
- feed
- letter
- schedule

### activeFeedMonth

추억피드의 현재 선택 월.

값 후보:

- all
- YYYY-MM

동작:

- 월 레일 클릭 시 변경
- 월 선택 팝오버 클릭 시 변경
- 변경 후 피드 재렌더링

### activeFeedFilter

추억피드 작성 주체 필터.

값 후보:

- all
- mine
- others

### monthPickerYear

월 선택 팝오버의 현재 연도.

동작:

- 이전/다음 연도 버튼으로 변경
- 팝오버 월 버튼 목록 재렌더링

### activeLetterFilter

행운편지 필터.

값 후보:

- all
- favorite

### selectedScheduleIds

우정공간별 현재 선택된 일정.

역할:

- 일정계획에서 선택한 D-day 상세를 유지한다.

### activeScheduleDensity

일정계획 표시 밀도.

값 후보:

- compact
- standard
- detailed

### isDarkMode

다크모드 여부.

동작:

- body에 dark-mode 클래스 적용
- 아이콘 애니메이션
- 전역 색상 토큰 변경

## 파생 데이터

### D-day 계산

입력:

- schedule.date

출력:

- D-n
- D-day
- D+n

### 월별 추억 그룹

입력:

- memoryDate 또는 date

출력:

- YYYY-MM
- 월별 기록 개수

### 성장 단계

입력:

- 일정 날짜
- 오늘 날짜

출력:

- 약속 씨앗
- D-day 새싹
- 만남 클로버
- 추억 꽃

## React 이식 시 상태 분리 제안

전역 상태:

- 현재 사용자
- 현재 우정공간
- 다크모드

화면 상태:

- 활성 탭
- 추억피드 월/필터
- 행운편지 필터
- 일정 표시 밀도
- 선택 일정

서버 상태:

- 우정공간 목록
- 멤버 목록
- 일정 목록
- 추억 목록
- 편지 목록

모달 상태:

- 열린 모달 종류
- 편집 대상 ID
- 임시 입력값

## API 설계 힌트

후보 API:

- `GET /spaces`
- `GET /spaces/{spaceId}`
- `GET /spaces/{spaceId}/schedules`
- `POST /spaces/{spaceId}/schedules`
- `PATCH /spaces/{spaceId}/schedules/{scheduleId}`
- `DELETE /spaces/{spaceId}/schedules/{scheduleId}`
- `GET /spaces/{spaceId}/memories`
- `POST /spaces/{spaceId}/memories`
- `GET /spaces/{spaceId}/letters`
- `POST /spaces/{spaceId}/letters`
- `PATCH /spaces/{spaceId}/letters/{letterId}/favorite`

주의:

- API 경로도 1:1/1:N을 나누지 않는다.
- `spaces`는 인원 제한 없는 단일 우정공간 개념으로 잡는다.
