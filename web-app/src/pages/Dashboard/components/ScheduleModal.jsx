// 2단계 전환: 일정 생성/수정 모달(#dt-schedule-modal, "영수증" 스타일, 명세서 §6.2-⑥).
// 리치 텍스트 툴바는 원본 그대로 document.execCommand를 사용한다(더 나은 API로
// 바꾸지 않음 — "기능/디자인 그대로 이식" 원칙). #dt-schedule-preview 안 텍스트/도장
// 값들은 js/schedule.js의 updateSchedulePreview('dt')가 매 입력마다 갱신한다.
export default function ScheduleModal() {
  return (
    <div className="modal-overlay" id="dt-schedule-modal">
      <div className="modal-box">
        <h3 id="dt-schedule-modal-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-3px', marginRight: 5 }}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          다가오는 약속, 새 D-day 만들기
        </h3>
        <input type="hidden" id="dt-input-schedule-id" />

        {/* 영수증 위에서 바로 작성 (제목·날짜·본문을 영수증에 직접 입력) */}
        <div className="schedule-editor">
          <div className="growth-detail receipt" id="dt-schedule-preview" style={{ '--stamp': '#c0392b' }}>
            <div className="receipt-paper">
              <div className="receipt-zigzag" />
              <div className="receipt-head">
                <div className="receipt-brand">CLOV. MEMORIES</div>
                <div className="receipt-sub">★  약 속 메 모  ★</div>
              </div>
              <div className="receipt-stamp-wrap">
                <div className="receipt-stamp">
                  <span className="receipt-stamp-label" id="dt-prev-phrase">함께할 그날까지</span>
                  <span className="receipt-stamp-dday" id="dt-prev-dday">D-day</span>
                </div>
              </div>
              <input
                type="text"
                className="receipt-title-input"
                id="dt-input-schedule-title"
                maxLength={20}
                placeholder="약속 제목을 적어주세요"
                aria-label="약속 제목"
                onInput={() => window.updateSchedulePreview('dt')}
              />
              <div className="receipt-meta">
                <div>
                  <span>DATE</span>
                  <span className="receipt-date-cell">
                    <span id="dt-prev-date">연도-월-일</span>
                    <input
                      type="date"
                      className="receipt-date-input"
                      id="dt-input-schedule-date"
                      aria-label="약속 날짜"
                      onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                      onInput={() => window.updateSchedulePreview('dt')}
                      onChange={() => window.updateSchedulePreview('dt')}
                    />
                  </span>
                </div>
                <div>
                  <span>D-DAY</span>
                  <span id="dt-prev-dday2">D-day</span>
                </div>
              </div>
              <div className="receipt-memo-label">— MEMO ————————————</div>
              <div className="receipt-memo-toolbar">
                <button type="button" className="rich-btn" onClick={() => document.execCommand('formatBlock', false, 'H3')} title="제목">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16M4 6v12M20 6v12" /></svg>
                </button>
                <button type="button" className="rich-btn" onClick={() => document.execCommand('bold', false, null)} title="굵게">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>
                </button>
                <div className="rich-divider" />
                <button type="button" className="rich-btn" onClick={() => document.execCommand('insertUnorderedList', false, null)} title="글머리 기호">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                </button>
                <button type="button" className="rich-btn" onClick={() => document.execCommand('insertOrderedList', false, null)} title="번호 매기기">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
                </button>
                <button type="button" className="rich-btn" onClick={() => document.execCommand('insertHorizontalRule', false, null)} title="구분선">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12" /></svg>
                </button>
                <div className="rich-divider" />
                <button type="button" className="rich-btn rich-btn-steps" onClick={() => window.insertScheduleSteps('dt-input-schedule-body')} title="약속 4단계(제안·일정·확정·만남) 한 번에 넣기">
                  ＋ 단계 넣기
                </button>
              </div>
              <div
                className="receipt-memo receipt-memo-input"
                id="dt-input-schedule-body"
                contentEditable="true"
                suppressContentEditableWarning
                placeholder="약속에 대한 계획, 준비물, 메모 등을 자유롭게 적어보세요."
                onInput={() => window.updateSchedulePreview('dt')}
              />
              <div className="receipt-barcode" />
            </div>
          </div>
        </div>
        <div className="modal-buttons">
          <button className="btn-sub" onClick={() => window.closeModal('dt-schedule-modal')}>취소</button>
          <button className="btn-main" onClick={() => window.saveSchedule('dt')}>저장하기</button>
        </div>
      </div>
    </div>
  )
}
