import headHtml from './legacy-source/makerooms-head.html?raw'
import bodyHtml from './legacy-source/makerooms-body.html?raw'
import LegacyEmbed from '../../components/LegacyEmbed'

// 원본: test-web-design/03-rooms/makerooms.html (2100줄대) 임베딩 이식.
// 방 목록(보딩패스 카드) 드래그 정렬, 필터/페이지네이션, 요청한 방/잠자는 방 섹션,
// 방 만들기·생성완료 패널, 방 미리보기 모달(소식피드/프로필편집/초대 3뷰 전환)까지
// 전부 인라인 스크립트 하나(~1080줄)에 상태가 촘촘하게 얽혀 있어, 손으로 JSX 재작성 시
// 회귀 위험이 매우 크다고 판단해 LegacyEmbed(1단계 임베딩)로 이식했다 — 기능·디자인은
// 원본과 100% 동일. 사용자설정 모달(clov-profile-modal.js)과 같은 판단 기준.
export default function MakeRoom() {
  return <LegacyEmbed headHtml={headHtml} bodyHtml={bodyHtml} baseHref="/legacy/03-rooms/" />
}
