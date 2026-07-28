# 도커 배포와 HTTPS 인증서 — 2026-07-28 실습 정리

> Clov 운영 서버(`clovlabcalss.store`)를 호스트 nginx 방식에서 **Docker 컨테이너**로 옮기면서 배운 것을 정리한다.
> 실제로 겪은 오류와 그 오류가 알려주는 개념을 함께 적었다. **인증서(§3)가 가장 분량이 많다.**
> 사고 경위와 복구 기록은 `work-logs/2026-07-28-핸드오프.md` §11~§14 참고.

---

## 큰 그림 — 무엇이 바뀌었나

**이전 (bare-metal)**

```
빌드 산출물(dist)을 서버에 직접 복사 → /var/www/clov
호스트에 설치된 nginx가 서빙
백엔드 JAR을 systemd 서비스로 실행
```

**이후 (컨테이너)**

```
Dockerfile로 이미지를 만든다 → Docker Hub에 push
서버에서 pull 받아 컨테이너로 실행
docker-compose로 여러 컨테이너를 한 번에 관리
```

핵심 차이는 **"환경까지 통째로 포장한다"** 는 점이다. 예전엔 서버에 Node·nginx·Java를 각각 설치해야 했지만, 이미지 안에 다 들어 있으니 `docker run` 한 줄로 끝난다.

---

## 1. Dockerfile — 이미지 만들기

### 1-1. 멀티스테이지 빌드

```dockerfile
FROM node:20 AS builder     # 1단계: 빌드용
...
RUN npm run build

FROM nginx:alpine           # 2단계: 실행용
COPY --from=builder /app/dist /usr/share/nginx/html
```

**왜 나누나?** 빌드에는 Node·npm·소스코드가 필요하지만 **실행에는 결과물만 있으면 된다.** 1단계를 통째로 버리고 결과물만 가져오면 이미지가 훨씬 작아진다.

백엔드에서 실행 스테이지를 `21-jdk` → `21-jre`로 바꾸니 **824MB → 557MB**로 줄었다. JDK는 컴파일 도구까지 포함하지만 실행에는 JRE만 있으면 되기 때문이다.

### 1-2. 레이어 캐싱 — 복사 순서가 중요하다

```dockerfile
COPY package*.json ./
RUN npm install          # 여기까지가 하나의 레이어

COPY . .                 # 소스는 나중에
RUN npm run build
```

**의존성 파일을 소스보다 먼저 복사한다.** 소스만 바뀌면 `npm install` 레이어는 캐시가 재사용돼 빌드가 몇 배 빨라진다. 순서를 바꾸면 소스 한 줄만 고쳐도 매번 의존성을 새로 받는다.

### 1-3. `.dockerignore`

없으면 `COPY . .`가 `node_modules`(106MB)·`.git`(12MB)까지 전부 올린다. 만들고 나니 **빌드 컨텍스트 130MB → 6.2MB**.

> ⚠️ **`.env*`를 통째로 제외하면 안 된다.** Vite는 빌드 시점에 `.env.production`을 읽어 API 주소를 굽는다. 컨텍스트에서 빠지면 개발 기본값(`localhost:8080`)이 운영 번들에 박힌다.

### 1-4. 문법 함정 2개

| 문제 | 설명 |
|---|---|
| `AS builder` 누락 | `COPY --from=builder`가 참조할 이름이 없어 빌드 실패 |
| `ENTRYPOINT ["java","-Dspring.profiles.active=${PROFILE}",...]` | **exec 형식(JSON 배열)은 셸을 안 거쳐 변수가 치환되지 않는다.** `ARG`는 런타임에 존재하지도 않는다 |

두 번째는 결말이 흥미롭다. `-e PROFILE=prod`를 주면 **Spring이 `${PROFILE}`을 프로퍼티 플레이스홀더로 보고 환경변수에서 다시 해석**해 결국 동작한다. Docker는 치환하지 않았지만 Spring이 해준 것이다.

권장 형태는 `ENV`를 거치는 쪽이다. 빠뜨렸을 때 조용히 기본값으로 뜨기 때문이다.

```dockerfile
ARG PROFILE=prod
ENV SPRING_PROFILES_ACTIVE=${PROFILE}
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

---

## 2. docker-compose — 여러 컨테이너 묶기

```yaml
services:
  web:      # nginx + 프론트
  certbot:  # 인증서 자동 갱신

volumes:
  certbot-etc:   # 인증서 저장소
  certbot-var:   # ACME 챌린지 파일
```

### 2-1. 볼륨을 쓰는 이유

**컨테이너는 지우면 안의 데이터가 같이 사라진다.** 인증서가 컨테이너 안에만 있으면 재시작할 때마다 날아간다. 볼륨은 컨테이너 바깥에 저장되므로 살아남는다.

두 컨테이너가 **같은 볼륨을 공유**하는 게 핵심이다. certbot이 발급한 인증서를 nginx가 읽어야 한다.

### 2-2. `extra_hosts` — 컨테이너에서 호스트로 나가기

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

**컨테이너 안의 `127.0.0.1`은 컨테이너 자기 자신이다.** 호스트가 아니다.

백엔드는 호스트에서 systemd로 도는데, nginx가 `proxy_pass http://127.0.0.1:8080`을 쓰면 컨테이너 안에서 8080을 찾다 실패한다. `host.docker.internal`이 "나를 실행 중인 호스트"를 가리키는 특별한 이름이다.

**확인법**: `/api/v1/rooms`가 **401**을 주면 성공이다(인증 요구 = 백엔드까지 도달). HTML이 돌아오면 프록시가 없는 것이다.

---

## 3. ★ HTTPS 인증서

### 3-1. 인증서가 왜 필요한가

HTTPS는 두 가지를 한다.

1. **암호화** — 오가는 데이터를 남이 못 읽게
2. **신원 증명** — "이 서버가 진짜 그 도메인이 맞다"

암호화만이면 자체 서명 인증서로도 된다. 문제는 2번이다. 아무나 "나 네이버야"라고 주장할 수 있으면 의미가 없다.

그래서 **CA(인증기관)** 라는 신뢰받는 제3자가 "이 서버 주인이 맞다"고 서명해 준다. 브라우저는 CA 목록을 미리 갖고 있어서, 그 CA가 서명한 인증서면 자물쇠를 띄운다.

**Let's Encrypt**는 이걸 무료·자동으로 해주는 CA다.

### 3-2. 도메인 소유를 어떻게 증명하나 — ACME / HTTP-01

```
1. certbot          "clovlabcalss.store 인증서 주세요"
2. Let's Encrypt    "그럼 이 토큰을
                     http://clovlabcalss.store/.well-known/acme-challenge/<토큰>
                     에 올려놔 봐"
3. certbot          그 경로에 파일을 만든다
4. Let's Encrypt    인터넷에서 그 주소로 접속해 확인
5. 확인되면 발급
```

**"그 도메인의 웹서버에 파일을 놓을 수 있다 = 그 도메인의 주인이다"** 라는 논리다.

여기서 두 조건이 따라온다.

- **포트 80이 인터넷에 열려 있어야 한다** — Let's Encrypt가 밖에서 접속한다
- **DNS가 이 서버를 가리켜야 한다**

> 이번에 `www.clovlabcalss.store`를 뺀 이유가 두 번째다. DNS가 서버를 가리키지 않아(`168.126.63.1` = 통신사 DNS 폴백) 검증이 실패했을 것이다. **도메인을 여러 개 넣으면 하나만 실패해도 전체 발급이 중단된다.**

nginx에서 4번을 받아주는 자리:

```nginx
location /.well-known/acme-challenge/ {
    root /var/www/certbot;
}
```

certbot이 파일을 쓰는 곳(`-w /var/www/certbot`)과 nginx가 읽는 곳이 **같은 볼륨**이라 맞물린다. 이 방식을 **webroot**라 한다.

### 3-3. 닭과 달걀 문제 — 스크립트 순서의 이유

```
nginx는 SSL 설정을 읽으려면 → 인증서 파일이 있어야 뜬다
인증서를 받으려면          → nginx가 챌린지를 서빙해야 한다
```

`init-letsencrypt.sh`가 푸는 방식:

| 단계 | 하는 일 | 왜 |
|---|---|---|
| 1 | **임시(dummy) 자체서명 인증서 생성** | nginx가 일단 뜨게. 가짜지만 파일 형식은 맞다 |
| 2 | **web 컨테이너 기동** | 이제 챌린지를 서빙할 수 있다 |
| 3 | **임시 인증서 삭제** | 진짜와 섞이면 안 된다 |
| 4 | **Let's Encrypt에 진짜 요청** | nginx가 살아 있으니 검증 통과 |
| 5 | **nginx 재로드** | 새 인증서를 읽어들인다 |

3번에서 파일을 지워도 nginx가 안 죽는 이유는 **이미 메모리에 읽어둔 상태**라 계속 서비스하기 때문이다. 5번의 reload가 새 파일을 다시 읽는다.

스크립트에 `set -e`를 넣어 중간 실패 시 즉시 멈추게 했다. 덕분에 2단계에서 두 번 멈췄을 때 **인증서 요청까지 가지 않아 발급 한도를 쓰지 않았다.**

### 3-4. staging — 연습용 발급

```bash
staging=1   →   certbot --staging
```

Let's Encrypt에는 **테스트 서버**가 따로 있다. 여기서 받은 인증서는

- 브라우저가 신뢰하지 **않는다**(경고가 뜬다)
- 대신 **발급 한도를 소모하지 않는다**

**연습은 반드시 staging으로.** 실제 발급은 한도가 있어서, 설정을 틀린 채 몇 번 시도하면 일주일간 막힌다.

순서는 **staging으로 전체 흐름 검증 → `staging=0`으로 진짜 발급**이 맞다.

#### HSTS 때문에 staging은 브라우저로 못 본다

```
NET::ERR_CERT_AUTHORITY_INVALID
웹사이트에서 HSTS를 사용하므로 지금은 방문할 수 없습니다.
```

**HSTS**(HTTP Strict Transport Security)는 "이 사이트는 앞으로 무조건 HTTPS로만 접속하라"를 브라우저에 기억시키는 기능이다. 한번 기억하면 **인증서가 이상할 때 "그래도 계속 진행" 옵션 자체를 없앤다.**

보안상 옳은 동작이지만 연습 중엔 화면을 못 본다. **확인은 `curl`로 하고, 눈으로 볼 단계면 진짜 인증서로 넘어간다.**

> 굳이 뚫으려면 경고 페이지에서 `thisisunsafe`를 타이핑한다. 입력창은 없고 그냥 치면 된다.

### 3-5. 진짜인지 판별하는 법

```bash
curl -k https://도메인/    # -k = 인증서 검증 생략
curl    https://도메인/    # 브라우저와 같은 조건
```

- `-k`로만 200 → **staging**(브라우저는 거부)
- `-k` 없이 200 → **진짜 인증서**

### 3-6. 인증서 파일 구조

```
/etc/letsencrypt/
├── live/<도메인>/
│   ├── fullchain.pem    ← nginx의 ssl_certificate
│   └── privkey.pem      ← nginx의 ssl_certificate_key
├── archive/             ← 실제 파일들(버전별로 쌓임)
└── renewal/             ← 갱신 설정
```

- **`fullchain.pem`** = 내 서버 인증서 + 중간 인증서. 브라우저가 신뢰 사슬을 따라가려면 중간 것도 필요하다
- **`privkey.pem`** = 개인키. **절대 외부에 노출되면 안 된다**
- `live/`는 `archive/`를 가리키는 심볼릭 링크다. 갱신돼도 nginx 설정은 그대로 두면 되는 이유다

### 3-7. 갱신 — 90일마다

Let's Encrypt 인증서는 **90일** 유효하다. 짧은 이유는 자동 갱신을 전제로 설계됐기 때문이다.

```yaml
entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

12시간마다 `certbot renew`를 돌린다. `renew`는 **만료가 30일 이내로 다가온 인증서만** 실제로 갱신하고 아니면 넘어간다. 그래서 자주 돌려도 안전하다.

> `docker compose up -d`를 **서비스 이름 없이** 해야 `web`과 `certbot`이 둘 다 뜬다. `up -d web`만 하면 갱신 루프가 안 돈다.

### 3-8. 발급 한도

| 한도 | 내용 |
|---|---|
| 같은 도메인 조합 | **주당 5회** |
| 실패한 검증 | 시간당 5회 |

백업해 두면 실습 중 날려도 복구할 수 있다.

```bash
mkdir -p ~/cert-backup
docker run --rm -v <프로젝트>_certbot-etc:/src -v ~/cert-backup:/dst \
  alpine sh -c 'cp -a /src/. /dst/'
```

### 3-9. 직접 `certbot certonly`를 치지 말 것

```bash
docker compose run --rm certbot certonly --webroot ...   # ✗ 무시된다
```

compose의 `certbot` 서비스는 **entrypoint가 무한 갱신 루프**로 고정돼 있다. 뒤에 붙인 인자를 루프가 무시하고 그냥 돈다. 스크립트가 매번 `--entrypoint`로 덮어쓰는 이유다.

---

## 4. 겪은 오류들 — 각각이 개념 하나씩

| 오류 | 배운 것 |
|---|---|
| `address already in use` | 포트는 **한 프로세스만** 점유한다. 컨테이너와 호스트 nginx가 80을 두고 다툰다 |
| `pull access denied` | 이미지 이름 오타. 그리고 **Docker Hub에 push해야 다른 서버에서 받을 수 있다** |
| `unexpected media type text/html` | 이미지 이름 첫 조각에 **점(`.`)이 있으면 레지스트리 주소로 해석**된다 |
| `invalid additional host` | YAML은 **들여쓰기 하나로 구조가 무너진다**. `docker compose config`로 미리 검사 |
| `Decode argument cannot be null` | 컨테이너에 **시크릿을 안 넣었다**. JAR에서 제외했으니 실행 시 마운트해야 한다 |
| `E45: readonly` | 다른 vim이 살아 있거나 root 소유 파일. 설정 파일은 `sudo tee`가 안전 |
| HTTPS만 죽고 HTTP는 살아남음 | **컨테이너에 80을 직접 주면 앞단 nginx가 밀려난다** |

### 가장 큰 사고 — 컨테이너가 nginx를 밀어냈다

컨테이너를 80 포트로 띄우면서 호스트 nginx가 내려갔고, **nginx가 갖고 있던 HTTPS(443)와 `/api` 프록시가 함께 사라졌다.**

화면은 멀쩡히 떠서 알아채기 어려웠다. `/api/v1/rooms`가 JSON 대신 **index.html을 반환**하는 것(SPA fallback이 삼킴)으로 드러났다.

**진단은 밖에서 curl 한 번이면 갈린다.**

```
http  → 200        웹서버는 살아 있음
https → 연결 거부   443 리스너가 없음
/api  → HTML       프록시 블록이 없음
```

**교훈**: 컨테이너로 서빙하려면 `-p 8081:80`으로 올리고 **nginx를 앞단에 두어 `proxy_pass`** 하는 구성이 안전하다. 이미지 안 nginx는 프록시를 갖고 있지 않다.

### 되돌릴 방법을 먼저 확보하고 실험한다

```bash
docker compose -f web-docker-compose.yaml down -v
sudo systemctl start nginx
```

호스트의 `/etc/letsencrypt`와 `/var/www/clov`를 남겨둔 덕에 **매번 1분 안에 복구**할 수 있었다. 이 안전망이 있어서 과감하게 시도할 수 있었다.

---

## 5. 최종 구성

```
[인터넷]
   │ :80 → :443 리다이렉트
   ↓ :443 (Let's Encrypt 인증서)
[web 컨테이너 = nginx]
   ├─ /                  → 이미지 안 dist (React SPA)
   ├─ /api/, /oauth2/    → host.docker.internal:8080
   └─ /.well-known/...   → 인증서 갱신 챌린지
                              ↓
                    [호스트 systemd = clov-api :8080]
                              ↓
                         [원격 MySQL]
```

**프론트는 컨테이너, 백엔드는 아직 호스트 systemd**인 혼합 구성이다. 다음 단계는 백엔드도 컨테이너로 옮겨 compose에 합치는 것이다.

---

## 6. 체크리스트

**컨테이너를 올리기 전**

- [ ] `docker compose config`로 문법 검사
- [ ] 이미지 이름이 `계정/이미지` 형태인가 (도메인 아님)
- [ ] 80·443을 쓰는 다른 프로세스가 없는가 — `sudo ss -tlnp | grep -E ':80 |:443 '`
- [ ] 되돌리는 명령을 알고 있는가

**인증서를 발급하기 전**

- [ ] `staging=1`인가 (연습이면)
- [ ] 도메인이 전부 이 서버를 가리키는가 — `nslookup`
- [ ] 포트 80이 밖에서 열려 있는가
- [ ] 기존 인증서를 백업했는가

**발급 후**

- [ ] `curl` (`-k` 없이) 200인가
- [ ] `/api`가 JSON(또는 401)을 주는가 — HTML이면 프록시 누락
- [ ] `docker compose up -d`로 certbot 갱신 루프를 켰는가
- [ ] 재부팅 대비 `sudo systemctl disable nginx` 했는가
