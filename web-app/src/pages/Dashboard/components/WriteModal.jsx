// 2단계 전환: 글쓰기 모달 정적 뼈대(§7.3 "추억 기록하기", 원본 body-fragment의 #wm-backdrop).
// 동적 컨테이너(#wm-photo-strip, #wm-chips, #wm-schedule-connect)는 body-fragment.html에
// 그대로 남아있는 큰 인라인 스크립트(openWriteModal/saveWritePost 등)가 채운다 —
// 그 스크립트는 "렌더와 동시에 그 자리에서 이벤트를 붙이는" 자기완결형 패턴이라
// (예: _buildChips()가 innerHTML로 칩을 만들고 바로 다음 줄에서 querySelectorAll로
// 그 칩들에 click 리스너를 붙인다) 껍데기를 JSX로 바꿔도 안전하다.
// 열림/닫힘은 CSS 클래스(.write-modal-backdrop.open) 토글 방식 — 인라인 style 없음.
export default function WriteModal() {
  return (
    <div
      className="write-modal-backdrop"
      id="wm-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) window.closeWriteModal()
      }}
    >
      <div className="write-modal" role="dialog" aria-modal="true" aria-label="추억 기록하기">
        <div className="wm-head">
          <h2>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-3px', marginRight: 5 }}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
            추억 기록하기
          </h2>
          <button className="wm-close" onClick={() => window.closeWriteModal()} aria-label="닫기">✕</button>
        </div>
        <div className="wm-body">
          {/* 사진 (여러 장 가능) */}
          <div className="wm-field">
            <span className="wm-label">사진 (선택, 최대 15장)</span>
            <div className="wm-photo-strip" id="wm-photo-strip" />
            <input type="file" id="wm-img-input" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => window.previewWriteImg(e.currentTarget)} />
          </div>

          {/* 제목 */}
          <div className="wm-field">
            <span className="wm-label">제목</span>
            <div className="wm-title-wrap">
              <input
                className="wm-input"
                id="wm-title"
                type="text"
                maxLength={25}
                placeholder="오늘의 추억 제목을 입력하세요"
                onInput={(e) => { document.getElementById('wm-char-count').textContent = e.currentTarget.value.length + '/25' }}
              />
              <span className="wm-char-count" id="wm-char-count">0/25</span>
            </div>
          </div>

          {/* 본문 (너무 길지 않게 100자 제한) */}
          <div className="wm-field">
            <span className="wm-label">본문</span>
            <textarea
              className="wm-input"
              id="wm-body"
              rows={4}
              maxLength={100}
              placeholder="오늘 어떤 추억을 남겼나요?"
              onInput={(e) => { document.getElementById('wm-body-count').textContent = e.currentTarget.value.length + '/100' }}
            />
            <span className="wm-body-count" id="wm-body-count">0/100</span>
          </div>

          {/* 해시태그 */}
          <div className="wm-field">
            <span className="wm-label">해시태그</span>
            <input className="wm-input" id="wm-tags" type="text" placeholder="#한강 #시험끝 처럼 띄어쓰기나 쉼표로 구분해 입력 (선택)" />
          </div>

          {/* 참여자 */}
          <div className="wm-field">
            <span className="wm-label">함께한 친구</span>
            <div className="wm-chips" id="wm-chips" />
          </div>

          {/* 약속 연결 (선택 · 일정계획) — 연결하면 상세 여권에 약속 영수증이 찍힌다 */}
          <div className="wm-field wm-schedule-field">
            <span className="wm-label">약속 연결 <em>(선택 · 일정계획)</em></span>
            <div id="wm-schedule-connect" />
          </div>

          <button className="wm-submit" onClick={() => window.saveWritePost()}>
            기록 남기기 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-2px' }}><path d="M20 6 9 17l-5-5" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
