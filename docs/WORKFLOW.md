# 🔁 개발 워크플로우 룰북 (SSOT)

> 팀원·AI가 **한 슬라이스를 시작해서 머지·클로즈**까지 밟는 정확한 순서. 이 순서를 벗어나지 않는다.
> 관련: [`AI-협업-운영규칙.md`](AI-협업-운영규칙.md)(2-AI 루프) · [`CODE-CONVENTION.md`](CODE-CONVENTION.md) · [`DOMAIN-NAMING-REGISTRY.md`](DOMAIN-NAMING-REGISTRY.md)

---

## 0. 한 슬라이스 = 한 이슈 = 한 브랜치 = 한 PR

```
이슈 선택 → 브랜치 생성 → (AI에 프롬프트로) 구현 → 로컬 검증(lint/build/test)
  → PR 생성(Closes #N) → CI 통과 → 리뷰(계약·레지스트리 기준) → squash 머지 → 브랜치 삭제 → 이슈 자동 클로즈
```

## 1. 이슈 선택
- GitHub Issues에서 **본인 담당(레지스트리 §2)** 이슈 하나를 고른다. 담당자 미지정이면 self-assign.
- 이슈 본문의 "확정 이름·완료 기준·반드시 지킬 것"을 읽는다. **이름은 레지스트리에서만.**

## 2. 브랜치
```bash
git checkout main && git pull --ff-only
git checkout -b feat/<이슈번호>-<topic>     # 예: feat/23-room-list
```
- 형식: `feat/<#>-<topic>` · `fix/<#>-<topic>` · `chore/<topic>`. **main에서 직접 작업 금지.**

## 3. 구현 (AI에 맡길 때 프롬프트 앞에 붙일 공통 블록)
```
이 레포의 AGENTS.md와 web-design-repository/docs/{API-CONTRACT, CODE-CONVENTION, DOMAIN-NAMING-REGISTRY}.md를 먼저 읽어.
이슈 #N을 구현해. auth 슬라이스를 구조 그대로 복사하고 이름은 레지스트리 확정값만 써(지어내지 마).
공통(ApiResponse·client.js·authStore)은 재사용. 계약·DB·시크릿은 바꾸지 마.
작업 후 lint/build(웹) 또는 gradlew test(백)를 돌리고, git diff로 범위가 이슈와 맞는지 확인해.
```

## 4. 로컬 검증 (PR 전 필수)
- 웹: `npm run lint && npm run build` / 백: `./gradlew.bat test`(로컬 DB) 또는 최소 컴파일.
- `git status`로 **무관한 변경이 섞이지 않았는지** 확인(한 이슈 = 한 PR). 작업 후 워킹트리를 커밋/스태시로 비운다.

## 5. PR 생성
```bash
git push -u origin feat/<#>-<topic>
# PR 본문 첫 줄에 반드시:  Closes #<이슈번호>
```
- PR 템플릿 체크리스트(레지스트리 준수·공통 재사용·무관 변경 없음·검증 실행)를 채운다.
- **CI(lint/build/compile)가 초록**이어야 리뷰로 넘어간다.

## 6. 리뷰 (머지 전 게이트)
- 리뷰어(리더 또는 클로드 코드)가 **계약·레지스트리·CODE-CONVENTION 기준**으로 확인:
  - 이름이 레지스트리와 일치하는가 / 새 구조·이름을 지어내지 않았는가
  - 계약 지뢰 없는가(role 금지·`/api/v1`·시크릿 미커밋·JPA 금지·`#{}`·봉투)
  - CI 초록 + 로컬 검증 결과 첨부
- 지적은 PR 코멘트로. 수정 후 재확인.

## 7. 머지 & 클로즈
```bash
gh pr merge <PR번호> --repo <owner/repo> --squash --delete-branch
```
- **squash 머지 + 브랜치 삭제.** `Closes #N`이 이슈를 자동 클로즈한다.
- ⚠️ **머지는 사람이 실행한다** — Claude Code 자동승인 분류기가 `gh pr merge`를 차단하므로, 리뷰까지는 AI가 하고 머지는 리더가 누른다. (main 보호: 직접 push 금지·PR 필수·CI required)

## 8. 다음
- 머지 후 `git checkout main && git pull` 로 최신화하고 다음 이슈로.

---

## 규칙 요약 (어기면 통합이 터진다)
1. 워킹 스켈레톤(auth) 완성 전엔 팬아웃하지 않는다 — 지금은 완성됐으니 팬아웃 OK.
2. 이름은 레지스트리에서만. 없으면 지어내지 말고 이슈로 제안 → 문서 갱신 후 진행.
3. 한 이슈 = 한 브랜치 = 한 PR. 무관한 변경 섞지 않기.
4. 계약·DB·시크릿은 리더 승인(SSOT 변경) 없이 바꾸지 않는다.
5. CI 초록 + 리뷰 통과만 머지. 머지는 사람이.
