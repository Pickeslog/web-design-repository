# signup.html — 회원가입 (profile 폴더 버전)

## 개요

Clov 회원가입 화면이다. Glassmorphism 카드 UI와 Outfit 폰트를 사용하며, 4단계 step 구조로 구성되어 있다.  
`signup/signup.html`과 동일한 소스 기반이며, profile 폴더에 배치된 작업본이다.

---

## 화면 구조

- 배경: `linear-gradient` + 3개 `orb` (blur 80px, 드리프트 애니메이션)
- 중앙 카드: `glassmorphism` (`backdrop-filter: blur(24px) saturate(160%)`, `border-radius: 28px`)
- 진입 애니메이션: `slideUp` (`translateY 36px → 0, scale 0.97 → 1, 700ms`)

---

## 4단계 회원가입 플로우

| 단계 | 내용 |
|---|---|
| Step 1 | 기본 정보 입력 (이메일 · 전화번호 · 비밀번호) |
| Step 2 | 약관 동의 (전체 / 필수 2개 / 선택 1개) |
| Step 3 | 프로필 설정 (이미지 · 닉네임 · 생년월일) |
| Step 4 | 가입 완료 (축하 메시지 + 입장 버튼) |

상단 step bar: active / done 상태 시각적 구분

---

## 입력 검증

| 항목 | 검증 |
|---|---|
| 이메일 | 이메일 형식 (`example@email.com`) |
| 전화번호 | `010-XXXX-XXXX` 자동 변환 (`01012345678` → `010-1234-5678`) |
| 비밀번호 | 8자 이상 |
| 닉네임 | 한글·영문·숫자 1~12자 |

경고 문구 표시 규칙:
- input 빈 값으로 이동 → 경고 없음
- 잘못된 값 작성 후 이동 → 경고 표시
- 다음 단계 버튼 클릭 시 필수값 비어 있으면 → 경고 표시

---

## 비밀번호 기능

- 눈 아이콘으로 보기/숨기기 토글
- 보임 상태: `조심하세요! 비밀번호가 보여요!` 문구 표시
- 강도 표시 bar (4 segment): 8자 이상 / 12자 이상 / 대문자 or 숫자 / 특수문자

---

## 프로필 설정 단계 (Step 3)

- 원형 이미지 미리보기 (선택 즉시 반영)
- 닉네임 입력 후 🎂 버튼 클릭 → 카드 180도 회전으로 생년월일 카드 전환
- 생년월일: 클릭 시 년/월/일 선택 모달 → `YYYY-MM-DD` 형식 반영

---

## 이스터에그

- 클로버 로고 클릭 → 랜덤 메시지 캡슐 팝업
- 10% 확률 희귀 이벤트: 카드 자체가 반으로 갈라지는 애니메이션 (`cracking` 클래스)
  - `::before` / `::after` 가상 요소로 카드 양쪽 조각 연출

---

## OAuth2 UI

- 카카오 · 네이버 · 구글 소셜 버튼 (원형 아이콘)
- hover 시 provider 라벨 표시 (`title` 속성 미사용)

---

## 폰트

`Outfit` (Google Fonts, 300–900 웨이트)

---

## 관련 파일

- [login.html](../signin/login.html) — 로그인 페이지 (이동 연결)
- [signup/signup.html](../signup/signup.html) — 동일 소스 다른 위치 버전
