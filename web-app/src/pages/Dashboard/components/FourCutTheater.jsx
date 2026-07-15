// 2단계 전환: 인생4컷 극장 로비 모달 + 풀스크린 상영관(§6.2-⑦, 원본 pages/schedule-page.js의
// FOURCUT_HTML). 원본에서 <main id="desktop-scroll-container">의 형제 요소였다 —
// .modal-overlay의 position:absolute 기준이 되는 조상이 달라지면 레이아웃이 깨지므로
// Dashboard.jsx에서 <main> 바로 다음에 있는 #dt-fourcut-mount에 portal로 마운트한다
// (dt-tab-schedule 안에 넣지 않음. 원본 주석에 있던 이유를 그대로 유지).
export default function FourCutTheater() {
  return (
    <>
      <div className="modal-overlay" id="dt-fourcut-gallery-modal">
        <div className="modal-box fourcut-gallery-modal">
          <div className="fourcut-gallery-head">
            <div className="fourcut-lobby-headtext">
              <span className="fourcut-lobby-kicker">LIFE FOUR CUT</span>
              <h3>전체 약속 보기</h3>
              <p className="fourcut-lobby-subtitle">제안하기부터 만남까지, 네 장의 인증사진이 모이면 인생4컷처럼 완성됩니다.</p>
            </div>
            <button type="button" className="fourcut-gallery-close" onClick={() => window.closeFourCutGallery()} aria-label="닫기">×</button>
          </div>
          <div className="fourcut-poster" id="dt-fourcut-poster">
            <div className="fourcut-poster-slides" id="dt-fourcut-poster-slides" />
            <div className="fourcut-poster-scrim" />
            <div className="fourcut-poster-bulbs" />
            <div className="fourcut-nowplaying">
              지금 상영 · <span id="dt-fourcut-nowplaying">-</span>
            </div>
            <div className="fourcut-poster-title">
              <span className="fourcut-poster-kicker">◉ NOW SHOWING</span>
              <div className="fourcut-poster-heading">인생4컷 극장</div>
              <div className="fourcut-poster-tagline">제안부터 만남까지 — 네 컷으로 완성된 우리의 이야기</div>
              <div className="fourcut-poster-actions" id="dt-fourcut-poster-actions">
                <button className="fourcut-enter-btn" type="button" onClick={() => window.fourCutEnter()}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" /><path d="M13 6v1.5M13 16.5V18M13 11v2" /></svg>
                  입장하기
                </button>
                <span className="fourcut-poster-chip">완료된 약속 <b id="dt-fourcut-done-count">0</b></span>
                <span className="fourcut-poster-chip muted">다가오는 약속 <span id="dt-fourcut-upcoming-count">0</span></span>
              </div>
            </div>
            <div className="fourcut-poster-bar">
              <span className="fourcut-poster-bar-left">TODAY · <span id="dt-fourcut-today-count">0</span>편 상영</span>
              <span className="fourcut-poster-bar-right">clov. memories</span>
            </div>
          </div>
          <div className="fourcut-gallery-empty" id="dt-fourcut-gallery-empty" style={{ display: 'none' }}>아직 완성된 인생4컷이 없어요. 네 단계를 모두 채워보세요!</div>
          <div className="fourcut-row" id="dt-fourcut-row">
            <div className="fourcut-row-head">완료된 약속 <span id="dt-fourcut-row-count">0</span></div>
            <div className="fourcut-row-track" id="dt-fourcut-row-track" />
          </div>
        </div>
      </div>
      <div className="fourcut-theater" id="dt-fourcut-theater">
        <div className="fourcut-theater-scene" id="dt-theater-scene">
          <div className="fourcut-seatwall fourcut-seatwall-l" />
          <div className="fourcut-seatwall fourcut-seatwall-r" />
          <div className="fourcut-aisle" />

          <div className="fourcut-screen">
            <div className="fourcut-shot" id="dt-theater-shot">
              <div className="fourcut-filmstrip">
                <div className="fourcut-sprocket fourcut-sprocket-top" />
                <div className="fourcut-sprocket fourcut-sprocket-bottom" />
                <div className="fourcut-strip" id="dt-theater-strip" />
              </div>
              <div className="fourcut-caption">
                <div className="fourcut-caption-title" id="dt-theater-title" />
                <div className="fourcut-caption-date"><span id="dt-theater-date" /> · clov. memories</div>
              </div>
            </div>
            <div className="fourcut-scrglow" id="dt-theater-scrglow" />
            <div className="fourcut-grain" id="dt-theater-grain" />
            <div className="fourcut-countdown" id="dt-theater-count"><span className="fourcut-countdown-sweep" /><span id="dt-theater-countnum">3</span></div>
            <div className="fourcut-curtain fourcut-curtain-l" id="dt-theater-curtl" />
            <div className="fourcut-curtain fourcut-curtain-r" id="dt-theater-curtr" />
            <div className="fourcut-valance" />
          </div>

          <div className="fourcut-beam" id="dt-theater-beam">
            <div className="fourcut-dustwrap" id="dt-theater-dustwrap" />
          </div>
        </div>

        <div className="fourcut-spill" id="dt-theater-spill" />
        <div className="fourcut-house" id="dt-theater-house" />
        <div className="fourcut-seats" id="dt-theater-seats">
          <div className="fourcut-seats-bar" />
          <div className="fourcut-seat-head" style={{ left: '8%' }} />
          <div className="fourcut-seat-head" style={{ left: '30%' }} />
          <div className="fourcut-seat-head" style={{ left: '54%' }} />
          <div className="fourcut-seat-head" style={{ left: '78%' }} />
        </div>

        <button className="fourcut-exit-btn" id="dt-theater-exit" type="button" onClick={() => window.fourCutExit()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>나가기
        </button>
        <button className="fourcut-sit-btn" id="dt-theater-sit" type="button" onClick={() => window.fourCutSit()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5" /><path d="M4 11h16v5H4z" /><path d="M6 16v3M18 16v3" /></svg>
          착석하기
        </button>
        <div className="fourcut-nav" id="dt-theater-nav">
          <button type="button" onClick={() => window.fourCutNav(-1)} aria-label="이전 완성작">‹</button>
          <span id="dt-theater-counter">1 / 1</span>
          <button type="button" onClick={() => window.fourCutNav(1)} aria-label="다음 완성작">›</button>
        </div>
      </div>
    </>
  )
}
