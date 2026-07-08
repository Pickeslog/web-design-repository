# 우정공간 space-memory-preview 재설계 작업 기록 (2026-07-01)

## 최종 상태 요약

참여자별 추억 증거 카드 영역(`space-memory-preview`)을 팬 뷰어(polaroid fan viewer)에서
**빨랫줄(clothesline) 폴라로이드 + 카메라 필름 스트립** 구조로 전면 재설계했다.

---

## 작업 목록

| # | 작업 | 파일 |
|---|------|------|
| 1 | 팬 뷰어 → 빨랫줄 폴라로이드 뷰어 구조 재설계 | `desktop.js`, `desktop.css` |
| 2 | 빈티지 암실 필름 집게 SVG 제작 | `desktop.js` |
| 3 | 폴라로이드 카드 디테일 (아바타, 제목, 위치, 해시태그) | `desktop.js`, `desktop.css` |
| 4 | 카메라 필름 스트립 하단 추가 | `desktop.js`, `desktop.css` |
| 5 | 데스크톱 5장 / 모바일 3장 레이아웃 분리 | `desktop.js` |
| 6 | 필름 스트립 프레임 38px → 52px 확대 | `desktop.css` |
| 7 | 사진 비율 1:1 → 4:5 세로 변경 | `desktop.css` |
| 8 | 폴라로이드 카드 너비 170px → 210px 확대 | `desktop.css` |

---

## 작업 1 — 빨랫줄 폴라로이드 뷰어 구조

### 변경 전 (팬 뷰어)
- 폴라로이드 카드를 부채꼴로 펼쳐 보여주는 팬 형태
- 카드 전환이 직관적이지 않음

### 변경 후 (빨랫줄 뷰어)

```
         [집게]        [집게]        [집게]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ← 빨랫줄 (와이어)
       [카드]        [카드]        [카드]

◁     far-past  past  current  newer  far-newer     ▷

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 과거 [■][■][■][■][■][■][■][■][■][■] 현재  ← 카메라 필름 스트립
```

### 핵심 함수

| 함수 | 역할 |
|------|------|
| `renderEvidenceViewer(viewType)` | 빨랫줄 뷰어 전체 렌더 |
| `makeSlot(delta, slotCls)` | 내부 함수 — 슬롯 하나 생성 (`delta`: 현재 인덱스로부터 오프셋) |
| `renderEvidenceViewers()` | dt/mb 양쪽 렌더 후 필름 스트립 현재 프레임으로 스크롤 |
| `setEvidenceIndex(index)` | 특정 포스트로 이동 |
| `moveEvidence(direction)` | ◁ ▷ 버튼으로 이동 (+1=과거, -1=최신) |

### 데이터 방향 규칙
- `posts[0]` = 가장 최신 추억
- `posts[index]`가 클수록 오래된 추억
- 필름 스트립은 `[...posts].reverse()` 로 렌더 → 왼쪽 = 과거, 오른쪽 = 현재

### CSS z-index 레이어 스택

| 레이어 | z-index | 요소 |
|--------|---------|------|
| 1 | 2 | `.cline-wire` (빨랫줄) |
| 2 | 3 | `.cline-cards` (카드 컨테이너) |
| 3 | 1 | `.cline-slot--far-past/far-newer` (양 끝 카드) |
| 4 | 2 | `.cline-slot--past/newer` (인접 카드) |
| 5 | 10 | `.cline-slot--current.is-active` (현재 카드) |
| 6 | 4 | `.cline-clip-svg` (집게 — 카드 앞에 위치) |

---

## 작업 2 — 빈티지 암실 필름 집게 SVG

### 기획 배경

사용자 스케치(빨랫줄 집게)를 CSS pseudo-element로 구현했으나 복잡한 3D 형태 재현 한계.
이후 사용자가 빈티지 암실 스테인리스 필름 건조 집게(eBay 사진 참조) 이미지를 제시해
SVG 인라인으로 전환.

### SVG 구조 (`viewBox="0 0 28 48"`)

| 파트 | 요소 | 설명 |
|------|------|------|
| 상단 플레이트 | `<rect>` | 와이어 통과 홀이 있는 상단판 |
| 와이어 홀 | `<circle>` × 2 | 외부 링 + 내부 구멍 + 광택 반사 |
| 힌지 피벗 | `<rect>` | 스프링 연결부 |
| 힌지 리벳 | `<circle>` × 4 + `<line>` × 2 | 좌우 스크류 리벳 (나사선 표현) |
| 메인 바디 | `<rect>` | 집게 본체 |
| 메인 리벳 | `<circle>` × 2 + `<line>` × 2 | 십자 슬롯 스크류 |
| 하단 조 플레이트 | `<rect>` | 필름/카드 클램핑 부위 |
| 톱니 이빨 | `<path>` | 8개 세레이션 (serration) |
| 하이라이트 | `<line>` × 4 | 스테인리스 광택 (좌우 수직 + 수평 반사선) |

### 색상 팔레트 (스테인리스 스틸)

| 역할 | 색상 |
|------|------|
| 상단 플레이트 | `#c8cdd2` |
| 힌지 피벗 | `#a0a8b0` |
| 메인 바디 | `#bec4ca` |
| 어두운 스트로크 | `#8a9298` |
| 구멍 배경 | `#1a1f24` |
| 하이라이트 | `rgba(255,255,255,0.45)` |

### CSS 적용

```css
.cline-clip-svg {
    width: 28px;
    height: 48px;
    margin-bottom: -10px;  /* 집게 아랫부분이 카드 위에 겹치도록 */
    filter: drop-shadow(0 3px 8px rgba(0,0,0,0.45))
            drop-shadow(0 1px 2px rgba(0,0,0,0.3));
    position: relative;
    z-index: 4;
}
```

### 빨랫줄-집게 정렬 해결 과정

- 초기 문제: `cline-wire-area`에 `padding-top: 48px` 적용 시 와이어가 집게 구멍보다 아래에 위치
- 해결: `padding-top: 0` + `.cline-wire { top: 2px }` + `.cline-nav { margin-top: 2px }`
- 검증: `getBoundingClientRect()` 비교로 `gapAligned: true` 확인

---

## 작업 3 — 폴라로이드 카드 디테일

### 카드 구조

```
┌─────────────────────────────┐
│  [집게 SVG]                  │  ← .cline-clip-svg
│ ┌─────────────────────────┐ │
│ │ [아바타][아바타]   06.15 │ │  ← .cline-card-header
│ │ ┌─────────────────────┐ │ │
│ │ │                     │ │ │
│ │ │       사진           │ │ │  ← .cline-photo (4:5 비율)
│ │ │                     │ │ │
│ │ └─────────────────────┘ │ │
│ │                          │ │
│ │ 성수 스터디 카페           │ │  ← .cline-caption-title
│ │ 📍 성수동 카페             │ │  ← .cline-caption-sub
│ │ #4명 기록 #같은 장소       │ │  ← .cline-tags
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### 참여자 아바타

- 최대 4명 표시, 초과 시 `+N` 배지
- 색상 팔레트: `['#52b788','#e76f51','#457b9d','#f4a261','#2a9d8f']`
- 첫 글자 이니셜, 원형, overlap 배치 (`margin-left: -6px`)

### 카드 슬롯별 시각 처리

| 슬롯 | rotate | scale | opacity | filter |
|------|--------|-------|---------|--------|
| far-past | -8.5° | 0.74 | 0.42 | saturate(0.3) brightness(0.88) |
| past | -4° | 0.88 | 0.72 | saturate(0.55) brightness(0.95) |
| current | 0° | 1.04 | 1 | none |
| newer | +4° | 0.88 | 0.72 | saturate(0.55) brightness(0.95) |
| far-newer | +8.5° | 0.74 | 0.42 | saturate(0.3) brightness(0.88) |

---

## 작업 4 — 카메라 필름 스트립

### 구조

```
과거  [■][■][■][■][■][■][■][■][■]  현재
        ↑ 오래된 추억          ↑ 최신 추억
```

- 배경: `#111` (암실 필름 색)
- 스프로켓 홀: `::before` (상단) + `::after` (하단) — `repeating-linear-gradient`
- 현재 선택 프레임: 녹색 테두리 + glow (`box-shadow: 0 0 8px rgba(82,183,136,0.4)`)
- 클릭 시 해당 포스트로 직접 이동

### 필름 프레임 크기 변화

| 버전 | 크기 | 필름 영역 높이 |
|------|------|--------------|
| 초기 | 38×38px | ~56px |
| 최종 | 52×52px | 78px |

---

## 작업 5 — 뷰타입별 카드 수 분리

| 뷰타입 | 카드 수 | 이유 |
|--------|---------|------|
| desktop | 5장 (far-past ~ far-newer) | 와이어를 꽉 채워 허전함 제거 |
| mobile | 3장 (past ~ newer) | 좁은 화면에서 overflow 방지 |

```js
// renderEvidenceViewer 내부
${viewType === 'desktop' ? makeSlot(+2, 'far-past') : ''}
${makeSlot(+1, 'past')}
${makeSlot( 0, 'current')}
${makeSlot(-1, 'newer')}
${viewType === 'desktop' ? makeSlot(-2, 'far-newer') : ''}
```

---

## 작업 7 & 8 — 사진 비율 및 카드 크기 변화

| 항목 | 초기 | 최종 |
|------|------|------|
| 사진 비율 | `aspect-ratio: 1` (1:1 정방형) | `aspect-ratio: 4/5` (세로 세장) |
| 카드 너비 | 190px | 210px |
| 카드 내 사진 너비 | 176px | 196px |
| 카드 내 사진 높이 | 176px | 245px |

---

## 관련 파일

| 파일 | 주요 변경 |
|------|----------|
| `02-main/js/desktop.js` | `clothespinSvg` 상수, `renderEvidenceViewer()` 전체 교체, `renderEvidenceViewers()` 필름 스크롤 추가 |
| `02-main/css/desktop.css` | `.cline-*` 전체 CSS 섹션 추가 (빨랫줄, 집게, 폴라로이드, 필름 스트립) |

---

## 다음 작업 예정

없음 (현재 기준) — 추가 피드백에 따라 카드 크기·장 수 조정 가능
