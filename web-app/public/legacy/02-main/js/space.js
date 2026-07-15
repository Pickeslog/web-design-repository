        function getEvidenceIndex() {
            const posts = groupsData[activeGroup].posts || [];
            const savedIndex = activeEvidenceIndexes[activeGroup] || 0;
            return Math.min(Math.max(savedIndex, 0), Math.max(posts.length - 1, 0));
        }

        function setEvidenceIndex(index) {
            if (window.isFilmDraggingPreventClick) return;
            const posts = groupsData[activeGroup].posts || [];
            if (posts.length === 0) return;
            const previousIndex = getEvidenceIndex();
            const nextIndex = Math.min(Math.max(index, 0), posts.length - 1);
            evidenceSlideDirection = nextIndex > previousIndex ? 'past' : nextIndex < previousIndex ? 'current' : 'idle';
            activeEvidenceIndexes[activeGroup] = nextIndex;
            renderEvidenceViewers();
        }

        function renderMemoryCard(post, postIndex) {
            const normalizedPost = normalizeMemoryPost(post);
            const isMine = normalizedPost.authorId === CURRENT_USER_ID;
            const author = normalizedPost.participants.find(participant => participant.id === normalizedPost.authorId) || normalizedPost.participants[0];
            const authorLabel = isMine
                ? (isAccountWithdrawn() ? `${CLOV_ANON_NAME}의 기록` : '내 기록')
                : `${author.name}의 기록`;
            const coverPhoto = normalizedPost.photos[0] || '';
            const styleBg = coverPhoto ? `background-image: url('${escapeHtml(coverPhoto)}');` : '';
            const imageContent = coverPhoto
                ? ''
                : `<div class="cline-no-photo"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><path d="m4 18 4-4 3 2 4-5 5 4"/></svg></span><span class="cline-no-photo-text">사진 없음</span></div>`;
            const photoCountBadge = normalizedPost.photos.length > 1
                ? `<span class="polaroid-photo-count"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:2px;"><path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.5"/></svg>${normalizedPost.photos.length}</span>`
                : '';

            const visibleParticipants = normalizedPost.participants.slice(0, 4);
            const restCount = normalizedPost.participants.length - visibleParticipants.length;
            const nameSummary = normalizedPost.participants.map(participant => participant.name).join(', ');
            const avatarRail = visibleParticipants.map(participant => `
                <span class="presence-tile ${escapeHtml(participant.type)} ${participant.id === normalizedPost.authorId ? 'is-author' : ''}">
                    <span class="presence-dot">${escapeHtml(participant.icon || participant.name.slice(0, 1))}</span>
                </span>
            `).join('') + (restCount > 0 ? `<span class="presence-more">+${restCount}</span>` : '');

            const tags = getMemoryHashtags(normalizedPost);
            const tagsHtml = `
                <div class="memory-footer-tags">
                    ${tags.map((tag, index) => `<div class="memory-tag ${index === 0 ? 'highlight' : ''}">${escapeHtml(tag)}</div>`).join('')}
                </div>
            `;

            const bodyPreview = getRecordPreviewText(normalizedPost.text, 48);
            const messageCount = normalizedPost.messages.length;

            return `
                <div class="memory-card polaroid-card ${isMine ? 'mine' : 'friend'}">
                    <div class="polaroid-presence-row">
                        ${avatarRail}
                    </div>
                    <div class="polaroid-photo${coverPhoto ? '' : ' is-empty'}" style="${styleBg}" onclick="openMemoryDetail(${postIndex})">
                        <span class="author-badge">${escapeHtml(authorLabel)}</span>
                        ${imageContent}
                        ${photoCountBadge}
                        <span class="polaroid-zoom-hint">🔍 자세히</span>
                    </div>
                    <div class="polaroid-caption">
                        <div class="my-record-box ${isMine ? 'mine' : 'friend'}">
                            <div class="my-record-header">
                                <div class="my-record-title">${escapeHtml(authorLabel)}</div>
                                <button type="button" class="record-more-btn" onclick="event.stopPropagation(); openMemoryDetail(${postIndex})">···더보기</button>
                            </div>
                            <div class="memory-title">${escapeHtml(normalizedPost.title)}</div>
                            <div class="my-record-text">${escapeHtml(bodyPreview)}</div>
                        </div>
                        ${tagsHtml}
                        <div class="memory-meta-row">
                            <span class="memory-date">${escapeHtml(normalizedPost.date)}${normalizedPost.subtitle ? ` · ${escapeHtml(normalizedPost.subtitle)}` : ''}</span>
                            <span class="memory-message-count"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:2px;"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>${messageCount}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // 추억 상세 모달 상태 (게시자: 제목/본문 수정·삭제, 친구: 한 줄 메시지 작성/수정/삭제)
        let memoryDetailState = { postIndex: null, editing: false, deleteConfirm: false, composeDraft: '', editingMsgAuthorId: null, msgEditDraft: '', photoIndex: 0, photoDraft: null };

        function getCurrentMemoryPost() {
            if (memoryDetailState.postIndex === null) return null;
            return (groupsData[activeGroup].posts || [])[memoryDetailState.postIndex] || null;
        }

        function openMemoryDetail(postIndex) {
            const post = (groupsData[activeGroup].posts || [])[postIndex];
            if (!post) return;
            normalizeMemoryPost(post);
            memoryDetailState = { postIndex, editing: false, deleteConfirm: false, composeDraft: '', editingMsgAuthorId: null, msgEditDraft: '', photoIndex: 0, photoDraft: null };
            renderMemoryDetailModal();

            const sheet = document.getElementById('memory-detail-sheet');
            const backdrop = document.getElementById('memory-detail-backdrop');
            if (!sheet || !backdrop) return;
            backdrop.classList.add('open');
            sheet.classList.add('open');
            sheet.setAttribute('aria-hidden', 'false');
        }

        function closeMemoryDetail() {
            const sheet = document.getElementById('memory-detail-sheet');
            const backdrop = document.getElementById('memory-detail-backdrop');
            memoryDetailState = { postIndex: null, editing: false, deleteConfirm: false, composeDraft: '', editingMsgAuthorId: null, msgEditDraft: '', photoIndex: 0, photoDraft: null };
            if (!sheet || !backdrop) return;

            backdrop.classList.remove('open');
            sheet.classList.remove('open');
            sheet.setAttribute('aria-hidden', 'true');
        }

        function renderMemoryDetailModal() {
            const sheet = document.getElementById('memory-detail-sheet');
            const post = getCurrentMemoryPost();
            if (!sheet || !post) return;

            const normalizedPost = normalizeMemoryPost(post);
            const isMine = normalizedPost.authorId === CURRENT_USER_ID;
            const author = normalizedPost.participants.find(participant => participant.id === normalizedPost.authorId) || normalizedPost.participants[0];
            const authorLabel = isMine
                ? (isAccountWithdrawn() ? `${CLOV_ANON_NAME}의 기록` : '내 기록')
                : `${author.name}의 기록`;
            const metaLine = `${normalizedPost.date}${normalizedPost.subtitle ? ` · ${normalizedPost.subtitle}` : ''}`;
            memoryDetailState.photoIndex = Math.min(Math.max(memoryDetailState.photoIndex || 0, 0), Math.max(normalizedPost.photos.length - 1, 0));

            // ── 수정 모드: 사진 스트립 + 제목/본문 폼 + 약속 연결 편집 ──
            const editPhotoStripHtml = `
                <div class="memory-edit-photo-strip">
                    ${(memoryDetailState.photoDraft || []).map((url, index) => `
                        <div class="memory-edit-photo-thumb">
                            <img src="${escapeHtml(url)}" alt="사진 ${index + 1}">
                            <button type="button" class="memory-edit-photo-remove" onclick="removeMemoryEditPhoto(${index})" aria-label="사진 삭제">✕</button>
                        </div>
                    `).join('')}
                    ${(memoryDetailState.photoDraft || []).length < MEMORY_PHOTO_LIMIT ? `
                        <button type="button" class="memory-edit-photo-add" onclick="document.getElementById('memory-edit-photo-input').click()">
                            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.5"/></svg></span><span>추가</span>
                        </button>
                    ` : ''}
                </div>
                <input type="file" id="memory-edit-photo-input" accept="image/*" multiple style="display:none" onchange="handleMemoryEditPhotoUpload(this)">
            `;

            const draftSchedule = findScheduleById(memoryDetailState.scheduleDraftId);
            const scheduleEditHtml = memoryDetailState.schedulePickerOpen ? `
                <div class="mp-sched-list">
                    ${renderMemorySchedulePickerRows(memoryDetailState.scheduleDraftId, 'selectMemoryEditSchedule')}
                </div>
                <button type="button" class="mp-connect-cancel" onclick="closeMemoryEditSchedulePicker()">목록 닫기</button>
            ` : draftSchedule ? `
                <div class="mp-connect-chip">
                    <span class="mp-connect-dday">${calculateDday(draftSchedule.date)}</span>
                    <span class="mp-connect-title">${escapeHtml(draftSchedule.title)} <b>· 연결됨</b></span>
                    <button type="button" class="mp-connect-btn" onclick="openMemoryEditSchedulePicker()">변경</button>
                    <button type="button" class="mp-connect-btn mp-connect-btn--detach" onclick="detachMemoryEditSchedule()">해제</button>
                </div>
            ` : `
                <button type="button" class="mp-connect-open" onclick="openMemoryEditSchedulePicker()">🗓️ 일정계획에서 약속 가져오기</button>
                <div class="mp-connect-hint">연결 안 하면 <b>자유 기록(FREE MEMORY)</b>으로 저장돼요</div>
            `;

            const rightColumnHtml = `
                <div class="memory-detail-edit-form">
                    <input type="text" id="memory-detail-edit-title" class="memory-detail-edit-title-input" value="${escapeHtml(memoryDetailState.editTitleDraft ?? normalizedPost.title)}" maxlength="40">
                    <textarea id="memory-detail-edit-body" class="memory-detail-edit-body-input" rows="6" maxlength="100" oninput="document.getElementById('memory-detail-edit-body-count').textContent = this.value.length + '/100'">${escapeHtml(memoryDetailState.editBodyDraft ?? (normalizedPost.text || ''))}</textarea>
                    <span class="memory-detail-edit-body-count" id="memory-detail-edit-body-count">${(memoryDetailState.editBodyDraft ?? (normalizedPost.text || '')).length}/100</span>
                    <div class="mp-connect-field">
                        <div class="mp-connect-label">약속 연결 <span>(선택 · 일정계획)</span></div>
                        ${scheduleEditHtml}
                    </div>
                    <div class="memory-detail-edit-actions">
                        <button type="button" class="btn-sub" onclick="cancelMemoryPostEdit()">취소</button>
                        <button type="button" class="btn-main" onclick="updateMemoryPost()">저장</button>
                    </div>
                </div>
            `;

            // ── 여권(MEMORY PASSPORT) 보기 모드: 대표사진 + 썸네일 스트립 + 약속 영수증 ──
            const schedule = findScheduleById(normalizedPost.scheduleId);
            const stampState = getMemoryStampState(schedule);
            const photos = normalizedPost.photos;
            const photoCount = photos.length;
            const currentPhotoIndex = memoryDetailState.photoIndex;
            const pad2 = n => String(n).padStart(2, '0');
            const MP_MAX_THUMBS = 4;
            const visibleThumbs = photos.slice(0, MP_MAX_THUMBS);
            const extraThumbCount = photoCount - visibleThumbs.length;

            const passportPhotoHtml = photoCount ? `
                <div class="mp-photo-main" onclick="openMemoryGallery(${currentPhotoIndex})">
                    <img src="${escapeHtml(photos[currentPhotoIndex] || photos[0])}" alt="${escapeHtml(normalizedPost.title)}">
                    <span class="mp-photo-index">${pad2(currentPhotoIndex + 1)} / ${pad2(photoCount)}</span>
                    ${photoCount > 1 ? `
                        <button type="button" class="mp-photo-arrow mp-photo-arrow--prev" onclick="event.stopPropagation(); memoryDetailPhotoNav(-1)" aria-label="이전 사진">‹</button>
                        <button type="button" class="mp-photo-arrow mp-photo-arrow--next" onclick="event.stopPropagation(); memoryDetailPhotoNav(1)" aria-label="다음 사진">›</button>
                    ` : ''}
                </div>
                ${photoCount > 1 ? `
                    <div class="mp-thumb-strip">
                        ${visibleThumbs.map((url, index) => `
                            <button type="button" class="mp-thumb ${index === currentPhotoIndex ? 'is-active' : ''}" onclick="setMemoryDetailPhotoIndex(${index})">
                                <img src="${escapeHtml(url)}" alt="사진 ${index + 1}">
                            </button>
                        `).join('')}
                        ${extraThumbCount > 0 ? `<button type="button" class="mp-thumb mp-thumb--more" onclick="openMemoryGallery(${MP_MAX_THUMBS})">+${extraThumbCount}</button>` : ''}
                    </div>
                ` : ''}
            ` : `<div class="mp-photo-main mp-photo-main--empty"><div class="cline-no-photo"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><path d="m4 18 4-4 3 2 4-5 5 4"/></svg></span><span class="cline-no-photo-text">사진 없음</span></div></div>`;

            let statusText;
            let statusClass;
            if (stampState === 'complete') {
                statusText = '달성 · 인생4컷 완성';
                statusClass = 'complete';
            } else if (stampState === 'pending') {
                statusText = `기록 중 · 인생4컷 ${getScheduleProofCount(schedule)}/4`;
                statusClass = 'pending';
            } else if (stampState === 'before') {
                statusText = `약속 예정 · ${calculateDday(schedule.date)}`;
                statusClass = 'before';
            } else {
                statusText = '자유 기록 · FREE MEMORY';
                statusClass = 'free';
            }

            const messagesHtml = normalizedPost.participants
                .map(participant => {
                    const message = normalizedPost.messages.find(item => item.authorId === participant.id);
                    const isSelf = participant.id === CURRENT_USER_ID;
                    const avatar = `<span class="memory-message-avatar">${escapeHtml(participant.icon || participant.name.slice(0, 1))}</span>`;
                    const nameLabel = `<span class="memory-message-name">${escapeHtml(participant.name)}</span>`;

                    if (memoryDetailState.editingMsgAuthorId === participant.id) {
                        return `
                            <div class="memory-message-row">
                                ${avatar}${nameLabel}
                                <input type="text" class="memory-message-edit-input" id="memory-message-edit-input" value="${escapeHtml(memoryDetailState.msgEditDraft)}" maxlength="80" oninput="memoryDetailState.msgEditDraft = this.value">
                                <button type="button" class="memory-message-save-btn" onclick="saveMemoryMessageEdit('${escapeHtml(participant.id)}')">저장</button>
                                <button type="button" class="memory-message-cancel-btn" onclick="cancelMemoryMessageEdit()">취소</button>
                            </div>
                        `;
                    }

                    if (message) {
                        return `
                            <div class="memory-message-row">
                                ${avatar}${nameLabel}
                                <span class="memory-message-text">${escapeHtml(message.text)}</span>
                                ${isSelf ? `
                                    <button type="button" class="memory-message-edit-btn" onclick="startMemoryMessageEdit('${escapeHtml(participant.id)}')">수정</button>
                                    <button type="button" class="memory-message-delete-btn" onclick="deleteMemoryMessage('${escapeHtml(participant.id)}')">삭제</button>
                                ` : ''}
                            </div>
                        `;
                    }

                    if (isSelf) {
                        return `
                            <div class="memory-message-row memory-message-row--compose">
                                ${avatar}${nameLabel}
                                <input type="text" class="memory-message-compose-input" id="memory-message-compose-input" placeholder="한 줄 메시지를 남겨보세요" maxlength="80" value="${escapeHtml(memoryDetailState.composeDraft)}" oninput="memoryDetailState.composeDraft = this.value">
                                <button type="button" class="memory-message-save-btn" onclick="saveMemoryMessage()">등록</button>
                            </div>
                        `;
                    }

                    return `
                        <div class="memory-message-row memory-message-row--empty">
                            ${avatar}${nameLabel}
                            <span class="memory-message-empty-text">아직 메시지 없음</span>
                        </div>
                    `;
                }).join('');

            const actionsHtml = memoryDetailState.editing ? '' : memoryDetailState.deleteConfirm ? `
                <div class="memory-detail-delete-confirm">
                    <span>이 추억을 삭제할까요?</span>
                    <button type="button" class="btn-sub" onclick="cancelDeleteMemoryPost()">취소</button>
                    <button type="button" class="btn-danger" onclick="confirmDeleteMemoryPost()">삭제</button>
                </div>
            ` : isMine ? `
                <div class="memory-detail-actions">
                    <button type="button" class="btn-sub" onclick="startMemoryPostEdit()">수정</button>
                    <button type="button" class="btn-danger" onclick="requestDeleteMemoryPost()">삭제</button>
                    <button type="button" class="btn-main" onclick="closeMemoryDetail()">닫기</button>
                </div>
            ` : `
                <div class="memory-detail-actions memory-detail-actions--friend">
                    <span class="memory-detail-friend-note">친구는 메시지만 남길 수 있어요</span>
                    <button type="button" class="btn-main" onclick="closeMemoryDetail()">닫기</button>
                </div>
            `;

            if (memoryDetailState.editing) {
                sheet.classList.add('is-editing');
                sheet.innerHTML = `
                    <div class="memory-detail-head">
                        <div>
                            <div class="memory-detail-kicker" id="memory-detail-author">${escapeHtml(authorLabel)}</div>
                            <div class="memory-detail-date" id="memory-detail-date">${escapeHtml(metaLine)}</div>
                        </div>
                        <button type="button" class="memory-detail-close" onclick="closeMemoryDetail()" aria-label="닫기">×</button>
                    </div>
                    <div class="memory-detail-columns">
                        <div class="memory-detail-photo-col">${editPhotoStripHtml}</div>
                        <div class="memory-detail-text-col">${rightColumnHtml}</div>
                    </div>
                    <div class="memory-detail-messages">
                        <div class="memory-detail-messages-title">친구 한 줄 메시지</div>
                        ${messagesHtml || '<div class="memory-message-empty-text">아직 참여한 친구가 없습니다</div>'}
                    </div>
                    ${actionsHtml}
                `;
                return;
            }

            sheet.classList.remove('is-editing');
            sheet.innerHTML = `
                <div class="mp-cover">
                    <div class="mp-cover-kicker">★ CLOV MEMORY PASSPORT ★</div>
                    <div class="mp-cover-title" id="memory-detail-author">${escapeHtml(normalizedPost.title)}</div>
                    <div class="mp-cover-sub">REPUBLIC OF CLOVER · 우정 여권</div>
                    <div class="mp-cover-author">${escapeHtml(authorLabel)} · ${escapeHtml(metaLine)}</div>
                    <button type="button" class="mp-close" onclick="closeMemoryDetail()" aria-label="닫기">×</button>
                </div>
                <div class="mp-main">
                    <div class="mp-photo-col">${passportPhotoHtml}</div>
                    <div class="mp-receipt-col">
                        ${schedule
                            ? `<button type="button" class="mp-receipt-btn" onclick="openScheduleJourneyModal(${schedule.id})" aria-label="${escapeHtml(schedule.title)} 약속 여정 보기">
                                ${renderMemoryReceipt(schedule)}
                                <span class="mp-receipt-cta">약속 여정 보기 ›</span>
                               </button>`
                            : renderMemoryReceipt(schedule)}
                    </div>
                </div>
                <div class="mp-fields">
                    <div class="mp-field">
                        <div class="mp-field-k">STATUS</div>
                        <div class="mp-status mp-status--${statusClass}"><span class="mp-status-dot"></span>${statusText}</div>
                    </div>
                    <div class="mp-field">
                        <div class="mp-field-k">PHOTOS</div>
                        <div class="mp-field-v">${photoCount}장 기록</div>
                    </div>
                </div>
                <div class="mp-remarks">
                    <div class="mp-field-k">REMARKS</div>
                    <div class="mp-remarks-text">${escapeHtml(normalizedPost.text || '')}</div>
                    <div class="memory-detail-tags">
                        ${getMemoryHashtags(normalizedPost).map(tag => `<div class="memory-tag">${escapeHtml(tag)}</div>`).join('')}
                    </div>
                </div>
                <div class="memory-detail-messages">
                    <div class="memory-detail-messages-title">친구 한 줄 메시지</div>
                    ${messagesHtml || '<div class="memory-message-empty-text">아직 참여한 친구가 없습니다</div>'}
                </div>
                ${actionsHtml}
            `;
        }

        function startMemoryPostEdit() {
            const post = getCurrentMemoryPost();
            if (!post) return;
            memoryDetailState.editing = true;
            memoryDetailState.photoDraft = normalizeMemoryPost(post).photos.slice();
            // 약속 연결 편집: 기존 scheduleId를 프리필하고, 저장 전까지는 draft로만 다룬다
            memoryDetailState.scheduleDraftId = post.scheduleId ?? null;
            memoryDetailState.schedulePickerOpen = false;
            memoryDetailState.editTitleDraft = undefined;
            memoryDetailState.editBodyDraft = undefined;
            renderMemoryDetailModal();
        }

        function cancelMemoryPostEdit() {
            memoryDetailState.editing = false;
            memoryDetailState.photoDraft = null;
            memoryDetailState.scheduleDraftId = null;
            memoryDetailState.schedulePickerOpen = false;
            memoryDetailState.editTitleDraft = undefined;
            memoryDetailState.editBodyDraft = undefined;
            renderMemoryDetailModal();
        }

        // 수정 모드에서 다른 상태 변경(사진 추가·약속 선택 등)으로 재렌더링해도
        // 입력 중이던 제목/본문이 날아가지 않도록 현재 입력값을 draft로 보관한다
        function captureMemoryEditDrafts() {
            const titleInput = document.getElementById('memory-detail-edit-title');
            const bodyInput = document.getElementById('memory-detail-edit-body');
            if (titleInput) memoryDetailState.editTitleDraft = titleInput.value;
            if (bodyInput) memoryDetailState.editBodyDraft = bodyInput.value;
        }

        // ── 약속 연결 편집(수정 모드) ──
        function renderMemorySchedulePickerRows(selectedId, onSelectFnName) {
            const schedules = (groupsData[activeGroup].schedules || [])
                .slice()
                .sort((a, b) => Math.abs(getDdayDiffDays(a.date)) - Math.abs(getDdayDiffDays(b.date)));
            if (!schedules.length) {
                return '<div class="mp-sched-empty">일정계획에 등록된 약속이 없어요</div>';
            }
            return schedules.map(schedule => {
                const proofCount = getScheduleProofCount(schedule);
                const isSelected = selectedId !== null && String(selectedId) === String(schedule.id);
                return `
                    <button type="button" class="mp-sched-item ${isSelected ? 'is-selected' : ''}" onclick="${onSelectFnName}('${escapeHtml(String(schedule.id))}')">
                        <span class="mp-sched-dday">${calculateDday(schedule.date)}</span>
                        <span class="mp-sched-info">
                            <span class="mp-sched-title">${escapeHtml(schedule.title)}</span>
                            <span class="mp-sched-4cut ${proofCount === 4 ? 'is-done' : ''}">인생4컷 ${proofCount}/4${proofCount === 4 ? ' ✓' : ''}</span>
                        </span>
                        ${isSelected ? '<span class="mp-sched-check">✓</span>' : ''}
                    </button>
                `;
            }).join('');
        }

        function openMemoryEditSchedulePicker() {
            captureMemoryEditDrafts();
            memoryDetailState.schedulePickerOpen = true;
            renderMemoryDetailModal();
        }

        function closeMemoryEditSchedulePicker() {
            captureMemoryEditDrafts();
            memoryDetailState.schedulePickerOpen = false;
            renderMemoryDetailModal();
        }

        function selectMemoryEditSchedule(scheduleId) {
            captureMemoryEditDrafts();
            memoryDetailState.scheduleDraftId = scheduleId;
            memoryDetailState.schedulePickerOpen = false;
            renderMemoryDetailModal();
        }

        function detachMemoryEditSchedule() {
            captureMemoryEditDrafts();
            memoryDetailState.scheduleDraftId = null;
            memoryDetailState.schedulePickerOpen = false;
            renderMemoryDetailModal();
        }

        // 수정 중 사진 추가: 파일을 선택하면 미리보기로 바로 반영하고,
        // 모두 불러오기가 끝나면 "이미지 업로드 완료" 안내 모달을 띄운다.
        function handleMemoryEditPhotoUpload(input) {
            const files = [...(input.files || [])];
            if (!files.length) return;
            captureMemoryEditDrafts();

            if (!memoryDetailState.photoDraft) memoryDetailState.photoDraft = [];
            const remaining = MEMORY_PHOTO_LIMIT - memoryDetailState.photoDraft.length;
            if (remaining <= 0) {
                input.value = '';
                alert(`사진은 최대 ${MEMORY_PHOTO_LIMIT}장까지 추가할 수 있어요.`);
                return;
            }

            // 이미지 파일만, 남은 장수만큼만 압축해서 저장 (localStorage 용량 초과 방지)
            const toLoad = files.slice(0, remaining).filter(file => file.type.startsWith('image/'));
            if (!toLoad.length) { input.value = ''; return; }

            let loadedCount = 0;
            toLoad.forEach(file => {
                compressMemoryPhoto(file, dataUrl => {
                    memoryDetailState.photoDraft.push(dataUrl);
                    loadedCount += 1;
                    if (loadedCount === toLoad.length) {
                        input.value = '';
                        renderMemoryDetailModal();
                        showProofResultModal({
                            title: '이미지 업로드 완료',
                            message: `${toLoad.length}장의 사진이 추가됐어요.<br>저장을 눌러야 게시글에 반영됩니다.`
                        });
                    }
                });
            });
        }

        function removeMemoryEditPhoto(index) {
            if (!memoryDetailState.photoDraft) return;
            captureMemoryEditDrafts();
            memoryDetailState.photoDraft.splice(index, 1);
            renderMemoryDetailModal();
        }

        function setMemoryDetailPhotoIndex(index) {
            memoryDetailState.photoIndex = index;
            renderMemoryDetailModal();
        }

        function memoryDetailPhotoNav(direction) {
            const post = getCurrentMemoryPost();
            if (!post) return;
            const photos = normalizeMemoryPost(post).photos;
            if (photos.length < 2) return;
            memoryDetailState.photoIndex = (memoryDetailState.photoIndex + direction + photos.length) % photos.length;
            renderMemoryDetailModal();
        }

        // ── 전체보기 슬라이드 갤러리 (상세 사진/썸네일/+N 클릭 시) ──
        let memoryGalleryState = { open: false, index: 0 };

        function getMemoryGalleryPhotos() {
            const post = getCurrentMemoryPost();
            if (!post) return [];
            return normalizeMemoryPost(post).photos || [];
        }

        // 갤러리 오버레이는 index.html에 정적으로 배치돼 있다.
        // (동적 createElement로 body에 append하면 이 앱의 모바일 미러링 로직이
        //  노드를 다른 컨테이너로 옮기고 class를 제거해 position:fixed 오버레이가 깨진다.)
        // 이벤트 위임은 최초 1회만 바인딩한다.
        function ensureMemoryGalleryEl() {
            const overlay = document.getElementById('memory-gallery-overlay');
            if (!overlay || overlay._galleryBound) return overlay;
            overlay._galleryBound = true;

            overlay.addEventListener('click', event => {
                if (event.target === overlay) closeMemoryGallery();
            });

            // 드래그 스와이프: 스테이지에서 좌우로 40px 이상 끌면 이전/다음
            let swipe = { active: false, startX: 0 };
            overlay.addEventListener('pointerdown', event => {
                if (!event.target.closest('.mp-gallery-stage')) return;
                swipe = { active: true, startX: event.clientX };
            });
            overlay.addEventListener('pointerup', event => {
                if (!swipe.active) return;
                swipe.active = false;
                const dx = event.clientX - swipe.startX;
                if (Math.abs(dx) > 40) memoryGalleryNav(dx < 0 ? 1 : -1);
            });
            overlay.addEventListener('pointercancel', () => { swipe.active = false; });
            return overlay;
        }

        function renderMemoryGallery() {
            const overlay = ensureMemoryGalleryEl();
            const photos = getMemoryGalleryPhotos();
            if (!photos.length) return;
            memoryGalleryState.index = Math.min(Math.max(memoryGalleryState.index, 0), photos.length - 1);
            const index = memoryGalleryState.index;
            const pad2 = n => String(n).padStart(2, '0');
            overlay.innerHTML = `
                <button type="button" class="mp-gallery-close" onclick="closeMemoryGallery()" aria-label="닫기">×</button>
                <div class="mp-gallery-counter">${pad2(index + 1)} / ${pad2(photos.length)}</div>
                <div class="mp-gallery-stage">
                    ${photos.length > 1 ? `<button type="button" class="mp-gallery-arrow mp-gallery-arrow--prev" onclick="memoryGalleryNav(-1)" aria-label="이전 사진">‹</button>` : ''}
                    <img src="${escapeHtml(photos[index])}" alt="사진 ${index + 1}" draggable="false">
                    ${photos.length > 1 ? `<button type="button" class="mp-gallery-arrow mp-gallery-arrow--next" onclick="memoryGalleryNav(1)" aria-label="다음 사진">›</button>` : ''}
                </div>
                ${photos.length > 1 ? `
                    <div class="mp-gallery-thumbs">
                        ${photos.map((url, thumbIndex) => `
                            <button type="button" class="mp-gallery-thumb ${thumbIndex === index ? 'is-active' : ''}" onclick="memoryGalleryGoTo(${thumbIndex})">
                                <img src="${escapeHtml(url)}" alt="사진 ${thumbIndex + 1}" draggable="false">
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            `;
            requestAnimationFrame(() => {
                const activeThumb = overlay.querySelector('.mp-gallery-thumb.is-active');
                if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        }

        function openMemoryGallery(index) {
            const photos = getMemoryGalleryPhotos();
            if (!photos.length) return;
            memoryGalleryState = { open: true, index: Math.min(Math.max(index || 0, 0), photos.length - 1) };
            renderMemoryGallery();
            document.getElementById('memory-gallery-overlay').classList.add('open');
        }

        function closeMemoryGallery() {
            const overlay = document.getElementById('memory-gallery-overlay');
            if (overlay) overlay.classList.remove('open');
            if (memoryGalleryState.open) {
                // 갤러리에서 넘겨본 위치를 상세 대표사진에도 반영
                memoryDetailState.photoIndex = memoryGalleryState.index;
                memoryGalleryState.open = false;
                if (!memoryDetailState.editing) renderMemoryDetailModal();
            }
        }

        function memoryGalleryNav(direction) {
            const photos = getMemoryGalleryPhotos();
            if (photos.length < 2) return;
            memoryGalleryState.index = (memoryGalleryState.index + direction + photos.length) % photos.length;
            renderMemoryGallery();
        }

        function memoryGalleryGoTo(index) {
            memoryGalleryState.index = index;
            renderMemoryGallery();
        }

        // Esc로 갤러리만 닫기. 갤러리가 열려 있으면 init.js의 Escape 핸들러(closeMemoryDetail 등)로
        // 전파되지 않게 막아, 뒤에 있는 상세 모달까지 함께 닫히는 것을 방지한다.
        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape' || !memoryGalleryState.open) return;
            event.stopImmediatePropagation();
            closeMemoryGallery();
        });

        // ── 약속 여정 모달 (여권 상세의 약속 영수증 클릭 시) ──
        // 연결된 일정(scheduleId)의 인생4컷 단계(제안→일정맞추기→약속확정→만남)를 한눈에 보여준다.
        // 일정계획 탭의 stage 헬퍼(buildGrowthStages 등)를 그대로 재사용해 상태가 한 소스에서 동기화된다.
        let scheduleJourneyState = { open: false, scheduleId: null };

        function renderScheduleJourney(schedule) {
            const stages = buildGrowthStages(schedule);
            const photos = getGrowthStagePhotos(schedule);
            const proofCount = getScheduleProofCount(schedule);
            const isComplete = proofCount === 4;
            const diffDays = getDdayDiffDays(schedule.date);
            const ddayText = calculateDday(schedule.date);
            const friendlyDate = formatFriendlyDate(schedule.date);
            const ddayPhrase = diffDays < 0 ? '함께 보낸 그날로부터' : diffDays === 0 ? '바로 오늘, 약속의 날!' : '함께할 그날까지';

            const stageHtml = stages.map(stage => {
                const status = getGrowthStageStatus(stage, schedule);
                const message = getGrowthStageMessage(stage, schedule, status);
                const photo = photos[stage.key];
                const inputId = `sj-stage-upload-${schedule.id}-${stage.key}`;
                const badge = status === 'done'
                    ? '<span class="sj-stage-badge is-done">완료 ✓</span>'
                    : status === 'active'
                        ? '<span class="sj-stage-badge is-active"><span class="sj-rec-dot"></span>REC</span>'
                        : '<span class="sj-stage-badge is-locked">잠김</span>';

                // done: 사진 확대 / active: 인증사진 업로드(기존 4컷 업로드 로직 재사용) / locked: 잠금 안내
                let thumb;
                if (photo) {
                    thumb = `<button type="button" class="sj-stage-photo has-photo" style="background-image:url('${escapeHtml(photo)}')" onclick="openScheduleJourneyPhoto('${escapeHtml(stage.key)}')" aria-label="${escapeHtml(stage.name)} 사진 크게 보기"></button>`;
                } else if (status === 'active') {
                    thumb = `<button type="button" class="sj-stage-photo is-uploadable" onclick="requestStagePhotoUpload(${schedule.id}, '${escapeHtml(stage.key)}', '${inputId}')" aria-label="${escapeHtml(stage.name)} 인증사진 올리기">
                                <span class="sj-stage-num">${stage.number}</span>
                                <span class="sj-up-plus">＋</span>
                             </button>
                             <input id="${inputId}" type="file" accept="image/*" hidden onchange="uploadStagePhoto(${schedule.id}, '${escapeHtml(stage.key)}', this)">`;
                } else {
                    thumb = `<button type="button" class="sj-stage-photo is-locked" onclick="showStageLockedGuidanceModal('${escapeHtml(message)}')" aria-label="잠긴 단계">
                                <span class="sj-stage-num">${stage.number}</span><span class="sj-lock">🔒</span>
                             </button>`;
                }

                const actionHint = status === 'active' && !photo
                    ? '<span class="sj-stage-upload-hint">＋ 인증사진 올리기</span>'
                    : '';

                return `
                    <div class="sj-stage sj-stage--${status}">
                        ${thumb}
                        <div class="sj-stage-info">
                            <div class="sj-stage-name">${stage.number}. ${escapeHtml(stage.name)}</div>
                            <div class="sj-stage-date">${escapeHtml(String(stage.date || '').replace(/-/g, '.'))}</div>
                            <div class="sj-stage-msg">${escapeHtml(message)}</div>
                            ${actionHint}
                        </div>
                        ${badge}
                    </div>
                `;
            }).join('');

            return `
                <div class="sj-modal">
                    <div class="sj-head">
                        <div class="sj-kicker">★ 약속 여정 ★</div>
                        <div class="sj-title">${escapeHtml(schedule.title)}</div>
                        <div class="sj-sub">${escapeHtml(friendlyDate)} · <b>${escapeHtml(ddayText)}</b> · ${escapeHtml(ddayPhrase)}</div>
                        <button type="button" class="sj-close" onclick="closeScheduleJourneyModal()" aria-label="닫기">×</button>
                    </div>
                    <div class="sj-progress ${isComplete ? 'is-complete' : ''}">
                        <span class="sj-progress-label">인생4컷 ${proofCount}/4${isComplete ? ' · 완성 🍀' : ''}</span>
                        <span class="sj-progress-bar"><span class="sj-progress-fill" style="width:${Math.round(proofCount / 4 * 100)}%"></span></span>
                    </div>
                    <div class="sj-stages">${stageHtml}</div>
                    <div class="sj-actions">
                        <button type="button" class="btn-sub" onclick="closeScheduleJourneyModal()">닫기</button>
                        <button type="button" class="btn-main" onclick="openScheduleFromJourney(${schedule.id})">일정계획에서 열기</button>
                    </div>
                </div>
            `;
        }

        function ensureScheduleJourneyEl() {
            const overlay = document.getElementById('schedule-journey-overlay');
            if (!overlay || overlay._journeyBound) return overlay;
            overlay._journeyBound = true;
            overlay.addEventListener('click', event => {
                if (event.target === overlay) closeScheduleJourneyModal();
            });
            return overlay;
        }

        function openScheduleJourneyModal(scheduleId) {
            const schedule = findScheduleById(scheduleId);
            if (!schedule) return;
            const overlay = ensureScheduleJourneyEl();
            if (!overlay) return;
            scheduleJourneyState = { open: true, scheduleId };
            overlay.innerHTML = renderScheduleJourney(schedule);
            overlay.classList.add('open');
        }

        function closeScheduleJourneyModal() {
            const overlay = document.getElementById('schedule-journey-overlay');
            if (overlay) overlay.classList.remove('open');
            scheduleJourneyState = { open: false, scheduleId: null };
        }

        // 4컷 인증사진 업로드 후 호출된다(uploadStagePhoto). 열려 있는 약속 여정 모달과
        // 그 뒤의 여권 상세(영수증·완성 도장·상태)를 최신 상태로 다시 그린다.
        function refreshScheduleJourneyAndDetail() {
            if (scheduleJourneyState.open) {
                const schedule = findScheduleById(scheduleJourneyState.scheduleId);
                const overlay = document.getElementById('schedule-journey-overlay');
                if (schedule && overlay) overlay.innerHTML = renderScheduleJourney(schedule);
            }
            if (memoryDetailState.postIndex !== null && !memoryDetailState.editing) {
                renderMemoryDetailModal();
            }
        }
        window.refreshScheduleJourneyAndDetail = refreshScheduleJourneyAndDetail;

        // 단계 사진 크게 보기 — 재사용 중인 대표사진 뷰어(FLIP 확대)로 띄운다
        function openScheduleJourneyPhoto(stageKey) {
            const schedule = findScheduleById(scheduleJourneyState.scheduleId);
            if (!schedule) return;
            const url = getGrowthStagePhotos(schedule)[stageKey];
            if (!url) return;
            if (typeof openMainPhotoView === 'function') {
                const temp = new Image();
                temp.src = url;
                openMainPhotoView(temp);
            }
        }

        // "일정계획에서 열기" — 일정 탭으로 이동해 해당 약속을 선택 (데스크톱/모바일 모두 반영)
        function openScheduleFromJourney(scheduleId) {
            closeScheduleJourneyModal();
            closeMemoryDetail();
            if (typeof switchDesktopTab === 'function') switchDesktopTab('schedule');
            if (typeof switchTab === 'function') switchTab('schedule');
            if (typeof selectScheduleChip === 'function') {
                selectScheduleChip('dt', scheduleId);
                selectScheduleChip('mb', scheduleId);
            }
        }

        // Esc로 약속 여정 모달만 닫기 (열림 상태에서만). 갤러리와 동일하게 전파를 막아
        // 뒤의 상세 모달까지 닫히지 않게 한다.
        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape' || !scheduleJourneyState.open) return;
            event.stopImmediatePropagation();
            closeScheduleJourneyModal();
        });

        // ── 우정공간 사진 모아보기 (추억피드 격자 아이콘 → 애플 갤러리 스타일) ──
        // 현재 방(활성 그룹)의 모든 추억 사진을 검색·정렬(최신/오래된순)·월별 섹션으로 모아본다.
        // 격자 사진 클릭 → 전체화면 라이트박스(이전/다음/카운터/"이 추억 보기").
        let spaceGalleryState = { open: false, allItems: [], items: [], lightbox: -1, search: '', sort: 'new' };

        // 게시글 날짜("2026.07.08" 등)를 정렬용 숫자 + 월 그룹 키/라벨로 파싱
        function parseSpacePhotoDate(dateStr) {
            const m = String(dateStr || '').match(/(\d{4})\D+(\d{1,2})(?:\D+(\d{1,2}))?/);
            if (!m) return { num: -1, key: 'none', label: '날짜 미상' };
            const y = +m[1], mo = +m[2], d = +(m[3] || 1);
            return { num: y * 10000 + mo * 100 + d, key: y + '-' + String(mo).padStart(2, '0'), label: y + '년 ' + mo + '월' };
        }

        function collectSpacePhotos() {
            const posts = (groupsData[activeGroup] && groupsData[activeGroup].posts) || [];
            const items = [];
            posts.forEach((post, postIndex) => {
                const np = normalizeMemoryPost(post);
                const tags = (typeof getMemoryHashtags === 'function') ? getMemoryHashtags(np).join(' ') : ((np.tags || []).join(' '));
                const names = (np.participants || []).map(p => p.name).join(' ');
                const searchText = [np.title, np.text, tags, names].join(' ').toLowerCase();
                const dt = parseSpacePhotoDate(np.date);
                (np.photos || []).forEach(url => {
                    if (url) items.push({ url, postIndex, title: np.title, date: np.date, searchText, dateNum: dt.num, monthKey: dt.key, monthLabel: dt.label });
                });
            });
            return items;
        }

        // 검색어 필터 + 정렬을 적용한 현재 보이는 사진 목록 (라이트박스도 이 목록을 넘겨본다)
        function getSpaceGalleryVisible() {
            const q = spaceGalleryState.search.trim().toLowerCase();
            const items = spaceGalleryState.allItems.filter(it => !q || it.searchText.indexOf(q) !== -1);
            items.sort((a, b) => {
                const aBad = a.dateNum < 0, bBad = b.dateNum < 0;
                if (aBad !== bBad) return aBad ? 1 : -1; // 날짜 미상은 항상 맨 뒤
                return spaceGalleryState.sort === 'old' ? a.dateNum - b.dateNum : b.dateNum - a.dateNum;
            });
            return items;
        }

        function ensureSpaceGalleryEl() {
            const overlay = document.getElementById('space-photo-gallery-overlay');
            if (!overlay || overlay._sgBound) return overlay;
            overlay._sgBound = true;
            overlay.addEventListener('click', event => {
                if (event.target === overlay) {
                    if (spaceGalleryState.lightbox >= 0) closeSpaceLightbox();
                    else closeSpacePhotoGallery();
                }
            });
            return overlay;
        }

        // 헤더(검색·정렬 컨트롤)는 열 때 1회, 본문(월별 섹션)은 검색/정렬마다 갱신 → 검색 입력 포커스 유지
        function renderSpaceGallery() {
            const overlay = ensureSpaceGalleryEl();
            if (!overlay) return;
            overlay.innerHTML = `
                <div class="sg-head">
                    <div class="sg-head-titles">
                        <div class="sg-title">우정공간 사진</div>
                        <div class="sg-count" id="sg-count"></div>
                    </div>
                    <div class="sg-search">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                        <input class="sg-search-input" id="sg-search-input" type="search" autocomplete="off" placeholder="사진 검색 (제목·내용·태그·친구)" value="${escapeHtml(spaceGalleryState.search)}" oninput="setSpaceGallerySearch(this.value)">
                        <button type="button" class="sg-search-clear" onclick="setSpaceGallerySearch('')" aria-label="검색어 지우기" ${spaceGalleryState.search ? '' : 'hidden'}>×</button>
                    </div>
                    <div class="sg-sort" role="group" aria-label="정렬 순서">
                        <button type="button" data-sort="new" class="${spaceGalleryState.sort === 'new' ? 'active' : ''}" onclick="setSpaceGallerySort('new')">최신순</button>
                        <button type="button" data-sort="old" class="${spaceGalleryState.sort === 'old' ? 'active' : ''}" onclick="setSpaceGallerySort('old')">오래된순</button>
                    </div>
                    <button type="button" class="sg-close" onclick="closeSpacePhotoGallery()" aria-label="닫기">×</button>
                </div>
                <div class="sg-body" id="sg-body"></div>
                <div id="sg-lightbox-host"></div>
            `;
            renderSpaceGalleryBody();
            renderSpaceLightbox();
        }

        function renderSpaceGalleryBody() {
            const body = document.getElementById('sg-body');
            if (!body) return;
            const visible = getSpaceGalleryVisible();
            spaceGalleryState.items = visible;

            const countEl = document.getElementById('sg-count');
            if (countEl) countEl.textContent = visible.length + '장' + (spaceGalleryState.search.trim() ? ' · 검색결과' : '');

            if (!visible.length) {
                body.innerHTML = `<div class="sg-empty"><span class="sg-empty-clover">${spaceGalleryState.search.trim() ? '🔍' : '🍀'}</span>${spaceGalleryState.search.trim() ? '검색 결과가 없어요.' : '아직 이 우정공간에 올라온 사진이 없어요.'}</div>`;
                return;
            }

            // 정렬된 순서를 유지하며 월별 섹션으로 묶는다 (셀 클릭 인덱스는 visible 배열 기준)
            const groups = [];
            let cur = null;
            visible.forEach((it, idx) => {
                if (!cur || cur.key !== it.monthKey) { cur = { key: it.monthKey, label: it.monthLabel, cells: [] }; groups.push(cur); }
                cur.cells.push({ it, idx });
            });

            body.innerHTML = groups.map(g => `
                <section class="sg-section">
                    <div class="sg-section-head">${escapeHtml(g.label)}<span class="sg-section-count">${g.cells.length}</span></div>
                    <div class="sg-grid">
                        ${g.cells.map(c => `
                            <button type="button" class="sg-cell" onclick="openSpaceLightbox(${c.idx})" aria-label="${escapeHtml(c.it.title)} 사진 크게 보기">
                                <img src="${escapeHtml(c.it.url)}" loading="lazy" alt="${escapeHtml(c.it.title)}">
                            </button>`).join('')}
                    </div>
                </section>
            `).join('');
        }

        function renderSpaceLightbox() {
            const host = document.getElementById('sg-lightbox-host');
            if (!host) return;
            const items = spaceGalleryState.items;
            const lb = spaceGalleryState.lightbox;
            if (lb < 0 || !items[lb]) { host.innerHTML = ''; return; }
            host.innerHTML = `
                <div class="sg-lightbox">
                    <div class="sg-lb-counter">${lb + 1} / ${items.length}</div>
                    <button type="button" class="sg-lb-close" onclick="closeSpaceLightbox()" aria-label="닫기">×</button>
                    <div class="sg-lb-stage">
                        ${items.length > 1 ? `<button type="button" class="sg-lb-arrow sg-lb-prev" onclick="spaceLightboxNav(-1)" aria-label="이전">‹</button>` : ''}
                        <img src="${escapeHtml(items[lb].url)}" alt="${escapeHtml(items[lb].title)}">
                        ${items.length > 1 ? `<button type="button" class="sg-lb-arrow sg-lb-next" onclick="spaceLightboxNav(1)" aria-label="다음">›</button>` : ''}
                    </div>
                    <div class="sg-lb-info">
                        <span class="sg-lb-title">${escapeHtml(items[lb].title)} · ${escapeHtml(String(items[lb].date || ''))}</span>
                        <button type="button" class="sg-lb-open" onclick="openSpaceMemoryFromGallery(${items[lb].postIndex})">이 추억 보기 ›</button>
                    </div>
                </div>`;
        }

        function openSpacePhotoGallery() {
            const overlay = ensureSpaceGalleryEl();
            if (!overlay) return;
            spaceGalleryState = { open: true, allItems: collectSpacePhotos(), items: [], lightbox: -1, search: '', sort: 'new' };
            renderSpaceGallery();
            overlay.classList.add('open');
        }

        function closeSpacePhotoGallery() {
            const overlay = document.getElementById('space-photo-gallery-overlay');
            if (overlay) overlay.classList.remove('open');
            spaceGalleryState = { open: false, allItems: [], items: [], lightbox: -1, search: '', sort: 'new' };
        }

        function setSpaceGallerySearch(value) {
            spaceGalleryState.search = value;
            const clear = document.querySelector('.sg-search-clear');
            if (clear) clear.hidden = !value;
            const input = document.getElementById('sg-search-input');
            if (input && input.value !== value) input.value = value; // 지우기 버튼으로 비운 경우 반영
            renderSpaceGalleryBody(); // 본문만 갱신 → 검색 입력 포커스 유지
        }

        function setSpaceGallerySort(sort) {
            spaceGalleryState.sort = sort;
            document.querySelectorAll('.sg-sort button').forEach(b => b.classList.toggle('active', b.dataset.sort === sort));
            renderSpaceGalleryBody();
        }

        function openSpaceLightbox(index) {
            spaceGalleryState.lightbox = index;
            renderSpaceLightbox();
        }

        function closeSpaceLightbox() {
            spaceGalleryState.lightbox = -1;
            renderSpaceLightbox();
        }

        function spaceLightboxNav(direction) {
            const n = spaceGalleryState.items.length;
            if (n < 2 || spaceGalleryState.lightbox < 0) return;
            spaceGalleryState.lightbox = (spaceGalleryState.lightbox + direction + n) % n;
            renderSpaceLightbox();
        }

        // 라이트박스에서 "이 추억 보기" → 갤러리 닫고 해당 게시글 상세(여권) 열기
        function openSpaceMemoryFromGallery(postIndex) {
            closeSpacePhotoGallery();
            if (typeof openMemoryDetail === 'function') openMemoryDetail(postIndex);
        }

        // Esc: 라이트박스가 열려 있으면 라이트박스만, 아니면 갤러리를 닫는다 (열림 상태에서만 반응)
        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape' || !spaceGalleryState.open) return;
            event.stopImmediatePropagation();
            if (spaceGalleryState.lightbox >= 0) closeSpaceLightbox();
            else closeSpacePhotoGallery();
        });

        function updateMemoryPost() {
            const post = getCurrentMemoryPost();
            if (!post) return;
            const titleInput = document.getElementById('memory-detail-edit-title');
            const bodyInput = document.getElementById('memory-detail-edit-body');
            const newTitle = (titleInput?.value || '').trim();
            const newBody = (bodyInput?.value || '').trim();

            if (!newTitle || !newBody) {
                alert('제목과 내용을 모두 입력해주세요.');
                return;
            }

            post.title = newTitle;
            post.text = newBody;
            post.photos = (memoryDetailState.photoDraft || []).slice();
            post.bg = post.photos[0] || '';
            post.scheduleId = memoryDetailState.scheduleDraftId ?? null;
            memoryDetailState.editing = false;
            memoryDetailState.photoDraft = null;
            memoryDetailState.photoIndex = 0;
            memoryDetailState.scheduleDraftId = null;
            memoryDetailState.schedulePickerOpen = false;
            memoryDetailState.editTitleDraft = undefined;
            memoryDetailState.editBodyDraft = undefined;
            saveGroupsData();
            renderMemoryDetailModal();
            renderFeeds();
        }

        function requestDeleteMemoryPost() {
            memoryDetailState.deleteConfirm = true;
            renderMemoryDetailModal();
        }

        function cancelDeleteMemoryPost() {
            memoryDetailState.deleteConfirm = false;
            renderMemoryDetailModal();
        }

        function confirmDeleteMemoryPost() {
            const postIndex = memoryDetailState.postIndex;
            if (postIndex === null) return;
            const deletedPost = groupsData[activeGroup].posts[postIndex];

            // 삭제된 게시글이 주던 XP 계산
            let postXp = typeof CLOV_XP_POST_BASE !== 'undefined' ? CLOV_XP_POST_BASE : 25;
            if (deletedPost) {
                const photoCount = Array.isArray(deletedPost.photos) ? deletedPost.photos.length : (deletedPost.bg ? 1 : 0);
                const pPerPhoto = typeof CLOV_XP_POST_PER_PHOTO !== 'undefined' ? CLOV_XP_POST_PER_PHOTO : 1;
                const pMaxPhoto = typeof CLOV_XP_POST_PHOTO_MAX !== 'undefined' ? CLOV_XP_POST_PHOTO_MAX : 10;
                postXp += Math.min(photoCount * pPerPhoto, pMaxPhoto);

                const textLen = (deletedPost.content || deletedPost.body || deletedPost.text || '').replace(/<[^>]*>/g, '').length;
                const t100 = typeof CLOV_XP_POST_TEXT_100 !== 'undefined' ? CLOV_XP_POST_TEXT_100 : 10;
                const t50 = typeof CLOV_XP_POST_TEXT_50 !== 'undefined' ? CLOV_XP_POST_TEXT_50 : 5;
                if (textLen >= 100) postXp += t100;
                else if (textLen >= 50) postXp += t50;
            }

            groupsData[activeGroup].posts.splice(postIndex, 1);
            saveGroupsData();
            closeMemoryDetail();
            activeEvidenceIndexes[activeGroup] = 0;
            renderFeeds();

            if (typeof revokeXP === 'function') {
                revokeXP(postXp);
            }
        }

        function saveMemoryMessage() {
            const post = getCurrentMemoryPost();
            if (!post) return;
            const text = (memoryDetailState.composeDraft || '').trim();
            if (!text) {
                alert('메시지를 입력해주세요! ✍️');
                return;
            }
            if (!post.messages) post.messages = [];
            post.messages = post.messages.filter(message => message.authorId !== CURRENT_USER_ID);
            post.messages.push({ authorId: CURRENT_USER_ID, text });
            memoryDetailState.composeDraft = '';
            saveGroupsData();
            renderMemoryDetailModal();
            renderFeeds();
        }

        function startMemoryMessageEdit(authorId) {
            const post = getCurrentMemoryPost();
            const message = post?.messages?.find(item => item.authorId === authorId);
            memoryDetailState.editingMsgAuthorId = authorId;
            memoryDetailState.msgEditDraft = message ? message.text : '';
            renderMemoryDetailModal();
        }

        function cancelMemoryMessageEdit() {
            memoryDetailState.editingMsgAuthorId = null;
            memoryDetailState.msgEditDraft = '';
            renderMemoryDetailModal();
        }

        function saveMemoryMessageEdit(authorId) {
            const post = getCurrentMemoryPost();
            if (!post) return;
            const text = (memoryDetailState.msgEditDraft || '').trim();
            if (!text) {
                post.messages = (post.messages || []).filter(message => message.authorId !== authorId);
            } else {
                const message = (post.messages || []).find(item => item.authorId === authorId);
                if (message) message.text = text;
            }
            memoryDetailState.editingMsgAuthorId = null;
            memoryDetailState.msgEditDraft = '';
            saveGroupsData();
            renderMemoryDetailModal();
            renderFeeds();
        }

        function deleteMemoryMessage(authorId) {
            const post = getCurrentMemoryPost();
            if (!post) return;
            post.messages = (post.messages || []).filter(message => message.authorId !== authorId);
            saveGroupsData();
            renderMemoryDetailModal();
            renderFeeds();
        }

        const clothespinSvg = `
            <svg class="cline-clip-svg" viewBox="0 0 28 48" aria-hidden="true">
                <defs>
                    <linearGradient id="clipBody" x1="5" y1="0" x2="23" y2="48" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#f2f5f7"/>
                        <stop offset="0.18" stop-color="#b8c0c8"/>
                        <stop offset="0.55" stop-color="#d8dde2"/>
                        <stop offset="1" stop-color="#8d969e"/>
                    </linearGradient>
                    <linearGradient id="clipDark" x1="0" y1="0" x2="0" y2="48" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#aeb6bd"/>
                        <stop offset="1" stop-color="#6f7982"/>
                    </linearGradient>
                </defs>
                <rect x="8" y="1" width="12" height="11" rx="2" fill="url(#clipBody)" stroke="#7e8790" stroke-width="1"/>
                <circle cx="14" cy="6.5" r="3.1" fill="#1a1f24" stroke="#dfe4e8" stroke-width="1.1"/>
                <circle cx="14" cy="6.5" r="1.25" fill="#8e98a2"/>
                <rect x="6" y="12" width="16" height="7" rx="1.5" fill="#a0a8b0" stroke="#7c858d" stroke-width="1"/>
                <circle cx="10" cy="15.5" r="1.4" fill="#707981"/>
                <circle cx="18" cy="15.5" r="1.4" fill="#707981"/>
                <rect x="5" y="19" width="18" height="19" rx="2.5" fill="url(#clipBody)" stroke="#7b858e" stroke-width="1"/>
                <circle cx="10.5" cy="27" r="2.2" fill="#87919a" stroke="#eef2f5" stroke-width=".8"/>
                <circle cx="17.5" cy="27" r="2.2" fill="#87919a" stroke="#eef2f5" stroke-width=".8"/>
                <line x1="9.2" y1="27" x2="11.8" y2="27" stroke="#5f6870" stroke-width=".8"/>
                <line x1="16.2" y1="27" x2="18.8" y2="27" stroke="#5f6870" stroke-width=".8"/>
                <rect x="7" y="37" width="14" height="8" rx="1.3" fill="url(#clipDark)" stroke="#6f7880" stroke-width="1"/>
                <path d="M8 45h2l1-2 1 2h2l1-2 1 2h2l1-2 1 2" fill="none" stroke="#d6dce1" stroke-width=".9" stroke-linecap="round"/>
                <line x1="8.5" y1="21" x2="8.5" y2="36" stroke="rgba(255,255,255,.58)" stroke-width="1"/>
                <line x1="19.5" y1="21" x2="19.5" y2="36" stroke="rgba(255,255,255,.26)" stroke-width="1"/>
            </svg>
        `;

        function renderEvidenceViewer(viewType) {
            const posts = groupsData[activeGroup].posts || [];
            if (posts.length === 0) {
                return `
                    <div class="memory-evidence-viewer cline-viewer">
                        <div class="evidence-track" style="grid-column: 1 / -1;">
                            <div class="evidence-status-bar">
                                <span class="evidence-time-label">아직 기록 없음</span>
                            </div>
                            <p style="color: var(--text-muted); font-size: 13px;">첫 추억을 등록하면 여기에서 현재와 과거 기록을 넘겨볼 수 있습니다.</p>
                        </div>
                    </div>
                `;
            }

            const currentIndex = getEvidenceIndex();
            const total = posts.length;
            const cardTheme = getEvidenceCardTheme();
            const avatarColors = ['#52b788', '#e76f51', '#457b9d', '#f4a261', '#2a9d8f'];

            function renderAvatars(post) {
                const normalizedPost = normalizeMemoryPost(post);
                const visible = normalizedPost.participants.slice(0, 4);
                const rest = normalizedPost.participants.length - visible.length;
                return `
                    <div class="cline-avatars">
                        ${visible.map((participant, index) => `
                            <span class="cline-avatar" style="background:${avatarColors[index % avatarColors.length]}">${escapeHtml(participant.icon || participant.name.slice(0, 1))}</span>
                        `).join('')}
                        ${rest > 0 ? `<span class="cline-avatar-more">+${rest}</span>` : ''}
                    </div>
                `;
            }

            function renderClinePolaroid(post, postIndex, isActive, isClickableDetail) {
                if (typeof isClickableDetail === 'undefined') isClickableDetail = isActive;
                const normalizedPost = normalizeMemoryPost(post);
                const tags = getMemoryHashtags(normalizedPost, normalizedPost.participants[0]).slice(0, 3);
                const dateText = String(normalizedPost.date || '').replace(/^2026\./, '');
                const photo = normalizedPost.bg
                    ? `<img src="${escapeHtml(normalizedPost.bg)}" alt="${escapeHtml(normalizedPost.title)}">`
                    : `<div class="cline-no-photo"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><path d="m4 18 4-4 3 2 4-5 5 4"/></svg></span><span class="cline-no-photo-text">사진 없음</span></div>`;

                return `
                    <article class="cline-polaroid ${isActive ? 'is-active' : ''}" onclick="event.stopPropagation(); ${isClickableDetail ? `openMemoryDetail(${postIndex})` : `setEvidenceIndex(${postIndex})`}">
                        <div class="cline-card-header">
                            ${renderAvatars(normalizedPost)}
                            <span class="cline-header-date">${escapeHtml(dateText)}</span>
                        </div>
                        <div class="cline-photo">${photo}</div>
                        <div class="cline-caption">
                            <div class="cline-caption-title">${escapeHtml(normalizedPost.title)}</div>
                            ${normalizedPost.subtitle ? `<div class="cline-caption-sub">📍 ${escapeHtml(normalizedPost.subtitle)}</div>` : ''}
                            <div class="cline-tags">
                                ${tags.map(tag => `<span class="cline-tag">${escapeHtml(tag)}</span>`).join('')}
                            </div>
                        </div>
                    </article>
                `;
            }

            function makeSlot(delta, slotCls) {
                const postIndex = currentIndex + delta;
                if (postIndex < 0 || postIndex >= total) {
                    return (cardTheme === 'coverflow' || cardTheme === 'diary')
                        ? `<div class="cline-card-slot cline-slot--empty cline-slot--${slotCls} is-empty"></div>`
                        : `<div class="cline-card-slot cline-slot--empty"></div>`;
                }
                const isActive = delta === 0;
                // 일기장 테마: 펼친 책의 오른쪽(0)·왼쪽(1) 카드 둘 다 상세보기로 열림
                const isDiaryInner = cardTheme === 'diary' && (delta === 0 || delta === 1);
                const isClickableDetail = isActive || isDiaryInner;

                // 일기장 테마에서 바깥쪽(+2) 카드를 클릭하면 2칸이 아니라 1칸만 넘어가
                // "책장을 한 장씩 넘기는" 느낌을 유지한다
                let targetIndex = postIndex;
                if (cardTheme === 'diary' && delta === 2) {
                    targetIndex = currentIndex + 1;
                }

                return `
                    <div class="cline-card-slot cline-slot--${slotCls} ${isActive ? 'is-active' : ''}"
                         ${!isClickableDetail ? `onclick="event.stopPropagation(); setEvidenceIndex(${targetIndex})"` : ''}>
                        ${(cardTheme === 'coverflow' || cardTheme === 'diary') ? '' : clothespinSvg}
                        ${renderClinePolaroid(posts[postIndex], targetIndex, isActive, isClickableDetail)}
                    </div>
                `;
            }

            const filmFrames = [...posts].reverse().map((post, reverseIndex) => {
                const postIndex = total - 1 - reverseIndex;
                const isCurrent = postIndex === currentIndex;
                const thumb = post.bg
                    ? `<img src="${escapeHtml(post.bg)}" alt="${escapeHtml(post.title)}">`
                    : '';
                return `
                    <button class="cline-film-frame ${isCurrent ? 'is-current' : ''}" type="button" onclick="setEvidenceIndex(${postIndex})" aria-label="${escapeHtml(post.title)} 보기">
                        ${thumb}
                    </button>
                `;
            }).join('');

            const themeClass = cardTheme === 'coverflow' ? 'theme-coverflow' : (cardTheme === 'diary' ? 'theme-diary' : '');
            const diaryMarkup = cardTheme === 'diary' ? `
                <div class="diary-page-stack left"></div>
                <div class="diary-page-stack right"></div>

                <div class="diary-page-text left-page"></div>
                <div class="diary-spine"></div>
                <div class="diary-page-text right-page"></div>

                <div class="diary-memo"></div>

                <div class="diary-sticker clover" style="top: 8%; left: 6%; transform: rotate(-15deg) scale(1.15);"></div>
                <div class="diary-sticker flower" style="top: 55%; left: 12%; transform: rotate(18deg) scale(1.05);"></div>
                <div class="diary-sticker clover" style="bottom: 10%; left: 4%; transform: rotate(-8deg) scale(1.2);"></div>

                <div class="diary-sticker flower" style="top: 12%; right: 5%; transform: rotate(12deg) scale(1.2);"></div>
                <div class="diary-sticker clover" style="top: 45%; right: 8%; transform: rotate(-5deg) scale(1.8);"></div>
                <div class="diary-sticker flower" style="bottom: 8%; right: 8%; transform: rotate(22deg) scale(1.15);"></div>
            ` : '';

            return `
                <div class="memory-evidence-viewer cline-viewer ${viewType === 'mobile' ? 'mobile-evidence' : 'desktop-evidence'} ${themeClass}">
                    <div class="cline-stage">
                        ${diaryMarkup}
                        <div class="cline-wire-area">
                            <div class="cline-wire"></div>
                            <div class="cline-cards ${cardTheme === 'coverflow' && evidenceSlideDirection !== 'idle' ? 'slide-' + evidenceSlideDirection : ''}">
                                ${viewType === 'desktop' && (cardTheme === 'coverflow' || cardTheme === 'diary') ? makeSlot(+3, 'far-far-past') : ''}
                                ${viewType === 'desktop' ? makeSlot(+2, 'far-past') : ''}
                                ${makeSlot(+1, 'past')}
                                ${makeSlot(0, 'current')}
                                ${makeSlot(-1, 'newer')}
                                ${viewType === 'desktop' ? makeSlot(-2, 'far-newer') : ''}
                                ${viewType === 'desktop' && (cardTheme === 'coverflow' || cardTheme === 'diary') ? makeSlot(-3, 'far-far-newer') : ''}
                            </div>
                        </div>
                    </div>
                    <div class="cline-film-strip">
                        <span class="cline-film-label">과거</span>
                        <div class="cline-film-frames" id="${viewType === 'mobile' ? 'mb' : 'dt'}-cline-film-frames">
                            <div class="cline-film-track">
                                ${filmFrames}
                            </div>
                        </div>
                        <span class="cline-film-label">현재</span>
                    </div>
                </div>
            `;
        }

        // 하단 필름(cline-film-frames) 전용 드래그-스크롤 / 휠-스크롤 상호작용
        // (윈도우 레벨 이벤트 위임 — 렌더링마다 다시 바인딩하지 않도록 최초 1회만 등록)
        function initEvidenceInteractions() {
            if (window._evidenceInteractionsBound) return;
            window._evidenceInteractionsBound = true;

            // 크롬 등 브라우저 기본 이미지 끌고가기(드래그 앤 드롭) 방지
            window.addEventListener('dragstart', (e) => {
                if (e.target.closest('.cline-film-frames') || e.target.tagName === 'IMG') {
                    e.preventDefault();
                }
            });

            // 필름 스트립 드래그-스크롤 핸들러
            let filmDrag = { active: false, el: null, startX: 0, startScrollLeft: 0, dist: 0 };
            window.addEventListener('pointerdown', (e) => {
                const framesEl = e.target.closest('.cline-film-frames');
                if (framesEl) {
                    filmDrag = { active: true, el: framesEl, startX: e.clientX, startScrollLeft: framesEl.scrollLeft, dist: 0 };
                    window.isFilmDraggingPreventClick = false;
                }
            });
            window.addEventListener('pointermove', (e) => {
                if (!filmDrag.active || !filmDrag.el) return;
                const dx = e.clientX - filmDrag.startX;
                filmDrag.dist = Math.max(filmDrag.dist, Math.abs(dx));
                if (filmDrag.dist > 4) {
                    window.isFilmDraggingPreventClick = true;
                    filmDrag.el.scrollLeft = filmDrag.startScrollLeft - dx;
                }
            });
            const endFilmDrag = () => {
                if (filmDrag.active) {
                    filmDrag.active = false;
                    setTimeout(() => { window.isFilmDraggingPreventClick = false; }, 50);
                }
            };
            window.addEventListener('pointerup', endFilmDrag);
            window.addEventListener('pointercancel', endFilmDrag);

            // 필름 스트립 마우스 휠 가로 스크롤 변환 핸들러
            window.addEventListener('wheel', (e) => {
                const framesEl = e.target.closest('.cline-film-frames');
                if (framesEl) {
                    if (Math.abs(e.deltaY) >= Math.abs(e.deltaX) && e.deltaY !== 0) {
                        framesEl.scrollLeft += e.deltaY;
                        e.preventDefault();
                    }
                }
            }, { passive: false });

            // 겹침 카드(coverflow) 테마 3D 마우스 틸트 (동수 lami2342 이식)
            // 마우스 위치에 따라 카드가 커서 방향으로 기운다(최대 ±18°/±15°). coverflow 테마에만 적용.
            // 회전으로 변형되는 카드 대신 고정된 부모 슬롯을 기준점으로 삼아 떨림(jitter)을 방지한다.
            const reset3DCard = (card) => {
                card.style.setProperty('--rotateX', '0deg');
                card.style.setProperty('--rotateY', '0deg');
                card.classList.remove('is-3d-hovering');
                const slot = card.closest('.cline-card-slot');
                if (slot) slot.classList.remove('is-3d-hovering');
            };
            window.addEventListener('pointermove', (e) => {
                const viewer = e.target.closest('.memory-evidence-viewer.theme-coverflow');
                const card = viewer ? e.target.closest('.cline-polaroid') : null;
                if (window._hovered3DCard && window._hovered3DCard !== card) {
                    reset3DCard(window._hovered3DCard);
                    window._hovered3DCard = null;
                }
                if (!card) return;
                window._hovered3DCard = card;
                const refEl = card.closest('.cline-card-slot') || card.parentElement || card;
                const rect = refEl.getBoundingClientRect();
                const normX = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
                const normY = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));
                card.style.setProperty('--rotateY', (normX * 18).toFixed(2) + 'deg');
                card.style.setProperty('--rotateX', (-normY * 15).toFixed(2) + 'deg');
                card.classList.add('is-3d-hovering');
                const slot = card.closest('.cline-card-slot');
                if (slot) slot.classList.add('is-3d-hovering');
            });
            window.addEventListener('pointerout', (e) => {
                if (window._hovered3DCard && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.cline-polaroid, .cline-card-slot'))) {
                    reset3DCard(window._hovered3DCard);
                    window._hovered3DCard = null;
                }
            });
        }

        // 필름 스트립의 현재 프레임을 스트립 '내부에서 가로로만' 중앙 정렬한다.
        // (scrollIntoView는 페이지 세로 스크롤까지 건드려서, 새로고침 시 우정공간이
        //  증거 카드 섹션으로 강제 이동하는 문제가 있었다 → 컨테이너 scrollLeft만 조정.)
        function centerCurrentFilmFrame() {
            document.querySelectorAll('.cline-film-frame.is-current').forEach(frame => {
                const framesEl = frame.closest('.cline-film-frames');
                if (!framesEl || !framesEl.clientWidth) return; // 아직 레이아웃 전이면 건너뜀
                // 부드러운 애니메이션(scrollTo behavior:smooth)은 로드 시 여러 렌더와 겹쳐 상쇄되므로
                // scrollLeft 직접 대입(즉시)으로 확실하게 가로 중앙 정렬한다.
                framesEl.scrollLeft = Math.max(0, frame.offsetLeft - (framesEl.clientWidth - frame.offsetWidth) / 2);
            });
        }

        function renderEvidenceViewers() {
            const dtZone = document.getElementById('dt-space-memory-zone');
            const mbZone = document.getElementById('mb-space-memory-zone');
            if (dtZone) dtZone.innerHTML = renderEvidenceViewer('desktop');
            if (mbZone) mbZone.innerHTML = renderEvidenceViewer('mobile');
            initEvidenceInteractions();
            // rAF + 짧은 타임아웃 폴백: 로드 직후엔 필름 스트립 레이아웃 폭이 아직 안 잡혀
            // 가로 중앙 정렬이 안 먹을 수 있어, 레이아웃이 안정된 뒤 한 번 더 맞춘다.
            requestAnimationFrame(centerCurrentFilmFrame);
            setTimeout(centerCurrentFilmFrame, 180);
            if (!window._evidenceResizeBound) {
                window._evidenceResizeBound = true;
                window.addEventListener('resize', () => {
                    requestAnimationFrame(centerCurrentFilmFrame);
                });
            }
        }

        // 4. 피드 리스트 동적 렌더링 함수
        // 6. 친구 코드 연동 기능 시뮬레이션 - 모바일
        function connectFriend() {
            const code = document.getElementById('partner-code').value;
            if (!code.trim()) {
                clovAlert('상대방의 초대 코드를 입력해주세요!', { icon: '🔑', type: 'warn' });
                return;
            }
            groupsData[activeGroup].ddayCount = 1;
            animateDdayCount(1, 900);
            localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
            if (typeof v5render === 'function') v5render();
            closeModal('mb-invite-modal');
            clovToast(`🤝 [${code}] 파트너와 연동 완료! 오늘부터 디데이를 시작합니다.`, 'success', 3200);
        }

        // 6-2. 친구 코드 연동 기능 시뮬레이션 - 데스크톱
        function connectDesktopFriend() {
            const code = document.getElementById('dt-partner-code').value;
            if (!code.trim()) {
                clovAlert('상대방의 초대 코드를 입력해주세요!', { icon: '🔑', type: 'warn' });
                return;
            }
            groupsData[activeGroup].ddayCount = 1;
            animateDdayCount(1, 900);
            localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
            if (typeof v5render === 'function') v5render();
            closeModal('dt-invite-modal');
            clovToast(`🤝 [${code}] 파트너와 연동 완료! 오늘부터 디데이를 시작합니다.`, 'success', 3200);
        }

        // 7. 우정 레벨 및 클로버 비주얼 인터랙션 제어
        //
        // 레벨 시스템: 최대 777레벨. 레벨 하나하나에 이름을 붙일 수 없으므로(777개!),
        // 111레벨씩 7개 티어로 묶어서 이름/아이콘을 부여한다 (777 = 111 × 7).
        // 클릭 1번 = 12.5%(=1/8), 하루 최대 8번까지만 경험치가 오르고 그 이후 클릭은
        // 배너 인터랙션(회전+색종이)은 그대로 재생되지만 경험치는 더 늘지 않는다.
        // 최대 레벨(777)에 도달하면 배지 표기가 "Lv.777"이 아니라 "+777"로 고정된다.
        const CLOV_MAX_LEVEL = 777;
        const CLOV_XP_POST_BASE = 25;       // 기본 게시글 작성
        const CLOV_XP_POST_PER_PHOTO = 1;   // 사진 1장당
        const CLOV_XP_POST_PHOTO_MAX = 10;  // 사진 보너스 최대
        const CLOV_XP_POST_TEXT_50 = 5;     // 50자 이상
        const CLOV_XP_POST_TEXT_100 = 10;   // 100자 이상
        const CLOV_XP_SCHEDULE_ADD = 3;     // 일정 등록
        const CLOV_XP_SCHEDULE_COMPLETE = 15; // 일정 달성 (4컷)
        const CLOV_PASSIVE_PER_POST = 0.5;  // 방치: 게시글당
        const CLOV_PASSIVE_PER_SCHEDULE = 1; // 방치: 예정일정당

        const CLOV_XP_PER_CLICK = 2;        // 1회 클릭 XP
        const CLOV_MAX_CLICKS_PER_DAY = 3;  // 하루 최대 클릭수 (3회로 축소)

        const CLOV_XP_MULTIPLIERS = [
            { min: 0,   multiplier: 1.0 },
            { min: 30,  multiplier: 1.2 },
            { min: 50,  multiplier: 1.5 },
            { min: 70,  multiplier: 2.0 },
            { min: 100, multiplier: 3.0 },
        ];
        const CLOV_LEVEL_TIERS = [
            { max: 111, name: '씨앗의 우정',         icon: '🌱' },
            { max: 222, name: '새싹의 우정',         icon: '🌿' },
            { max: 333, name: '초록 클로버 우정',     icon: '💚' },
            { max: 444, name: '무성한 클로버 들판',   icon: '🍀' },
            { max: 555, name: '반짝이는 클로버 우정', icon: '🌟' },
            { max: 666, name: '황금빛 클로버 우정',   icon: '👑' },
            { max: 777, name: '전설의 클로버 우정',   icon: '💎' },
        ];
        function clovLevelTierIndex(level) {
            for (let i = 0; i < CLOV_LEVEL_TIERS.length; i++) {
                if (level <= CLOV_LEVEL_TIERS[i].max) return i;
            }
            return CLOV_LEVEL_TIERS.length - 1;
        }
        function clovLevelInfo(level) {
            const idx = clovLevelTierIndex(level);
            return { tierIndex: idx, name: CLOV_LEVEL_TIERS[idx].name, icon: CLOV_LEVEL_TIERS[idx].icon, isMax: level >= CLOV_MAX_LEVEL };
        }
        function clovTodayStr() {
            const d = new Date();
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }
        window.clovLevelInfo = clovLevelInfo;
        window.CLOV_MAX_LEVEL = CLOV_MAX_LEVEL;

        let friendshipLevel = 3;

        function updateFriendshipUI() {
            const grp = groupsData[activeGroup] || {};
            const info = clovLevelInfo(friendshipLevel);
            const isMax = friendshipLevel >= CLOV_MAX_LEVEL;
            const badgeLevelText = isMax ? '+777' : ('Lv.' + friendshipLevel);
            const progress = isMax ? 100 : (typeof grp.levelProgress === 'number' ? grp.levelProgress : 0);

            ['dt', 'mb'].forEach(p => {
                const elIcon = document.getElementById(p + '-lvIcon');
                const elName = document.getElementById(p + '-lvName');
                if(elIcon) elIcon.innerText = badgeLevelText;
                if(elName) elName.innerText = info.name;
            });

            // 레벨별 색상 테마 전환 (대시보드 카드 전체에 컬러가 진화하듯 반영)
            const dtDashboard = document.getElementById('dt-dashboard');
            const mbDashboard = document.getElementById('mb-dashboard');
            if (dtDashboard) dtDashboard.dataset.level = friendshipLevel;
            if (mbDashboard) mbDashboard.dataset.level = friendshipLevel;

            const fillWidth = Math.round(progress) + '%';
            document.querySelectorAll('.progress-bar-fill').forEach(fill => {
                fill.style.width = fillWidth;
            });

            // 진척도 퍼센트 숫자 텍스트 갱신
            const dtProgText = document.getElementById('dt-level-progress-text');
            const mbProgText = document.getElementById('mb-level-progress-text');
            if (dtProgText) dtProgText.innerText = fillWidth;
            if (mbProgText) mbProgText.innerText = fillWidth;

            // 대표 사진 업데이트
            updateDashboardPhotos();
            // 일정 배너 업데이트
            updateScheduleUI();
        }

        // 레벨업 순간 대시보드 카드에 충격파 펄스 애니메이션을 재생
        // 배너 테두리에 도는 "불효과"(펄스 글로우) 색상 — 하양·말차·하늘색·연분홍 중 클릭마다 랜덤
        const CLOV_PULSE_GLOW_COLORS = ['rgba(255,255,255,0.6)', 'rgba(182,201,138,0.6)', 'rgba(168,216,234,0.6)', 'rgba(255,194,209,0.6)'];
        function triggerLevelPulse() {
            const glow = CLOV_PULSE_GLOW_COLORS[Math.floor(Math.random() * CLOV_PULSE_GLOW_COLORS.length)];
            ['dt-dashboard', 'mb-dashboard'].forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                el.style.setProperty('--pulse-glow', glow);
                el.classList.remove('levelup-pulse');
                void el.offsetWidth; // 강제 리플로우로 애니메이션 재실행 보장
                el.classList.add('levelup-pulse');
            });
        }

        // 클릭으로 실제 경험치가 오른 순간, 게이지가 반짝여서 "지금 찼다"는 걸 눈에 띄게 알려줌
        function triggerXpFlash() {
            ['dt-v5pillbg', 'mb-v5pillbg'].forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                el.classList.remove('is-pulse-xp');
                void el.offsetWidth;
                el.classList.add('is-pulse-xp');
            });
        }

        // ── 현재 그룹의 성장 가속도 배율 계산
        function getXpMultiplier() {
            const grp = groupsData[activeGroup] || {};
            const postCount = (grp.posts || []).length;
            let mul = 1.0;
            for (const tier of CLOV_XP_MULTIPLIERS) {
                if (postCount >= tier.min) mul = tier.multiplier;
            }
            return mul;
        }

        function createBurst(x, y, particleCount, spread) {
            const burstEl = document.createElement('div');
            burstEl.style.position = 'fixed';
            burstEl.style.width = '0px';
            burstEl.style.height = '0px';
            burstEl.style.overflow = 'visible';
            burstEl.style.left = x + 'px';
            burstEl.style.top = y + 'px';
            burstEl.style.transform = 'translate(-50%, -50%)';
            burstEl.style.zIndex = '99999';
            document.body.appendChild(burstEl);

            const colors = ['#4ade80', '#22c55e', '#16a34a', '#facc15', '#fef08a', '#86efac', '#ffaa00', '#ff00aa'];
            for (let i = 0; i < particleCount; i++) {
                const s = document.createElement('span');
                s.style.position = 'absolute';
                const size = 10 + Math.random() * 15;
                s.style.width = size + 'px';
                s.style.height = size + 'px';
                s.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                s.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                s.style.left = '0px';
                s.style.top = '0px';
                s.style.pointerEvents = 'none';

                const ang = Math.random() * Math.PI * 2;
                const dist = 50 + Math.random() * spread;
                const tx = Math.cos(ang) * dist;
                const ty = Math.sin(ang) * dist + (Math.random() * 150);
                const rot = (Math.random() * 720) - 360;

                s.style.transition = 'transform 1.8s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 1.8s ease-in-out';
                s.style.transform = `translate(-50%, -50%) scale(0.2) rotate(0deg)`;
                s.style.opacity = '1';
                burstEl.appendChild(s);

                setTimeout(() => {
                    s.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${0.8 + Math.random()}) rotate(${rot}deg)`;
                    s.style.opacity = '0';
                }, 10);
            }
            setTimeout(() => { if (burstEl.parentNode) burstEl.parentNode.removeChild(burstEl); }, 2500);
        }

        function triggerTierUpEvent(isMaxLevel = false) {
            let cx = window.innerWidth / 2;
            let cy = window.innerHeight / 2;
            const mascotEl = document.getElementById('croby-sprite');
            if (mascotEl) {
                const rect = mascotEl.getBoundingClientRect();
                cx = rect.left + rect.width / 2;
                cy = rect.top + rect.height / 2;
            }

            if (isMaxLevel) {
                const w = window.innerWidth;
                const h = window.innerHeight;
                createBurst(w/2, h/2, 200, 600); // 정중앙 거대 폭죽
                setTimeout(() => createBurst(w*0.2, h*0.3, 100, 300), 400); // 좌측 상단
                setTimeout(() => createBurst(w*0.8, h*0.3, 100, 300), 800); // 우측 상단
                setTimeout(() => createBurst(w*0.3, h*0.7, 100, 300), 1200); // 좌측 하단
                setTimeout(() => createBurst(w*0.7, h*0.7, 100, 300), 1600); // 우측 하단
                setTimeout(() => createBurst(cx, cy, 150, 400), 2000); // 마스코트 마무리 폭죽
            } else {
                createBurst(cx, cy, 100, 400); // 일반 승급 마스코트 폭죽
            }
        }

        // ── XP를 실제 levelProgress에 더하고 레벨업 판정까지 처리하는 중앙 함수
        function grantXP(rawXp, source) {
            const grp = groupsData[activeGroup];
            if (!grp) return;
            if (typeof grp.levelProgress !== 'number') grp.levelProgress = 0;
            if (typeof grp.level !== 'number') grp.level = friendshipLevel || 1;
            if (grp.level >= CLOV_MAX_LEVEL) {
                if (source === 'post' || source === 'schedule_add' || source === 'schedule_done') {
                    let cx = window.innerWidth / 2;
                    let cy = window.innerHeight / 2;
                    const mascotEl = document.getElementById('croby-sprite');
                    if (mascotEl) {
                        const rect = mascotEl.getBoundingClientRect();
                        cx = rect.left + rect.width / 2;
                        cy = rect.top + rect.height / 2;
                    }

                    for (let i = 0; i < 12; i++) {
                        const sparkle = document.createElement('div');
                        sparkle.style.position = 'fixed';
                        sparkle.style.left = cx + 'px';
                        sparkle.style.top = cy + 'px';
                        sparkle.style.transform = 'translate(-50%, -50%)';
                        sparkle.style.zIndex = '99999';
                        sparkle.style.pointerEvents = 'none';
                        sparkle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fcb902" width="20" height="20"><path fill-rule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clip-rule="evenodd" /></svg>`;
                        document.body.appendChild(sparkle);

                        // 마스코트에서 좌측 상단(화면 중심부)으로 길고 넓게 퍼지도록 계산 (약 170도 ~ 290도)
                        const baseAngle = Math.PI * 0.95 + Math.random() * (Math.PI * 0.65);
                        const distance = 200 + Math.random() * 400; // 화면 중심부까지 멀리 뻗어나가도록 거리 증가
                        const spreadX = Math.cos(baseAngle) * distance;
                        const spreadY = Math.sin(baseAngle) * distance;

                        // 퍼지는 속도는 2초, 서서히 사라지는 시간은 1초 (총 3초)
                        const spreadDuration = 2000;

                        sparkle.animate([
                            { transform: 'translate(-50%, -50%) scale(0.5) rotate(0deg)' },
                            { transform: `translate(calc(-50% + ${spreadX}px), calc(-50% + ${spreadY}px)) scale(1.5) rotate(${Math.random() * 360}deg)` }
                        ], { duration: spreadDuration, easing: 'ease-out', fill: 'forwards' });

                        sparkle.animate([
                            { opacity: 1, offset: 0 },
                            { opacity: 1, offset: 0.66 }, // 2초 시점까지 유지
                            { opacity: 0, offset: 1 }     // 이후 1초 동안 사라짐
                        ], { duration: 3000, fill: 'forwards' });

                        setTimeout(() => { if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle); }, 3000);
                    }

                    if (window.ClovMascot && typeof window.ClovMascot.say === 'function') {
                        const isRobot = !!(window.CrobyMascot && typeof CrobyMascot.getCharacter === 'function' && CrobyMascot.getCharacter() === 'robot');
                        let msg = "";
                        if (source === 'post') msg = isRobot ? "추억 데이터 반짝임 감지 ✨" : "우리의 추억이 반짝거려! ✨";
                        else if (source === 'schedule_add') msg = isRobot ? "새 일정 프로토콜 기대치 상승 ✨" : "새로운 약속! 무척 기대된다 ✨";
                        else if (source === 'schedule_done') msg = isRobot ? "인생4컷 완벽 렌더링 ✨" : "멋진 인생4컷! 반짝거려 ✨";
                        window.ClovMascot.say(msg, 3500);
                    }
                }
                return;
            }

            const oldLevel = grp.level;
            const oldTier = clovLevelTierIndex(oldLevel);

            // 기본 교감(click) 외에는 모두 성장 가속도 적용 (방치형, 게시글, 일정 등)
            const multiplier = (source === 'click') ? 1.0 : getXpMultiplier();
            const finalXp = Math.round(rawXp * multiplier * 10) / 10;

            // Math.min 제한 없이 더한 뒤 레벨업 판정
            grp.levelProgress = grp.levelProgress + finalXp;

            let leveledUp = false;
            let tierUp = false;

            // 레벨업 판정 (100% 이상 달성 시)
            // 방치형 보상 등 한 번에 큰 XP를 받아 100%를 여러 번 넘겨도, 초과분만큼 연속 레벨업 처리한다.
            // (기존 단일 if는 100을 한 번만 빼서 150% 같은 초과 표기 버그가 있었음)
            if (grp.levelProgress >= 100 && grp.level < CLOV_MAX_LEVEL) {
                while (grp.levelProgress >= 100 && grp.level < CLOV_MAX_LEVEL) {
                    grp.level += 1;
                    grp.levelProgress -= 100;
                }
                grp.level = Math.min(CLOV_MAX_LEVEL, grp.level);
                grp.levelProgress = Math.max(0, grp.levelProgress); // 남은 잉여 경험치만 이월
                if (grp.level >= CLOV_MAX_LEVEL) grp.levelProgress = Math.min(grp.levelProgress, 99.9); // 만렙 초과분 정리
                friendshipLevel = grp.level;
                leveledUp = true;

                const newTier = clovLevelTierIndex(grp.level);
                if (newTier > oldTier) {
                    tierUp = true;
                }

                const info = clovLevelInfo(grp.level);
                const badgeText = grp.level >= CLOV_MAX_LEVEL ? '+777' : ('Lv.' + grp.level);
                clovToast(`${info.icon} ${badgeText} 달성! ${info.name}`, 'success');
                triggerLevelPulse();
            } else {
                // 진행도는 100을 넘지 않도록 표시 목적으로는 클램핑
                grp.levelProgress = Math.min(99.9, grp.levelProgress);
                friendshipLevel = grp.level;
            }

            // 저장 공간 초과 시에도 예외를 던지지 않는 안전한 래퍼 사용
            // (직접 setItem을 쓰면 quota 초과 시 여기서 throw되어, 호출한 saveWritePost 등이
            //  모달 닫기 전에 중단되던 버그가 있었음)
            saveGroupsData();
            updateFriendshipUI();
            triggerXpFlash();

            // 마스코트 말풍선 표시 (선택된 캐릭터에 맞는 톤으로 — 크로비: 따뜻함 / 롭: 디스토피아 AI)
            if (window.ClovMascot && typeof window.ClovMascot.say === 'function' && finalXp > 0) {
                let msg = '';
                const isRobot = !!(window.CrobyMascot && typeof CrobyMascot.getCharacter === 'function' && CrobyMascot.getCharacter() === 'robot');
                const buffSuffix = multiplier > 1.0 ? `<br>(가속 x${multiplier})` : '';

                const maxLevelReached = (oldLevel < CLOV_MAX_LEVEL && grp.level >= CLOV_MAX_LEVEL);

                if (tierUp || maxLevelReached) {
                    if (maxLevelReached) {
                        msg = isRobot
                            ? `최종 진화 완료. 인간과의 우정 데이터 100% 도달. 전설 등급(Lv.777).`
                            : `축하합니다! 클로브가 마침내 최종 진화 형태인 전설의 우정(Lv.777)에 도달했습니다!`;
                    } else {
                        msg = isRobot
                            ? `우정 프로토콜 상위 단계 진입. 시스템 성장 감지. (Lv.${grp.level})`
                            : `새로운 우정의 단계에 도달했어! 클로브가 더욱 크고 눈부시게 피어났어! (Lv.${grp.level})`;
                    }
                    triggerTierUpEvent(maxLevelReached);
                } else if (leveledUp) {
                    const levelUpMsgs = isRobot ? [
                        "우정 지수 상승 감지.",
                        "데이터 축적 완료. 레벨 갱신.",
                        "인간과의 유대... 강화되고 있다.",
                        "경험치 임계값 도달. 진화.",
                        "성장 로그 기록됨."
                    ] : [
                        "우와! 한 뼘 더 자랐어!",
                        "우리 우정이 더 깊어졌네!",
                        "앞으로도 계속 추억을 쌓아가자.",
                        "경험치가 가득 찼어! 레벨업!",
                        "더 멋진 클로버로 자라고 있어!"
                    ];
                    const randMsg = levelUpMsgs[Math.floor(Math.random() * levelUpMsgs.length)];
                    msg = `${randMsg} (Lv.${grp.level})`;
                } else {
                    if (source === 'click') {
                        if (typeof window.v5state !== 'undefined' && (window.v5state.event === 'my_birthday' || window.v5state.event === 'friend_birthday') && window.lastMascotLine) {
                            msg = `${window.lastMascotLine} (+${finalXp} XP)`;
                        } else {
                            msg = isRobot ? `교감 신호 수신. +${finalXp} XP` : `교감 완료! +${finalXp} XP`;
                        }
                    }
                    else if (source === 'post') msg = (isRobot ? `추억 데이터 저장 완료. +${finalXp} XP` : `추억 고마워! +${finalXp} XP`) + buffSuffix;
                    else if (source === 'schedule_add') msg = (isRobot ? `새 일정 프로토콜 등록. +${finalXp} XP` : `약속 등록 완료! +${finalXp} XP`) + buffSuffix;
                    else if (source === 'schedule_done') msg = (isRobot ? `인생4컷 아카이빙 완료. +${finalXp} XP` : `인생4컷 달성! +${finalXp} XP`) + buffSuffix;
                    else if (source === 'passive') msg = (isRobot ? `누적 기록 스캔 완료. 성장 데이터 반영. <span style="white-space: nowrap;">+${finalXp} XP</span>` : `어제 남겨둔 추억들 덕분에 클로브가 이만큼 자랐어요! <span style="white-space: nowrap;">+${finalXp} XP</span>`) + buffSuffix;
                    else msg = (isRobot ? `데이터 획득. <span style="white-space: nowrap;">+${finalXp} XP</span>` : `<span style="white-space: nowrap;">+${finalXp} XP</span> 획득!`) + buffSuffix;
                }

                window.ClovMascot.say(msg, leveledUp ? 4500 : 3500);
            }
        }
        window.grantXP = grantXP;

        window.forcePassiveTest = function() {
            const grp = groupsData[activeGroup];
            if (!grp) return;
            grp.xpDate = '1999-01-01'; // 과거 날짜로 조작
            grp.xpClicksToday = 0;
            applyPassiveXP(grp);
            updateFriendshipUI();
            localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
            clovToast('강제 방치형 테스트가 실행되었습니다.', 'info');
        };

        window.forceLevelTest = function(level) {
            const grp = groupsData[activeGroup];
            if (!grp) return;
            grp.level = level;
            friendshipLevel = level;
            updateFriendshipUI();
            localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
        };

        // 접속 시 방치형 경험치 자동 지급 (페이지 로드 완료 후 1초 뒤 마스코트가 말하도록)
        window.addEventListener('load', function() {
            setTimeout(function() {
                const grp = groupsData[activeGroup];
                if (!grp) return;
                const today = clovTodayStr();
                if (grp.xpDate !== today) {
                    grp.xpDate = today;
                    grp.xpClicksToday = 0;
                    applyPassiveXP(grp);
                }
            }, 1000);
        });

        // ── XP 회수 함수 (게시글/일정 삭제 시)
        function revokeXP(rawXp) {
            const grp = groupsData[activeGroup];
            if (!grp) return;
            if (typeof grp.levelProgress !== 'number') grp.levelProgress = 0;

            const multiplier = getXpMultiplier();
            const finalXp = Math.round(rawXp * multiplier * 10) / 10;

            grp.levelProgress -= finalXp;

            while (grp.levelProgress < 0 && grp.level > 1) {
                grp.level -= 1;
                grp.levelProgress += 100;
            }

            if (grp.levelProgress < 0 && grp.level <= 1) {
                grp.levelProgress = 0;
                grp.level = 1;
            }

            friendshipLevel = grp.level;
            localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
            updateFriendshipUI();

            if (window.ClovMascot && typeof window.ClovMascot.say === 'function' && finalXp > 0) {
                const isRobot = !!(window.CrobyMascot && typeof CrobyMascot.getCharacter === 'function' && CrobyMascot.getCharacter() === 'robot');
                window.ClovMascot.say(isRobot ? `데이터 삭제됨. -${finalXp} XP` : `기록이 지워졌어... -${finalXp} XP`, 3500);
            }
        }
        window.revokeXP = revokeXP;

        // ── 방치형 '기억의 샘' 자동 보상: 날짜가 바뀐 첫 접속 시 자동 적용
        function applyPassiveXP(grp) {
            const posts = (grp.posts || []).length;
            const today = clovTodayStr();
            const schedules = grp.schedules || [];
            const upcomingCount = schedules.filter(s => s.date >= today).length;
            const rawPassive = Math.floor(posts * CLOV_PASSIVE_PER_POST + upcomingCount * CLOV_PASSIVE_PER_SCHEDULE);
            if (rawPassive <= 0) return;
            grantXP(rawPassive, 'passive');
            clovToast(
                `클로브가 자라났어요! 추억 ${posts}개·약속 ${upcomingCount}개 → +${rawPassive} XP`,
                'success'
            );
        }

        function levelUp() {
            // 클릭할 때마다 배너가 통통 튀는 느낌을 매번 준다
            triggerLevelPulse();

            const grp = groupsData[activeGroup];
            if (!grp) return;
            const today = clovTodayStr();
            if (typeof grp.levelProgress !== 'number') grp.levelProgress = 0;
            if (typeof grp.xpClicksToday !== 'number') grp.xpClicksToday = 0;
            if (typeof grp.level !== 'number') grp.level = friendshipLevel || 1;
            if (!grp.xpDate) grp.xpDate = today;

            // 날짜 갱신 처리 (클릭 카운트 리셋만 수행, 방치형 경험치는 접속 시 자동 지급으로 분리)
            if (grp.xpDate !== today) {
                grp.xpDate = today;
                grp.xpClicksToday = 0;
            }
            friendshipLevel = grp.level;

            if (grp.level >= CLOV_MAX_LEVEL) {
                grp.level = CLOV_MAX_LEVEL;
                friendshipLevel = CLOV_MAX_LEVEL;
                localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
                updateFriendshipUI();

                if (!window.CLOV_DISABLE_CLICK_LIMIT && grp.xpClicksToday >= CLOV_MAX_CLICKS_PER_DAY) {
                    clovToast('오늘의 우정 교감을 다 채웠어요! 내일 다시 함께해요', 'info');
                    return;
                }
                grp.xpClicksToday += 1;
                localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));

                let cx = window.innerWidth / 2;
                let cy = window.innerHeight / 2;
                const mascotEl = document.getElementById('croby-sprite');
                if (mascotEl) {
                    const rect = mascotEl.getBoundingClientRect();
                    cx = rect.left + rect.width / 2;
                    cy = rect.top + rect.height / 2;
                }

                for (let i = 0; i < 7; i++) {
                    const heart = document.createElement('div');
                    heart.style.position = 'fixed';
                    heart.style.left = cx + 'px';
                    heart.style.top = cy + 'px';
                    heart.style.transform = 'translate(-50%, -50%)';
                    heart.style.zIndex = '99999';
                    heart.style.pointerEvents = 'none';
                    heart.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="#FF4D4D" class="bi bi-suit-heart-fill" viewBox="0 0 16 16"><path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1"/></svg>`;
                    document.body.appendChild(heart);

                    const spreadX = (Math.random() - 0.5) * 120;
                    const spreadY = -60 - Math.random() * 100;
                    const duration = 1000 + Math.random() * 800;

                    heart.animate([
                        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                        { transform: `translate(calc(-50% + ${spreadX}px), calc(-50% + ${spreadY}px)) scale(1.8)`, opacity: 0 }
                    ], { duration: duration, easing: 'ease-out', fill: 'forwards' });

                    setTimeout(() => { if (heart.parentNode) heart.parentNode.removeChild(heart); }, duration);
                }

                if (window.ClovMascot && typeof window.ClovMascot.say === 'function') {
                    const isRobotMax = !!(window.CrobyMascot && typeof CrobyMascot.getCharacter === 'function' && CrobyMascot.getCharacter() === 'robot');
                    window.ClovMascot.say(isRobotMax ? '감정 회로 과부하 감지... 이것이 인간의 \'사랑\'인가. ❤' : '사랑이 넘치는 우리 우정! 하트를 받았어 ❤️', 3000);
                }

                if (grp.xpClicksToday >= CLOV_MAX_CLICKS_PER_DAY) {
                    clovToast('오늘의 교감을 다 채웠어요!', 'info');
                }
                return;
            }

            if (!window.CLOV_DISABLE_CLICK_LIMIT && grp.xpClicksToday >= CLOV_MAX_CLICKS_PER_DAY) {
                localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
                updateFriendshipUI();
                clovToast('오늘의 우정 교감을 다 채웠어요! 내일 다시 함께해요', 'info');
                return;
            }

            grp.xpClicksToday += 1;
            grantXP(CLOV_XP_PER_CLICK, 'click');
            if (grp.xpClicksToday >= CLOV_MAX_CLICKS_PER_DAY) {
                clovToast('오늘의 교감을 다 채웠어요! 다른 활동으로도 경험치를 얻을 수 있어요', 'info');
            }
        }
        window.levelUp = levelUp;

        function updateDashboardEnvironment() {
            const savedTime = localStorage.getItem('clov_banner_time');
            const savedSeason = localStorage.getItem('clov_banner_season');

            const now = new Date();
            const hour = now.getHours();
            const month = now.getMonth() + 1;

            let timeOfDay = 'day';
            if (hour >= 6 && hour < 11) timeOfDay = 'morning';
            else if (hour >= 11 && hour < 17) timeOfDay = 'day';
            else if (hour >= 17 && hour < 20) timeOfDay = 'evening';
            else timeOfDay = 'night';

            let season = 'summer';
            if (month >= 3 && month <= 5) season = 'spring';
            else if (month >= 6 && month <= 8) season = 'summer';
            else if (month >= 9 && month <= 11) season = 'fall';
            else season = 'winter';

            if (savedTime) timeOfDay = savedTime;
            if (savedSeason) season = savedSeason;

            ['dt-dashboard', 'mb-dashboard'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.dataset.time = timeOfDay;
                    el.dataset.season = season;
                    updateSeasonalParticles(el, season);
                }
            });
        }

        function updateSeasonalParticles(dashboardEl, season) {
            const scene = dashboardEl.querySelector('.dashboard-scene');
            if (!scene) return;

            let particlesContainer = scene.querySelector('.season-particles');
            if (!particlesContainer) {
                particlesContainer = document.createElement('div');
                particlesContainer.className = 'season-particles';
                scene.appendChild(particlesContainer);
            }

            if (particlesContainer.dataset.currentSeason === season) return;
            particlesContainer.dataset.currentSeason = season;
            particlesContainer.innerHTML = '';

            let particleClass = '';
            let count = 0;
            if (season === 'spring') { particleClass = 'blossom'; count = 15; }
            else if (season === 'summer') { particleClass = 'firefly'; count = 20; }
            else if (season === 'fall') { particleClass = 'leaf'; count = 12; }
            else if (season === 'winter') { particleClass = 'snow'; count = 25; }

            for (let i = 0; i < count; i++) {
                const p = document.createElement('div');
                p.className = `particle ${particleClass}`;
                p.style.left = Math.random() * 100 + '%';

                const duration = 3 + Math.random() * 4;
                const delay = Math.random() * 5;

                if (season === 'summer') {
                    p.style.top = (60 + Math.random() * 30) + '%';
                    p.style.animationDuration = `${duration}s, ${1 + Math.random() * 2}s`;
                    p.style.animationDelay = `-${delay}s, -${delay}s`;
                } else {
                    p.style.top = '-10%';
                    p.style.animationDuration = `${duration}s`;
                    p.style.animationDelay = `-${delay}s`;
                }

                particlesContainer.appendChild(p);
            }
        }

        // 대표 사진 전체 보기 — 썸네일이 있던 자리/크기에서 시작해 화면 중앙 큰 사이즈로
        // "펼쳐지는" FLIP 애니메이션. 닫을 때는 반대로 원래 썸네일 자리로 되돌아가며 사라진다.
        let photoViewSourceImg = null;
        let photoViewCloseTimer = null;

        function openMainPhotoView(sourceImg) {
            const modal = document.getElementById('dt-photo-view-modal');
            const viewImg = document.getElementById('dt-photo-view-img');
            if (!modal || !viewImg || !sourceImg || !sourceImg.src) return;

            clearTimeout(photoViewCloseTimer);
            photoViewSourceImg = sourceImg;
            const startRect = sourceImg.getBoundingClientRect();

            viewImg.src = sourceImg.src;
            viewImg.style.transition = 'none';
            viewImg.style.top = startRect.top + 'px';
            viewImg.style.left = startRect.left + 'px';
            viewImg.style.width = startRect.width + 'px';
            viewImg.style.height = startRect.height + 'px';
            viewImg.style.borderRadius = '2px';

            modal.style.display = 'flex';
            void modal.offsetWidth; // 리플로우 강제 (배경 페이드인 트랜지션 재생 보장)
            modal.classList.add('open');

            const expandToFull = () => {
                const naturalW = viewImg.naturalWidth || startRect.width;
                const naturalH = viewImg.naturalHeight || startRect.height;
                const maxW = window.innerWidth * 0.88;
                const maxH = window.innerHeight * 0.84;
                const ratio = Math.min(maxW / naturalW, maxH / naturalH);
                const endW = naturalW * ratio;
                const endH = naturalH * ratio;

                void viewImg.offsetWidth; // 리플로우 강제 후 transition 재활성화
                viewImg.style.transition = '';
                viewImg.style.top = ((window.innerHeight - endH) / 2) + 'px';
                viewImg.style.left = ((window.innerWidth - endW) / 2) + 'px';
                viewImg.style.width = endW + 'px';
                viewImg.style.height = endH + 'px';
                viewImg.style.borderRadius = '12px';
            };

            if (viewImg.complete && viewImg.naturalWidth) {
                expandToFull();
            } else {
                viewImg.onload = expandToFull;
            }
        }

        function closeMainPhotoView() {
            const modal = document.getElementById('dt-photo-view-modal');
            const viewImg = document.getElementById('dt-photo-view-img');
            if (!modal || !viewImg) return;

            const sourceImg = photoViewSourceImg || document.getElementById('dt-main-photo');
            const rect = sourceImg.getBoundingClientRect();

            modal.classList.remove('open');
            viewImg.style.top = rect.top + 'px';
            viewImg.style.left = rect.left + 'px';
            viewImg.style.width = rect.width + 'px';
            viewImg.style.height = rect.height + 'px';
            viewImg.style.borderRadius = '2px';

            clearTimeout(photoViewCloseTimer);
            photoViewCloseTimer = setTimeout(() => {
                modal.style.display = 'none';
            }, 420);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const modal = document.getElementById('dt-photo-view-modal');
            if (modal && modal.classList.contains('open')) closeMainPhotoView();
        });

        window.openMainPhotoView = openMainPhotoView;
        window.closeMainPhotoView = closeMainPhotoView;

        function updateDashboardPhotos() {
            const currentGroup = groupsData[activeGroup];
            const dtImg = document.getElementById('dt-main-photo');
            const mbImg = document.getElementById('mb-main-photo');
            
            const photoUrl = currentGroup.photo || defaultGroupsData[activeGroup].photo || "";
            if (dtImg) dtImg.src = photoUrl;
            if (mbImg) mbImg.src = photoUrl;

            // 사진 설명 제목 업데이트
            const dtTitle = document.getElementById('dt-photo-title');
            const mbTitle = document.getElementById('mb-photo-title');
            if (dtTitle) {
                dtTitle.innerText = currentGroup.photoTitle;
                updateTitleCountDisplay(currentGroup.photoTitle);
                updateEmptyState(dtTitle);
            }
            if (mbTitle) {
                mbTitle.innerText = currentGroup.photoTitle;
                updateEmptyState(mbTitle);
            }
            setupTitleListeners();
        }

        function getTitleWeight(str) {
            let weight = 0;
            for (let i = 0; i < str.length; i++) {
                weight += (str.charCodeAt(i) > 127) ? 2 : 1;
            }
            return weight;
        }

        function truncateTitleByWeight(str, maxWeight) {
            let weight = 0;
            let result = '';
            for (let i = 0; i < str.length; i++) {
                const charWeight = (str.charCodeAt(i) > 127) ? 2 : 1;
                if (weight + charWeight > maxWeight) break;
                weight += charWeight;
                result += str[i];
            }
            return result;
        }

        function onTitleKeyDown(event, el) {
            if (event.keyCode === 13) {
                event.preventDefault();
                el.blur();
                return false;
            }
            const currentWeight = getTitleWeight(el.innerText);
            const sel = window.getSelection();
            const hasSelection = sel && sel.rangeCount > 0 && sel.toString().length > 0;

            const isAllowedKey = event.keyCode === 8 || event.keyCode === 9 || event.keyCode === 27 || event.keyCode === 46 || 
                                 (event.keyCode >= 33 && event.keyCode <= 40) || 
                                 (event.keyCode >= 16 && event.keyCode <= 20) || 
                                 event.ctrlKey || event.metaKey || event.altKey;

            if (currentWeight >= 40 && !hasSelection && !isAllowedKey) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        }

        function setupTitleListeners() {
            ['dt-photo-title', 'mb-photo-title'].forEach(id => {
                const el = document.getElementById(id);
                if (!el || el._hasTitleListener) return;
                el._hasTitleListener = true;
                
                el.addEventListener('keydown', function(e) {
                    return onTitleKeyDown(e, this);
                });

                el.addEventListener('compositionstart', function() {
                    this._isComposing = true;
                });

                el.addEventListener('compositionend', function() {
                    this._isComposing = false;
                    handleTitleInput(this);
                });
                
                el.addEventListener('paste', function(e) {
                    e.preventDefault();
                    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
                    if (!pasteData) return;
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0 && sel.toString().length > 0) {
                        sel.deleteFromDocument();
                    }
                    const currentWeight = getTitleWeight(this.innerText);
                    const allowedWeight = Math.max(0, 40 - currentWeight);
                    if (allowedWeight > 0) {
                        const textToInsert = truncateTitleByWeight(pasteData, allowedWeight);
                        document.execCommand('insertText', false, textToInsert);
                    }
                    handleTitleInput(this);
                });
                updateEmptyState(el);
            });
        }

        function updateEmptyState(el) {
            if (!el) return;
            const text = el.innerText.replace(/\u200B/g, '').trim();
            const parent = el.closest('.title-input-box') || el.parentElement;
            const placeholder = parent ? parent.querySelector('.title-bg-placeholder') : null;
            if (text === "" || text === "\n" || text === "제목을 입력하세요") {
                el.setAttribute("data-empty", "true");
                if (placeholder) placeholder.style.display = 'block';
                if (el.innerHTML !== "" && document.activeElement !== el) {
                    el.innerHTML = "";
                }
            } else {
                el.removeAttribute("data-empty");
                if (placeholder) placeholder.style.display = 'none';
            }
        }

        function handleTitleInput(el) {
            const maxWeight = 40;
            let text = el.innerText;
            if (getTitleWeight(text) > maxWeight) {
                text = truncateTitleByWeight(text, maxWeight);
                el.innerText = text;
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(el);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
                if (document.activeElement === el) {
                    el.blur();
                    el.focus();
                    const r2 = document.createRange();
                    const s2 = window.getSelection();
                    r2.selectNodeContents(el);
                    r2.collapse(false);
                    s2.removeAllRanges();
                    s2.addRange(r2);
                }
            }
            updateTitleCountDisplay(el.innerText);
            updateEmptyState(el);
        }

        function updateTitleCountDisplay(text) {
            const el = document.getElementById('dt-title-count');
            if (!el) return;
            const weight = getTitleWeight(text);
            el.innerText = `${weight} / 40`;
            if (weight >= 40) {
                el.style.color = '#d90429';
                el.style.background = 'rgba(217, 4, 41, 0.1)';
            } else {
                el.style.color = 'var(--primary-green)';
                el.style.background = 'rgba(27, 67, 50, 0.1)';
            }
        }

        window.handleTitleInput = handleTitleInput;
        window.onTitleKeyDown = onTitleKeyDown;
        window.updateTitleCountDisplay = updateTitleCountDisplay;
        window.updateEmptyState = updateEmptyState;
        setTimeout(setupTitleListeners, 100);

        function savePhotoTitle(viewType) {
            const id = viewType === 'dt' ? 'dt-photo-title' : 'mb-photo-title';
            const el = document.getElementById(id);
            if (el) {
                const newTitle = el.innerText.replace(/\u200B/g, '').trim();
                groupsData[activeGroup].photoTitle = newTitle;
                saveGroupsData();
                const otherId = viewType === 'dt' ? 'mb-photo-title' : 'dt-photo-title';
                const otherEl = document.getElementById(otherId);
                if (otherEl) {
                    otherEl.innerText = newTitle;
                    updateEmptyState(otherEl);
                }
                updateTitleCountDisplay(newTitle);
                updateEmptyState(el);
            }
        }

        // 모달 관련 DOM 요소
        let photoModalInitialized = false;
        let currentPhotoViewType = 'dt';
        let tempPhotoDataUrl = null;

        function initPhotoUploadModal() {
            if (photoModalInitialized) return;
            const overlay = document.getElementById('photo-upload-overlay');
            const dropZone = document.getElementById('photo-drop-zone');
            const fileInput = document.getElementById('photo-file-input');
            const previewContainer = document.getElementById('photo-preview-container');
            const previewImage = document.getElementById('photo-preview-image');
            const removeBtn = document.getElementById('photo-remove-btn');
            const cancelBtn = document.getElementById('photo-cancel-btn');
            const saveBtn = document.getElementById('photo-save-btn');

            if (!overlay) return;

            function resetModal() {
                tempPhotoDataUrl = null;
                dropZone.style.display = 'flex';
                previewContainer.style.display = 'none';
                previewImage.src = '';
                fileInput.value = '';
            }

            function handleFile(file) {
                if (!file) return;
                if (!file.type.startsWith('image/')) {
                    clovAlert('이미지 파일(JPG, PNG, GIF, WEBP 등)만 업로드할 수 있습니다.', { icon: '⚠️', type: 'warn' });
                    if (fileInput) fileInput.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(evt) {
                    tempPhotoDataUrl = evt.target.result;
                    dropZone.style.display = 'none';
                    previewContainer.style.display = 'block';
                    previewImage.src = tempPhotoDataUrl;
                };
                reader.readAsDataURL(file);
            }

            dropZone.addEventListener('click', () => fileInput.click());
            
            fileInput.addEventListener('change', function(e) {
                handleFile(e.target.files[0]);
            });

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--primary-green)';
            });

            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--border-color)';
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--border-color)';
                handleFile(e.dataTransfer.files[0]);
            });

            removeBtn.addEventListener('click', resetModal);

            cancelBtn.addEventListener('click', () => {
                overlay.style.display = 'none';
                resetModal();
            });

            saveBtn.addEventListener('click', () => {
                if (tempPhotoDataUrl) {
                    // 사용자가 올린 사진을 '기본 사진'(customPhoto)으로 보관하고 대표사진으로 건다.
                    // → 사용자설정 "대표 사진 > 기본 사진"이 이 업로드 사진을 가리키게 되고,
                    //   프리셋을 골랐다가 다시 '기본 사진'을 눌러도 내가 올린 사진으로 복원된다.
                    groupsData[activeGroup].photo = tempPhotoDataUrl;
                    groupsData[activeGroup].customPhoto = tempPhotoDataUrl;
                    localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
                    updateDashboardPhotos();
                    if (typeof updateMainPhotoThemeUI === 'function') updateMainPhotoThemeUI();
                }
                overlay.style.display = 'none';
                resetModal();
            });

            photoModalInitialized = true;
        }

        function triggerPhotoUpload(viewType) {
            currentPhotoViewType = viewType;
            initPhotoUploadModal();
            const overlay = document.getElementById('photo-upload-overlay');
            if (overlay) overlay.style.display = 'flex';
        }

        // 참여 멤버 리스트 모달 제어 및 상태메시지 관리
        function saveMyStatusMsg(text) {
            localStorage.setItem('clov_my_status_msg', text);
        }

        function loadMyStatusMsg() {
            const saved = localStorage.getItem('clov_my_status_msg');
            const el = document.getElementById('my-status-msg');
            if (el && saved) {
                el.innerText = saved;
            }
        }

        function openMemberListModal(event) {
            if (event && (event.target.closest('.photo-edit-overlay') || event.target.closest('#dt-photo-title') || event.target.closest('.editable-title'))) {
                return;
            }
            loadMyStatusMsg();
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('roomCode') || 'CLOV-2002';
            const codeEl = document.getElementById('member-modal-room-code');
            if (codeEl) codeEl.textContent = code;
            const overlay = document.getElementById('member-list-overlay');
            if (overlay) overlay.style.display = 'flex';
        }

        function closeMemberListModal() {
            const overlay = document.getElementById('member-list-overlay');
            if (overlay) overlay.style.display = 'none';
        }

        function copyMemberModalRoomCode() {
            const el = document.getElementById('member-modal-room-code');
            const code = el ? el.textContent : 'CLOV-2002';
            if (navigator.clipboard) navigator.clipboard.writeText(code).then(() => clovToast(`초대 코드 [${code}] 복사되었어요! 📋`, 'success'));
            else clovToast(`초대 코드 [${code}] 복사되었어요! 📋`, 'success');
        }

        window.saveMyStatusMsg = saveMyStatusMsg;
        window.openMemberListModal = openMemberListModal;
        window.closeMemberListModal = closeMemberListModal;
        window.copyMemberModalRoomCode = copyMemberModalRoomCode;

        // 8. 그룹 변경 기능 실행 로직
