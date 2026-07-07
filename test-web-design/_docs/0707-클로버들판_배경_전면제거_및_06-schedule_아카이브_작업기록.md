# 0707 — 클로버 들판(절차적 배경) 전면 제거 & 06-schedule 아카이브 작업기록

**작업일**: 2026-07-07
**범위**: `02-main/`(대시보드 배너·사용자설정), `06-schedule/`, `_docs/`, `index.md`
**한 줄 요약**: 사용되지 않던 절차적 "클로버 들판" 배경 시스템을 설정 옵션 → v5 배너 엔진 → 구형 `.dashboard-scene`까지 3단계로 완전히 걷어내고, 죽은 `06-schedule/` 페이지를 아카이브했다. 대시보드 배너는 이제 사진 벽지(`V5_WALLPAPERS`) 방식만 사용한다.

---

## 0. 배경

- 대시보드 배너(`.v5-scene`)에는 원래 두 종류의 "클로버 들판" 절차적 배경 코드가 있었다.
  1. **v5 씬 엔진의 `field` 테마** — 사용자설정 "대시보드 배경"에서 고르던 산·하늘·별·클로버밭 절차적 배경 (기본값).
  2. **구형 `.dashboard-scene` "성장 풍경"** — 더 오래된 별개 시스템. 어떤 활성 화면에도 DOM이 주입되지 않아 이미 죽은 코드였고, 클래스명(`.scene-sky` 등)이 v5와 겹쳐 있었다.
- 실제 서비스에서 절차적 들판을 쓰지 않기로 하여 전부 제거. 배너는 LP 턴테이블 등 실사 사진 벽지만 사용한다.

---

## 1. `06-schedule/` 아카이브

- `06-schedule/schedule.html`, `schedule.md`는 실제 화면 어디에서도 링크되지 않는 죽은 독립 페이지였다(우정공간 일정계획은 `02-main/index.html` 내부 인생4컷 방식으로 대체됨).
- 이미 `_docs/0704-...`와 `README.md`에는 "`_archive/schedule/`로 이동했다"고 적혀 있었으나 **실제 파일 이동만 누락**된 상태였다.
- 조치: `06-schedule/` → `_archive/schedule/`로 이동, 빈 폴더 삭제. 문서와 실제 상태 일치.
- 참조 확인: 실제 코드(HTML/JS)에서 참조 없음 — 남은 언급은 문서(.md)뿐이었다.

---

## 2. 사용자설정 "대시보드 배경"에서 클로버 들판 제거

**파일**: `02-main/components/clov-profile-modal.js`, `js/v5-banner.js`, `js/desktop.js`

- 설정 목록(`#dt-bg-theme-list`)에서 하드코딩된 `<li data-bg-theme="field">클로버 들판</li>` 삭제 → 이제 `V5_WALLPAPERS` 등록소 항목(현재 LP 턴테이블)만 노출.
- 기본값 전환: `getBgTheme()` 기본값 `'field'` → `'lp-turntable'`.
- 마이그레이션: localStorage 저장값 `'field'`(및 구버전 `'photo'`) → `'lp-turntable'`로 자동 변환.
- `setBgTheme` 토스트의 `field` 특수처리 제거.
- 등록소 주석 갱신: "field가 기본값이라 목록에 넣지 않는다" → "기본 배경은 등록소 첫 항목".

**동작 원리**: `field` 외 테마를 고르면 CSS가 절차적 레이어를 `display:none` 처리하고 `.scene-sky`에 사진을 깐다. 기본값을 `lp-turntable`로 바꾸면서 절차적 배경은 화면에 뜨지 않게 됐다.

---

## 3. v5 배너 엔진의 절차적 `field` 코드 전면 제거

`field`가 더 이상 선택·기본값이 아니게 되어 관련 코드가 죽은 코드가 됨. DOM·JS·CSS에서 물리적으로 제거.

### 3-1. DOM (`pages/space-page.js`)
`.v5-scene`에서 제거: `.scene-stars`, `.scene-celestial`, `.scene-clouds`, `.scene-mountains`, `.scene-ground`, `.scene-clover-field`, `.scene-haze`, `.v5-lp-loop`(field 모드 전용 LP 장식).
**유지**: `.scene-sky`(→ 사진 벽지 컨테이너로 재사용), `.season-particles`, `.scene-balloons`, `.v5-photo-rec`(LP 레코드), `.banner-hud`(레벨/D-day).

### 3-2. JS 엔진 (`js/v5-banner.js` + `js/desktop.js` 양쪽 복사본)
제거: `v5updateGround`, `v5updateMountains`, `v5updateCelestial`, `v5buildStars`, `v5buildClovers`, `makeSVGClover`, 상수(`GROUND_COLORS`/`MTN_COLORS`/`CEL`/`hexRgb`/`lerpColor`), `NS`, `v5render` 내 해당 호출, 초기화 별생성 호출.
**유지**: `v5buildParticles`, `v5buildBalloons`, `v5updateHUD`, `v5ApplyWallpaperImage`.

### 3-3. CSS (`styles/space.css` + `css/desktop.css` 양쪽)
제거: `.v5-scene .scene-stars/.star/.scene-celestial/.crater/.scene-clouds/.cloud/.scene-mountains/.scene-ground(::before)/.scene-clover-field/.scene-haze`, 시간대 하늘 그라디언트, 클로버/스프라우트 SVG 스타일, `.v5-lp-loop` 계열 전체.
`:not([data-bg-theme="field"])` hide 블록은 `.scene-sky { background-size:cover }` 사진 규칙만 남기고 단순화.
**유지**: `.scene-sky`(사진), `.season-particles`, `.ptcl.*`, `.scene-balloons`, `.lv-pill` 계절색, LP 턴테이블 `.v5-photo-rec/.v5-photo-burst`.

> `desktop.js`/`desktop.css`는 `04-feed/feed.html`이 피드 렌더링 때문에 로드하는 복사본. feed.html에는 `.v5-scene`이 없어 v5 엔진 코드가 완전한 죽은 코드였으므로 동일하게 제거해도 안전.

---

## 4. 구형 `.dashboard-scene` "성장 풍경" 시스템 제거

`.dashboard-scene` 컨테이너는 어떤 활성 DOM에도 주입되지 않음 → 관련 CSS/JS 대부분이 죽은 코드. 단, `renderGroundGrowth()`만은 legacy 호환용 **숨김 stub div**(`#dt-ground-growth`, `display:none`)에 클로버 12~36개를 매번 렌더하고 있었다(화면 밖 낭비).

### 4-1. CSS (`styles/space.css` + `css/desktop.css` 양쪽)
제거:
- 계절별 필터: `.dashboard-card[data-season] .scene-ground::before / .scene-mountain / .ground-sprout`
- 레거시 계절 파티클: bare `.season-particles`, `.particle.blossom/firefly/leaf/snow` + keyframes(`fallBlossom/floatFirefly/twinkleFirefly/fallLeaf/fallSnow`)
- `.dashboard-scene` + scene 레이어(bare `.scene-sky/.scene-stars/.scene-sun/.scene-haze/.scene-ground(::before)`), `.ground-growth`, `.ground-sprout` + keyframes(`starTwinkle/sproutSway/sproutGrow`)

### 4-2. JS (`js/space.js` + `js/desktop.js` 양쪽)
`renderGroundGrowth()` 함수 정의 + 호출 2개씩 제거.

### 4-3. 유지 (의도적)
- `.progress-bar-bg/.progress-bar-fill` — JS가 `querySelectorAll('.progress-bar-fill')`로 참조
- `.d-day-label/.d-day-count` — 실제 배너 D-day 스타일
- `.dashboard-card>*:not(.dashboard-scene)` — 대시보드 자식 z-index 레이어링
- `.levelup-pulse` — 레벨업 펄스 효과
- `updateSeasonalParticles`/`updateDashboardEnvironment` — `.dashboard-scene`가 없어 **가드된 무해 no-op**. 제거 시 `init.js`의 `window.onload`/60초 interval·테스트패널(`forceTheme`) 호출부까지 건드려 크래시 위험이 있어 그대로 둠.

---

## 5. 문서 갱신

- `02-main/index.md` — "V5 씬 배너" 레이어 표를 사진 벽지 방식으로 갱신하고, 절차적 field 배경 제거 사실을 명시.

---

## 6. 브라우저 검증 (포트 8899 정적 서버)

> `02-main/index.html`은 반드시 트레일링 슬래시(`http://localhost:8899/02-main/`)로 열 것. 슬래시 없으면 clean-URL 리다이렉트로 상대경로가 루트 기준으로 풀려 스크립트 전부 404.

| 대상 | 결과 |
|---|---|
| 공간 페이지 | 콘솔 에러 0. v5 배너 정상(LP 사진 `cover`, 레벨 pill, particles). field 레이어 전부 제거. 설정 "대시보드 배경" = LP 턴테이블만(`hasField:false`). 기본값·`field→lp-turntable` 마이그레이션 확인. **ground-sprout 12→0**, `#dt-ground-growth` 빈 값, `.dashboard-scene` 0, 레거시 `.particle` 0. `updateFriendshipUI`/`updateDashboardEnvironment` 정상 |
| feed.html | 콘솔 에러 0. `renderFeeds` 정상(피드 48개). `renderGroundGrowth` 제거 확인. `updateDashboardEnvironment` 유지·정상 |

> 스크린샷(`preview_screenshot`)은 페이지 내 다른 `filter:drop-shadow`+`mask` 요소 때문에 헤드리스에서 타임아웃 → DOM 레벨 검증으로 확정(알려진 함정).

---

## 7. 남은 것 (선택 정리 후보)

- 사용되지 않게 된 CSS 변수(`--sky-top`, `--sky-bottom`, `--ground-top`, `--ground-bottom`, `--haze-color`, `--haze-opacity`, `--celestial-color`, `--celestial-glow`, `--sun-glow-size`)의 정의가 남아 있으나 아무 규칙도 참조하지 않는 inert 상태.
- `updateSeasonalParticles`(가드된 no-op)와 관련 legacy 호환 stub(`#dt-ground-growth`/`#mb-ground-growth` 빈 hidden div)은 자동 stub 컨테이너의 일부로 남아 있음.

---

## 8. 변경 파일 목록

- 이동: `06-schedule/{schedule.html,schedule.md}` → `_archive/schedule/`
- 수정: `02-main/components/clov-profile-modal.js`
- 수정: `02-main/pages/space-page.js`
- 수정: `02-main/js/v5-banner.js`
- 수정: `02-main/js/desktop.js`
- 수정: `02-main/js/space.js`
- 수정: `02-main/styles/space.css`
- 수정: `02-main/css/desktop.css`
- 수정: `02-main/index.md`
- 신규: `_docs/0707-클로버들판_배경_전면제거_및_06-schedule_아카이브_작업기록.md` (본 문서)
