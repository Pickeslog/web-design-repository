// 2단계 전환: 행운편지 탭 본문 뼈대(§5, 원본 pages/letter-page.js).
// 선물상자/우체통 SVG 두 벌은 문서 §7.2에서 언급된 사용자설정 테마 전환용 —
// CSS가 둘 중 하나만 보이게 전환한다(로직 그대로, 마크업만 JSX로 옮김).
// 받는사람 칩 4개(나/솔/민/준)는 명세서 §5.2-③/§9-2에 나온 대로 하드코딩이며,
// 신규 멤버가 늘어나도 자동 반영되지 않는 기존 동작을 그대로 유지했다.
export default function LetterTabContent() {
  return (
    <div className="letter-tab-container">
      <section className="letter-stage">
        <div className="letter-stage-copy">
          <span className="letter-stage-kicker">Lucky Letter</span>
          <h2>행운 편지함</h2>
          <p>상자를 열어 편지를 천천히 확인해보세요.</p>
        </div>
        <button className="letter-box-trigger" id="dt-letter-box-trigger" type="button" onClick={() => window.openLetterInboxModal()}>
          <span className="letter-box-ground-shadow" aria-hidden="true" />
          <span className="letter-box-visual letter-box-visual-giftbox" aria-hidden="true">
            <span className="gift-bow" aria-hidden="true">
              <svg className="gift-bow-svg" viewBox="0 0 250 120">
                <defs>
                  <linearGradient id="dtRibL" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffd6e4" /><stop offset="1" stopColor="#ff8fb3" />
                  </linearGradient>
                  <linearGradient id="dtRibR" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffd6e4" /><stop offset="1" stopColor="#ff8fb3" />
                  </linearGradient>
                  <linearGradient id="dtKnot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffe3ec" /><stop offset="1" stopColor="#ff8fb3" />
                  </linearGradient>
                </defs>
                <path d="M120 52 C 108 74, 92 92, 78 112 L 96 116 C 108 96, 118 78, 125 60 Z" fill="url(#dtRibL)" />
                <path d="M130 52 C 142 74, 158 92, 172 112 L 154 116 C 142 96, 132 78, 125 60 Z" fill="url(#dtRibR)" />
                <path d="M125 54 C 96 26, 44 18, 40 50 C 37 74, 84 74, 125 62 Z" fill="url(#dtRibL)" />
                <path d="M125 54 C 154 26, 206 18, 210 50 C 213 74, 166 74, 125 62 Z" fill="url(#dtRibR)" />
                <path d="M118 58 C 92 42, 58 40, 52 54 C 62 62, 92 62, 118 58 Z" fill="#e0567f" opacity="0.28" />
                <path d="M132 58 C 158 42, 192 40, 198 54 C 188 62, 158 62, 132 58 Z" fill="#e0567f" opacity="0.28" />
                <rect x="108" y="44" width="34" height="32" rx="9" fill="url(#dtKnot)" />
                <rect x="112" y="47" width="10" height="26" rx="5" fill="#ffc2d6" opacity="0.5" />
              </svg>
            </span>
            <span className="letter-box-lid" />
            <span className="letter-box-body" />
          </span>
          <span className="letter-box-visual letter-box-visual-mailbox" aria-hidden="true">
            <svg className="mailbox-svg" viewBox="0 0 250 230" aria-hidden="true">
              <defs>
                <linearGradient id="mbPostGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#374151" /><stop offset="0.5" stopColor="#4b5563" /><stop offset="1" stopColor="#1f2937" />
                </linearGradient>
                <linearGradient id="mbBodyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ef4444" /><stop offset="0.6" stopColor="#dc2626" /><stop offset="1" stopColor="#991b1b" />
                </linearGradient>
                <linearGradient id="mbDoorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f87171" /><stop offset="0.3" stopColor="#ef4444" /><stop offset="1" stopColor="#b91c1c" />
                </linearGradient>
                <linearGradient id="mbFlagGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fbbf24" /><stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
                <filter id="mbShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#111827" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* 우체통 철제 받침대 (Post) */}
              <g className="mailbox-post-group">
                <rect x="98" y="206" width="54" height="10" rx="5" fill="#374151" />
                <rect x="105" y="198" width="40" height="8" rx="3" fill="#4b5563" />
                <rect x="113" y="140" width="24" height="60" rx="4" fill="url(#mbPostGrad)" />
              </g>

              {/* 우체통 본체 (Housing & Interior) */}
              <g className="mailbox-housing" filter="url(#mbShadow)">
                <path d="M 55 142 L 55 80 C 55 40, 195 40, 195 80 L 195 142 Z" fill="#1e293b" />
                <rect x="48" y="140" width="154" height="14" rx="7" fill="#7f1d1d" />
              </g>

              {/* 내부에 담긴 편지 */}
              <g className="mailbox-letter-item">
                <rect x="85" y="70" width="80" height="54" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                <path d="M 85 70 L 125 98 L 165 70" fill="none" stroke="#dc2626" strokeWidth="2" />
                <circle cx="125" cy="95" r="9" fill="#dc2626" />
                <text x="125" y="99" fontSize="11" textAnchor="middle" fill="#fff">🍀</text>
              </g>

              {/* 우측 알림 깃발 (Flag) */}
              <g className="mailbox-flag-group">
                <rect x="196" y="70" width="6" height="50" rx="3" fill="url(#mbFlagGrad)" />
                <path d="M 202 70 L 228 70 M 202 70 L 228 82 L 202 94 Z" fill="#f59e0b" />
                <circle cx="199" cy="115" r="6" fill="#b45309" stroke="#fff" strokeWidth="2" />
              </g>

              {/* 우체통 앞문 (Door) */}
              <g className="mailbox-door-group">
                <path d="M 55 142 L 55 80 C 55 40, 195 40, 195 80 L 195 142 Z" fill="url(#mbDoorGrad)" stroke="#ffffff" strokeWidth="3.5" />
                <rect x="80" y="58" width="90" height="14" rx="4" fill="#374151" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="84" y="62" width="82" height="6" rx="2" fill="#111827" />
                <circle cx="125" cy="102" r="18" fill="#ffffff" />
                <text x="125" y="108" fontSize="18" textAnchor="middle">📮</text>
                <circle cx="125" cy="45" r="6" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
              </g>
            </svg>
          </span>
        </button>
        <div id="dt-letter-zone" className="letter-box-summary" />
        <button className="letter-filter-btn action-btn letter-write-btn" onClick={() => window.toggleInlineLetterWrite('dt')}>
          <span>편지 작성</span>
        </button>
      </section>

      <div id="dt-inline-letter-write" className="modal-box letter-write-card" style={{ display: 'none' }}>
        <h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-3px', marginRight: 5 }}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
          행운 편지 작성
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>소중한 사람에게 마음을 담은 편지를 보내보세요.</p>
        <div className="modal-form-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <label style={{ marginBottom: 0, fontSize: 13 }}>받는 사람 선택</label>
            <button
              type="button"
              id="dt-letter-to-all-btn"
              onClick={() => window.toggleLetterToAllBtn('dt')}
              style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 20, border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', background: 'var(--nav-item-bg-active)', color: 'var(--primary-green)' }}
            >
              모두에게{' '}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-1px' }}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            </button>
          </div>
          <div className="letter-recipient-picker" id="dt-letter-recipient-picker">
            <button type="button" className="letter-recipient-chip" data-name="나" onClick={(e) => window.selectLetterRecipient(e.currentTarget, 'dt')}>
              <span className="letter-recipient-avatar" style={{ background: 'var(--primary-green)' }}>나</span>
              <span>나</span>
            </button>
            <button type="button" className="letter-recipient-chip" data-name="솔" onClick={(e) => window.selectLetterRecipient(e.currentTarget, 'dt')}>
              <span className="letter-recipient-avatar" style={{ background: '#52b788' }}>솔</span>
              <span>솔</span>
            </button>
            <button type="button" className="letter-recipient-chip" data-name="민" onClick={(e) => window.selectLetterRecipient(e.currentTarget, 'dt')}>
              <span className="letter-recipient-avatar" style={{ background: '#74c69d' }}>민</span>
              <span>민</span>
            </button>
            <button type="button" className="letter-recipient-chip" data-name="준" onClick={(e) => window.selectLetterRecipient(e.currentTarget, 'dt')}>
              <span className="letter-recipient-avatar" style={{ background: '#95d5b2' }}>준</span>
              <span>준</span>
            </button>
          </div>
        </div>
        <div className="modal-form-group">
          <label>편지 내용</label>
          <textarea
            id="dt-letter-content"
            className="letter-write-textarea"
            placeholder="응원, 감사, 행운의 메시지를 자유롭게 작성해주세요."
            onInput={(e) => window.handleLetterContentInput(e.currentTarget, 'dt')}
          />
          <div className="letter-content-count" id="dt-letter-content-count" style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            0 / 1000 (한글 500자 / 영어 1000자)
          </div>
        </div>
        <div className="modal-buttons letter-write-buttons">
          <button className="btn-sub" onClick={() => window.toggleInlineLetterWrite('dt')}>취소</button>
          <button className="btn-main" onClick={() => window.submitLetter('dt')}>편지 발송!</button>
        </div>
      </div>
    </div>
  )
}
