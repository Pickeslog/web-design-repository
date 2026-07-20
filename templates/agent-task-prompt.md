# AI Agent Task Prompt

```text
작업 전 [대상 레포]/AGENTS.md,
web-design-repository/docs/AI-TEAM-HARNESS.md,
web-design-repository/docs/CODE-CONVENTION.md,
[관련 API 계약/화면 명세/DB 문서]를 읽어.

이슈 #[번호] [제목]을 구현해.

목적:
- [사용자 관점의 목표]

작업 범위:
- [구현 항목]

완료 기준:
- [동작/테스트 기준]

금지 또는 주의:
- 계약, DB 스키마, 공통 설정, 시크릿을 임의로 바꾸지 마.
- 기존 유사 코드의 폴더와 명명 패턴을 따라.
- 작업 범위 밖 리팩터링은 하지 마.

작업 후 git diff로 범위를 확인하고, 아래 세 줄로 보고해.
- 변경:
- 검증:
- 남은 점:
```
