# Clov. 데이터 및 상태 명세 소스

## 문서 목적

이 문서는 기준 HTML 프로토타입에 등장하는 데이터 구조와 UI 상태를 화면명세서, API 설계, React 상태 설계에 연결하기 위한 소스다.

아래 "주요 엔티티/UI 상태/API"는 **서버·React 이식을 위한 이상적 데이터 모델**이다. 현재 프로토타입(`test-web-design/`)의 **실제 저장은 localStorage 기반**이며, 그 키 목록은 문서 하단 [실제 구현 데이터 저장(localStorage)](#실제-구현-데이터-저장-localstorage) 절을 참고한다(이쪽이 현재 동작하는 화면의 데이터 기준).

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

- 현재 구현은 to/from/content/emoji/favorite를 모두 지원한다(작성은 인라인 폼, 상세는 별도 페이지 `letter_detail.html`). → [../test-web-design/05-letter/letter_detail.md](../test-web-design/05-letter/letter_detail.md)

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

### activeScheduleFilter

일정계획 상태 필터. (과거 명세의 `activeScheduleDensity`/compact·standard·detailed 표시 밀도 개념은 실제 구현에는 없으며, 상태 필터로 대체되었다.)

값 후보:

- 전체
- 인증 가능
- 다가오는 약속
- 완료된 약속

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

### 성장 단계 (인생4컷 단계)

> 과거 명세의 식물 성장 단계명(약속 씨앗/D-day 새싹/만남 클로버/추억 꽃)은 실제 구현에서 인생4컷 단계명으로 대체되었다. 자세한 내용은 [05-schedule-screen.md](05-schedule-screen.md) 참고.

입력:

- 일정 날짜
- 오늘 날짜

출력:

- 제안하기
- 일정 맞추기
- 약속 확정
- 만남 (약속 당일 이후 인증 사진 업로드 가능)

## 실제 구현 데이터 저장 (localStorage)

현재 프로토타입은 서버 없이 브라우저 localStorage(일부 sessionStorage)에 저장한다. 위 엔티티 모델과 대응하되, 실제 키는 아래와 같다. 화면별 상세는 각 화면 명세서를 우선한다.

| 키 | 내용 | 관련 화면 |
|---|---|---|
| `accessToken` | 로그인 토큰. "로그인 유지" 여부에 따라 localStorage / sessionStorage 선택. 존재 시 로그인 화면 건너뜀 | [로그인](../test-web-design/01-auth/login.md) |
| `clov_groupsData` | 그룹(우정공간)별 `posts`·`schedules`·`notifications`·`level`·대표사진 등 핵심 데이터. 안전 래퍼(`saveGroupsData`)로 저장(용량 초과 시 예외 대신 안내) | [메인](../test-web-design/02-main/index.md) |
| `clov_acceptedMembers` | 수락된 참여 멤버(가입 신청 수락 시 반영) | [알림](../test-web-design/07-notification/notification.md) |
| `clov_joinRequests` | 가입 신청 목록(신청자·코드·상태 `pending/accepted/rejected`·초대 경로) | [입장](../test-web-design/03-rooms/join_room.md) · [알림](../test-web-design/07-notification/notification.md) |
| `clov_my_status_msg` | 내 상태메시지 | [메인](../test-web-design/02-main/index.md) |
| `clov_darkMode` | 라이트/다크 모드 | [사용자설정](../test-web-design/08-profile/profile_edit.md) |
| `clov_appBackground` | 바탕화면 id(`default`/이미지/`custom`) | [사용자설정](../test-web-design/08-profile/profile_edit.md) |
| `clov_appBgCustomColor` | 커스텀 배경 HEX(물감 커스텀 색상) | [사용자설정](../test-web-design/08-profile/profile_edit.md) |
| `clov_withdrawn` | 계정 탈퇴(익명화) 플래그 — **삭제가 아니라 익명화**(기록 보존) | [사용자설정](../test-web-design/08-profile/profile_edit.md) |
| 프로필(이름·이메일·생년월일·아바타) | 개인정보. 저장하기 눌러야 반영 | [사용자설정](../test-web-design/08-profile/profile_edit.md) |
| 그 외 | 대시보드 배경·대표사진·커버·편지·증거카드 테마·마스코트 테마 등 | [사용자설정](../test-web-design/08-profile/profile_edit.md) |

주의:

- **경험치(XP)/레벨**은 `clov_groupsData`의 그룹별 `level`에 저장된다. 적립: 약속 추가(+3)·완료(+15)·게시글 작성(기본25+사진+정성)·마스코트 교감(+2, 하루 3회). 100% 초과 시 while 루프로 연속 레벨업(초과분 이월). 만렙 777.
- **멤버 관점 기록/참여 멤버**는 서버 모델의 `Member`/`ParticipantRecord`에 대응하지만, 현재는 `clov_acceptedMembers`와 그룹 `posts` 안의 작성자 정보로 표현된다.
- **가입 신청 거절**은 세션 메모리에만 표시(새로고침 시 대기로 복원) — 파괴적 삭제를 피하는 정책.

## React 이식 시 상태 분리 제안

전역 상태:

- 현재 사용자
- 현재 우정공간
- 다크모드

화면 상태:

- 활성 탭
- 추억피드 월/필터
- 행운편지 필터 (전체/즐겨찾기/편지 쓰기)
- 일정 상태 필터 (전체/인증 가능/다가오는 약속/완료된 약속)
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
- `rooms`(=spaces)는 **최대 8명**이 참여하는 단일 우정공간 개념으로 잡는다(ACTIVE 멤버 기준, 생성자 포함). 정원 초과 시 가입 신청 생성·수락 차단.
