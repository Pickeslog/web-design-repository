(function () {
  'use strict';
  var HTML = `
                          <div class="letter-tab-container">
                            <section class="letter-stage">
                                <div class="letter-stage-copy">
                                    <span class="letter-stage-kicker">Lucky Letter</span>
                                    <h2>행운 편지함</h2>
                                    <p>상자를 열어 편지를 천천히 확인해보세요.</p>
                                </div>
                                <button class="letter-box-trigger" id="dt-letter-box-trigger" type="button" onclick="openLetterInboxModal()">
                                    <span class="letter-box-ground-shadow" aria-hidden="true"></span>
                                    <span class="letter-box-visual letter-box-visual-giftbox" aria-hidden="true">
                                        <span class="gift-bow" aria-hidden="true">
                                            <svg class="gift-bow-svg" viewBox="0 0 250 120">
                                                <defs>
                                                    <linearGradient id="dtRibL" x1="0" y1="0" x2="1" y2="1">
                                                        <stop offset="0" stop-color="#ffd6e4"></stop><stop offset="1" stop-color="#ff8fb3"></stop>
                                                    </linearGradient>
                                                    <linearGradient id="dtRibR" x1="1" y1="0" x2="0" y2="1">
                                                        <stop offset="0" stop-color="#ffd6e4"></stop><stop offset="1" stop-color="#ff8fb3"></stop>
                                                    </linearGradient>
                                                    <linearGradient id="dtKnot" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0" stop-color="#ffe3ec"></stop><stop offset="1" stop-color="#ff8fb3"></stop>
                                                    </linearGradient>
                                                </defs>
                                                <path d="M120 52 C 108 74, 92 92, 78 112 L 96 116 C 108 96, 118 78, 125 60 Z" fill="url(#dtRibL)"></path>
                                                <path d="M130 52 C 142 74, 158 92, 172 112 L 154 116 C 142 96, 132 78, 125 60 Z" fill="url(#dtRibR)"></path>
                                                <path d="M125 54 C 96 26, 44 18, 40 50 C 37 74, 84 74, 125 62 Z" fill="url(#dtRibL)"></path>
                                                <path d="M125 54 C 154 26, 206 18, 210 50 C 213 74, 166 74, 125 62 Z" fill="url(#dtRibR)"></path>
                                                <path d="M118 58 C 92 42, 58 40, 52 54 C 62 62, 92 62, 118 58 Z" fill="#e0567f" opacity="0.28"></path>
                                                <path d="M132 58 C 158 42, 192 40, 198 54 C 188 62, 158 62, 132 58 Z" fill="#e0567f" opacity="0.28"></path>
                                                <rect x="108" y="44" width="34" height="32" rx="9" fill="url(#dtKnot)"></rect>
                                                <rect x="112" y="47" width="10" height="26" rx="5" fill="#ffc2d6" opacity="0.5"></rect>
                                            </svg>
                                        </span>
                                        <span class="letter-box-lid"></span>
                                        <span class="letter-box-body"></span>
                                    </span>
                                    <span class="letter-box-visual letter-box-visual-mailbox" aria-hidden="true">
                                        <svg class="mailbox-svg" viewBox="0 0 250 230" aria-hidden="true">
                                            <defs>
                                                <linearGradient id="mbPostGrad" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0" stop-color="#374151" /><stop offset="0.5" stop-color="#4b5563" /><stop offset="1" stop-color="#1f2937" />
                                                </linearGradient>
                                                <linearGradient id="mbBodyGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0" stop-color="#ef4444" /><stop offset="0.6" stop-color="#dc2626" /><stop offset="1" stop-color="#991b1b" />
                                                </linearGradient>
                                                <linearGradient id="mbDoorGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0" stop-color="#f87171" /><stop offset="0.3" stop-color="#ef4444" /><stop offset="1" stop-color="#b91c1c" />
                                                </linearGradient>
                                                <linearGradient id="mbFlagGrad" x1="0" y1="0" x2="1" y2="1">
                                                    <stop offset="0" stop-color="#fbbf24" /><stop offset="1" stop-color="#f59e0b" />
                                                </linearGradient>
                                                <filter id="mbShadow" x="-50%" y="-50%" width="200%" height="200%">
                                                    <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#111827" flood-opacity="0.25" />
                                                </filter>
                                            </defs>

                                            <!-- 우체통 철제 받침대 (Post) -->
                                            <g class="mailbox-post-group">
                                                <rect x="98" y="206" width="54" height="10" rx="5" fill="#374151" />
                                                <rect x="105" y="198" width="40" height="8" rx="3" fill="#4b5563" />
                                                <rect x="113" y="140" width="24" height="60" rx="4" fill="url(#mbPostGrad)" />
                                            </g>

                                            <!-- 우체통 본체 (Housing & Interior) -->
                                            <g class="mailbox-housing" filter="url(#mbShadow)">
                                                <path d="M 55 142 L 55 80 C 55 40, 195 40, 195 80 L 195 142 Z" fill="#1e293b" />
                                                <rect x="48" y="140" width="154" height="14" rx="7" fill="#7f1d1d" />
                                            </g>

                                            <!-- 내부에 담긴 편지 -->
                                            <g class="mailbox-letter-item">
                                                <rect x="85" y="70" width="80" height="54" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
                                                <path d="M 85 70 L 125 98 L 165 70" fill="none" stroke="#dc2626" stroke-width="2" />
                                                <circle cx="125" cy="95" r="9" fill="#dc2626" />
                                                <text x="125" y="99" font-size="11" text-anchor="middle" fill="#fff">🍀</text>
                                            </g>

                                            <!-- 우측 알림 깃발 (Flag) -->
                                            <g class="mailbox-flag-group">
                                                <rect x="196" y="70" width="6" height="50" rx="3" fill="url(#mbFlagGrad)" />
                                                <path d="M 202 70 L 228 70 M 202 70 L 228 82 L 202 94 Z" fill="#f59e0b" />
                                                <circle cx="199" cy="115" r="6" fill="#b45309" stroke="#fff" stroke-width="2" />
                                            </g>

                                            <!-- 우체통 앞문 (Door) -->
                                            <g class="mailbox-door-group">
                                                <path d="M 55 142 L 55 80 C 55 40, 195 40, 195 80 L 195 142 Z" fill="url(#mbDoorGrad)" stroke="#ffffff" stroke-width="3.5" />
                                                <rect x="80" y="58" width="90" height="14" rx="4" fill="#374151" stroke="#cbd5e1" stroke-width="2" />
                                                <rect x="84" y="62" width="82" height="6" rx="2" fill="#111827" />
                                                <circle cx="125" cy="102" r="18" fill="#ffffff" />
                                                <text x="125" y="108" font-size="18" text-anchor="middle">📮</text>
                                                <circle cx="125" cy="45" r="6" fill="#f8fafc" stroke="#64748b" stroke-width="2" />
                                            </g>
                                        </svg>
                                    </span>
                                </button>
                                <div id="dt-letter-zone" class="letter-box-summary">
                                    <!-- 동적 행운 편지함 요약 영역 -->
                                </div>
                                <button class="letter-filter-btn action-btn letter-write-btn" onclick="toggleInlineLetterWrite('dt')">
                                    <span>편지 작성</span>
                                </button>
                            </section>

                            <div id="dt-inline-letter-write" class="modal-box letter-write-card" style="display: none;">
                                <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:5px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>행운 편지 작성</h3>
                                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">소중한 사람에게 마음을 담은 편지를 보내보세요.</p>
                                <div class="modal-form-group">
                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                        <label style="margin-bottom: 0; font-size: 13px;">받는 사람 선택</label>
                                        <button type="button" id="dt-letter-to-all-btn" onclick="toggleLetterToAllBtn('dt')" style="padding: 5px 12px; font-size: 11px; font-weight: 600; border-radius: 20px; border: none; cursor: pointer; transition: all 0.2s ease; background: var(--nav-item-bg-active); color: var(--primary-green);">모두에게 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></button>
                                    </div>
                                    <div class="letter-recipient-picker" id="dt-letter-recipient-picker">
                                        <button type="button" class="letter-recipient-chip" data-name="나" onclick="selectLetterRecipient(this, 'dt')">
                                            <span class="letter-recipient-avatar" style="background: var(--primary-green);">나</span>
                                            <span>나</span>
                                        </button>
                                        <button type="button" class="letter-recipient-chip" data-name="솔" onclick="selectLetterRecipient(this, 'dt')">
                                            <span class="letter-recipient-avatar" style="background: #52b788;">솔</span>
                                            <span>솔</span>
                                        </button>
                                        <button type="button" class="letter-recipient-chip" data-name="민" onclick="selectLetterRecipient(this, 'dt')">
                                            <span class="letter-recipient-avatar" style="background: #74c69d;">민</span>
                                            <span>민</span>
                                        </button>
                                        <button type="button" class="letter-recipient-chip" data-name="준" onclick="selectLetterRecipient(this, 'dt')">
                                            <span class="letter-recipient-avatar" style="background: #95d5b2;">준</span>
                                            <span>준</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="modal-form-group">
                                    <label>편지 내용</label>
                                    <textarea id="dt-letter-content" class="letter-write-textarea" placeholder="응원, 감사, 행운의 메시지를 자유롭게 작성해주세요." oninput="handleLetterContentInput(this, 'dt')"></textarea>
                                    <div class="letter-content-count" id="dt-letter-content-count" style="text-align: right; font-size: 11px; color: var(--text-muted); margin-top: 4px;">0 / 1000 (한글 500자 / 영어 1000자)</div>
                                </div>
                                <div class="modal-buttons letter-write-buttons">
                                    <button class="btn-sub" onclick="toggleInlineLetterWrite('dt')">취소</button>
                                    <button class="btn-main" onclick="submitLetter('dt')">편지 발송!</button>
                                </div>
                            </div>
                          </div>
`;

  window.LetterPage = {
    init: function () {
      var el = document.getElementById('dt-tab-letter');
      if (el) el.innerHTML = HTML;
    }
  };
})();
