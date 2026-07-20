# Code Convention

All contributors and AI agents follow this document before creating a new
package, directory, class, component, DTO, API function, or database mapper.
When this document conflicts with an existing nearby pattern, follow the
existing pattern and raise the difference in the issue or PR. Do not invent a
third pattern.

## Golden Reference

새 슬라이스는 **이미 머지된 `auth` 슬라이스를 구조 그대로 복사**하고 이름만
[`DOMAIN-NAMING-REGISTRY.md`](DOMAIN-NAMING-REGISTRY.md)의 확정 값으로 치환한다.
스스로 구조·이름을 설계하지 않는다.

- 백엔드: `clov-api` `domain/auth/{controller,service,mapper,dto,entity}` + `resources/mapper/auth/*.xml`
- 프론트: `clov-web` `src/pages/auth/Login/{Login.jsx, Login.style.js}` · `src/api/auth.js` · `src/stores/authStore.js`
- 공통(재사용, 재생성 금지): `ApiResponse`·`ErrorCode`·`GlobalExceptionHandler`·axios `client.js`(봉투 언래핑 1곳)

## Shared Rules

- Use English names that describe the domain and responsibility.
- Do not use vague names such as `Data`, `Info`, `Util`, `Helper`, `Manager`,
  `Common`, or `Base` unless the project already has a specific established use.
- Keep one domain term consistent across API, frontend, contract, and database.
  For example, use `refreshToken`, not a mix of `refresh`, `refresh_token`, and
  `tokenRefresh` outside their required layer-specific forms.
- API JSON uses `camelCase`. Database tables and columns use the contract's
  `snake_case`. Do not change contract or DDL names for style.
- IDs are strings in JSON and `BIGINT` in the database.
- Before adding a new top-level package, folder, or shared abstraction, search
  for the nearest existing equivalent. New shared structure needs an issue or
  PR explanation.

## API: Java and MyBatis

- Packages and directories are lowercase: `domain/auth/service`.
- Classes, records, enums, and interfaces use `PascalCase`.
- Methods, fields, parameters, and local variables use `camelCase`.
- Constants and enum values use `UPPER_SNAKE_CASE`.
- Organize feature code as
  `domain/<domain>/{controller,service,mapper,dto,entity}`. Shared code belongs
  under `global/`.
- Controller names end in `Controller`; service names end in `Service`; MyBatis
  interfaces and XML files end in `Mapper` and use the same fully qualified
  namespace.
- Request and response DTOs are explicit: `SignupRequest`, `UserResponse`.
  Do not use generic suffixes such as `Dto`, `Data`, or `Result`.
- Mapper methods start with a clear action: `findByEmail`, `insert`,
  `updateRevokedAt`, `deleteById`.
- SQL statement IDs match their mapper method names exactly. Use `#{}` only;
  `${}` is prohibited.

## Web: React and JavaScript

- React components and component files use `PascalCase`. Page folders group a
  domain's screens under a **lowercase domain folder**, matching the existing
  `pages/auth/Login/Login.jsx` pattern — do **not** force pluralization
  (`pages/auth`, not `pages/auths`). A simple standalone page may live directly
  in `src/pages/` (for example `pages/Home.jsx`).
- Other JavaScript files use the nearest existing pattern. API and store modules
  are lowercase, for example `src/api/auth.js` and `src/stores/authStore.js`.
- Functions, variables, props, and hooks use `camelCase`. Hooks begin with
  `use`, for example `useAuth`.
- Route page components go in `src/pages/`; reusable UI goes in
  `src/components/`; HTTP calls go only in `src/api/`; client shared state goes
  in `src/stores/`.
- API functions use action-oriented names such as `login`, `signup`, and
  `exchangeOAuthCode`. Components must not call `fetch` or axios directly.
- Do not create a second API client, token store, response-envelope parser, or
  design-token system. Extend the existing one.

## Known Gotchas (빌드 중 실제로 걸린 함정 — 되풀이 금지)

- **Emotion 컴포넌트 셀렉터** `${StyledComp} { ... }` 는 babel/swc 플러그인 없으면 런타임 크래시(`Component selectors can only be used...`). 요소·클래스 셀렉터(`label`, `& > div + div`)를 쓴다.
- **OAuth 일회성 코드 재교환**: React StrictMode 이중 마운트로 `exchange`가 2번 호출돼 2번째가 `401 OAUTH_CODE_INVALID`. **모듈 레벨 `Map`(code → in-flight Promise)으로 교환을 1회로 dedup**한다 — `OAuthRedirect.jsx`의 `exchangeOnce(code)`가 같은 code면 진행 중인 Promise를 재사용(마운트/언마운트와 무관하게 모듈 스코프에서 공유). effect cleanup의 `active` 플래그는 언마운트 후 setState를 막는 별도 장치. **`useRef` 가드가 아니다** — ref는 마운트마다 새로 생겨 StrictMode 이중 마운트를 못 막는다.
- **dev 서버 실행 중 npm 의존성 추가** → Vite 최적화 캐시 꼬임(React 중복/`useContext` null). `node_modules/.vite` 삭제 후 dev 서버 재시작.
- **CORS**: 브라우저 `5173`→`8080` 호출은 백엔드 CORS 설정 필수(`app.cors.allowed-origins`). 없으면 `net::ERR_FAILED`.
- **eslint `react-hooks/immutability`**: `window.location.href = ...` 할당 금지 → `window.location.assign(...)`.
- **`git add -A`** 가 무관한 동시 변경(다른 사람의 파일)을 쓸어담는다. 파일을 지정해 add 하거나 `git status`로 확인 후 커밋. 한 이슈 = 한 PR.
- **MyBatis**: `#{}` 만, `${}` 금지. resultMap 컬럼은 DB `snake_case`, 프로퍼티는 `camelCase`. refresh 토큰은 **해시로 저장**(원문 금지), JWT는 `jti`로 유일성 보장.
- **작업 후 워킹트리를 비운다**(커밋/스태시). 미커밋으로 두면 브랜치 전환·다른 에이전트가 날린다.

## Pull Request Check

- [ ] Read this document, the repository `AGENTS.md`, and the relevant contract.
- [ ] Reused the closest existing package, file, and naming pattern.
- [ ] Did not add a new shared folder, abstraction, dependency, contract name,
      or DB name without explaining it in the issue or PR.
- [ ] Ran the repository's required verification command.

## Prompt Block for AI Agents

```text
Before working, read the repository AGENTS.md and
web-design-repository/docs/CODE-CONVENTION.md. Follow the nearest existing
package, folder, class, DTO, API function, and component naming pattern. Do not
invent a new naming convention or shared structure; raise it in the issue or PR
when the existing pattern is insufficient.
```
