# 16. 온보딩 첫 PR (비전공 팀원용)

> **목적**: 실제 도메인 작업을 받기 **전에**, 작은 PR 하나로
> **브랜치 → PR → CI 초록 → 리뷰 → 머지** 전체 사이클을 각자 **한 번 성공**시킨다.
> 여기서 막히는 환경·권한 문제(collaborator 초대, gh 로그인, CI)를 미리 걸러낸다.
> 대상: **chacha1650a**(Claude) · **kimgyubi1234**(Gemini) · **lami2342**(Gemini).
> 관련: [`11-claude-prompt-template.md`](11-claude-prompt-template.md) · [`13-gemini-prompt-recipes.md`](13-gemini-prompt-recipes.md) · 워크플로 정본 [`../docs/AI-TEAM-HARNESS.md`](../docs/AI-TEAM-HARNESS.md)

## 무엇을 만드나 (아주 작음)

**`clov-web` 레포에 자기소개 파일 1개 추가.**
- 파일 경로: `docs/team/<본인_github_아이디>.md` (예: `docs/team/chacha1650a.md`)
- 세 명이 **서로 다른 파일** → 충돌 날 일 없음.
- 문서(.md) 파일이라 CI(lint·build)를 **안전하게 통과**한다.

> 왜 clov-web? CI(`build` 체크)가 모든 PR에 돌아서 "초록 없으면 머지 불가"를 실제로 경험할 수 있기 때문. (web-design-repository는 CI가 없어 온보딩엔 안 씀.)

---

## 0. 사전 준비 (딱 한 번)

1. **도구 설치 확인** — Git, Node.js 22, 그리고 GitHub CLI(`gh`) 또는 GitHub Desktop, 본인 AI 에이전트.
2. **레포 권한** — 리더가 여러분을 `clov-web`에 **Collaborator로 초대**한다. 메일/GitHub 알림에서 **초대 수락**. (이게 없으면 브랜치를 올릴 수 없다.)
3. **gh 로그인** — 터미널에서 `gh auth login` (브라우저로 로그인). GitHub Desktop을 쓰면 앱 로그인으로 대체.
4. **클론(한 번만)**
   ```bash
   git clone https://github.com/Pickeslog/clov-web.git
   cd clov-web
   ```

---

## 사람이 밟는 단계 (순서대로 그대로)

### 1. 내 이슈 확인
리더가 만들어 배정한 이슈 **"온보딩: 팀 소개 추가 (\<아이디\>)"** 를 GitHub `clov-web > Issues`에서 찾는다. **이슈 번호 `#N`** 을 기억한다.

### 2. 최신화하고 브랜치 만들기
```bash
git checkout main
git pull
git checkout -b chore/onboarding-<아이디>     # 예: chore/onboarding-chacha1650a
```
> ⚠️ **main에서 바로 작업하지 않는다.** 반드시 새 브랜치에서.

### 3. AI 에이전트로 파일 만들기
아래 **본인 에이전트용 프롬프트(§A 또는 §B)** 를 그대로 붙여넣어 파일을 만든다.

### 4. 만들어진 것 확인
```bash
git status
```
→ `docs/team/<아이디>.md` 가 보이면 성공. 파일을 열어 내용도 눈으로 확인.

### 5. 커밋하고 올리기(push)
```bash
git add docs/team/<아이디>.md
git commit -m "chore: add team intro (<아이디>)"
git push -u origin chore/onboarding-<아이디>
```

### 6. PR 만들기
- GitHub `clov-web` 페이지에 뜨는 **"Compare & pull request"** 클릭.
  (또는 터미널에서 `gh pr create --base main --fill`)
- **제목**: `chore: 온보딩 팀 소개 (<아이디>)`
- **본문 첫 줄에 반드시**: `Closes #N`  ← 내 이슈 번호. (이게 있어야 머지 시 이슈가 자동으로 닫힌다.)
- **Create pull request**.

### 7. CI 초록 기다리기
PR 페이지 아래 **`build` 체크**가 노랑(진행중) → **초록 ✓**(성공) 될 때까지 1~2분 기다린다.
- 초록이 되면 다음 단계.
- 빨강 ✗ 이면 → "Details"로 로그를 열어 캡처해서 **리더에게 공유**(온보딩 파일이 CI를 깨는 일은 거의 없다).

### 8. 리뷰 → 머지
- **리더(또는 리뷰어)** 가 확인 후 승인한다.
- **머지 버튼은 리더가** 누른다("Squash and merge"). 머지되면 내 이슈가 자동으로 닫힌다.
- 팀원은 머지될 때까지 기다린다. (직접 머지 X)

### 9. 마무리
```bash
git checkout main
git pull
```
축하! 전체 사이클 1회 완주. 이 흐름이 M2 도메인 작업에서도 **똑같이** 반복된다.

---

## §A. Claude 프롬프트 (chacha1650a용 — 붙여넣기)

```
clov-web 레포에서 작업 중이야. docs/team/chacha1650a.md 파일을 새로 하나만 만들어줘.
내용은 아래 형식(마크다운):

# chacha1650a
- 사용 에이전트: Claude
- 관심 도메인: (예: 추억피드 — 자유롭게)
- 한 줄 각오: (자유)

규칙: 이 파일 하나만 생성하고 다른 파일은 절대 건드리지 마. 코드/설정/계약 변경 없음.
```

## §B. Gemini 프롬프트 (kimgyubi1234 · lami2342용 — 붙여넣기)

```
clov-web 레포에서 작업 중입니다. docs/team/<본인아이디>.md 파일을 새로 하나만 만들어 주세요.
(파일명 예: docs/team/kimgyubi1234.md)
내용은 아래 마크다운 형식으로:

# <본인아이디>
- 사용 에이전트: Gemini
- 관심 도메인: (예: 행운편지 — 자유)
- 한 줄 각오: (자유)

규칙: 이 파일 하나만 생성하고 다른 파일은 절대 수정하지 마세요. 코드/설정/계약 변경 없음.
```

---

## 자주 나는 문제 & 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| push할 때 `permission denied`/`403` | clov-web collaborator 초대 안 받음 | 리더에게 초대 요청 → 수락 후 다시 push |
| `refusing to update main` 류 | 브랜치 안 만들고 main에서 작업 | §2로 돌아가 `git checkout -b ...` |
| PR에 `build` 체크가 안 뜸 | PR base가 main이 아님 | PR을 base=`main`으로 다시 |
| CI 빨강 ✗ | (온보딩 파일은 대개 아님) 다른 변경 섞임 | `git status`로 무관한 변경 확인, 로그 리더 공유 |
| 머지했는데 이슈가 안 닫힘 | 본문에 `Closes #N` 누락 | PR 본문 수정해 `Closes #N` 추가 |

---

## 리더용 — 이슈 3개 만들기 (온보딩 시작 전)

각자에게 이슈 하나씩(총 3개). 예시(`gh` 사용):

```bash
gh issue create --repo Pickeslog/clov-web \
  --title "온보딩: 팀 소개 추가 (chacha1650a)" \
  --assignee chacha1650a \
  --body "docs/team/chacha1650a.md 자기소개 1파일 추가. 완료 기준: PR CI(build) 초록 + Closes #이슈 + squash 머지. 가이드: team-guides/16-onboarding-first-pr.md"
```
kimgyubi1234·lami2342도 아이디만 바꿔 동일하게. (또는 GitHub UI `Issues > New issue`.)

> **리더 체크**: ①세 명 clov-web collaborator 초대 ②이슈 3개 생성·배정 ③각자 PR 리뷰·머지(머지는 리더). 세 명 모두 완주하면 → **M2 도메인 이슈 배정 단계로**.
