# Code Convention

All contributors and AI agents follow this document before creating a new
package, directory, class, component, DTO, API function, or database mapper.
When this document conflicts with an existing nearby pattern, follow the
existing pattern and raise the difference in the issue or PR. Do not invent a
third pattern.

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

- React components, page folders, and component files use `PascalCase`, matching
  the existing `pages/auth/Login/Login.jsx` pattern.
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
