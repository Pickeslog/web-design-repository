# feed.html — 추억 피드

**최종 수정**: 2026-07-01  
**담당 파트**: `04-feed/`

---

## 화면 개요

우정공간 안에서 친구와 함께 남긴 추억 게시글을 월별 타임라인으로 보여주는 화면.  
`03-rooms/makerooms.html`에서 방을 선택했을 때 진입한다.  
`02-main/index.html` 내부 피드 탭을 독립 페이지로 분리한 것이다.

---

## 기술 구조

| 항목 | 내용 |
|---|---|
| CSS | `../02-main/css/desktop.css` 참조 (CSS 변수 + 피드/카드 스타일 재사용) |
| JS | `../02-main/js/desktop.js` 참조 (데이터 + 렌더링 로직 재사용) |
| 로컬 오버라이드 | `<style>` 블록으로 `body`, 헤더 등 스탠드얼론 레이아웃 재정의 |
| 진입 함수 | `window.onload`에서 `renderFeeds()` 자동 호출 (desktop.js 내) |

### desktop.js 재사용 함수 목록

| 함수 | 역할 |
|---|---|
| `renderFeeds()` | 피드 그리드 전체 렌더링 (`dt-full-feed-zone`) |
| `setFeedFilter('all'/'mine'/'others')` | 필터 탭 전환 후 재렌더링 |
| `renderFeedMonthControls()` | 월별 레일 버튼 생성 (`dt-feed-month-rail`) |
| `normalizeMemoryPost(post)` | 구형/신형 post 포맷 통일 |
| `renderMemoryCard(post, idx)` | 폴라로이드 카드 HTML 생성 |
| `getMemoryHashtags(post, participant)` | `#해시태그` 배열 반환 |
| `toggleMonthPicker(event)` | 월 선택 팝오버 열기/닫기 |
| `moveMonthPickerYear(direction)` | 팝오버 연도 이동 |
| `closeMemoryDetail()` | 추억 상세 바텀 시트 닫기 |

---

## 화면 구성

### 1. 헤더 (`.feed-header`, sticky)

```
← 방 목록    🍀 Clov.              🔔  [☀️] [김]
```

- **← 방 목록**: `../03-rooms/makerooms.html` 링크
- **다크모드 토글**: iOS 슬라이딩 버튼. `localStorage('darkMode')` 저장/복원.  
  `body.dark-mode` 클래스로 desktop.css 다크 테마 전환
- **아바타**: 현재 로그인 사용자 이니셜 (프로토타입에서는 고정 "김")

### 2. 그룹 선택 칩

```
[🍀 단짝친구]  [👨‍👩‍👧‍👦 우리가족]  [💻 코딩 스터디]
```

- `switchGroup(groupId, btn)` 호출 → `activeGroup` 변경 → `renderFeeds()` 재호출
- `groupsData` 오브젝트의 키: `'friend'` / `'family'` / `'study'`

### 3. 피드 헤더 영역

```
월별 추억 아카이브                    [전체 추억 · N개] [✏️ 글쓰기]
단짝과 남긴 기록을 월 단위로...
```

- `dt-feed-month-summary`: 현재 선택된 월 + 게시글 수 표시. `renderFeeds()`가 갱신
- 글쓰기 버튼: 프로토타입에서는 `alert()` (실제 구현 시 `write_post.html`로 이동)

### 4. 월별 레일 + 필터 탭 (`.feed-controls`)

```
[전체 12개] [2026.06 3개] [2026.05 3개] [...] [📅]

[전체]  [내 기록]  [친구 기록]
```

- **월별 레일** (`dt-feed-month-rail`): `renderFeedMonthControls()`가 동적 생성.  
  각 버튼 클릭 시 `activeFeedMonth` 변경 → `renderFeeds()` 재호출
- **📅 팝오버**: `toggleMonthPicker(event)`로 연/월 그리드 팝업
- **필터 탭**: `setFeedFilter()` 호출. 현재 선택은 `.active` 클래스

### 5. 피드 그리드 (`#dt-full-feed-zone`, `.feed-grid`)

`renderFeeds()` → `renderMemoryCard(post, idx)`가 동적으로 채우는 카드 목록.

---

## 폴라로이드 카드 구조

```
┌─────────────────────────────────────────────────┐
│  [배경 이미지 or 🍀 빈 플레이스홀더]              │
│                                                  │
│  참여자 타일 [나 나] [솔 솔] [민 민]             │
│                                                  │
│  2026.06.20 · 뚝섬 한강                          │
│  첫 한강 피크닉                                  │
│                                                  │
│  [내 기록]  [···더보기]                           │
│  떡볶이 먹고 돗자리 펴고 오래 웃었다.             │
│                                                  │
│  #소중한순간 #내기록 #2026년06월                 │
└─────────────────────────────────────────────────┘
```

| 요소 | 설명 |
|---|---|
| 배경 이미지 | `post.bg` URL. 없으면 🍀 + "사진이 없는 추억은 클로버로 보관됩니다" |
| 참여자 타일 | 각 참여자를 클릭하면 해당 참여자 시점의 추억 상세 바텀 시트 열기 |
| 날짜 · 장소 | `post.date` + `post.subtitle` (장소명) |
| 제목 | `post.title` |
| 필터 레이블 | "내 기록" / "친구 기록". 클릭하면 해당 필터로 전환 |
| ···더보기 | 추억 상세 바텀 시트 열기 (`openMemoryDetail(idx, participantId)`) |
| 본문 텍스트 | `participant.text` (참여자별 한 줄 기록) |
| 해시태그 | `getMemoryHashtags()` 반환값: `#태그명` 형태로 나열 |

---

## 추억 상세 바텀 시트

`···더보기` 또는 참여자 타일 클릭 시 화면 아래에서 슬라이드 업.

```html
<div class="memory-detail-backdrop" id="memory-detail-backdrop">
<section class="memory-detail-sheet" id="memory-detail-sheet">
  [핸들바]
  [작성자 레이블]   [✕]
  [제목]
  [날짜 · 장소]
  [본문 텍스트]
  [#해시태그 ...]
</section>
```

- `openMemoryDetail(postIndex, participantId)` — feed.html 내에서 오버라이드.  
  `normalizeMemoryPost()` + `getMemoryHashtags()`로 내용 채운 뒤 `.open` 클래스 추가
- `closeMemoryDetail()` — desktop.js 내 정의. `.open` 클래스 제거

---

## 월 선택 팝오버

```
❮  2026년  ❯
[1월] [2월] [3월] [4월]
[5월] [6월] [7월] [8월]
[9월] [10월] [11월] [12월]
```

- `toggleMonthPicker(event)` / `moveMonthPickerYear(direction)` (desktop.js 내)
- `month-picker-popover` 팝오버 HTML이 page에 직접 포함

---

## 데이터 구조

desktop.js 내 `defaultGroupsData` → `groupsData[activeGroup].posts[]`

```js
// post 오브젝트
{
  date: "2026.06.20",
  title: "첫 한강 피크닉",
  subtitle: "뚝섬 한강",           // 장소명
  text: "...",                    // 간략 설명
  bg: "url('...')" | "",          // 배경 이미지 CSS값 (없으면 빈 문자열)
  participants: [
    {
      id: String,                 // 참여자 식별자
      name: String,               // 표시 이름
      icon: String,               // 이니셜 1~2자
      text: String,               // 참여자 시점 기록
      type: 'mine' | 'friend'
    }
  ],
  tags: ["2명 기록", "같은 장소"]  // 메타 태그
}
```

그룹 키: `'friend'` (단짝친구) / `'family'` (우리가족) / `'study'` (코딩 스터디)

---

## 필터 로직

| 상태 변수 | 역할 |
|---|---|
| `activeGroup` | 현재 선택된 그룹 (`'friend'/'family'/'study'`) |
| `activeFeedFilter` | `'all'/'mine'/'others'` |
| `activeFeedMonth` | `'all'` 또는 `'2026.06'` 형태 |

`renderFeeds()`가 세 변수를 조합해 표시할 posts 배열을 필터링한다.

---

## 관련 파일

- [makerooms.html](../03-rooms/makerooms.html) — 방 목록 (← 뒤로가기 대상)
- [desktop.css](../02-main/css/desktop.css) — 공통 스타일 (CSS 변수, 카드, 필터 탭)
- [desktop.js](../02-main/js/desktop.js) — 공통 로직 (renderFeeds, 데이터, 필터)
- [memory_detail.html](memory_detail.html) — 추억 상세 전용 페이지 (별도 구현)
- [_docs/0630-Clov추억피드 수정내용(규비님).md](../_docs/0630-Clov추억피드 수정내용(규비님).md) — 6/30 규비님 작업 참고
