# 🍀 Clov — 프로토타입 → React 이관 가이드

> `test-web-design/`(순수 HTML/CSS/JS·localStorage 프로토타입)를 `clov-web`(React 19)로 옮기는 방법.
> **이 문서는 공용(shared).** 프론트 작업 시 하네스가 이 가이드 + [`API-CONTRACT.md`](API-CONTRACT.md) + 화면 명세를 함께 본다.
> 최종 갱신: 2026-07-14

---

## 0. 큰 원칙

- **CSS·마크업은 거의 옮겨 붙이는 수준으로 쉽다. 진짜 일은 "상태(state)"에 있다.**
- 이관은 **화면 전체를 한꺼번에**가 아니라 **기능 슬라이스 단위**로, 백엔드 API와 **함께** 진행한다(통합 방식 — §7).
- 시각 정체성(디자인 토큰·연출 CSS)은 **보존 대상**, 상태·검증 로직은 **재작성 대상**.

---

## 1. 가장 큰 일 — 상태(state) 재편

프로토타입은 모든 걸 `localStorage`(`clov_*`)에 뭉쳐 둔다. React에선 **성격별 3곳**으로 나눈다. 이 분류가 이관의 80%다.

| 프로토타입 데이터(localStorage 키) | 성격 | React에서 어디로 | 도구 |
|---|---|---|---|
| `clov_groupsData`(방·약속·추억·편지·알림·레벨·대표사진) | 서버 데이터 | **서버 상태** | TanStack Query |
| `clov_joinRequests` · `clov_acceptedMembers` | 서버 데이터 | 서버 상태 | TanStack Query |
| `clov_my_status_msg` | 서버 데이터(방별) | 서버 상태 | TanStack Query |
| `clov_theme` · `clov_darkMode` · `clov_appBackground` · `clov_appBgCustomColor` · 각 테마값 | 사용자 설정(서버 저장) | 서버 상태 + 전역 캐시 | Query(preferences) + Zustand |
| 선택된 방 · 모달 열림/닫힘 · 탭 · 필터 | 순수 UI 상태 | **클라 전역/로컬** | Zustand / useState |
| `accessToken` | 인증 토큰 | **로컬 유지** | localStorage + axios 인터셉터 |

> 판단 기준 한 줄: **"이 값이 다른 기기에서 로그인해도 같아야 하나?" → 예면 서버, 아니면 클라.**

---

## 2. 한 번만 만들 레이어

1. **API 레이어** (`src/api/`) — 도메인별 호출 함수 + axios 인스턴스(baseURL `VITE_API_BASE_URL` · `Authorization: Bearer` 인터셉터 · 401 시 refresh). 프로토타입의 localStorage read/write를 이걸로 교체.
2. **공통 컴포넌트** (`src/components/`) — 명세 `09-component-inventory` 기준: `Header`(main/sub/home) · `Modal` · `Button`(main·sub·danger·icon·filter·tab) · `EmptyState` · `Toast/성공오버레이`. 프로토타입 `components/`를 1회 이식.
3. **사진 업로드 유틸** — base64/localStorage → **presign 업로드 + 클라 압축**(프로토타입 `compactStoredPhotos`의 canvas 압축 재활용).
4. **모달/포커스 시스템** — 프로토타입 전역 `window.onclick`/`keydown` → React 포털 + ESC 훅 + **포커스 트랩**(접근성 명세 반영, ESC 전파 차단 레이어 스택).

---

## 3. 화면별 반복 패턴 (9화면 동일)

프로토타입이 `pages/*-page.js`로 탭 단위 분리돼 있어 React 페이지로 **1:1 매핑**된다. 화면마다:

```
① 마크업(템플릿 문자열) → JSX
② CSS 가져오기 (styles/*.css → CSS Module)        ← 거의 복붙
③ localStorage 읽기 → useQuery, 쓰기 → useMutation
④ 연출(애니메이션) 재현 — CSS는 살리고, JS 타이밍은 useEffect
```

---

## 4. 살릴 것 vs 바꿀 것

| 거의 그대로 살림 | 새로 짜야 함 |
|---|---|
| `base.css` 디자인 토큰(CSS 변수) | 상태 관리 전부 |
| 다크모드(변수 기반) | 데이터 fetch/mutation |
| 시각 연출 CSS (인생4컷·폴라로이드·영수증·보딩패스) | 세션 전용 동작(거절 새로고침 복원 등) → 서버 상태 |
| 화면 레이아웃/구조 | 클라 신뢰 로직(XP·5분 타이머·정원) → 서버 검증, 프론트는 표시만 |

---

## 5. 옮길 때 터질 지점 (미리 알기)

1. **사진** — localStorage base64는 용량 한계로 "저장 공간 부족" 발생. **presign+스토리지 필수.**
2. **클라 신뢰 로직** — 5분 되돌리기 타이머·XP 적립·정원 8명은 지금 프론트에 있음 → 서버로 이동(계약 반영). 프론트는 **표시/카운트다운 연출만.**
3. **세션 전용 상태** — "거절은 새로고침하면 복원" 같은 편법 → 실제 서버 상태로 대체.
4. **전역 이벤트 핸들러 충돌** — 여러 모달의 `window.onclick` 덮어쓰기 → React 방식으로 자연 해소.

---

## 6. 화면별 이관 체크리스트

| 화면 | 프로토타입 | React 페이지 | 주 API 도메인 | 난이도 |
|---|---|---|---|---|
| 로그인/회원가입 | `01-auth/` | `pages/auth/` | Auth | 중(폼·위저드) |
| 방 목록·초대·입장 | `03-rooms/`·makerooms | `pages/rooms/` | Rooms·Invites·JoinRequests | 상 |
| 대시보드 | `pages/space-page.js` | `pages/Dashboard` | Rooms·Exp | 상(연출 많음) |
| 추억피드 | `pages/feed-page.js` | `pages/Feed` | Memories·Comments·Images | 상 |
| 행운편지 | `pages/letter-page.js` | `pages/Letters` | Letters | 중 |
| 일정계획·인생4컷 | `pages/schedule-page.js` | `pages/Schedule` | Plans·StagePhotos | 상(제일 복잡) |
| 알림 | index noti | `pages/Notifications` | Notifications·JoinRequests | 중 |
| 사용자설정 | `clov-profile-modal.js` | `components/SettingsModal` | Users·Preferences | 중 |

---

## 7. 통합 방식으로 진행하기 (백+프론트 함께)

이관은 **프론트만 따로 하는 별도 프로젝트가 아니다.** 백엔드와 **하나의 계약** 위에서 기능 슬라이스 단위로 함께 간다.

```
[공용 md]  API-CONTRACT.md(계약) · 이 가이드 · 화면명세 · DB05
             └─ 프론트·백 하네스가 같은 문서를 본다 (단일 맥락)
                    │
   기능 슬라이스마다 ▼
   ① [api] 백엔드 도메인 구현 (계약대로)
   ② [web] 그 화면을 React로 이관 + ①의 API에 연동 (이 가이드대로)
```

- **순서**: 각 슬라이스에서 `[api]`(계약 구현)를 먼저, 그 위에 `[web]`(React 이관+연동). → 이슈백로그의 M2 구조 그대로.
- **본보기 먼저**: **로그인 화면**을 워킹 스켈레톤으로 프론트→백→DB 관통(M1). 이게 나머지 8화면 이관의 **정답 패턴**이 된다.
- **왜 통합이냐**: 프론트가 `localStorage`를 API로 바꾸려면 그 API가 **계약대로 존재**해야 한다. 계약이 단일(SSOT)이라, 프론트 이관과 백 구현이 어긋나지 않는다.

---

## 관련 문서
- API 계약(단일 기준) → [`API-CONTRACT.md`](API-CONTRACT.md)
- DB 스키마 → [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md)
- 이슈 백로그 → [`이슈백로그.md`](이슈백로그.md) · 로드맵 → [`roadmap.md`](roadmap.md)
- 화면 명세(동작 기준) → `../test-web-design/*/*.md` · 컴포넌트 → `../screen-spec-source/09-component-inventory.md`
