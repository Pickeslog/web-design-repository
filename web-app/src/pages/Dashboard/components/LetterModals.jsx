// 2단계 전환: 행운편지 편지함(#dt-letter-inbox-modal) + 상세(#dt-letter-detail-modal) 모달(§5.2/§7.1).
// #dt-letter-inbox-list, #dt-detail-letter-* 는 js/letter.js가 innerHTML로 채우는 빈 컨테이너.
export function LetterInboxModal() {
  return (
    <div className="modal-overlay" id="dt-letter-inbox-modal">
      <div className="modal-box letter-inbox-modal">
        <div className="letter-inbox-head">
          <div>
            <span className="letter-stage-kicker">Mailbox</span>
            <h3>도착한 행운 편지</h3>
          </div>
          <button className="letter-modal-close" type="button" onClick={() => window.closeModal('dt-letter-inbox-modal')} aria-label="닫기">×</button>
        </div>
        <div className="letter-inbox-tabs">
          <button className="letter-filter-btn active" id="dt-letter-modal-filter-all" onClick={() => window.setLetterFilter('all')}>전체</button>
          <button className="letter-filter-btn" id="dt-letter-modal-filter-favorite" onClick={() => window.setLetterFilter('favorite')}>즐겨찾기</button>
          <button className="letter-filter-btn" id="dt-letter-modal-filter-sent" onClick={() => window.setLetterFilter('sent')}>보낸 편지함</button>
        </div>
        <div id="dt-letter-inbox-list" className="letter-inbox-list" />
        <div className="letter-inbox-pager">
          <button type="button" id="dt-letter-prev" onClick={() => window.moveLetterPage(-1)}>이전</button>
          <span id="dt-letter-page-label">1 / 1</span>
          <button type="button" id="dt-letter-next" onClick={() => window.moveLetterPage(1)}>다음</button>
        </div>
      </div>
    </div>
  )
}

export function LetterDetailModal() {
  return (
    <div className="modal-overlay" id="dt-letter-detail-modal">
      <div className="modal-box letter-detail-modal">
        <div className="letter-preview letter-detail-paper">
          <button className="letter-paper-btn letter-paper-back" onClick={() => window.backToLetterInbox()} title="편지함으로 돌아가기">←</button>
          <button className="letter-paper-btn letter-paper-close" onClick={() => window.closeModal('dt-letter-detail-modal')} title="닫기">×</button>
          <h3 className="letter-detail-heading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-3px', marginRight: 5 }}>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            행운편지
          </h3>
          <div id="dt-detail-letter-to" className="letter-detail-to" />
          <div id="dt-detail-letter-content" className="letter-detail-content" />
          <div id="dt-detail-letter-from" className="letter-detail-from" />
        </div>
      </div>
    </div>
  )
}
