# CI/CD 자동배포 — 팀원별 셋업 가이드

> `clov-api`에 **GitHub Actions 자동배포**를 붙였다(`.github/workflows/main.yml`).
> 각자 자기 브랜치에 push하면 **자기 VM에 자동 배포**된다.
>
> **2026-07-30 기준 `deploy-myeongjun`은 성공(3분 9초)했다.** 그 과정에서 **5번 시도해 4번 실패**했고,
> 원인이 매번 달랐다. 여기 적힌 함정들은 전부 실제로 밟은 것이다. **§2-2를 건너뛰면 반드시 실패한다.**
>
> 컨테이너·compose·인증서의 기본 개념은 [20-도커-배포와-HTTPS-인증서.md](20-도커-배포와-HTTPS-인증서.md) 참고.

---

## 큰 그림 — 무엇이 바뀌나

**이전 (수동)**

```
로컬에서 빌드 → VM에 SSH 접속 → 이미지 pull → compose 재시작
매번 손으로. 4명이 각자.
```

**이후 (자동)**

```
git push origin deploy-<내이름>
  ↓ (GitHub Actions가 알아서)
Docker 이미지 빌드 → Docker Hub push → 내 VM에 SSH → pull → 재시작
```

push 한 번이 끝이다. **VM에 직접 들어갈 일이 없어진다.**

### 왜 브랜치를 사람마다 나눴나

우리는 **VM이 4대**다(각자 개인 배포 환경). 브랜치 하나로는 "누구 VM에 배포할지" 알 수 없다.
그래서 워크플로가 **어느 브랜치에서 돌았는지 보고** 그 사람의 시크릿을 골라 쓴다.

```yaml
if [ "${{github.ref}}" == 'refs/heads/deploy-chacha' ]; then
  echo "GCP_VM_HOST=${{secrets.GCP_VM_HOST_CHACHA}}" >> $GITHUB_ENV
  ...
fi
```

브랜치 4개 × `if` 블록 4개. **브랜치명이 한 글자라도 다르면 어느 `if`에도 안 걸려서
환경변수가 전부 빈값이 된다**(→ §6 진단표 첫 줄).

---

## 0. 지금 상태

**2026-07-30 08:11 시점** — §1(리더)은 끝났다. 네 브랜치 모두 `f80ebf4`이고 배포가 한 번씩 돌았다.

| | 시크릿 6개 | deploy 브랜치 | 결과 | 남은 일 |
|---|---|---|---|---|
| 명준(리더) | ✅ | ✅ | ✅ 성공 | — |
| 차차 | ✅ | ✅ | ✅ **성공** (새 이미지 pull 확인) | §4 기동 확인 |
| 라미 | ✅ | ✅ | ❌ **첫 스텝**에서 실패 | `GCP_VM_HOST_LAMI`에 개인키가 들어가 있다 → **§2-3 마지막** |
| 규비 | ✅ | ✅ | ❌ **SSH** 실패 (빌드·push는 성공) | 키가 VM에서 거부됨 → **§2-2 + §6-2** |

**시크릿 24개는 다 등록돼 있다.** 문제는 개수가 아니라 **값**이다.

---

## 1. 리더가 먼저 — deploy 브랜치에 워크플로 심기 (1회)

세 브랜치는 `1c7304a`에 멈춰 있어 **`.github/workflows/main.yml`이 아직 없다.**

> **워크플로 파일은 "push된 브랜치에서" 읽힌다.** main에 있어도 그 브랜치에 없으면 **아무 일도 안 일어난다.
> 에러도 안 난다.** 조용히 안 돈다 — 이게 제일 헷갈렸다.
> Actions 화면의 `Run workflow` 브랜치 목록에도 그 브랜치가 **안 뜬다**(파일이 없으니 워크플로 자체를 모른다).

`1c7304a`는 main의 조상이므로 **fast-forward라 `--force`가 필요 없다.**

```bash
git -C clov-api push origin origin/main:deploy-chacha
```

```bash
git -C clov-api push origin origin/main:deploy-lami
```

```bash
git -C clov-api push origin origin/main:deploy-kimgyubi
```

이걸 하면 **push 이벤트로 배포가 바로 한 번 돈다.** §2가 아직 안 끝난 사람은 SSH 단계에서 실패한다 —
**정상이다.** §2를 마친 뒤 다시 돌리면 된다.

---

## 2. 팀원 각자 — VM 준비

### 2-1. compose 파일 이름과 이미지 이름 맞추기

워크플로 마지막 단계가 VM에서 실행하는 것은 **정확히 이 세 줄**이다.

```bash
cd /home/<GCP_VM_USERNAME>
sudo docker compose -f api-docker-compose.yaml pull
sudo docker compose -f api-docker-compose.yaml down
sudo docker compose -f api-docker-compose.yaml up -d
```

여기서 두 가지가 **정확히** 맞아야 한다.

**① 파일명이 `api-docker-compose.yaml`인가** — 홈 디렉터리에, `.yml`이 아니라 `.yaml`이다.

```bash
ls ~/api-docker-compose.yaml
```

없으면 이름을 바꾼다(내 경우 `.yml`이라 안 돌았다).

```bash
mv ~/api-docker-compose.yml ~/api-docker-compose.yaml
```

**② compose의 `image:`가 `<내Docker Hub아이디>/springboot-app:latest`인가**

```bash
grep image: ~/api-docker-compose.yaml
```

워크플로는 **`springboot-app`** 이라는 이름으로 빌드·push한다.

```yaml
docker build -t ${{env.DOCKER_USERNAME}}/springboot-app:latest .
```

compose가 다른 이름(예: `spring-app`)을 가리키면 **`pull`은 성공하는데 옛 이미지를 받는다.**
초록불이 뜨고 배포도 됐는데 코드가 안 바뀐다 — **가장 눈치채기 어려운 실패다.**

수정:

```bash
nano ~/api-docker-compose.yaml
```

`image:` 줄을 이렇게 만든다(`kimmyeongjun998`을 **본인 Docker Hub 아이디**로).

```yaml
    image: kimmyeongjun998/springboot-app:latest
```

> **`image:`만 바꾼다.** 포트 매핑, 시크릿 파일 마운트(`application-secret.yaml`), DB 연결, 볼륨은
> 지금 수동 배포로 잘 돌고 있는 설정이므로 **그대로 둔다.** 워크플로는 이미지만 갈아끼운다.

### 2-2. ★★ SSH 키 등록 — 반드시 GCP 메타데이터로

**여기가 4번 실패의 주범이다.** GitHub Actions가 내 VM에 SSH로 들어가야 하는데,
평소 쓰는 브라우저 SSH 접속과 **인증 경로가 다르다.**

#### 왜 `authorized_keys`에 직접 넣으면 안 되나

GCP VM에는 **게스트 에이전트**가 돌고 있다. 이 에이전트가 주기적으로
**인스턴스/프로젝트 메타데이터에 등록된 SSH 키만 남기고 `~/.ssh/authorized_keys`를 다시 쓴다.**
손으로 추가한 줄은 **지워진다.**

실제로 겪은 일:

```
07:28  authorized_keys에 공개키 추가 → 잘 들어감
07:32  ~/.ssh 디렉터리가 텅 비어 있다
```

4분 만에 사라졌다. 그래서 워크플로가 계속 이 에러를 뱉었다.

```
ssh: handshake failed: ssh: unable to authenticate,
attempted methods [none publickey], no supported methods remain
```

**해결: `authorized_keys`가 아니라 GCP 콘솔의 인스턴스 메타데이터에 넣는다.**
그러면 에이전트가 그걸 근거로 `authorized_keys`를 **써 준다**(지우지 않는다).

#### ① OS Login이 꺼져 있는지 먼저 확인 (VM에서)

OS Login이 켜져 있으면 **메타데이터 SSH 키는 아예 무시된다.** 먼저 확인한다.

```bash
curl -s -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/attributes/enable-oslogin"; echo; curl -s -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/project/attributes/enable-oslogin"; echo
```

**둘 다 `404`(= 값 없음)면 꺼져 있는 것이고, 이 가이드대로 하면 된다.**
`TRUE`가 나오면 메시지 주시라 — 다른 방법으로 가야 한다.

#### ② 키 쌍 만들기 (로컬 Git Bash 또는 VM)

```bash
ssh-keygen -t rsa -b 4096 -f ~/gha-deploy -N "" -C "chacha"
```

- **`-N ""` = 암호 없음.** Actions는 암호를 입력할 수 없다. 암호를 걸면 무조건 실패한다.
- **`-C "chacha"` ← 여기가 함정.** 이 주석이 **GCP에서 리눅스 사용자명으로 해석된다.**
  본인 VM 사용자명을 정확히 적는다(`whoami`로 확인). 오타가 있으면 **엉뚱한 사용자로 등록되고**
  Actions가 접속할 계정엔 키가 없게 된다. 나는 `bubaragi23`인데 예전 키에 `bubargi23`(a 빠짐)이
  박혀 있어서 헤맸다.

```bash
whoami
```

#### ③ 공개키를 GCP 인스턴스 메타데이터에 등록

```bash
cat ~/gha-deploy.pub
```

출력 **한 줄 전체**를 복사한다 — `ssh-rsa AAAA...`로 시작해 **끝의 `== chacha`까지 전부**.
(`==`는 base64 패딩이라 반드시 포함한다. 뒤의 사용자명 주석도 포함한다.)

GCP 콘솔 → **Compute Engine → VM 인스턴스 → 내 VM 클릭 → 수정 → SSH 키 → 항목 추가** →
붙여넣기 → **저장**.

#### ④ 등록됐는지 VM에서 확인

저장 후 몇십 초 기다리면 게스트 에이전트가 반영한다.

```bash
ssh-keygen -lf ~/.ssh/authorized_keys
```

이렇게 나와야 한다.

```
4096 SHA256:PGRZsTa... chacha (RSA)
```

**`4096`과 뒤의 사용자명을 확인한다.** 안 보이면 아직 반영 전이거나 ③이 잘못됐다.

#### ⑤ 개인키를 GitHub 시크릿에 넣기

```bash
cat ~/gha-deploy
```

`-----BEGIN OPENSSH PRIVATE KEY-----`부터 `-----END OPENSSH PRIVATE KEY-----`까지
**BEGIN/END 줄을 포함해 전부** 복사한다.

`clov-api` → Settings → Secrets and variables → Actions → **`GCP_VM_SSHKEY_<본인>`** →
Update → 붙여넣기 → Update secret.

> 붙여넣은 뒤 **줄바꿈이 살아 있는지** 눈으로 확인한다. 한 줄로 뭉개지면 안 된다.

#### ⑥ 개인키 파일은 지운다

```bash
rm ~/gha-deploy ~/gha-deploy.pub
```

**개인키를 디스크에 남기지 않는다.** 시크릿에 들어갔으면 파일은 필요 없다.
(내려받은 게 `~/Downloads`에 있으면 그것도 지운다.)

### 2-3. 시크릿 6개 값 검증

이미 다 등록돼 있지만 **값이 맞는지**는 별개다. 실제로 오타 2건이 있었다.

| 시크릿 | 값 | 흔한 실수 |
|---|---|---|
| `GCP_VM_HOST_<이름>` | VM 외부 IP 또는 도메인 | — |
| `GCP_VM_USERNAME_<이름>` | **`whoami` 결과와 정확히 일치** | §2-2의 `-C` 주석과도 같아야 한다 |
| `GCP_VM_SSHKEY_<이름>` | 개인키 전문 | BEGIN/END 누락, 줄바꿈 뭉개짐 |
| `DOCKER_USERNAME_<이름>` | Docker Hub 아이디 | **이름 오타**(`DOKER_...`로 만들면 빈값이 된다) |
| `DOCKER_PASSWORD_<이름>` | Docker Hub **액세스 토큰** | 계정 비밀번호 말고 토큰. `Read & Write` 권한 |
| `APPLICATION_SECRET_<이름>` | (현재 워크플로는 **사용하지 않는다**) | 아래 참고 |

> **`APPLICATION_SECRET_*`은 지금 쓰이지 않는다.** clov-api는 시크릿을 이미지에 굽지 않고
> **VM에 있는 `application-secret.yaml`을 마운트**한다. `.dockerignore`가 그 파일을 빌드 컨텍스트에서
> 빼기 때문에 이미지에 들어갈 수도 없다. 등록해 둔 건 나중을 위한 것이니 **이미지에 시크릿이
> 들어간다고 오해하지 말 것.**

#### ★ 한 줄 시크릿에 여러 줄을 넣으면 첫 스텝에서 죽는다

`GCP_VM_SSHKEY_*` **하나만** 여러 줄이다. 나머지 5개는 **반드시 한 줄**이어야 한다.
워크플로가 이렇게 쓰기 때문이다.

```bash
echo "GCP_VM_HOST=${{secrets.GCP_VM_HOST_LAMI}}" >> $GITHUB_ENV
```

값에 줄바꿈이 있으면 `$GITHUB_ENV` 파일에 **`=`가 없는 줄**이 생겨 이 에러로 죽는다.

```
##[error]Unable to process file command 'env' successfully.
##[error]Invalid format '***'
```

**`환경변수 세팅`(첫 스텝)에서 실패하면 100% 이 문제다.** 빌드도 배포도 시작되지 않는다.

실제로 있었던 일 — `GCP_VM_HOST_LAMI`에 **IP가 아니라 개인키(27줄)가 들어가 있었다.**
`GCP_VM_SSHKEY_*`에 넣을 것을 `GCP_VM_HOST_*`에 넣은 것이다. **시크릿 칸을 헷갈리지 말 것.**

> 값 끝에 빈 줄이 하나 붙는 것(끝 줄바꿈)은 **지금은 통과한다** — 빈 줄은 허용된다.
> 그래도 붙여넣을 때 **뒤에 커서를 두고 남는 줄바꿈을 지우는** 습관을 들이는 게 안전하다.

---

## 3. 배포 실행

### 방법 A — 코드 push (평소 방식)

```bash
git push origin deploy-chacha
```

### 방법 B — 코드 변경 없이 재배포

GitHub → Actions → 왼쪽 **GCP-VM-CICD** → 오른쪽 **Run workflow** → 브랜치에서
**`deploy-chacha`** 선택 → 실행.

> 브랜치를 반드시 자기 deploy 브랜치로 고른다. `main`으로 돌리면 `if` 4개 중 하나도 안 걸려서
> 환경변수가 빈값인 채로 진행된다.

### 성공 시 스텝 6개

```
환경변수 세팅  →  Setup SSH Key  →  Checkout
              →  Docker build & push  →  GCP SSH REMOTE  ✅
```

로그에 `err:`가 잔뜩 보여도 **에러가 아니다.** Docker가 진행률을 stderr로 뿌리는 것이다.
`Pull complete` → `Image Pulled` → `Container ... Started` 흐름이면 정상이다.

---

## 4. ★ 초록불 ≠ 서비스 정상

**여기서 방심하면 안 된다.**

`docker compose up -d`는 컨테이너를 띄우고 **즉시 반환**한다. 워크플로는 그 시점에 성공으로 끝난다.
그런데 **이 VM에서 Spring Boot 부팅은 185~208초** 걸린다(로컬의 40배 — 사양이 낮다).

**즉 초록불 뜬 뒤 3~4분간 API는 502다.** 워크플로에 헬스체크가 없어서
**부팅 실패해도 워크플로는 초록불이다.** 실제 기동은 직접 확인해야 한다.

```bash
sudo docker compose -f ~/api-docker-compose.yaml logs -f
```

`Started ClovApiApplication in XXX seconds`가 나오면 완료다. `Ctrl+C`로 나온다.

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/v1/rooms
```

**`401`이면 정상이다** — 인증을 요구한다 = 백엔드까지 도달했다는 뜻이다.
`000`/`502`면 아직 부팅 중이거나 죽은 것이다.

새 이미지가 실제로 도는지도 확인한다.

```bash
sudo docker ps --format '{{.Names}} | {{.Image}} | {{.Status}}'
```

`Image`가 `<내아이디>/springboot-app:latest`이고 `Status`가 방금 시작이면 맞다.

---

## 5. 알아 둘 한계 (일부러 이렇게 뒀다)

강사님 원본 구조를 최대한 유지했다. 아래는 **알고 있는 한계**다.

| 한계 | 무슨 일이 생기나 |
|---|---|
| `down` → `up` 순서 | 재배포 때 **3~4분 다운타임**이 생긴다. 개인 환경이라 감수한다 |
| `:latest` 태그만 | 커밋 SHA 태그가 없어 **어떤 코드가 도는지 이미지로 역추적 못 한다** |
| 헬스체크 없음 | §4 그대로 — 초록불이 정상 기동을 보장하지 않는다 |
| `Setup SSH Key` 단계 | `appleboy/ssh-action`이 `key:`를 직접 받으므로 **실제로는 안 쓰인다.** 그래도 남겨 뒀다 — **진단에 아주 유용하다**(§6-2) |
| `pull_request` 트리거 없음 | PR에서는 안 돈다. PR의 `github.ref`는 `refs/pull/N/merge`라서 `if` 4개에 안 걸린다 |

---

## 6. 실패했을 때 — 증상별 진단

### 6-1. 진단표

| 증상 | 원인 | 조치 |
|---|---|---|
| 워크플로가 **아예 안 돈다**(에러도 없음) | 그 브랜치에 워크플로 파일이 없다 | §1 |
| `Run workflow` 목록에 내 브랜치가 없다 | 같은 이유 | §1 |
| **첫 스텝**(`환경변수 세팅`)에서 `Invalid format '***'` | 한 줄 시크릿에 **여러 줄 값**이 들어갔다(대개 개인키를 `GCP_VM_HOST_*`에 붙여넣음) | **§2-3 마지막** |
| `docker login`에서 사용자명이 빈칸 | 시크릿 **이름** 오타(`DOKER_USERNAME_...`) → 빈값 | 시크릿 이름 확인 |
| 모든 환경변수가 빈값 | `github.ref`가 `if` 4개에 안 걸림(브랜치 오타, main에서 실행) | 브랜치 확인 |
| `docker push` 권한 거부 | `DOCKER_USERNAME` ≠ Docker Hub 아이디 / 토큰이 Read-only | 시크릿 재등록 |
| `Setup SSH Key`에 `Invalid key format` | 개인키에 BEGIN/END 없음, 줄바꿈 뭉개짐 | §2-2 ⑤ 재붙여넣기 |
| **`ssh: handshake failed ... [none publickey]`** | 키 3대 원인 중 하나 | **§6-2** |
| SSH는 됐는데 `no such file` | compose 파일명 불일치(`.yml`/`.yaml`, 경로) | §2-1 ① |
| 배포 성공인데 **코드가 안 바뀐다** | compose `image:` 이름 불일치 → 옛 이미지 pull | §2-1 ② |
| 초록불인데 502 | Spring 부팅 3~4분 | §4 |

### 6-2. ★ `handshake failed`가 나올 때 — 순서대로

이 에러 하나에 **원인이 세 겹**이었다. 순서대로 좁힌다.

**1단계. 시크릿에 든 키가 무엇인지 본다.**

Actions 로그의 **`Setup SSH Key` 스텝**을 펼치면 이 줄이 있다.

```
2048 SHA256:+cRbmnW4Ufev9gJKtdNFI9tXAP/cS4C+2gdhAFJjj/Y bubargi23 (RSA)
```

**이 한 줄이 최고의 진단 도구다.** 여기서 두 개를 읽는다.

- **비트수**: 만든 키가 `4096`인데 `2048`이 찍히면 → **시크릿에 옛 키가 들어 있다.** 다시 붙여넣는다.
- **뒤의 사용자명**: `bubargi23`처럼 오타면 → §2-2 ②의 `-C`가 틀렸다. 키를 다시 만든다.

**2단계. VM 쪽 지문과 맞춰 본다.**

```bash
ssh-keygen -lf ~/.ssh/authorized_keys
```

**두 `SHA256:` 값이 같아야 한다.** 다르면 짝이 안 맞는 키다.
`authorized_keys`가 없거나 비어 있으면 → **게스트 에이전트가 지운 것이다.** §2-2로 돌아가
**메타데이터에** 등록한다.

**3단계. 사용자명이 일치하는지 본다.**

```bash
whoami
```

이 값이 `GCP_VM_USERNAME_<이름>` 시크릿과 **글자 하나까지 같아야** 한다.
Actions는 `ssh <username>@<host>`로 붙는데, 키는 그 사용자의 `authorized_keys`에 있어야 한다.

> **시크릿을 고친 뒤에는 반드시 다시 실행하고, `Setup SSH Key`의 지문 줄을 확인한다.**
> "고쳤다고 생각했는데 안 고쳐진" 경우가 실제로 있었다. **지문으로 확인하는 게 유일하게 확실하다.**

---

## 체크리스트

**리더 (1회)**

- [ ] `deploy-chacha` / `deploy-lami` / `deploy-kimgyubi`에 main push (§1)

**팀원 각자**

- [ ] `whoami`로 리눅스 사용자명 확인
- [ ] OS Login 꺼짐 확인 (404/404) (§2-2 ①)
- [ ] `-N ""`(암호 없음), `-C "<사용자명>"`으로 RSA 4096 키 생성 (§2-2 ②)
- [ ] 공개키를 **GCP 인스턴스 메타데이터**에 등록 — `authorized_keys` 직접 편집 ✗ (§2-2 ③)
- [ ] `ssh-keygen -lf ~/.ssh/authorized_keys`로 반영 확인 (§2-2 ④)
- [ ] 개인키 전문을 `GCP_VM_SSHKEY_<이름>`에 등록 (§2-2 ⑤)
- [ ] **개인키 파일 삭제** (§2-2 ⑥)
- [ ] `~/api-docker-compose.yaml` 파일명 확인 (§2-1 ①)
- [ ] compose `image:` = `<내아이디>/springboot-app:latest` (§2-1 ②)
- [ ] 시크릿 6개 값 검증 — 특히 `GCP_VM_USERNAME`, `DOCKER_USERNAME` (§2-3)
- [ ] 배포 실행, 스텝 6개 전부 초록불 (§3)
- [ ] **로그로 `Started ClovApiApplication` 확인** (§4)
- [ ] `curl`이 **401** 반환 (§4)
- [ ] `docker ps`의 이미지 이름·시작 시각 확인 (§4)

---

## 배포는 됐는데 소셜 로그인이 안 될 때

이 문서 범위 밖이다. **배포가 성공해도 소셜 로그인 주소는 따로 맞춰야 한다** — 안 맞추면 로그인이
`localhost:5173`으로 튕기거나 `redirect_uri_mismatch`가 난다. 환경변수 세 줄과 소셜 콘솔 등록이
필요하고, nginx `location`도 좁게 잡아야 한다.

→ [22-개인배포-소셜로그인-주소설정.md](22-개인배포-소셜로그인-주소설정.md)

---

## 다음 단계 (아직 안 한 것)

- **`clov-web` 워크플로** — 프론트는 아직 자동배포가 없다. 같은 구조를 얹으면 된다
  (`web-docker-compose.yaml`, 이미지 이름만 다르다)
- **헬스체크 추가** — `up -d` 뒤에 `curl` 재시도 루프. **타임아웃은 240초 이상**이어야 한다(§4)
- **커밋 SHA 태그** — `:latest`와 함께 `:${{github.sha}}`도 붙이면 역추적이 된다
- **`down` 제거** — `up -d`만으로 바뀐 컨테이너만 교체되어 다운타임이 줄어든다
- **`main` CI** — PR에서 빌드·테스트만 돌리는 별도 워크플로(배포 없이)
