(function () {
  'use strict';
  var HTML = `
                            <div class="feed-hero">
                                <div class="section-title">
                                    <span class="feed-title">월별 추억 아카이브</span>
                                    <span class="feed-subtitle">단짝과 남긴 기록을 월 단위로 접어서 보고, 필요한 달만 빠르게 꺼내봅니다.</span>
                                </div>
                                <div class="feed-hero-meta">
                                    <div class="feed-month-summary" id="dt-feed-month-summary">전체 추억</div>
                                    <button class="btn-action-sm feed-write-btn" type="button" data-open-write-modal onclick="openWriteModal()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>글쓰기</button>
                                </div>
                            </div>
                            <div class="feed-controls">
                                <div class="feed-search">
                                    <svg class="feed-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                                    <input class="feed-search-input" id="dt-feed-search" type="search" autocomplete="off" placeholder="추억 검색 (제목·내용·태그·친구)" oninput="setFeedSearch(this.value)" onkeydown="if(event.key==='Escape'){clearFeedSearch();}">
                                    <button class="feed-search-clear" id="dt-feed-search-clear" type="button" onclick="clearFeedSearch()" aria-label="검색어 지우기" hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
                                </div>
                                <div class="feed-controls-right">
                                    <div class="feed-sort" role="group" aria-label="정렬 순서">
                                        <button class="feed-sort-btn active" data-sort="new" type="button" onclick="setFeedSort('new')">최신순</button>
                                        <button class="feed-sort-btn" data-sort="old" type="button" onclick="setFeedSort('old')">오래된순</button>
                                    </div>
                                    <div class="feed-filter-tabs">
                                        <button class="month-picker-trigger" id="dt-month-picker-trigger" type="button" onclick="toggleMonthPicker(event)" title="월 선택"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg></button>
                                        <button class="feed-tab active" data-filter="all" onclick="setFeedFilter('all')">전체</button>
                                        <button class="feed-tab" data-filter="mine" onclick="setFeedFilter('mine')">내 기록</button>
                                        <button class="feed-tab" data-filter="others" onclick="setFeedFilter('others')">친구 기록</button>
                                    </div>
                                </div>
                            </div>
                            <div id="dt-full-feed-zone" class="feed-grid">
                                <!-- 동적 피드 영역 -->
                            </div>
`;

  window.FeedPage = {
    init: function () {
      var el = document.getElementById('dt-tab-feed');
      if (el) el.innerHTML = HTML;
    }
  };
})();
