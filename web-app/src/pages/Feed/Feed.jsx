import headHtml from './legacy-source/feed-head.html?raw'
import bodyHtml from './legacy-source/feed-body.html?raw'
import LegacyEmbed from '../../components/LegacyEmbed'

// 원본: test-web-design/04-feed/feed.html 임베딩 이식.
// 이 화면은 대시보드와 같은 desktop.js(js/desktop.js, ~4700줄) 엔진을 그대로 재사용해
// 월별 추억 아카이브를 독립 페이지로 보여준다 — groupsData/renderFeeds()/월 선택
// 팝오버/글쓰기 모달 전부 desktop.js 쪽 로직이라 LegacyEmbed(1단계 임베딩)로 이식했다.
// desktop.js는 초기 렌더를 window.onload에 등록하므로 retriggerOnload가 필요하다.
export default function Feed() {
  return <LegacyEmbed headHtml={headHtml} bodyHtml={bodyHtml} baseHref="/legacy/04-feed/" retriggerOnload />
}
