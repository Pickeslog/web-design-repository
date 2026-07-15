// 2단계 전환: 추억피드 탭 본문 뼈대(§4, 원본 pages/feed-page.js). SpaceTabContent와
// 동일한 패턴 — #dt-full-feed-zone은 js/feed.js(renderFeeds 등)가 여전히 채운다.
export default function FeedTabContent() {
  return (
    <>
      <div className="feed-hero">
        <div className="section-title">
          <span className="feed-title">월별 추억 아카이브</span>
          <span className="feed-subtitle">단짝과 남긴 기록을 월 단위로 접어서 보고, 필요한 달만 빠르게 꺼내봅니다.</span>
        </div>
        <div className="feed-hero-meta">
          <div className="feed-month-summary" id="dt-feed-month-summary">전체 추억</div>
          <button className="btn-action-sm feed-write-btn" type="button" data-open-write-modal="" onClick={() => window.openWriteModal()}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-2px', marginRight: 4 }}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
            글쓰기
          </button>
        </div>
      </div>
      <div className="feed-controls">
        <div className="feed-search">
          <svg className="feed-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input
            className="feed-search-input"
            id="dt-feed-search"
            type="search"
            autoComplete="off"
            placeholder="추억 검색 (제목·내용·태그·친구)"
            onInput={(e) => window.setFeedSearch(e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') window.clearFeedSearch() }}
          />
          <button className="feed-search-clear" id="dt-feed-search-clear" type="button" onClick={() => window.clearFeedSearch()} aria-label="검색어 지우기" hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="feed-controls-right">
          <div className="feed-sort" role="group" aria-label="정렬 순서">
            <button className="feed-sort-btn active" data-sort="new" type="button" onClick={() => window.setFeedSort('new')}>최신순</button>
            <button className="feed-sort-btn" data-sort="old" type="button" onClick={() => window.setFeedSort('old')}>오래된순</button>
          </div>
          <div className="feed-filter-tabs">
            <button className="feed-gallery-trigger" type="button" onClick={() => window.openSpacePhotoGallery()} title="사진 모아보기" aria-label="사진 모아보기">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="3" width="5" height="5" rx="1.3" /><rect x="9.5" y="3" width="5" height="5" rx="1.3" /><rect x="16" y="3" width="5" height="5" rx="1.3" /><rect x="3" y="9.5" width="5" height="5" rx="1.3" /><rect x="9.5" y="9.5" width="5" height="5" rx="1.3" /><rect x="16" y="9.5" width="5" height="5" rx="1.3" /><rect x="3" y="16" width="5" height="5" rx="1.3" /><rect x="9.5" y="16" width="5" height="5" rx="1.3" /><rect x="16" y="16" width="5" height="5" rx="1.3" /></svg>
            </button>
            <button className="month-picker-trigger" id="dt-month-picker-trigger" type="button" onClick={(e) => window.toggleMonthPicker(e)} title="월 선택">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
            </button>
            <button className="feed-tab active" data-filter="all" onClick={() => window.setFeedFilter('all')}>전체</button>
            <button className="feed-tab" data-filter="mine" onClick={() => window.setFeedFilter('mine')}>내 기록</button>
            <button className="feed-tab" data-filter="others" onClick={() => window.setFeedFilter('others')}>친구 기록</button>
          </div>
        </div>
      </div>
      <div id="dt-full-feed-zone" className="feed-grid" />
    </>
  )
}
