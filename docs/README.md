# 🍀 Clov — 여기부터 읽으세요 (docs 시작 문서)

> Clov = **약속이 추억으로 자라는 친구 전용 기록 서비스.**
> 이 폴더는 프론트(`clov-web`)·백(`clov-api`)이 **함께 보는 공용 문서 허브**다.
> 프론트든 백이든, 사람이든 AI 하네스든 — **모두 같은 문서를 단일 기준으로 본다.**

---

## 📖 무슨 순서로 읽나

| 순서 | 문서 | 언제 보나 |
|---|---|---|
| 1 | [`roadmap.md`](roadmap.md) | **전체 흐름·역할·하네스 운영** — 처음 온 사람 필독 |
| 2 | [`팀-시작가이드.md`](팀-시작가이드.md) | **오늘 뭘 하나** — clone·작업 사이클·main 보호 |
| 3 | [`API-CONTRACT.md`](API-CONTRACT.md) | ⭐**API 계약 단일 기준(SSOT)** — 코드 짜기 전 필독 |
| 4 | [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md) | **DB 스키마**(18테이블 DDL) |
| 5 | [`이슈백로그.md`](이슈백로그.md) | **무슨 이슈를 누가** — 25개 백로그 |
| 6 | [`React-이관가이드.md`](React-이관가이드.md) | 프론트 이관 시 — 프로토타입 → React |

> 화면 명세(동작 기준)는 `../test-web-design/*/*.md`, 컴포넌트는 `../screen-spec-source/09-component-inventory.md`.

---

## 🧭 우리가 일하는 방식 (한눈에)

- **레포 3개 유지**: `clov-api`(백) · `clov-web`(프론트) · `web-design-repository`(이 문서·설계).
  → 셋을 **한 부모 폴더에 나란히 clone**하고 하네스를 부모 폴더에서 실행하면, AI가 프론트+백+계약을 한 맥락으로 본다.
- **통합 = 단일 계약**: 파일을 한 덩어리로 뭉치지 않는다. **[`API-CONTRACT.md`](API-CONTRACT.md) 하나**를 프론트·백이 같이 보는 것이 "통합"이다.
- **기능은 세로로**: 한 사람이 기능 하나를 `[api]`(계약 구현) → `[web]`(화면 이관+연동) 끝까지.
- **AI 도구 3종**: Gemini·Claude·Codex 모두 각 레포 `AGENTS.md`(= `CLAUDE.md`·`GEMINI.md` 포인터)를 읽어 같은 규칙으로 동작.
- **안전망**: `main` 보호(PR+리더 승인) · CI(lint/build) · 계약 변경은 **리더만**.

```
[공용 계약 1개]  API-CONTRACT.md  ←── 프론트·백 하네스가 같이 봄
       │
 기능 슬라이스마다 ▼
   ① [api] 백엔드 도메인 구현 (계약대로)
   ② [web] 그 화면 React 이관 + ①에 연동
```

---

## ✅ 지금 상태 / 다음

- **완료**: DB 통일(05) · API 계약 통일(SSOT) · 지침·CI·공용 문서
- **남음**: `main` 보호 켜기(리더, GitHub UI) · **로그인 워킹 스켈레톤**(M1) → 그 뒤 4명 팬아웃

> 막히면 [`roadmap.md`](roadmap.md) §6·§7(미해결 결정)부터 확인.
