// 2단계 전환: 인증사진 업로드 결과 안내 모달(#dt-proof-result-modal, 명세서 §7.1).
// 제목/문구/아이콘은 js/schedule.js가 상황에 맞게 textContent로 갈아끼운다(정적 문구는 초기값).
export default function ProofResultModal() {
  return (
    <div className="modal-overlay" id="dt-proof-result-modal">
      <div className="modal-box proof-result-modal">
        <div className="proof-result-icon" id="dt-proof-result-icon">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <span className="v5-photo-burst" id="dt-proof-burst" />
        <h3 id="dt-proof-result-title">인증사진 업로드</h3>
        <p id="dt-proof-result-message">인증사진이 업로드됐어요.</p>
        <button className="proof-result-primary" id="dt-proof-result-primary" type="button" onClick={() => window.closeProofResultModal()}>확인</button>
        <button className="proof-result-secondary" id="dt-proof-result-secondary" type="button" onClick={() => window.closeProofResultModal()}>나중에 하기</button>
      </div>
    </div>
  )
}
