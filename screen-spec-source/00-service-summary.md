# Clov. 서비스 요약

## 문서 목적

이 문서 묶음은 `Clov - 추억피드.html` 기준본을 Claude 디자인 프레임워크에 효율적으로 입력하기 위한 화면 명세 소스다.

HTML 전체를 그대로 넣지 않고, 화면별 목적과 컴포넌트, 상태, 사용자 액션을 구조화해 전달하는 것을 목표로 한다.

## 기준 프로토타입

- 기준 파일: `C:\gov\project\clov-계획서\화면구상html\Clov - 추억피드.html`
- 기준 성격: 추억피드와 일정계획 개선이 가장 많이 반영된 HTML 프로토타입
- 참고 분기: `Clov - 행운 편지.html`
  - 행운편지 작성/상세 모달과 버튼 색상 개선은 이 분기에서 추후 병합 대상

## 서비스 개요

Clov.는 친구와의 약속이 시간이 지나 추억으로 자라나는 과정을 기록하는 친구 전용 우정 기록 서비스다.

서비스 슬로건:

> 약속이 추억으로 자라는 친구 전용 기록공간.

## 핵심 사용자 가치

- 친구와의 약속을 D-day로 관리한다.
- 약속이 끝나면 자연스럽게 추억 작성 후보로 이어진다.
- 같은 약속에 대해 친구별로 서로 다른 시점과 감정의 기록을 남길 수 있다.
- 기록이 쌓일수록 우정 레벨과 클로버 성장으로 관계의 변화를 시각화한다.

## 핵심 흐름

1. 우정공간 생성 또는 진입
2. 약속 등록
3. D-day 확인
4. 실제 만남
5. 추억 작성 후보 생성
6. 친구별 기록 작성
7. 추억피드 저장
8. 우정 레벨과 클로버 성장 반영

## 구조 원칙

- 우정공간은 인원 제한 없는 단일 구조다.
- 1:1 전용 화면과 1:N 전용 화면으로 나누지 않는다.
- 방장, 대표자, 초대한 사람의 권한 차이를 두지 않는다.
- 모든 멤버는 동등한 권한을 가진다.
- Clov.의 1차 차별점은 `약속 완료 -> 추억 작성 후보 전환`이다.
- Clov.의 2차 차별점은 `같은 약속에 대한 친구별 관점 기록`이다.

## 기준 화면 구성

- 우정공간 대시보드
- 추억피드
- 행운편지
- 일정계획
- 공통 모달
- 다크모드
- 데스크톱/모바일 동시 미리보기 프레임

## Claude 디자인 프레임워크 입력 방식

화면명세를 만들 때는 HTML 전체를 넣지 말고 아래 순서로 필요한 문서만 넣는다.

1. 항상 `00-service-summary.md`와 `01-design-system.md`를 먼저 제공한다.
2. 명세화할 화면 문서 하나를 추가한다.
3. 모달이나 상태 변화가 중요한 화면이면 `06-modal-and-interaction.md`를 함께 제공한다.
4. 필요할 때만 HTML의 해당 영역 일부를 발췌한다.

예시:

```text
추억피드 명세서 작성 요청:
- 00-service-summary.md
- 01-design-system.md
- 03-memory-feed-screen.md
- 06-modal-and-interaction.md
```

## 현재 기준본 판단

`Clov - 추억피드.html`을 기준본으로 삼는다.

이유:

- 서비스 핵심 흐름인 추억 저장/탐색 구조가 가장 잘 반영되어 있다.
- 월별 추억 아카이브와 iOS 스타일 월 선택 팝오버가 포함되어 있다.
- 추억 상세 바텀시트, 해시태그, 사진 없는 카드 플레이스홀더가 포함되어 있다.
- 일정계획의 `Clover Growth Path`가 포함되어 약속에서 추억으로 이어지는 흐름을 설명하기 좋다.

## 병합 메모

`Clov - 행운 편지.html`에서 추후 가져와야 할 항목:

- 행운편지 작성 버튼
- 행운편지 작성 모달
- 행운편지 상세 모달
- 편지 이모지 선택
- 편지 미리보기
- To/From 입력
- 편지 즐겨찾기 빈 화면 텍스트 스타일 개선
- `--btn-primary-bg` 기반 버튼 색상 보정

## 실제 구현 반영 현황 (2026-07 기준)

위 내용은 원본 HTML 두 파일(`Clov - 추억피드.html`, `Clov - 행운 편지.html`) 기준의 초기 계획이다. 실제 팀 구현체(`test-web-design/`)에서는 아래처럼 반영·변형·확장되었으므로, 화면 세부 스펙을 확인할 때는 **각 화면별 명세서(`test-web-design/*/*.md`)의 최신 내용을 우선**한다. 마스터 문서(00~09)는 "왜/구조" 중심이고, 화면별 상세는 링크로 연결한다.

### 화면 구성 확장 (초기 계획 → 현재 구현)

초기 계획은 단일 앱(대시보드/피드/편지/일정) 중심이었으나, 현재는 아래 화면군까지 구현되었다.

- **인증**: 로그인(자동로그인·간편로그인·성공 오버레이) + 회원가입 5단계 위저드.
  → [../test-web-design/01-auth/login.md](../test-web-design/01-auth/login.md) · [../test-web-design/01-auth/signup.md](../test-web-design/01-auth/signup.md)
- **우정공간 진입/관리**: 방 목록(보딩패스 카드·입장 스탬프), 친구 초대(코드 복사/전달), 방 입장(코드 → 가입 신청 → 알림 수락).
  → [../test-web-design/03-rooms/makerooms.md](../test-web-design/03-rooms/makerooms.md) · [invite.md](../test-web-design/03-rooms/invite.md) · [join_room.md](../test-web-design/03-rooms/join_room.md)
- **알림**: 가입 신청 수락(5분 되돌리기)·거절, 친구 활동 알림, 관리진 공지. 방장이 없으므로 **참여 멤버 누구나 1명 수락으로 입장 확정**.
  → [../test-web-design/07-notification/notification.md](../test-web-design/07-notification/notification.md)
- **사용자설정**: 개인정보 + 테마 스와치·물감 커스텀 색상 피커·바탕화면 아이콘 스와치. **계정 탈퇴는 삭제가 아니라 익명화**(기록 보존).
  → [../test-web-design/08-profile/profile_edit.md](../test-web-design/08-profile/profile_edit.md)

### 기존 4개 화면의 변형

- 행운편지 작성/이모지/미리보기/To·From 입력은 이미 구현되었으나, 팝업 모달이 아니라 탭 내 인라인 전환 방식으로 구현되었다. 상세 보기도 모달이 아니라 별도 페이지(`letter_detail.html`) 이동이다. → [04-lucky-letter-screen.md](04-lucky-letter-screen.md) · [화면별](../test-web-design/05-letter/letter_detail.md)
- 일정계획의 `Clover Growth Path`(약속 씨앗 → D-day 새싹 → 만남 클로버 → 추억 꽃)는 "포토부스 인생4컷 카드"(제안하기 → 일정 맞추기 → 약속 확정 → 만남) + **약속 여정 영수증**으로 대체되었다. → [05-schedule-screen.md](05-schedule-screen.md)
- 우정공간 대시보드의 추억 미리보기는 "참여자별 추억 증거 카드"(겹침 카드/빨랫줄/일기장 3종 테마) + 카메라 필름 스트립 구조로 구체화되었고, **마스코트(크로비/롭)·경험치/레벨 시스템**이 추가되었다. → [02-dashboard-screen.md](02-dashboard-screen.md) · [화면별](../test-web-design/02-main/index.md)
- 추억피드/추억 상세는 검색·정렬·사진 모아보기·월별 섹션 + MEMORY PASSPORT 여권 상세(약속 영수증 도장 4상태)로 확장되었다. → [03-memory-feed-screen.md](03-memory-feed-screen.md) · [화면별](../test-web-design/04-feed/feed.md)
