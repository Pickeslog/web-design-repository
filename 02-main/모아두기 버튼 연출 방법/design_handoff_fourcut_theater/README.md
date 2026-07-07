# Handoff: 인생4컷 "추억 극장" 입장 연출

## Overview
`전체 약속 보기` 화면을 **영화관 상영 포스터**로 만들고, **입장하기** 버튼을 누르면 완성된 인생4컷(4/4 인증사진이 모인 약속)들을 **1인칭 극장 상영**으로 보여주는 몰입형 연출입니다.

전체 흐름:
1. **로비 = 영화 포스터(원시트)**. 완성작들의 **만남(4번째 컷) 사진**이 켄번즈 줌 + 크로스페이드로 자동 순환하는 키 비주얼 위에 `◉ NOW SHOWING · 인생4컷 극장` 타이틀. 우상단 `지금 상영 · {약속명}` 칩이 슬라이드마다 갱신.
2. **입장하기** 클릭 → 극장 통로로 입장(카메라 전진). 하우스 조명 켜진 상태, 스크린엔 커튼이 닫혀 있음. **착석하기** 버튼 등장.
3. **착석하기** 클릭 → 앞좌석이 올라오며(착석) → 소등 → 커튼이 갈라지고 → 3·2·1 필름 카운트다운 → **인생4컷 상영**.
4. 스크린에는 한 약속의 4단계 인증사진(제안하기·일정 맞추기·약속 확정·만남)이 필름스트립으로 보이고, 제목·날짜·`clov. memories` 캡션이 붙음.
5. **◁ / ▷** 로 다른 완성작으로 넘김(필름 어드밴스 전환). **나가기**로 로비(포스터) 복귀.

## About the Design Files
이 번들의 `모아보기 연출.dc.html` 은 **HTML로 만든 디자인 레퍼런스(프로토타입)** 입니다. 그대로 복사해 넣는 프로덕션 코드가 아니라, 의도한 룩·동작을 보여주는 참고물입니다. 목표는 이 연출을 **기존 코드베이스(`test-web-design/02-main`, 바닐라 JS + CSS)의 패턴에 맞춰 재현**하는 것입니다. 프로토타입은 DC(디자인 컴포넌트) 런타임 위에서 돌지만, 실제 제품은 프레임워크 없는 순수 JS이므로 **애니메이션 스펙과 비주얼만 이식**하면 됩니다(DC 런타임/클래스 구조는 무시).

`support.js` 는 프로토타입을 브라우저에서 열어 보기 위한 런타임입니다. `모아보기 연출.dc.html` 을 이 폴더째로 열면 실제 동작을 확인할 수 있습니다.

## Fidelity
**High-fidelity.** 색/타이포/타이밍/이징이 모두 확정값입니다. 아래 스펙 그대로 재현하세요. 단, 사진은 프로토타입에서 **색 그라디언트 플레이스홀더**이며, 실제 구현에서는 각 약속의 **실제 단계 사진**(`stagePhotos`)으로 대체합니다.

---

## 기존 코드 연결 지점 (Integration Points)
모두 `test-web-design/02-main/` 안.
- **트리거 버튼**: `.fourcut-gallery-btn`(현재 라벨 "모아보기" → **"입장하기"** 로 변경, 아이콘은 티켓). `onclick="openFourCutGallery()"`.
- **진입 함수**: `openFourCutGallery()` (`js/desktop.js`).
- **모달 마크업**: `index.html`의 `dt-fourcut-gallery-modal`(`#dt-fourcut-gallery-grid`, `#dt-fourcut-gallery-empty`).
- **데이터**: 완성작 = `getScheduleProofCount(sch) === 4` 인 스케줄, `new Date(b.date)-new Date(a.date)` 최신순.
  - `sch.title`, `formatFriendlyDate(sch.date)`.
  - `getGrowthStagePhotos(sch)` → `{ proposal, coordinate, confirm, meet }` (단계별 사진 URL).
  - 4단계 라벨: **제안하기 / 일정 맞추기 / 약속 확정 / 만남** (`buildGrowthStages` 순서).
- **매핑**:
  - **포스터 슬라이드쇼** = 완성작들의 `stagePhotos.meet`(만남 컷) 목록. (프로토타입 `posterSlides`)
  - **상영 필름스트립** = 선택된 완성작의 4장 전부(proposal/coordinate/confirm/meet).

### 권장 구현 방식
- 기존 코르크보드 그리드 대신, `전체 약속 보기` 하단 영역을 **포스터 패널**로 교체(또는 별도 오버레이). 입장하기 → 극장 오버레이(`#fourcut-theater`, 풀스크린 권장)를 여는 흐름.
- 애니메이션은 **Web Animations API(`el.animate`)** 로. 포스터 슬라이드쇼는 `setInterval` + opacity transition.
- 상영 중 ◁▷ 넘김은 **재렌더 없이 DOM 직접 갱신**(제목/날짜/카운터/4프레임 `background-image`) 후 필름 어드밴스만 재생. 재렌더하면 "열린 커튼·켜진 스크린" 상태가 초기화되어 깨짐(프로토타입에서 겪은 이슈).

---

## Screens / Views

### View A — 로비 = 영화 포스터(원시트)
헤더는 기존 `전체 약속 보기`(kicker `LIFE FOUR CUT`, 타이틀, 서브카피) 유지. 그 아래 **포스터 패널**:
- **컨테이너**: `margin:22px 34px`, `border-radius:16px`, `overflow:hidden`, `position:relative`. 금장 프레임 = `box-shadow: inset 0 0 0 6px #1c1327, inset 0 0 0 8px rgba(212,175,90,.5), 0 18px 40px rgba(0,0,0,.4)`. 폴백 배경 `radial-gradient(120% 92% at 50% -12%, #3a2340, #170f24 58%, #0b0912 100%)`.
- **히어로 슬라이드쇼**(`#posterslides`, z1): 완성작마다 `position:absolute;inset:0` 슬라이드 div 1개. `background:<meet 사진>; background-size:cover; background-position:center;`, `opacity:0; transition:opacity 1.2s ease;`, `animation:kenburns7 11s ease-in-out infinite alternate`. JS가 **3600ms 마다** 활성 슬라이드 opacity 1(나머지 0)로 크로스페이드하고 `#nowplaying7` 텍스트를 해당 약속 제목으로 갱신.
- **시네마틱 스크림**(z2, pointer-events none): `linear-gradient(0deg, rgba(9,7,15,.94) 0%, rgba(9,7,15,.5) 30%, rgba(9,7,15,.06) 54%, rgba(9,7,15,.42) 100%)`.
- **마퀴 전구**(z3, 상단): `top:11px;left/right:34px;height:8px;` `background:radial-gradient(circle,#ffe6a2 0 2.2px,transparent 3px) 0 50%/19px 8px repeat-x; filter:drop-shadow(0 0 4px rgba(255,214,120,.85))`.
- **지금 상영 칩**(z3, 우상단 `top:24px;right:30px`): `지금 상영 · <span id="nowplaying7">…</span>`. `font:700 10.5px 'Space Mono'`, `color:#ffd27a`, 배경 `rgba(0,0,0,.38)`, `border:1px solid rgba(212,175,90,.32)`, `border-radius:999px`, `padding:5px 12px`.
- **타이틀 블록**(z3, 좌하단 `left/right:32px;bottom:52px`): kicker `◉ NOW SHOWING`(`font:700 11px 'Space Mono'`, `letter-spacing:4px`, `#ffd27a`) / 타이틀 `인생4컷 극장`(`font:900 40px 'Gothic A1'`, `#f7efe0`, `letter-spacing:-1px`, `text-shadow:0 3px 22px rgba(0,0,0,.7)`) / 태그라인 `제안부터 만남까지 — 네 컷으로 완성된 우리의 이야기`(`font:600 13.5px 'Gothic A1'`, `#dccfba`).
- **하단 마퀴 바**(z3, `height:38px`): `linear-gradient(#1c1327,#120c1c)`, 상단 테두리 `1px solid rgba(212,175,90,.4)`. 좌 `TODAY · 3편 상영`(gold), 우 `clov. memories`(`#8a8272`) — 둘 다 `font:700 10.5px 'Space Mono'`, `letter-spacing:1.5px`.
- **필터 칩 + 입장하기 버튼**: 칩 `완료된 약속 3` / `다가오는 약속 5`. 버튼 = 배경 `#357a58`, 흰 글자 `font:800 14px 'Gothic A1'`, **티켓 아이콘**, `border-radius:999px`, `padding:12px 22px`, `box-shadow:0 6px 16px rgba(27,67,50,.28)`, 라벨 **입장하기**.

### View B — 극장 (오버레이)
풀블리드 컨테이너(프로토타입 1000×640, 실제는 풀스크린 권장), `perspective:1100px`, 배경 `radial-gradient(circle at 50% 22%, #241c26, #0a0809 80%)`.

**레이어 (z 낮→높)**
- `scene7`(z3, `transform-origin:50% 92%`): 원근 무대.
  - 좌/우 좌석 벽: `repeating-linear-gradient(0deg,#150f18 0 22px,#231b28 22px 38px)`, 각 `perspective(360px) rotateY(±32deg)`, w22%/h76%.
  - 통로 바닥: `linear-gradient(#2c2436,#0c0a0d)`, `clip-path:polygon(30% 0,70% 0,100% 100%,0 100%)`, w20%/h54%, opacity .8.
  - **스크린**(top 8%, w56%, `aspect-ratio:16/10`): `border:9px solid #1a1512`, `border-radius:6px`, `box-shadow:0 0 0 2px #000,0 26px 60px rgba(0,0,0,.66)`, `padding:16px`, `overflow:hidden`. 내부:
    - **필름스트립**(`shot7`, 초기 opacity 0): 다크 `#141013`, 위/아래 스프로킷 `repeating-linear-gradient(90deg,transparent 0 7px,rgba(235,235,222,.8) 7px 13px)` h6px. 4프레임 flex gap7, 각 `aspect-ratio:3/4` `border-radius:3px`, 하단 라벨 pill(제안하기/일정 맞추기/약속 확정/만남) `font:700 8.5px 'Gothic A1'` 흰색 + `linear-gradient(transparent,rgba(0,0,0,.6))`.
    - 캡션: 제목 `font:800 16px 'Gothic A1'` `#f4f1e8`, 아래 `날짜 · clov. memories` `font:700 11px 'Space Mono'` `#a9b3a6`.
    - `scrglow7`(z9): 점멸 `radial-gradient(circle at 50% 42%,#fff,rgba(255,255,255,.35))`, `mix-blend-mode:screen`.
    - `grain7`(z8): `repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 3px)`, `mix-blend-mode:overlay`, `animation:grain7 .32s steps(2) infinite`.
    - `count7`(z7): 3·2·1 리더, 74×74 원, `border:3px solid rgba(255,255,255,.85)`, `font:700 34px 'Space Mono'`, 안쪽 스윕 바 `animation:spin7 1s linear infinite`.
    - **커튼** `curtL7`/`curtR7`(각 w58%, z6): 벨벳 `repeating-linear-gradient(90deg,#14311f 0 9px,#2e5233 9px 20px,#3a6b43 20px 24px)`(우측 반전), 안쪽 그림자 `inset ∓12px 0 20px rgba(0,0,0,.55)`. 상단 밸런스 바(z8) `linear-gradient(#3a6b43,#14311f)` + 금장 `2px solid rgba(212,175,90,.55)`.
  - **영사 빔**(`beam7`, z2, 초기 opacity 0): `linear-gradient(0deg,rgba(206,232,255,0),rgba(206,232,255,.14))`, `clip-path:polygon(42% 100%,58% 100%,96% 0,4% 0)`, `mix-blend-mode:screen`. 안에 **먼지 입자** 10개(2~5px 원 `rgba(230,240,255,.9)`, `animation:dust7 4~8s linear infinite`).
- `spill7`(z5): `radial-gradient(circle,rgba(206,232,255,.26),transparent 66%)`, `mix-blend-mode:screen`, 초기 opacity 0.
- `house7`(z6): 하우스 조명 `radial-gradient(ellipse at 50% 0,rgba(255,224,170,.5),transparent 72%)`, top34%, 초기 opacity .5.
- `seats7`(z10): 전경 앞좌석. 하단 바 `linear-gradient(180deg,#100b0e,#050304)` `border-radius:52px 52px 0 0` + 머리 실루엣 4개(`#0a0709`, `border-radius:50% 50% 44% 44%`). 초기 `translateY(100%)`.
- **컨트롤**:
  - `exit7` **나가기**(z16, 좌상단): `rgba(255,255,255,.1)`, `1px solid rgba(255,255,255,.2)`, `backdrop-filter:blur(4px)`, `font:800 12px 'Gothic A1'` `#f4f1e8`, ‹ 아이콘.
  - `sit7` **착석하기**(z16, 하단중앙 bottom24%): `#357a58`, `font:800 15px 'Gothic A1'`, 의자 아이콘, `border-radius:999px`, `padding:15px 28px`, `animation:sitpulse7 2.2s ease-out infinite`(민트 링 펄스). 초기 opacity0/pointer-events none.
  - `nav7`(z16, 하단중앙 bottom18px): ‹ / 카운터(`1 / N`, `font:700 12px 'Space Mono'`) / › . 40×40 원형 `rgba(255,255,255,.12)` + blur. 초기 opacity0.

---

## Interactions & Behavior (정확한 타임라인)
모든 애니메이션 `element.animate(keyframes, { duration, delay, easing, fill:'forwards' })`.
`EASE_OUT = cubic-bezier(.2,.8,.2,1)`, `BOUNCE = cubic-bezier(.34,1.56,.64,1)`.

### 로비 포스터 슬라이드쇼 (마운트 시 시작)
- 슬라이드 opacity를 JS로 크로스페이드(각 slide `transition:opacity 1.2s`), **주기 3600ms**. 활성만 opacity1.
- 켄번즈: 각 슬라이드 `animation:kenburns7 11s ease-in-out infinite alternate` (`0%{scale(1.06) translate(0,0)} 100%{scale(1.18) translate(-2%,-2%)}`).
- 슬라이드 바뀔 때 `#nowplaying7` 텍스트를 해당 약속 제목으로 갱신.
- 컴포넌트 unmount 시 `clearInterval`.

### STEP 1 — 입장하기 클릭 → `_enter()`
| 대상 | 키프레임 | duration | delay | easing |
|---|---|---|---|---|
| theater 오버레이 | opacity 0→1 | 340 | 0 | – |
| 로비 | opacity 1→0 (pointer-events none) | 300 | 0 | – |
| `scene7` (돌리인) | `scale(.68) translateY(-6px)` → `scale(1) translateY(0)` | 1000 | 0 | cubic-bezier(.2,.7,.3,1) |
| `exit7` | opacity 0→1 | 400 | 900 | – |
| `sit7` (착석 버튼 등장) | opacity0 `translate(-50%,14px)` → opacity1 `translate(-50%,0)` | 460 | 1000 | – |

이 시점: 하우스 조명 ON, 커튼 닫힘, 좌석 숨김. **착석하기** 누를 때까지 대기.

### STEP 2 — 착석하기 클릭 → `_sit()`
| 대상 | 키프레임 | duration | delay | easing |
|---|---|---|---|---|
| `sit7` | opacity 1→0 (pointer-events none) | 240 | 0 | – |
| `seats7` (착석) | `translateY(100%)`→`translateY(-5%)`@.8→`translateY(0)` | 680 | 80 | BOUNCE |
| `scene7` (반동) | `translateY(0)`→`translateY(1.2%)`@.5→`translateY(0)` (scale1) | 320 | 360 | – |
| `house7` (소등) | opacity .5→0 | 460 | 720 | – |
| `curtL7` | `translateX(0)`→`translateX(-104%)` | 720 | 1180 | cubic-bezier(.5,0,.2,1) |
| `curtR7` | `translateX(0)`→`translateX(104%)` | 720 | 1180 | cubic-bezier(.5,0,.2,1) |
| `beam7` | opacity 0→1 | 700 | 1360 | – |
| 카운트다운 `3`/`2`/`1` | 아래 키프레임 | 400 각 | 2060 / 2480 / 2900 | – |
| `scrglow7` (점등 플래시) | opacity 0→.95@.3→0 | 560 | 3420 | – |
| `spill7` | opacity 0→1 | 560 | 3460 | – |
| `grain7` | opacity 0→1 | 400 | 3620 | – |
| `shot7` (상영) | opacity 0→1@.5→.82@.62→1 | 720 | 3480 | – |
| `nav7` | opacity 0→1 | 440 | 4180 | – |

**카운트다운 낱개 키프레임**(숫자 텍스트 3→2→1 교체): `opacity0 scale(1.5)`→`opacity1 scale(1)`@.35→`opacity1 scale(1)`@.82→`opacity0 scale(.85)` (모두 `translate(-50%,-50%)`), duration400, fill forwards.
**카운트다운 OFF**: 커튼 직후 바로 상영 — `screenAt(3420)`→`2020`(스크린 관련 delay 전부 -1400), 카운트다운 생략.

### 완성작 넘기기 — ◁ / ▷ (`nav(dir)`)
- 인덱스 `(i+dir+N)%N`.
- **재렌더 없이** DOM 직접 갱신: 제목/날짜/카운터(`i+1 / N`)/4프레임 `background-image`+라벨.
- **필름 어드밴스**: 필름스트립 `translateX(dir*46px) blur(3px) opacity.2` → `translateX(0) blur(0) opacity1` (380, EASE_OUT) + `scrglow7` 짧은 점멸(0→.6@.3→0, 300).

### 나가기 — `onExit()`
- 진행 중 카운트다운 타이머 clear.
- theater opacity1→0(320, pointer-events none), 로비 opacity0→1(340, delay120, pointer-events auto).
- 재진입 `_enter()` 는 모든 요소 `cancel()`(초기 상태 복귀: 커튼 닫힘·좌석 숨김·스크린 off·하우스 ON) 후 재시작.

---

## State / 구현 노트
- 상태 최소화: **현재 활성 완성작 인덱스** 하나. 상영 진입 후에는 재렌더 없이 DOM 직접 조작.
- 포스터 슬라이드쇼 인덱스는 별도 `setInterval` 로 관리, 상태와 무관.
- 접근성: 모든 버튼은 실제 `<button>`. `prefers-reduced-motion` 시 켄번즈·카운트다운·돌리·먼지 생략, 즉시 상영 상태로 스냅 권장.

## Design Tokens
- **그린**: `--primary-green:#1b4332`, 버튼 `#357a58`, 민트 `--accent-green:#52b788`. 커튼 `#14311f/#2e5233/#3a6b43`.
- **금장(마퀴/프레임)**: `rgba(212,175,90,.4~.55)`, 전구 `#ffe6a2` + 글로우 `rgba(255,214,120,.85)`, 강조 텍스트 `#ffd27a`.
- **포스터 배경**: `radial-gradient(120% 92% at 50% -12%,#3a2340,#170f24 58%,#0b0912 100%)`, 프레임 안쪽 `#1c1327`, 하단바 `#1c1327→#120c1c`.
- **극장 배경**: `radial-gradient(circle at 50% 22%,#241c26,#0a0809 80%)`. 좌석/전경 `#150f18/#231b28/#0a0709/#100b0e/#050304`.
- **스크린 텍스트**: 제목 `#f4f1e8`/`#f7efe0`, muted `#a9b3a6`/`#dccfba`/`#8a8272`. 영사광 `rgba(206,232,255,…)`, 하우스 `rgba(255,224,170,.5)`.
- **타이포**: `'Gothic A1'`(제목·UI 700~900), `'Space Mono'`(라벨·카운터·마퀴·칩). 기존 코드가 이미 로드함.
- **@keyframes**: `kenburns7`(포스터 줌), `spin7`(리더 회전), `dust7`(먼지 상승 페이드), `grain7`(그레인 점멸), `sitpulse7`(착석 버튼 민트 링 펄스).

## Assets
- 별도 이미지 없음. **포스터 슬라이드 = 각 완성작 `stagePhotos.meet`**, **상영 필름스트립 = 선택 완성작의 4장 전부**(background-image). 아이콘(티켓/의자/‹›/‹나가기›)은 인라인 SVG(프로토타입 참조).

## Files
- `모아보기 연출.dc.html` — 최신 프로토타입(포스터 로비 + 입장 2단계 + 상영 + 넘기기). 폴더째 브라우저로 열면 동작 확인 가능.
- `support.js` — 프로토타입 런타임(제품엔 불필요, 미리보기용).
- 실제 이식 대상: `test-web-design/02-main/js/desktop.js`(`openFourCutGallery` 등), `index.html`(`dt-fourcut-gallery-modal`), `css/desktop.css`(`.fourcut-gallery-*`).
