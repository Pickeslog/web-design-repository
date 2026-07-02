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

### GrowthScene (V5 Scene Banner)

`data-time`/`data-season`/`data-level`/`data-event` 속성으로 동적 전환되는 레이어형 배너.

구성:

- `.scene-sky` 하늘
- `.scene-stars` 별
- `.scene-celestial` 해/달
- `.scene-clouds` 구름 (3개, 개별 애니메이션)
- `.scene-mountains` 산
- `.scene-clover-field` 클로버밭
- `.scene-particles` 파티클
- `.scene-balloons` 풍선
- HUD: `D+N일째`, `.lv-pill` 레벨 진행 바

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

### SpaceMemoryPreview (빨랫줄 폴라로이드 + 카메라 필름 스트립)

자세한 내용은 [02-dashboard-screen.md](02-dashboard-screen.md) 참고.

구성:

- 섹션 타이틀
- 전체 피드 보기 버튼
- 빨랫줄(와이어) + 빈티지 필름 집게 SVG
- 폴라로이드 카드 슬롯 (데스크톱 5장 / 모바일 3장, ◁ ▷ 이동 버튼)
- 하단 카메라 필름 스트립 (썸네일 클릭 이동)

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

> 실제 구현에서는 아래처럼 이미 반영되어 있다. 자세한 내용은 [04-lucky-letter-screen.md](04-lucky-letter-screen.md) 참고.

### LuckyLetterHeader

구성:

- 타이틀
- 설명

### LetterFilterTabs

구성:

- 전체 편지
- 즐겨찾기
- 편지 쓰기 (인라인 작성 폼으로 전환하는 토글)

### LetterCard

구성:

- 즐겨찾기 버튼
- To
- From
- 본문
- 클릭 시 상세 페이지(`letter_detail.html`)로 이동

### LetterComposeInline

팝업 모달이 아니라, `편지 쓰기` 필터 선택 시 목록 자리에 나타나는 인라인 컴포넌트.

구성:

- 받는 사람
- 모두에게 보내기
- 보낸 사람
- 내용
- 이모지 선택
- 미리보기
- 제출

### LetterDetailPage (`letter_detail.html`)

모달이 아니라 별도 페이지. URL 파라미터(`groupId`, `index`, `theme`)로 데이터를 전달받는다.

구성:

- 발신자 레이블
- 전체 내용
- 즐겨찾기 토글
- 삭제
- 닫기 (목록으로 복귀)

## Schedule Components

> 과거 명세의 `CloverGrowthPath`/`ScheduleDensityControl`/`GrowthScheduleCard`(식물 성장 단계형)는 실제 구현에서 인생4컷 포토부스 카드 방식으로 대체되었다. 자세한 내용은 [05-schedule-screen.md](05-schedule-screen.md) 참고.

### ScheduleHeader

구성:

- 약속 여정 타이틀
- 새 D-day 만들기 버튼

### ScheduleStatusFilter

구성:

- 전체
- 인증 가능
- 다가오는 약속
- 완료된 약속

### LifeFourCutScheduleBoard

구성:

- 성장 카드 리스트 (데스크톱: 반응형 그리드 보드 / 모바일: 가로 스와이프)
- 선택 일정 상세

### LifeFourCutCard (`growth-card four-cut`)

구성:

- 제목
- 날짜
- D-day
- 인생4컷 프레임 4개 (제안하기 / 일정 맞추기 / 약속 확정 / 만남)
- 진행 바
- 현재 단계 설명

### StagePhotoUploadModal

구성:

- 업로드 전 확인 모달 (`사진 선택하기` 버튼으로 실제 파일 선택 진행)
- 이미 업로드된 프레임 안내 모달 (`이미 업로드됐어요`)
- 인생4컷 완성 축하 모달
- 저장 공간 부족 안내 모달

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
