// 2단계 전환: (레거시) 추억 게시글 작성 모달(#dt-post-modal, 명세서 §7.1).
// 명세서에 "실사용은 글쓰기 모달(wm-backdrop)이고 이건 레거시"라고 명시되어 있다 —
// 지금 이 모달을 여는 트리거가 없는 죽은 코드일 수 있지만, "기능을 지우지 말고
// 그대로 이식" 원칙에 따라 삭제하지 않고 그대로 옮긴다.
export default function LegacyPostModal() {
  return (
    <div className="modal-overlay" id="dt-post-modal">
      <div className="modal-box">
        <h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-3px', marginRight: 5 }}>
            <path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          새 추억 게시글 작성
        </h3>
        <div className="modal-form-group">
          <label>제목</label>
          <input type="text" id="dt-post-title" placeholder="추억의 제목을 작성해주세요" maxLength={30} />
        </div>
        <div className="modal-form-group">
          <label>내용</label>
          <textarea id="dt-post-content" placeholder="우리만의 소중한 기록을 남겨보세요." maxLength={500} />
        </div>
        <div className="modal-form-group">
          <label>해시태그 선택</label>
          <input className="custom-tag-input" type="text" id="dt-custom-tags" placeholder="직접 태그 입력 예: #한강 #시험끝" />
        </div>
        <div className="modal-buttons">
          <button className="btn-sub" onClick={() => window.closeModal('dt-post-modal')}>취소</button>
          <button className="btn-main" onClick={() => window.addNewDesktopPost()}>등록하기</button>
        </div>
      </div>
    </div>
  )
}
