# 개인 GCP 최종 배포 작업 기록 — 2026-07-27

> 작업자: GitHub `@myeongjundev` (Myeongjun Kim)
>
> 학원 최종 커리큘럼의 개인 배포 작업이다. 팀 공용 운영 서버가 아니라 개인 GCP VM과 개인 도메인에 배포했다.
> Docker는 사용하지 않았으며, 비밀번호·OAuth Client Secret·스토리지 키 등 실제 시크릿 값은 이 문서에 기록하지 않는다.

---

## 1. 최종 결과

| 항목 | 결과 |
|---|---|
| 서비스 주소 | `https://clovlabcalss.store` |
| GCP VM | `clov-server` · Ubuntu 24.04 · Java 21 |
| 외부 IP | `34.70.57.137` |
| 프론트 | React/Vite 빌드 → Nginx 정적 배포 |
| 백엔드 | Spring Boot JAR → systemd 서비스 |
| DB | 학원 원격 MySQL `116.122.153.5:3306/st4_clov` |
| HTTP 80 | 외부 `200 OK`, HTTPS로 전환 완료 |
| HTTPS 443 | 외부 `200 OK` |
| 인증서 | Let's Encrypt · 2026-10-25 만료 · 자동 갱신 설정 |
| OAuth2 | Google · Kakao · Naver 실제 로그인 성공 |
| 서버 로컬 MySQL | 배포에 사용하지 않으며 현재 중지 |

최종적으로 프론트 화면, Nginx → Spring 프록시, 원격 DB 연결, HTTPS, OAuth2 로그인까지 실제 환경에서 관통 검증했다.

---

## 2. 이슈·브랜치·릴리스 기준점

- clov-api 이슈: [#72 chore: 개인 최종 배포](https://github.com/Pickeslog/clov-api/issues/72)
  - 라벨: `backend`, `documentation`
- clov-api 브랜치: `chore/personal-final-deploy`
  - 커밋: `9c320ff chore: exclude local secrets from release JAR (#72)`
  - `processResources`에서 실제 `application-secret.yaml`을 제외해 배포 JAR에 시크릿이 포함되지 않도록 했다.
- clov-web 브랜치: `chore/personal-final-web-deploy`
  - 기준 커밋: `4789a5f`
- 양쪽 저장소에 태그 `personal-final-2026-07-27` 생성 및 push 완료.

### 빌드 검증

- clov-api: `clean bootJar` 성공.
- JAR 내용 확인 결과 실제 `application-secret.yaml`은 없고 예시 파일만 포함됐다.
- clov-api 통합 테스트는 Docker/Testcontainers가 없는 환경이라 초기화 단계에서 실패했다.
  - 이번 개인 배포는 Docker 없이 진행하기로 결정했다.
  - 따라서 전체 통합 테스트 미실행 상태는 후속 작업에서 다시 확인해야 한다.
- clov-web: `npm ci`, `npm run lint`, 운영 빌드 성공.
- Vite의 약 625KB JavaScript 청크 경고가 있었지만 이번 배포의 차단 사유는 아니었다.

---

## 3. 배포 구조

```text
브라우저
  └─ https://clovlabcalss.store:443
       └─ Nginx
            ├─ /, /assets/*                → /var/www/clov
            ├─ /api/*                      → Spring Boot 127.0.0.1:8080
            ├─ /oauth2/authorization/*     → Spring Boot 127.0.0.1:8080
            └─ /login/oauth2/*             → Spring Boot 127.0.0.1:8080

Spring Boot
  └─ 학원 원격 MySQL 116.122.153.5:3306/st4_clov
```

VM의 로컬 MySQL은 애플리케이션 DB가 아니다. `student4` 계정으로 학원 원격 DB에 접속하며, 비밀번호는 서버 시크릿 파일에서만 관리한다.

원격 DB 연결 검증:

```text
SELECT DATABASE(), NOW();
→ st4_clov 정상 반환
```

---

## 4. 백엔드 배포

### 서버 배치

- 애플리케이션 디렉터리: `/opt/clov-api`
- 실행 JAR: `/opt/clov-api/clov-api.jar`
  - 약 52MB
  - 소유자 `clov:clov`
  - 권한 `500`
- 외부 시크릿: `/opt/clov-api/application-secret.yaml`
  - JAR 밖에서 관리
  - 소유자 `clov:clov`
  - 권한 `600`
- 환경변수 파일: `/opt/clov-api/clov-api.env`
  - 소유자 `root:clov`
  - 권한 `640`

배포 도메인 관련 환경변수:

```text
APP_CORS_ALLOWED_ORIGINS=https://clovlabcalss.store
APP_OAUTH_REDIRECT_BASE=https://clovlabcalss.store
APP_OAUTH2_REDIRECT_URL=https://clovlabcalss.store/oauth2/redirect
```

### systemd

- 서비스: `/etc/systemd/system/clov-api.service`
- `systemctl enable --now clov-api` 적용 완료.
- VM 재시작 후에도 `clov-api`가 `active`로 복구되는 것을 확인했다.
- 내부 API 검증:

```text
GET http://127.0.0.1:8080/api/v1/rooms
→ HTTP 401
→ {"code":"UNAUTHORIZED","message":"인증이 필요합니다."}
```

인증 없이 보호 API를 호출했기 때문에 이 `401`은 정상 응답이다.

---

## 5. 프론트 배포

운영 빌드 시 API 기준 주소:

```text
VITE_API_BASE_URL=https://clovlabcalss.store/api/v1
```

처음 만든 Windows ZIP은 내부 경로 구분자가 Linux 배포에 적합하지 않았고, 서버에서 압축 해제가 오래 멈췄다. 최종적으로 Linux 호환 tar.gz를 사용했다.

- 최종 산출물: `clov-web-personal-final-2026-07-27.tar.gz`
- 서버 압축 해제 위치: `/home/bubaragi23/clov-dist`
- 운영 정적 파일: `/var/www/clov`
- 최종 용량: 약 7.5MB
- `/var/www/clov/index.html` 존재 확인: `FRONTEND_OK`

프론트 교체 후 Nginx 내부 확인:

```text
GET / → HTTP 200 OK
```

---

## 6. Nginx와 도메인 문제 해결

기존 `/etc/nginx/conf.d/default.conf`에는 아래 두 가지 문제가 있었다.

- 도메인이 `clovlabclass.store`로 등록돼 있었다.
- 정적 파일 경로가 `/usr/share/nginx/html`이었다.

실제 도메인은 철자 순서가 다른 `clovlabcalss.store`다. 설정을 다음 방향으로 수정했다.

- `server_name clovlabcalss.store`
- `root /var/www/clov`
- SPA fallback: `try_files $uri $uri/ /index.html`
- `/api/` → `127.0.0.1:8080`
- `/oauth2/authorization/` → `127.0.0.1:8080`
- `/login/oauth2/` → `127.0.0.1:8080`
- `X-Forwarded-Proto` 등 프록시 헤더 전달

기존 설정은 아래 파일로 백업했다.

```text
/etc/nginx/conf.d/default.conf.bak-20260727
/etc/nginx/conf.d/default.conf.pre-certbot
```

`nginx -t` 성공 후 reload했고, 외부에서 HTTP `200 OK`를 확인했다.

---

## 7. HTTPS와 인증서

설치돼 있던 Certbot 2.9.0과 Nginx 플러그인을 사용했다.

```bash
sudo certbot --nginx -d clovlabcalss.store
```

결과:

- 인증서 발급 성공.
- 인증서 경로: `/etc/letsencrypt/live/clovlabcalss.store/fullchain.pem`
- 키 경로: `/etc/letsencrypt/live/clovlabcalss.store/privkey.pem`
- 만료일: 2026-10-25.
- Certbot이 Nginx HTTPS 설정과 예약 갱신 작업을 적용했다.
- 외부 `https://clovlabcalss.store` → `200 OK` 확인.

자동 갱신 모의 테스트:

```bash
sudo certbot renew --dry-run
```

```text
Congratulations, all simulated renewals succeeded
```

---

## 8. OAuth2 배포 검증

### 공급자 콜백

```text
Google  https://clovlabcalss.store/login/oauth2/code/google
Kakao   https://clovlabcalss.store/login/oauth2/code/kakao
Naver   https://clovlabcalss.store/login/oauth2/code/naver
```

로그인 성공 후 Spring이 일회용 코드를 발급해 프론트로 복귀시키는 주소:

```text
https://clovlabcalss.store/oauth2/redirect
```

### 공급자 설정

- Google
  - 웹 애플리케이션의 승인된 리디렉션 URI에 운영 콜백 추가.
  - 실제 Google 로그인 성공.
- Kakao
  - 카카오 로그인 사용 설정 ON.
  - REST API 키의 리디렉션 URI에 운영 콜백 추가.
  - 닉네임·카카오계정 이메일 동의항목 확인.
  - 실제 Kakao 로그인 성공.
- Naver
  - PC 웹 서비스 URL을 `https://clovlabcalss.store`로 수정.
  - 운영 Callback URL 추가.
  - 이름·이메일 제공 정보 확인.
  - 실제 Naver 로그인 성공.

세 로그인 시작 엔드포인트는 외부 요청에서 모두 `302`를 반환했고, 공급자 동의 → 백엔드 콜백 → 프론트 복귀 → 로그인 완료까지 실제 브라우저에서 검증했다.

---

## 9. SSH 장애와 복구 기록

프론트 파일 복사 도중 브라우저 SSH가 끊긴 뒤 다음 문제가 발생했다.

- IAP 연결: 코드 4003 `failed to connect to backend`.
- IAP 없이 직접 연결: 22번 포트 연결 실패.
- GCP 기본 SSH 방화벽은 `0.0.0.0/0`, TCP 22로 이미 적용된 상태였다.
- VM 자체는 실행 중이었고, 직렬 로그에서 네트워크와 `ssh.service`의 과거 정상 시작 기록을 확인했다.

복구 과정:

1. VM의 직렬 포트 연결을 허용했다.
2. 직렬 콘솔 연결에 성공했으나 GCP Ubuntu 계정은 로컬 비밀번호가 없어 로그인할 수 없었다.
3. GCP 시작 스크립트로 임시 복구 계정과 SSH 재시작 절차를 준비했다.
4. 메타데이터 저장 중 `Supplied fingerprint does not match current metadata fingerprint` 오류가 발생했다.
5. 오래된 수정 탭을 닫고 VM 목록을 새로고침한 뒤 다시 저장해 해결했다.
6. 최종적으로 VM 중지 → 시작 후 브라우저 SSH가 정상 복구됐다.
7. 복구 후 임시 계정 제거를 시도하고 배포 작업을 이어갔다.

주의:

- GCP VM의 시작 스크립트에 임시 비밀번호가 남아 있지 않은지 반드시 재확인한다.
- SSH 장애 때 VM을 여러 번 재설정하지 말고, 방화벽 → 직렬 로그 → 직렬 콘솔 순서로 진단한다.
- VM 중지·시작은 임시 외부 IP를 바꿀 수 있으므로 재시작 후 IP를 확인한다. 이번에는 `34.70.57.137`이 유지됐다.

---

## 10. 기타 시행착오와 판단

### `gcp-test`와 실제 프로젝트 구분

처음 참고한 `gcp-test-1.0.jar`는 단순 Spring 상태 확인용 연습 프로젝트였다. 최종 배포 대상은 `C:\gov\project\clov-api`이며, 실제 서비스 JAR과 시크릿도 모두 clov-api 기준으로 정리했다.

### 로컬 MySQL과 학원 DB 구분

VM 안의 MySQL에는 서비스 DB가 없었다. 실제 사용 대상은 학원 서버의 `st4_clov`이므로 VM 로컬 DB를 새로 만들지 않았다. 배포 완료 후 로컬 MySQL은 중지했고 `clov-api`가 계속 `active`인 것을 확인했다.

### 명령어 입력 주의

- SQL을 명령행에서 바로 실행하려면 `mysql -u ... -p -e "SHOW DATABASES;"`처럼 `-e`가 필요하다.
- 브라우저 SSH에 여러 줄을 붙여 넣으면 화면의 명령이 섞여 보일 수 있으므로 마지막 성공·오류 메시지로 판단한다.
- `apt install`과 Windows ZIP 해제가 오래 멈춘 경험 때문에, 프론트 배포 산출물은 tar.gz로 통일하는 편이 안정적이다.

---

## 11. 유지보수 배포 방법

초기 설정을 반복하지 않는다. 도메인·Nginx·HTTPS·OAuth 콜백은 주소가 바뀌지 않는 한 유지된다.

### 공통 흐름

1. 이슈 생성.
2. 기능별 브랜치에서 수정.
3. 테스트 후 PR로 `main` 반영.
4. 최신 `main`에서 운영 빌드.
5. 서버의 현재 산출물 백업.
6. 새 산출물 업로드·교체.
7. 백엔드만 systemd 재시작.
8. HTTPS, 로그인, 주요 API smoke test.
9. 문제 발생 시 백업본으로 롤백.

### 백엔드

```text
./gradlew.bat clean bootJar
→ 새 JAR 업로드
→ /opt/clov-api/clov-api.jar 백업·교체
→ sudo systemctl restart clov-api
→ active 및 보호 API 401 확인
```

### 프론트

```text
VITE_API_BASE_URL=https://clovlabcalss.store/api/v1
→ npm ci
→ npm run build
→ dist를 tar.gz로 업로드
→ /var/www/clov 교체
→ 브라우저 Ctrl+F5 및 주요 화면 확인
```

DB 스키마가 변경되는 배포만 별도 SQL 마이그레이션, 데이터 백업, 롤백 계획이 필요하다.

---

## 12. 완료 및 남은 확인

### 완료

- [x] 개인 배포 이슈·브랜치 생성
- [x] 실제 시크릿이 없는 백엔드 JAR 빌드
- [x] 프론트 운영 빌드
- [x] 학원 원격 DB 연결 검증
- [x] systemd 백엔드 자동 시작
- [x] Nginx SPA·API·OAuth 프록시
- [x] 외부 HTTP 80 확인
- [x] HTTPS 443 및 자동 갱신 검증
- [x] Google 로그인
- [x] Kakao 로그인
- [x] Naver 로그인
- [x] VM 로컬 MySQL 중지

### 후속 확인

- [ ] GCP VM 메타데이터의 임시 시작 스크립트가 완전히 제거됐는지 재확인
- [ ] 로컬 MySQL을 재부팅 후에도 사용하지 않으면 `sudo systemctl disable mysql`
- [ ] Docker 가능한 환경에서 clov-api 전체 통합 테스트 재실행
- [ ] OAuth 앱이 테스트 상태라면 시연 계정을 테스트 사용자/앱 멤버로 등록
- [ ] Vite 대형 청크 경고는 성능 개선 작업에서 별도 검토

---

## 13. 오늘의 핵심 교훈

- 개인 배포라도 팀 저장소에서는 이슈·브랜치·검증 기준점을 남겨야 되돌리기 쉽다.
- 시크릿은 소스와 JAR이 아니라 서버 외부 파일에서 관리해야 한다.
- `401 인증 필요`는 보호 API의 정상 smoke test가 될 수 있다.
- OAuth는 코드만 맞는다고 끝나지 않는다. HTTPS와 공급자별 콜백 URI의 완전 일치가 필수다.
- 로컬 DB와 실제 원격 DB를 먼저 구분해야 불필요한 DB 생성·이관 작업을 피할 수 있다.
- 배포는 빌드보다 운영 환경의 DNS, 방화벽, 권한, 서비스 자동 시작, 롤백 준비가 더 중요하다.
- 큰 장애가 나도 VM 재생성부터 하지 말고, 로그와 복구 경로를 이용하면 기존 배포 파일을 보존할 수 있다.
