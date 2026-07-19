# 🍀 Clov — 소셜 로그인(OAuth) 설정 체크리스트

> 카카오·네이버·구글 개발자 콘솔이 **제대로 등록됐는지 확인**하기 위한 문서.
> 계약 근거: [`API-CONTRACT.md`](API-CONTRACT.md) §4 인증 · DB: [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md) `users.oauth_provider`/`oauth_subject`
> 작성: 2026-07-20 · 상태: **콘솔 확인 전 / 백엔드 설정 미작성**

---

## 0. 지금 백엔드 상태 (확인 결과)

`clov-api`를 전수 검색한 결과 **OAuth 설정이 하나도 없습니다.**

| 항목 | 상태 |
|---|---|
| `spring.security.oauth2.client.registration.*` | ❌ 없음 (kakao/naver/google 문자열 자체가 레포에 0건) |
| `application-secret.yaml` | ⚠️ **0바이트 (빈 파일)** — DB 접속 정보도 없음 |
| `application-secret.example.yaml` | ⚠️ **0바이트** — 팀원이 복사해도 빈 파일이 나옴 |
| `app.oauth2.redirect-url` | ✅ 있음 (`http://localhost:5173/oauth2/redirect`) — 단, 아래 §1 주의 |
| `spring-boot-starter-security-oauth2-client` | ✅ `build.gradle`에 있음 |
| jjwt (계약이 요구하는 `0.12.x`) | ❌ 의존성 누락 |

> ⚠️ **`docs/DB-SETUP.md`가 안내하는 "example 복사해서 값 3개 채우기"가 현재 불가능합니다.** example이 빈 파일이라 복사해도 채울 틀이 없습니다. OAuth보다 이게 먼저 막힙니다.

---

## 1. ⭐ 가장 많이 틀리는 지점 — Redirect가 **두 개**다

이 둘은 **완전히 다른 값**인데 이름이 비슷해서 섞어 쓰는 사고가 잦습니다.

```
① 콘솔에 등록하는 Redirect URI  → 백엔드(8080)를 가리킨다
   http://localhost:8080/login/oauth2/code/kakao
   ─ 소셜 서버가 "인가 코드"를 들고 돌아오는 주소
   ─ Spring Security가 자동으로 이 경로를 만든다 (직접 컨트롤러 안 만듦)
   ─ 형식: {백엔드주소}/login/oauth2/code/{registrationId}

② application.yaml의 app.oauth2.redirect-url → 프론트(5173)를 가리킨다
   http://localhost:5173/oauth2/redirect
   ─ 백엔드가 JWT를 발급한 뒤, 그 토큰을 들고 프론트로 되돌려보내는 주소
   ─ 우리가 직접 만드는 값 (Spring 표준 아님)
```

**콘솔에 ②를 등록하면 로그인이 반드시 깨집니다.** 콘솔에는 무조건 ①(8080)을 넣습니다.

> `clov-api`에 `server.port` 설정이 없으므로 백엔드 포트는 **기본값 8080**입니다.

---

## 2. 카카오 — https://developers.kakao.com

| # | 확인 항목 | 어디서 | 통과 기준 |
|---|---|---|---|
| 1 | 앱이 생성돼 있는가 | 내 애플리케이션 | 앱 1개 존재 |
| 2 | **REST API 키** 확보 | 앱 설정 → 앱 키 | 이 값이 `client-id`. (JavaScript 키·Native 키 아님 ⚠️) |
| 3 | 카카오 로그인 **활성화 ON** | 제품 설정 → 카카오 로그인 | OFF면 시작조차 안 됨 |
| 4 | **Redirect URI 등록** | 카카오 로그인 → Redirect URI | `http://localhost:8080/login/oauth2/code/kakao` |
| 5 | Client Secret | 카카오 로그인 → 보안 | 코드 발급 후 **활성화 상태 ON**. 켰으면 Spring 설정에도 반드시 넣어야 함 |
| 6 | **동의항목** | 카카오 로그인 → 동의항목 | 닉네임·프로필 사진 = 필수동의 / 카카오계정(이메일) = 필수 또는 선택 |
| 7 | 플랫폼 등록 | 앱 설정 → 플랫폼 → Web | 사이트 도메인에 `http://localhost:8080` |
| 8 | 팀원 접근 | 앱 설정 → 팀 관리 | 팀원 계정을 팀에 추가(안 하면 본인만 테스트 가능) |

> ⚠️ **이메일은 함정입니다.** 카카오는 이메일 동의항목이 기본 잠금이라, 개인 앱에서는 "비즈니스 채널 연결" 또는 검수가 필요할 수 있습니다. 우리 DB `users.email`은 `NOT NULL`이므로 **이메일을 못 받으면 소셜 가입 자체가 막힙니다.** 이 항목을 제일 먼저 확인하세요.

**Spring 설정에 필요한 값**: `client-id`(REST API 키) · `client-secret` · `user-name-attribute: id`
엔드포인트(provider 블록 직접 작성 필요): `kauth.kakao.com/oauth/authorize` · `kauth.kakao.com/oauth/token` · `kapi.kakao.com/v2/user/me`

---

## 3. 네이버 — https://developers.naver.com

| # | 확인 항목 | 어디서 | 통과 기준 |
|---|---|---|---|
| 1 | 애플리케이션 등록 | Application → 내 애플리케이션 | 앱 1개 존재 |
| 2 | **사용 API = 네이버 로그인** | 앱 설정 → API 설정 | 다른 API로 등록했으면 로그인 안 됨 |
| 3 | **제공 정보 선택** | API 설정 → 제공 정보 | 이메일 주소 · 별명 · 프로필 사진 체크 |
| 4 | 환경 = PC웹 | API 설정 → 로그인 오픈 API 서비스 환경 | PC웹 추가 |
| 5 | 서비스 URL | 같은 화면 | `http://localhost:8080` |
| 6 | **Callback URL** | 같은 화면 | `http://localhost:8080/login/oauth2/code/naver` |
| 7 | Client ID / Secret 확보 | 앱 설정 → 개요 | 두 값 모두 |

> 네이버는 **검수 전에도 개발자 본인 계정으로는 로그인이 됩니다.** 팀원 계정으로 테스트하려면 멤버 등록이 필요합니다.

**Spring 설정**: `user-name-attribute: response` (⚠️ 네이버는 응답이 `response` 객체로 한 겹 감싸져 있어 파싱 코드가 따로 필요)
엔드포인트: `nid.naver.com/oauth2.0/authorize` · `nid.naver.com/oauth2.0/token` · `openapi.naver.com/v1/nid/me`

---

## 4. 구글 — https://console.cloud.google.com

| # | 확인 항목 | 어디서 | 통과 기준 |
|---|---|---|---|
| 1 | 프로젝트 생성 | 상단 프로젝트 선택기 | Clov용 프로젝트 존재 |
| 2 | **OAuth 동의 화면 구성** | API 및 서비스 → OAuth 동의 화면 | User Type = 외부, 앱 이름·지원 이메일 입력 완료 |
| 3 | 범위(scope) | 동의 화면 → 범위 | `email` · `profile` · `openid` |
| 4 | ⭐ **테스트 사용자 등록** | 동의 화면 → 대상/테스트 사용자 | 게시 상태가 "테스트"면 **여기 등록된 계정만 로그인 가능**. 팀원 4명 구글 계정 전부 추가 |
| 5 | OAuth 클라이언트 ID 생성 | 사용자 인증 정보 → 사용자 인증 정보 만들기 | 유형 = **웹 애플리케이션** |
| 6 | **승인된 리디렉션 URI** | 위 클라이언트 상세 | `http://localhost:8080/login/oauth2/code/google` |
| 7 | 승인된 JavaScript 원본 | 위 클라이언트 상세 | `http://localhost:5173` (프론트) |
| 8 | Client ID / Secret 확보 | 클라이언트 생성 직후 | 두 값 모두 |

> ⚠️ 4번을 빼먹으면 팀원이 로그인할 때 `403: access_denied`가 뜹니다. **구글에서 제일 흔한 사고입니다.**

**Spring 설정**: 구글은 Spring Security에 **내장(CommonOAuth2Provider)** 이라 provider 블록 없이 `client-id`/`client-secret`만 넣으면 됩니다. 셋 중 가장 간단합니다. `user-name-attribute`는 `sub`.

---

## 5. 세 콘솔 공통 — 값 회수표

콘솔 확인이 끝나면 아래 6개 값이 손에 있어야 합니다. **이 값들은 `application-secret.yaml`에만 넣고, 절대 깃에 올리지 않습니다.**

| provider | client-id | client-secret |
|---|---|---|
| kakao | REST API 키 | 보안 탭에서 생성한 값 |
| naver | Client ID | Client Secret |
| google | `...apps.googleusercontent.com` | `GOCSPX-...` |

`users` 테이블 매핑 (계약 확정 사항):
- `oauth_provider` ← `kakao` / `naver` / `google`
- `oauth_subject` ← 각 provider의 고유 식별자(카카오 `id`, 네이버 `response.id`, 구글 `sub`)
- `password` ← 소셜 전용 계정은 **NULL**

---

## 6. 확인 방법 (설정을 넣은 뒤)

```
1. ./gradlew bootRun
2. 브라우저에서 http://localhost:8080/oauth2/authorization/kakao 접속
   → 카카오 로그인 화면이 뜨면 client-id·활성화 OK
   → 로그인 후 백엔드로 돌아오면 Redirect URI OK
3. naver / google 도 같은 방식으로 각각 확인
```

### 오류 메시지로 원인 찾기

| 증상 | 원인 |
|---|---|
| `redirect_uri_mismatch` / KOE006 | 콘솔의 Redirect URI가 `:8080/login/oauth2/code/{provider}`와 **글자 하나라도** 다름 (http/https, 끝 슬래시 포함) |
| 구글 `403 access_denied` | §4-4 테스트 사용자 미등록 |
| `invalid_client` | client-secret 불일치. 카카오는 **콘솔에서 켰는데 설정에 안 넣은** 경우가 대부분 |
| 로그인은 되는데 이메일이 null | 동의항목/제공정보 미설정 → `users.email`이 NOT NULL이라 저장 실패 |
| 401이 계속 뜸 | OAuth가 아니라 JWT 문제. jjwt 의존성 누락(§0) 확인 |

---

## 7. 다음 할 일 (이 체크리스트 통과 후)

- [ ] 콘솔 3사 확인 — **사람이 직접** (이 문서 §2~§4)
- [ ] `application-secret.example.yaml` 골격 작성 (DB + JWT + OAuth 3사 키) ← 지금 0바이트
- [ ] `application.yaml`에 kakao/naver provider 블록 + registration 3개 추가
- [ ] `build.gradle`에 jjwt 0.12.x 추가
- [ ] `docs/DB-SETUP.md` 안내와 실제 파일 상태 일치시키기

> 이 문서는 확인용 체크리스트입니다. 설정 파일을 실제로 채우는 작업은 별도로 진행합니다.
> 나중에 `clov-api/docs/`로 옮기는 것이 SSOT 원칙에 맞습니다(설명은 대상 옆에 둔다 — `DB-SETUP.md` 참고).
