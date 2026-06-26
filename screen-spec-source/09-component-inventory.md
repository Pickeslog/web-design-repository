# Clov. 컴포넌트 인벤토리

## 문서 목적

이 문서는 기준 HTML 프로토타입에 등장하는 UI 요소를 React 컴포넌트 또는 화면명세서 항목으로 분해하기 위한 목록이다.

## App Shell

### AppLayout

역할:

- 전체 앱 레이아웃
- 라이트/다크 모드 적용
- 데스크톱/모바일 반응형 기준 제공

### Header

역할:

- 로고
- 데스크톱 탭 네비게이션
- 다크모드 토글
- 프로필 드롭다운

### MobileFrame / MobileNavigation

역할:

- 모바일 탭 전환
- 모바일 화면 구조 검토

주의:

- HTML 프로토타입에서는 모바일 프레임이 동시에 보이지만, 실제 앱에서는 반응형 화면으로 구현한다.

## Navigation Components

### TabButton

사용 위치:

- 데스크톱 네비게이션
- 모바일 하단 네비게이션

상태:

- active
- inactive

### ProfileDropdown

구성:

- 그룹 변경
- 친구 초대코드

## Dashboard Components

### FriendshipGrowthCard

구성:

- 성장 풍경
- D-day 라벨
- D-day 카운트
- 우정 레벨 배지
- 진행률
- 진행 바

### GrowthScene

구성:

- 하늘
- 별
- 해/달
- 안개
- 지면
- 클로버 성장

### CoverPhotoCard

구성:

- 대표 사진
- 수정 오버레이
- 커버 제목
- 참여 멤버 아바타
- 메타 요약

### UpcomingScheduleBanner

구성:

- 일정 아이콘
- 일정 제목
- 일정 날짜
- D-day 배지

### SpaceMemoryPreview

구성:

- 섹션 타이틀
- 전체 피드 보기 버튼
- 추억 미리보기 카드

## Memory Feed Components

### MemoryFeedHeader

구성:

- 월별 추억 아카이브 타이틀
- 설명
- 월 요약 배지
- 글쓰기 버튼

### FeedMonthRail

구성:

- 전체 버튼
- 월별 버튼
- 기록 개수

### MonthPickerPopover

구성:

- 트리거 버튼
- 연도 이동
- 12개월 그리드
- 월별 카운트

### FeedFilterTabs

구성:

- 전체
- 내 기록
- 친구 기록

### MemoryCard

구성:

- 이미지 또는 클로버 플레이스홀더
- 작성자 배지
- 날짜
- 제목
- 부제
- 본문
- 참여자별 기록
- 태그
- 내 기록 박스
- 더보기 버튼

### MemoryImagePlaceholder

역할:

- 사진 없는 추억을 클로버 감성으로 표시

### ParticipantRecordTile

역할:

- 친구별 기록 일부 표시

### MemoryDetailSheet

역할:

- 긴 기록 전체 보기

## Lucky Letter Components

### LuckyLetterHeader

구성:

- 타이틀
- 설명
- 작성 버튼

주의:

- 작성 버튼은 행운편지 분기에서 병합 필요

### LetterFilterTabs

구성:

- 전체 편지
- 즐겨찾기

### LetterCard

현재 기준본 구성:

- 즐겨찾기 버튼
- From
- 본문

병합 후 구성:

- 즐겨찾기 버튼
- To
- From
- 본문 미리보기
- 상세 열기

### LetterComposeModal

병합 대상.

구성:

- 받는 사람
- 모두에게 보내기
- 보낸 사람
- 내용
- 이모지 선택
- 미리보기
- 제출

### LetterDetailModal

병합 대상.

구성:

- To
- From
- 전체 내용
- 닫기

## Schedule Components

### ScheduleHeader

구성:

- 약속 여정 타이틀
- 새 D-day 만들기 버튼

### CloverGrowthPath

구성:

- 히어로
- 표시 밀도 컨트롤
- 성장 카드 리스트
- 선택 일정 상세

### ScheduleDensityControl

상태:

- compact
- standard
- detailed

### GrowthScheduleCard

구성:

- 제목
- 날짜
- D-day
- 성장 단계
- 진행 바
- 현재 단계 설명

### ScheduleDetailPanel

구성:

- 수정
- 삭제
- 큰 D-day
- 제목
- 날짜
- 메모
- 추억 전환 안내

### ScheduleModal

구성:

- 제목 입력
- 날짜 입력
- 빠른 날짜 선택
- 저장

## Common Components

### Modal

역할:

- 중앙 모달 레이아웃
- 오버레이
- 등장 애니메이션

### Button

종류:

- main
- sub
- danger
- icon
- filter
- tab

### EmptyState

사용 위치:

- 추억피드 결과 없음
- 즐겨찾기 편지 없음
- 일정 없음

### DarkModeToggle

역할:

- 라이트/다크 모드 전환
- 아이콘 애니메이션

## React 이식 우선순위

1. AppLayout / Navigation
2. Dashboard
3. MemoryFeed
4. Schedule
5. LuckyLetter
6. Common Modal / Sheet
7. DarkMode

## 명세 작성 시 활용법

각 화면명세서에는 위 컴포넌트 중 해당 화면에서 쓰는 컴포넌트만 골라 넣는다.

예시:

```text
추억피드 화면명세서 컴포넌트:
- MemoryFeedHeader
- FeedMonthRail
- MonthPickerPopover
- FeedFilterTabs
- MemoryCard
- MemoryDetailSheet
```
