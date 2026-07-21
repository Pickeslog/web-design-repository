# chacha1650a — invite 프론트 완료 (clov-web #28)

> R2 착수 프롬프트([`2026-07-21-R2-착수-프롬프트.md`](2026-07-21-R2-착수-프롬프트.md))의 chacha 파트. letter 프론트(#25)를 골든레퍼런스로 삼아 진행.

## 한 일

- **`api/invite.js`** 신규 — `createInvite`·`getInvites`·`cancelInvite`·`requestJoin`·`getJoinRequests`·`acceptJoinRequest`·`rejectJoinRequest`·`undoJoinRequest` (계약 §7 그대로).
- **`pages/rooms/Invite`** — 방 안에서 초대 코드 생성(만료 기본/24h/7일 선택)·목록·취소, 대기 중인 가입 신청 목록(수락/거절), 수락 시 5분 되돌리기 카운트다운.
  - 되돌리기 대상은 `GET join-requests`가 PENDING만 돌려주므로(수락 즉시 목록에서 빠짐) 로컬 state로 따로 들고 카운트다운.
  - 백엔드가 UTC `LocalDateTime`을 오프셋 없이 내려줘서(`2026-07-20T11:05:00`) `Z`를 붙여 명시적으로 UTC 파싱 — 안 하면 KST 기준 9시간 밀려서 되돌리기가 즉시 만료된 것처럼 보임.
- **`pages/rooms/JoinRoom`** — 초대 코드 입력 → 가입 "신청"(PENDING 생성, 즉시 입장 아님). `roomId` 불필요(계약상 `accept`가 코드만 받음)이라 전역 `/join` 라우트로 뺌 (원 프롬프트는 `/rooms/:roomId/join`이었지만 기능상 roomId를 알 필요가 없어 라우트를 조정함).
- `router.jsx`: `/join`, `/rooms/:roomId/invite` 추가.
- `Dashboard.jsx` SECTIONS에 "초대하기" 카드, `RoomList.jsx`에 "초대 코드로 참여하기" 진입점 추가.

## 검증

- `npm run lint` / `npm run build` 통과.
- 로컬에서 clov-api(main) + clov-web(dev) 실제로 띄우고, 진짜 계정 2개로 브라우저 실측:
  코드 생성 → 코드 취소(CANCELED) → B 계정이 코드로 가입 신청(PENDING) → A 계정이 수락(멤버 등록·5분 타이머) → 되돌리기(PENDING 복원) → 거절(REJECTED) 전 구간 확인. 각 단계 실제 HTTP 200 응답 확인.
- **안 한 것**: 409 에러 3종(정원초과·중복처리·되돌리기만료)은 메시지 매핑만 해두고 실제 트리거는 못 해봄. 모바일/다크모드 미확인(앱 전역에 다크 팔레트 자체가 없음 — letter 슬라이스와 동일한 기존 갭).

## PR

- clov-web PR (`feat/28-invite-frontend` → main), 본문 첫 줄 `Closes #28`.
- 머지 중 팀원의 plan 프론트(#29)가 같은 `Dashboard.jsx` SECTIONS 배열을 건드려 충돌 발생(`schedule.ready: false→true`) → `git rebase origin/main`으로 해결, `invite` 항목 유지한 채 재정렬 후 force-with-lease push.
