# login.html — 로그인 (signin 폴더 버전)

## 개요

Clov 로그인 화면이다. 회원가입 페이지와 레이아웃을 의도적으로 차별화한 2패널 분할 구조다.  
Outfit 폰트와 glassmorphism 스타일을 사용한다.

---

## 화면 구성 (2열 그리드)

`grid-template-columns: minmax(310px, .92fr) minmax(360px, 1fr)`  
전체 크기: `min(980px, 100%)`, 최소 높이 `640px`

### 왼쪽 패널 (memory-panel)

- 배경: 진한 초록색 (`--forest: #073b24`)
- `🍀 Clov.` 브랜드 로고
- `오늘도 추억 보관 중` 배지
- 친구와의 추억을 강조하는 서비스 소개 문구
- 더미 추억 카드 (감성적 맥락 제공)

### 오른쪽 패널 (form-panel)

- 이메일 입력
- 비밀번호 입력 (보기/숨기기 토글)
- 로그인 유지 체크박스 (체크 시 초록 텍스트 변경)
- 비밀번호 찾기 버튼 (현재: 추후 API 연동 예정 안내)
- 로그인 버튼
- 소셜 로그인 (구글 · 카카오) — 아이콘 원형 버튼

---

## CSS 변수

```css
--forest: #073b24    /* 진한 숲 초록 */
--leaf:   #16874b    /* 잎 초록 */
--mint:   #50d990    /* 민트 */
--cream:  #f7fbf6    /* 크림 배경 */
--warn:   #b45309    /* 경고 (노란 계열) */
```

---

## 입력 검증

- 이메일 형식 오류 → 해당 input 흔들림 애니메이션
- 비밀번호 공란 → 해당 input 흔들림 애니메이션
- 정상 입력 → 예시 완료 메시지 (실제 API 미연동)

---

## 비밀번호 보기/숨기기

- 눈 아이콘 클릭 → `input[type]` 전환 (`password` ↔ `text`)
- 보임 상태: `조심하세요! 비밀번호가 보여요!` 표시

---

## 배경

- `radial-gradient` 3개 + `linear-gradient` 복합 배경
- glassmorphism 카드: `backdrop-filter: blur(22px) saturate(150%)`
- 진입 애니메이션: `rise` (`translateY + scale 0.98 → 1, 650ms`)

---

## 폰트

`Outfit` (Google Fonts, 300–900 웨이트)

---

## main/login.html과의 관계

| 구분 | signin/login.html | main/login.html |
|---|---|---|
| 폰트 | Outfit | Outfit |
| 레이아웃 | 2열 (memory-panel + form-panel) | 2열 동일 |
| CSS 변수 | `--forest`, `--leaf`, `--mint` 등 | `--primary-green`, `--accent-green` 등 |
| 배경 | radial + linear 복합 | 단순 |
| 용도 | signin 폴더 작업본 | main 폴더 최신본 |

---

## 페이지 이동

- 하단 `회원가입` 링크 → `signup.html`
- 로그인 성공 → `index.html` 또는 `main/index.html`

---

## 관련 파일

- [signup/signup.html](../signup/signup.html) — 회원가입 페이지
- [main/login.html](../main/login.html) — 최신 버전
