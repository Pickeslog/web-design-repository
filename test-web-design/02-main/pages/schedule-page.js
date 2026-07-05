(function () {
  'use strict';
  var TAB_HTML = `
                            <div class="section-title journey-section-title">
                                <div class="journey-heading">
                                    <span class="journey-page-kicker">PROMISE JOURNEY</span>
                                    <span class="journey-page-title">약속 여정</span>
                                </div>
                                <button class="btn-action-sm btn-schedule-new" onclick="openScheduleModal('dt')">＋ 새 D-day 만들기</button>
                            </div>
                            <div id="dt-schedule-list-zone">
                                <!-- 동적 다중 일정 카드 영역 -->
                            </div>
`;

  // 인생4컷 극장 로비 모달 + 풀스크린 상영관 오버레이 — 원본 index.html에서도
  // dt-tab-schedule의 형제 요소(같은 <main id="desktop-scroll-container"> 아래)였으므로,
  // 위치 컨텍스트(.modal-overlay의 position:absolute 기준)를 그대로 유지하려면
  // #dt-tab-schedule 안이 아니라 <main> 바로 뒤에 형제로 삽입해야 한다.
  var FOURCUT_HTML = `
                    <div class="modal-overlay" id="dt-fourcut-gallery-modal">
                        <div class="modal-box fourcut-gallery-modal">
                            <div class="fourcut-gallery-head">
                                <div class="fourcut-lobby-headtext">
                                    <span class="fourcut-lobby-kicker">LIFE FOUR CUT</span>
                                    <h3>전체 약속 보기</h3>
                                    <p class="fourcut-lobby-subtitle">제안하기부터 만남까지, 네 장의 인증사진이 모이면 인생4컷처럼 완성됩니다.</p>
                                </div>
                                <button type="button" class="fourcut-gallery-close" onclick="closeFourCutGallery()" aria-label="닫기">×</button>
                            </div>
                            <div class="fourcut-poster" id="dt-fourcut-poster">
                                <div class="fourcut-poster-slides" id="dt-fourcut-poster-slides"></div>
                                <div class="fourcut-poster-scrim"></div>
                                <div class="fourcut-poster-bulbs"></div>
                                <div class="fourcut-nowplaying">지금 상영 · <span id="dt-fourcut-nowplaying">-</span></div>
                                <div class="fourcut-poster-title">
                                    <span class="fourcut-poster-kicker">◉ NOW SHOWING</span>
                                    <div class="fourcut-poster-heading">인생4컷 극장</div>
                                    <div class="fourcut-poster-tagline">제안부터 만남까지 — 네 컷으로 완성된 우리의 이야기</div>
                                    <div class="fourcut-poster-actions" id="dt-fourcut-poster-actions">
                                        <button class="fourcut-enter-btn" type="button" onclick="fourCutEnter()">
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"></path><path d="M13 6v1.5M13 16.5V18M13 11v2"></path></svg>
                                            입장하기
                                        </button>
                                        <span class="fourcut-poster-chip">완료된 약속 <b id="dt-fourcut-done-count">0</b></span>
                                        <span class="fourcut-poster-chip muted">다가오는 약속 <span id="dt-fourcut-upcoming-count">0</span></span>
                                    </div>
                                </div>
                                <div class="fourcut-poster-bar">
                                    <span class="fourcut-poster-bar-left">TODAY · <span id="dt-fourcut-today-count">0</span>편 상영</span>
                                    <span class="fourcut-poster-bar-right">clov. memories</span>
                                </div>
                            </div>
                            <div class="fourcut-gallery-empty" id="dt-fourcut-gallery-empty" style="display:none;">아직 완성된 인생4컷이 없어요. 네 단계를 모두 채워보세요!</div>
                            <div class="fourcut-row" id="dt-fourcut-row">
                                <div class="fourcut-row-head">완료된 약속 <span id="dt-fourcut-row-count">0</span></div>
                                <div class="fourcut-row-track" id="dt-fourcut-row-track"></div>
                            </div>
                        </div>
                    </div>
                    <div class="fourcut-theater" id="dt-fourcut-theater">
                        <div class="fourcut-theater-scene" id="dt-theater-scene">
                            <div class="fourcut-seatwall fourcut-seatwall-l"></div>
                            <div class="fourcut-seatwall fourcut-seatwall-r"></div>
                            <div class="fourcut-aisle"></div>

                            <div class="fourcut-screen">
                                <div class="fourcut-shot" id="dt-theater-shot">
                                    <div class="fourcut-filmstrip">
                                        <div class="fourcut-sprocket fourcut-sprocket-top"></div>
                                        <div class="fourcut-sprocket fourcut-sprocket-bottom"></div>
                                        <div class="fourcut-strip" id="dt-theater-strip"></div>
                                    </div>
                                    <div class="fourcut-caption">
                                        <div class="fourcut-caption-title" id="dt-theater-title"></div>
                                        <div class="fourcut-caption-date"><span id="dt-theater-date"></span> · clov. memories</div>
                                    </div>
                                </div>
                                <div class="fourcut-scrglow" id="dt-theater-scrglow"></div>
                                <div class="fourcut-grain" id="dt-theater-grain"></div>
                                <div class="fourcut-countdown" id="dt-theater-count"><span class="fourcut-countdown-sweep"></span><span id="dt-theater-countnum">3</span></div>
                                <div class="fourcut-curtain fourcut-curtain-l" id="dt-theater-curtl"></div>
                                <div class="fourcut-curtain fourcut-curtain-r" id="dt-theater-curtr"></div>
                                <div class="fourcut-valance"></div>
                            </div>

                            <div class="fourcut-beam" id="dt-theater-beam">
                                <div class="fourcut-dustwrap" id="dt-theater-dustwrap"></div>
                            </div>
                        </div>

                        <div class="fourcut-spill" id="dt-theater-spill"></div>
                        <div class="fourcut-house" id="dt-theater-house"></div>
                        <div class="fourcut-seats" id="dt-theater-seats">
                            <div class="fourcut-seats-bar"></div>
                            <div class="fourcut-seat-head" style="left:8%"></div>
                            <div class="fourcut-seat-head" style="left:30%"></div>
                            <div class="fourcut-seat-head" style="left:54%"></div>
                            <div class="fourcut-seat-head" style="left:78%"></div>
                        </div>

                        <button class="fourcut-exit-btn" id="dt-theater-exit" type="button" onclick="fourCutExit()">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>나가기
                        </button>
                        <button class="fourcut-sit-btn" id="dt-theater-sit" type="button" onclick="fourCutSit()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"></path><path d="M4 11h16v5H4z"></path><path d="M6 16v3M18 16v3"></path></svg>
                            착석하기
                        </button>
                        <div class="fourcut-nav" id="dt-theater-nav">
                            <button type="button" onclick="fourCutNav(-1)" aria-label="이전 완성작">‹</button>
                            <span id="dt-theater-counter">1 / 1</span>
                            <button type="button" onclick="fourCutNav(1)" aria-label="다음 완성작">›</button>
                        </div>
                    </div>
`;

  window.SchedulePage = {
    init: function () {
      var tab = document.getElementById('dt-tab-schedule');
      if (tab) tab.innerHTML = TAB_HTML;

      var main = tab ? tab.closest('main') : null;
      if (main) main.insertAdjacentHTML('afterend', FOURCUT_HTML);
    }
  };
})();
