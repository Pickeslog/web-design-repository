# DB 설정 — 포인터

이 파일은 **원본이 아니다.** DB 접속 설정법의 단일 기준(SSOT)은 아래 한 곳이다:

> **`clov-api/docs/DB-SETUP.md`**
> GitHub에서 볼 때 → <https://github.com/Pickeslog/clov-api/blob/main/docs/DB-SETUP.md>
> (세 레포를 한 부모 폴더에 나란히 clone했다면 → [`../../clov-api/docs/DB-SETUP.md`](../../clov-api/docs/DB-SETUP.md))

원본을 `clov-api`에 두는 이유: 설정 대상 파일(`application-secret.yaml`)과 확인 명령(`./gradlew test`)이 전부 그 레포 안에 있다. **설명은 대상 옆에 둔다.**

---

## 3줄 요약 (자세한 건 원본)

- DB는 **이미 완성**됐다. 기관 공용 MySQL 서버의 스키마 `st4_clov`에 **테이블 19개**가 들어가 있다. 직접 만들 것 없다.
- 팀원이 할 일은 **접속 설정뿐**이다 — `application-secret.yaml.example`을 복사해 이름에서 `.example`을 떼고, 팀장에게 받은 값 3개(서버 주소·username·password)를 채운다. 5분.
- ⚠️ **팀 전체가 DB 하나를 공유한다.** `DROP DATABASE` / `DROP TABLE` / `TRUNCATE`를 실행하면 **전원 데이터가 사라진다.** 구조를 바꿔야 하면 리더에게 먼저 말한다.

---

## 관련 문서

- 테이블 정의 원본(SSOT): [`../api-spec/05-db-unified-final.md`](../api-spec/05-db-unified-final.md) — ERD + DDL 19테이블
- 구축 경위·결정·리스크: [`../work-logs/2026-07-15-db-bootstrap.md`](../work-logs/2026-07-15-db-bootstrap.md)
- API 계약: [`API-CONTRACT.md`](API-CONTRACT.md)
