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
                : `<span class="memory-clover-placeholder">🍀</span><span class="memory-image-text">사진이 없는 추억은<br>클로버로 보관됩니다</span>`;
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

            const photoHtml = memoryDetailState.editing ? `
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
            ` : normalizedPost.photos.length ? `
                <img class="memory-detail-photo" src="${escapeHtml(normalizedPost.photos[memoryDetailState.photoIndex] || normalizedPost.photos[0])}" alt="${escapeHtml(normalizedPost.title)}">
                ${normalizedPost.photos.length > 1 ? `
                    <div class="memory-detail-photo-strip">
                        ${normalizedPost.photos.map((url, index) => `
                            <button type="button" class="memory-detail-photo-thumb ${index === memoryDetailState.photoIndex ? 'is-active' : ''}" onclick="setMemoryDetailPhotoIndex(${index})">
                                <img src="${escapeHtml(url)}" alt="사진 ${index + 1}">
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            ` : `<div class="memory-detail-photo memory-detail-photo--empty"><span class="memory-clover-placeholder">🍀</span><span class="memory-image-text">사진이 없는 추억은<br>클로버로 보관됩니다</span></div>`;

            const rightColumnHtml = memoryDetailState.editing ? `
                <div class="memory-detail-edit-form">
                    <input type="text" id="memory-detail-edit-title" class="memory-detail-edit-title-input" value="${escapeHtml(normalizedPost.title)}" maxlength="40">
                    <textarea id="memory-detail-edit-body" class="memory-detail-edit-body-input" rows="6">${escapeHtml(normalizedPost.text || '')}</textarea>
                    <div class="memory-detail-edit-actions">
                        <button type="button" class="btn-sub" onclick="cancelMemoryPostEdit()">취소</button>
                        <button type="button" class="btn-main" onclick="updateMemoryPost()">저장</button>
                    </div>
                </div>
            ` : `
                <div class="memory-detail-title-lg">${escapeHtml(normalizedPost.title)}</div>
                <div class="memory-detail-body-text">${escapeHtml(normalizedPost.text || '')}</div>
                <div class="memory-detail-tags">
                    ${getMemoryHashtags(normalizedPost).map(tag => `<div class="memory-tag">${escapeHtml(tag)}</div>`).join('')}
                </div>
            `;

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

            sheet.innerHTML = `
                <div class="memory-detail-head">
                    <div>
                        <div class="memory-detail-kicker" id="memory-detail-author">${escapeHtml(authorLabel)}</div>
                        <div class="memory-detail-date" id="memory-detail-date">${escapeHtml(metaLine)}</div>
                    </div>
                    <button type="button" class="memory-detail-close" onclick="closeMemoryDetail()" aria-label="닫기">×</button>
                </div>
                <div class="memory-detail-columns">
                    <div class="memory-detail-photo-col">${photoHtml}</div>
                    <div class="memory-detail-text-col">${rightColumnHtml}</div>
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
            renderMemoryDetailModal();
        }

        function cancelMemoryPostEdit() {
            memoryDetailState.editing = false;
            memoryDetailState.photoDraft = null;
            renderMemoryDetailModal();
        }

        // 수정 중 사진 추가: 파일을 선택하면 미리보기로 바로 반영하고,
        // 모두 불러오기가 끝나면 "이미지 업로드 완료" 안내 모달을 띄운다.
        function handleMemoryEditPhotoUpload(input) {
            const files = [...(input.files || [])];
            if (!files.length) return;

            if (!memoryDetailState.photoDraft) memoryDetailState.photoDraft = [];
            const remaining = MEMORY_PHOTO_LIMIT - memoryDetailState.photoDraft.length;
            if (remaining <= 0) {
                input.value = '';
                alert(`사진은 최대 ${MEMORY_PHOTO_LIMIT}장까지 추가할 수 있어요.`);
                return;
            }

            const toLoad = files.slice(0, remaining);
            let loadedCount = 0;
            toLoad.forEach(file => {
                const reader = new FileReader();
                reader.onload = event => {
                    memoryDetailState.photoDraft.push(event.target.result);
                    loadedCount += 1;
                    if (loadedCount === toLoad.length) {
                        input.value = '';
                        renderMemoryDetailModal();
                        showProofResultModal({
                            title: '이미지 업로드 완료',
                            message: `${toLoad.length}장의 사진이 추가됐어요.<br>저장을 눌러야 게시글에 반영됩니다.`
                        });
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        function removeMemoryEditPhoto(index) {
            if (!memoryDetailState.photoDraft) return;
            memoryDetailState.photoDraft.splice(index, 1);
            renderMemoryDetailModal();
        }

        function setMemoryDetailPhotoIndex(index) {
            memoryDetailState.photoIndex = index;
            renderMemoryDetailModal();
        }

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
            memoryDetailState.editing = false;
            memoryDetailState.photoDraft = null;
            memoryDetailState.photoIndex = 0;
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
            groupsData[activeGroup].posts.splice(postIndex, 1);
            saveGroupsData();
            closeMemoryDetail();
            activeEvidenceIndexes[activeGroup] = 0;
            renderFeeds();
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

            function renderClinePolaroid(post, postIndex, isActive) {
                const normalizedPost = normalizeMemoryPost(post);
                const tags = getMemoryHashtags(normalizedPost, normalizedPost.participants[0]).slice(0, 3);
                const dateText = String(normalizedPost.date || '').replace(/^2026\./, '');
                const photo = normalizedPost.bg
                    ? `<img src="${escapeHtml(normalizedPost.bg)}" alt="${escapeHtml(normalizedPost.title)}">`
                    : `<div class="cline-no-photo"><span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><path d="m4 18 4-4 3 2 4-5 5 4"/></svg></span><span class="cline-no-photo-text">사진 없음</span></div>`;

                return `
                    <article class="cline-polaroid ${isActive ? 'is-active' : ''}" onclick="event.stopPropagation(); ${isActive ? `openMemoryDetail(${postIndex})` : `setEvidenceIndex(${postIndex})`}">
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
                    return cardTheme === 'coverflow'
                        ? `<div class="cline-card-slot cline-slot--empty cline-slot--${slotCls} is-empty"></div>`
                        : `<div class="cline-card-slot cline-slot--empty"></div>`;
                }
                const isActive = delta === 0;
                return `
                    <div class="cline-card-slot cline-slot--${slotCls} ${isActive ? 'is-active' : ''}"
                         ${!isActive ? `onclick="event.stopPropagation(); setEvidenceIndex(${postIndex})"` : ''}>
                        ${cardTheme === 'coverflow' ? '' : clothespinSvg}
                        ${renderClinePolaroid(posts[postIndex], postIndex, isActive)}
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

            return `
                <div class="memory-evidence-viewer cline-viewer ${viewType === 'mobile' ? 'mobile-evidence' : 'desktop-evidence'} ${cardTheme === 'coverflow' ? 'theme-coverflow' : ''}">
                    <div class="cline-stage">
                        <div class="cline-wire-area">
                            <div class="cline-wire"></div>
                            <div class="cline-cards">
                                ${viewType === 'desktop' && cardTheme === 'coverflow' ? makeSlot(+3, 'far-far-past') : ''}
                                ${viewType === 'desktop' ? makeSlot(+2, 'far-past') : ''}
                                ${makeSlot(+1, 'past')}
                                ${makeSlot(0, 'current')}
                                ${makeSlot(-1, 'newer')}
                                ${viewType === 'desktop' ? makeSlot(-2, 'far-newer') : ''}
                                ${viewType === 'desktop' && cardTheme === 'coverflow' ? makeSlot(-3, 'far-far-newer') : ''}
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
        }

        function renderEvidenceViewers() {
            const dtZone = document.getElementById('dt-space-memory-zone');
            const mbZone = document.getElementById('mb-space-memory-zone');
            if (dtZone) dtZone.innerHTML = renderEvidenceViewer('desktop');
            if (mbZone) mbZone.innerHTML = renderEvidenceViewer('mobile');
            initEvidenceInteractions();
            requestAnimationFrame(() => {
                document.querySelectorAll('.cline-film-frame.is-current').forEach(frame => {
                    frame.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                });
            });
            if (!window._evidenceResizeBound) {
                window._evidenceResizeBound = true;
                window.addEventListener('resize', () => {
                    requestAnimationFrame(() => {
                        document.querySelectorAll('.cline-film-frame.is-current').forEach(frame => {
                            frame.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
                        });
                    });
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
        const CLOV_XP_PER_CLICK = 12.5; // 8번 클릭 = 100%
        const CLOV_MAX_CLICKS_PER_DAY = 8;
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

        function levelUp() {
            // 실제 레벨업 여부와 상관없이, 클릭할 때마다 배너가 통통 튀는 느낌을 매번 준다
            triggerLevelPulse();

            const grp = groupsData[activeGroup];
            const today = clovTodayStr();
            if (typeof grp.levelProgress !== 'number') grp.levelProgress = 0;
            if (typeof grp.xpClicksToday !== 'number') grp.xpClicksToday = 0;
            if (typeof grp.level !== 'number') grp.level = friendshipLevel;
            if (!grp.xpDate) grp.xpDate = today;

            // 날짜가 바뀌었으면: 어제 게이지가 100%까지 다 찼었는지 확인해서 그때 비로소 레벨업을 확정한다.
            // (게이지가 8번째 클릭에 꽉 찬 순간 바로 다음 레벨로 넘어가 버리면 "가득 찬 상태"를 볼 틈이 없어서,
            //  오늘은 가득 찬 채로 유지하고, 내일 첫 클릭에서 레벨업 + 게이지 리셋이 함께 일어나도록 미룬다.)
            let leveledUp = false;
            if (grp.xpDate !== today) {
                if (grp.levelProgress >= 100 && grp.level < CLOV_MAX_LEVEL) {
                    grp.level = Math.min(CLOV_MAX_LEVEL, grp.level + 1);
                    grp.levelProgress = 0;
                    leveledUp = true;
                }
                grp.xpDate = today;
                grp.xpClicksToday = 0;
            }
            friendshipLevel = grp.level;

            if (grp.level >= CLOV_MAX_LEVEL) {
                grp.level = CLOV_MAX_LEVEL;
                grp.levelProgress = 0;
                friendshipLevel = CLOV_MAX_LEVEL;
                localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
                updateFriendshipUI();
                clovToast('🏆 이미 우리 우정은 최고치(777)에 도달했어요!', 'info');
                return;
            }

            if (leveledUp) {
                const info = clovLevelInfo(grp.level);
                const badgeText = grp.level >= CLOV_MAX_LEVEL ? '+777' : ('Lv.' + grp.level);
                clovToast(`${info.icon} ${badgeText} 달성! ${info.name}`, 'success');
            }

            if (grp.xpClicksToday >= CLOV_MAX_CLICKS_PER_DAY) {
                localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
                updateFriendshipUI();
                if (!leveledUp) clovToast('오늘의 우정 경험치를 다 채웠어요! 내일 다시 함께해요 🍀', 'info');
                return;
            }

            grp.xpClicksToday += 1;
            grp.levelProgress = Math.min(100, grp.levelProgress + CLOV_XP_PER_CLICK);
            localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
            updateFriendshipUI();
            triggerXpFlash();
            if (grp.levelProgress >= 100 && grp.xpClicksToday >= CLOV_MAX_CLICKS_PER_DAY) {
                clovToast('🎉 오늘의 우정 경험치를 가득 채웠어요! 내일 레벨업 돼요', 'success');
            }
        }

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
                    groupsData[activeGroup].photo = tempPhotoDataUrl;
                    localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
                    updateDashboardPhotos();
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
