# profile_edit.html — 개인정보 수정

**최종 수정**: 2026-07-01  
**담당 파트**: `08-profile/`

---

## 화면 개요

프로필 아바타, 닉네임, 이메일, 비밀번호, 상태 메시지를 수정하는 독립 페이지.  
`02-main/index.html` 프로필 드롭다운 → `개인정보 수정` 클릭 시 진입.

> **참고**: `index.html` 내부에는 Discord 형식의 `openProfileSettingsModal()` 모달도 있다.  
> 이 파일은 모달이 아닌 별도 페이지가 필요한 경우 사용한다.

---

## 화면 구성

| 섹션 | 내용 |
|---|---|
| 아바타 섹션 | 88px 원형 아바타 (그라디언트 배경), 하단 📷 편집 배지 |
| 기본 정보 카드 | 닉네임, 이메일, 상태 메시지 입력 폼 |
| 비밀번호 변경 카드 | 현재 비밀번호 / 새 비밀번호 / 확인 입력 |
| 계정 관리 카드 | 로그아웃 / 계정 탈퇴 (danger 색상) |

---

## 폼 동작

- 읽기 전용 필드(`readonly`)는 직접 편집 불가
- 저장 버튼 → 유효성 검사 → 1.2초 후 `goBack()` (index.html 복귀)
- 저장 데이터: `localStorage` (`clov_profile_nickname`, `clov_temp_email` 등)

---

## 계정 관리

| 동작 | 처리 |
|---|---|
| 로그아웃 | `../02-main/index.html` 복귀 (데모 계정 데이터 유지) |
| 계정 탈퇴 | `confirm()` 후 프로필 관련 localStorage 키 삭제 → 1.5초 후 `../01-auth/login.html` 이동 |

> `localStorage.clear()` 사용 금지 — 임시 로그인 계정 데이터까지 삭제될 수 있음.

---

## 다크모드

URL 파라미터 `?theme=dark|light` 우선 적용, 없으면 `localStorage` 폴백.

---

## 폰트

`Inter` (Google Fonts)

---

## 페이지 이동

| 동작 | 이동 대상 |
|---|---|
| ← 뒤로 / 저장 후 | `../02-main/index.html?theme=...` |
| 계정 탈퇴 완료 | `../01-auth/login.html` |

---

## 관련 파일

- [02-main/index.html](../02-main/index.html) — 프로필 드롭다운에서 진입
- [01-auth/login.html](../01-auth/login.html) — 계정 탈퇴 후 이동
