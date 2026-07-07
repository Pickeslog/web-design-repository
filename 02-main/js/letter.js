
        // 행운 편지 즐겨찾기 필터 상태 ('all' | 'favorite')
        let activeLetterFilter = 'all';
        let activeLetterPage = 0;
        const LETTERS_PER_PAGE = 3;
        const EMPTY_LETTER_MESSAGES = [
            '마음은 먼저 건네는 사람에게 가장 크게 남는대요.<br>오늘, 그 마음을 편지에 담아볼까요?',
            '누군가에게 전한 진심은 절대 사라지지 않아요.<br>지금 이 순간, 첫 편지를 띄워보세요.',
            '아직 아무도 열어보지 않은 편지함이지만,<br>당신의 한 마디로 누군가의 하루가 달라질 수 있어요.',
            '표현하지 않으면 마음은 전해지지 않아요.<br>망설이던 그 말, 편지로 먼저 건네보는 건 어때요?',
            '오늘 보낸 편지 한 통이,<br>훗날 소중한 추억으로 돌아올지도 몰라요.'
        ];

        function getFilteredLettersWithIndex() {
            const currentGroup = groupsData[activeGroup] || {};
            const letters = currentGroup.letters || [];
            return letters
                .map((letter, index) => ({ letter, index }))
                .filter(({ letter }) => {
                    if (activeLetterFilter === 'favorite') return !!letter.favorite;
                    if (activeLetterFilter === 'sent') return !!letter.isMine;
                    return true;
                });
        }

        function renderLetterInboxPage() {
            const listEl = document.getElementById('dt-letter-inbox-list');
            const pageLabel = document.getElementById('dt-letter-page-label');
            const prevBtn = document.getElementById('dt-letter-prev');
            const nextBtn = document.getElementById('dt-letter-next');
            if (!listEl) return;

            const filteredLetters = getFilteredLettersWithIndex();
            const totalPages = Math.max(1, Math.ceil(filteredLetters.length / LETTERS_PER_PAGE));
            activeLetterPage = Math.min(Math.max(activeLetterPage, 0), totalPages - 1);
            const start = activeLetterPage * LETTERS_PER_PAGE;
            const visibleLetters = filteredLetters.slice(start, start + LETTERS_PER_PAGE);

            if (!visibleLetters.length) {
                listEl.innerHTML = '<div class="letter-inbox-empty">아직 확인할 편지가 없어요.</div>';
            } else {
                listEl.innerHTML = visibleLetters.map(({ letter, index }, offset) => {
                    const activeClass = letter.favorite ? '' : 'inactive';
                    const delay = offset * 45;
                    return `
                        <div class="letter-inbox-card" role="button" tabindex="0" onclick="openLetterDetailModal(${index})" onkeydown="if(event.key==='Enter') openLetterDetailModal(${index})" style="animation-delay:${delay}ms">
                            <button class="letter-favorite-btn ${activeClass}" type="button" onclick="event.stopPropagation(); toggleLetterFavorite(${index})" title="즐겨찾기 토글">⭐</button>
                            <strong>To. ${escapeHtml(letter.to || '전체')}</strong>
                            <p>${escapeHtml(letter.text || '').slice(0, 64)}${(letter.text || '').length > 64 ? '...' : ''}</p>
                        </div>
                    `;
                }).join('');
            }

            if (pageLabel) pageLabel.textContent = `${activeLetterPage + 1} / ${totalPages}`;
            if (prevBtn) prevBtn.disabled = activeLetterPage === 0;
            if (nextBtn) nextBtn.disabled = activeLetterPage >= totalPages - 1;
        }

        function openLetterInboxModal() {
            const giftBox = document.querySelector('.letter-box-trigger');
            if (giftBox) giftBox.classList.add('is-opening');
            activeLetterPage = 0;
            renderLetterInboxPage();
            setTimeout(() => {
                openModal('dt-letter-inbox-modal');
                if (giftBox) giftBox.classList.remove('is-opening');
            }, 520);
        }

        function moveLetterPage(direction) {
            activeLetterPage += direction;
            renderLetterInboxPage();
        }

        function backToLetterInbox() {
            closeModal('dt-letter-detail-modal');
            openModal('dt-letter-inbox-modal');
        }

        // 편지함 동적 렌더링 (즐겨찾기 토글 및 필터링 기능 추가)
        function renderLetters() {
            // write 탭이면 편지 목록 렌더링 안 함
            if (activeLetterFilter === 'write') return;

            const currentGroup = groupsData[activeGroup] || {};
            const allLetters = currentGroup.letters || [];
            const filteredLetters = getFilteredLettersWithIndex();
            const dtZone = document.getElementById('dt-letter-zone');
            const boxTrigger = document.getElementById('dt-letter-box-trigger');
            if (boxTrigger) boxTrigger.classList.toggle('has-mail', allLetters.length > 0);
            let profileName = '사용자';
            try {
                const savedProfile = JSON.parse(localStorage.getItem('clov_profile') || '{}');
                profileName = savedProfile.name || profileName;
            } catch (e) {}

            let summaryText;
            if (activeLetterFilter === 'favorite') {
                summaryText = filteredLetters.length
                    ? `즐겨찾기 ${filteredLetters.length}통의 편지가<br>${escapeHtml(profileName)}님에게 도착했어요!`
                    : `⭐ 즐겨찾기한 편지가 없어요.`;
            } else if (activeLetterFilter === 'sent') {
                summaryText = '';
            } else {
                summaryText = allLetters.length
                    ? `총 ${allLetters.length}통의 편지가<br>${escapeHtml(profileName)}님에게 도착했어요!`
                    : EMPTY_LETTER_MESSAGES[Math.floor(Math.random() * EMPTY_LETTER_MESSAGES.length)];
            }

            if (dtZone) dtZone.innerHTML = summaryText ? `<p>${summaryText}</p>` : '';
            renderLetterInboxPage();
        }

        // 편지 즐겨찾기 상태 토글
        function toggleLetterFavorite(index) {
            const letters = groupsData[activeGroup].letters;
            if (letters && letters[index]) {
                letters[index].favorite = !letters[index].favorite;

                // 리렌더링으로 화면 갱신 및 실시간 양방향 동기화 효과
                renderLetters();
            }
        }

        function setLetterFilter(filterType) {
            activeLetterFilter = filterType;

            document.querySelectorAll('.letter-filter-btn').forEach(btn => btn.classList.remove('active'));

            const dtAllBtn = document.getElementById('dt-letter-filter-all');
            const dtFavBtn = document.getElementById('dt-letter-filter-favorite');
            const dtWriteBtn = document.getElementById('dt-letter-filter-write');
            const mbAllBtn = document.getElementById('mb-letter-filter-all');
            const mbFavBtn = document.getElementById('mb-letter-filter-favorite');
            const mbWriteBtn = document.getElementById('mb-letter-filter-write');
            const dtModalAllBtn = document.getElementById('dt-letter-modal-filter-all');
            const dtModalFavBtn = document.getElementById('dt-letter-modal-filter-favorite');
            const dtModalSentBtn = document.getElementById('dt-letter-modal-filter-sent');

            const dtLetterZone = document.getElementById('dt-letter-zone');
            const dtWriteZone = document.getElementById('dt-letter-write-zone');
            const mbLetterZone = document.getElementById('mb-letter-zone');
            const mbWriteZone = document.getElementById('mb-letter-write-zone');

            if (dtLetterZone) dtLetterZone.style.display = 'none';
            if (dtWriteZone) dtWriteZone.style.display = 'none';
            if (mbLetterZone) mbLetterZone.style.display = 'none';
            if (mbWriteZone) mbWriteZone.style.display = 'none';

            if (filterType === 'all') {
                if (dtAllBtn) dtAllBtn.classList.add('active');
                if (mbAllBtn) mbAllBtn.classList.add('active');
                if (dtModalAllBtn) dtModalAllBtn.classList.add('active');
                if (dtLetterZone) dtLetterZone.style.display = 'block';
                if (mbLetterZone) mbLetterZone.style.display = 'block';
                renderLetters();
            } else if (filterType === 'favorite') {
                if (dtFavBtn) dtFavBtn.classList.add('active');
                if (mbFavBtn) mbFavBtn.classList.add('active');
                if (dtModalFavBtn) dtModalFavBtn.classList.add('active');
                if (dtLetterZone) dtLetterZone.style.display = 'block';
                if (mbLetterZone) mbLetterZone.style.display = 'block';
                renderLetters();
            } else if (filterType === 'sent') {
                if (dtModalSentBtn) dtModalSentBtn.classList.add('active');
                if (dtLetterZone) dtLetterZone.style.display = 'block';
                if (mbLetterZone) mbLetterZone.style.display = 'block';
                renderLetters();
            } else if (filterType === 'write') {
                if (dtWriteBtn) dtWriteBtn.classList.add('active');
                if (mbWriteBtn) mbWriteBtn.classList.add('active');
                if (dtWriteZone) dtWriteZone.style.display = 'block';
                if (mbWriteZone) mbWriteZone.style.display = 'block';
            }
        }

        // 행운 편지 작성 관련 함수
        let selectedLetterRecipient = {};

        // 선택되지 않은 받는 사람 버튼(모두에게 + 나머지 멤버 칩)을 회색으로 흐리게 표시
        function updateLetterRecipientMutedState(prefix) {
            const picker = document.getElementById(`${prefix}-letter-recipient-picker`);
            const allBtn = document.getElementById(`${prefix}-letter-to-all-btn`);
            const hasSelection = !!selectedLetterRecipient[prefix];

            if (picker) {
                picker.querySelectorAll('.letter-recipient-chip').forEach(chip => {
                    chip.classList.toggle('muted', hasSelection && !chip.classList.contains('active'));
                });
            }
            if (allBtn) {
                const isAllSelected = allBtn.classList.contains('active-pill');
                if (isAllSelected) {
                    allBtn.style.background = 'var(--primary-green)';
                    allBtn.style.color = '#fff';
                } else if (hasSelection) {
                    allBtn.style.background = '#eef1f4';
                    allBtn.style.color = '#8c93a3';
                } else {
                    allBtn.style.background = 'var(--nav-item-bg-active)';
                    allBtn.style.color = 'var(--primary-green)';
                }
            }
        }

        // 모두에게 보내기 토글 (버튼 방식) — 누르면 받는 사람 선택 해제됨
        function toggleLetterToAllBtn(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const btn = document.getElementById(`${prefix}-letter-to-all-btn`);
            const picker = document.getElementById(`${prefix}-letter-recipient-picker`);
            if (!btn) return;
            const isActive = btn.classList.contains('active-pill');
            if (isActive) {
                btn.classList.remove('active-pill');
                selectedLetterRecipient[prefix] = '';
            } else {
                btn.classList.add('active-pill');
                selectedLetterRecipient[prefix] = '모두';
            }
            if (picker) picker.querySelectorAll('.letter-recipient-chip').forEach(c => c.classList.remove('active'));
            updateLetterRecipientMutedState(prefix);
        }

        // 받는 사람 선택 (현재 방 멤버 중 한 명) — 선택하면 "모두에게"는 해제됨
        // 이미 선택된 사람을 다시 누르면 선택 해제되어 처음(아무도 선택 안 한) 상태로 돌아감
        function selectLetterRecipient(btn, viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const picker = document.getElementById(`${prefix}-letter-recipient-picker`);
            const wasActive = btn.classList.contains('active');

            if (picker) picker.querySelectorAll('.letter-recipient-chip').forEach(c => c.classList.remove('active'));

            if (wasActive) {
                selectedLetterRecipient[prefix] = '';
            } else {
                btn.classList.add('active');
                selectedLetterRecipient[prefix] = btn.dataset.name;
            }

            const allBtn = document.getElementById(`${prefix}-letter-to-all-btn`);
            if (allBtn) allBtn.classList.remove('active-pill');
            updateLetterRecipientMutedState(prefix);
        }

        // 편지 내용 입력 제한 — 한글(2byte 취급) 기준 500자 / 영어 기준 1000자
        function handleLetterContentInput(el, viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const maxWeight = 1000;
            let text = el.value;
            if (getTitleWeight(text) > maxWeight) {
                text = truncateTitleByWeight(text, maxWeight);
                el.value = text;
            }
            updateLetterContentCountDisplay(prefix, text);
        }

        function updateLetterContentCountDisplay(prefix, text) {
            const el = document.getElementById(`${prefix}-letter-content-count`);
            if (!el) return;
            const weight = getTitleWeight(text || '');
            el.innerText = `${weight} / 1000 (한글 500자 / 영어 1000자)`;
            el.style.color = weight >= 1000 ? '#d90429' : 'var(--text-muted)';
        }

        function toggleInlineLetterWrite(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const inlineId = prefix + '-inline-letter-write';
            const inlineBox = document.getElementById(inlineId);
            if (!inlineBox) return;

            if (inlineBox.style.display === 'none') {
                inlineBox.style.display = 'block';
                // 초기화
                selectedLetterRecipient[prefix] = '';
                const contentEl = document.getElementById(prefix + '-letter-content');
                if (contentEl) contentEl.value = '';
                updateLetterContentCountDisplay(prefix, '');

                const picker = document.getElementById(prefix + '-letter-recipient-picker');
                if (picker) picker.querySelectorAll('.letter-recipient-chip').forEach(c => c.classList.remove('active', 'muted'));

                const allBtn = document.getElementById(prefix + '-letter-to-all-btn');
                if (allBtn) allBtn.classList.remove('active-pill');
                updateLetterRecipientMutedState(prefix);
            } else {
                inlineBox.style.display = 'none';
            }
        }

        // 편지 제출 (데이터에 추가 + 리렌더링) — 보내는 사람은 항상 작성자 본인
        function submitLetter(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const inlineId = prefix + '-inline-letter-write';
            const toVal = (selectedLetterRecipient[prefix] || '').trim();
            const contentVal = (document.getElementById(`${prefix}-letter-content`)?.value || '').trim();

            if (!toVal) {
                clovAlert('받는 사람을 선택해주세요! 💌', { icon: '✏️', type: 'warn' });
                return;
            }
            if (!contentVal) {
                clovAlert('편지 내용을 작성해주세요! ✍️', { icon: '✏️', type: 'warn' });
                return;
            }

            let myProfile = {};
            try { myProfile = JSON.parse(localStorage.getItem('clov_profile') || '{}'); } catch (e) {}
            const fromDisplay = myProfile.name || '나';

            // 현재 그룹의 letters 배열에 추가
            const currentGroup = groupsData[activeGroup];
            if (!currentGroup.letters) {
                currentGroup.letters = [];
            }
            currentGroup.letters.unshift({
                to: toVal,
                from: fromDisplay,
                text: contentVal,
                favorite: false,
                isMine: true
            });
            localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));

            // 인라인 작성창 닫기
            const inlineBox = document.getElementById(inlineId);
            if (inlineBox) inlineBox.style.display = 'none';

            // 편지함 리렌더링
            renderLetters();

            // 성공 알림
            clovToast('💌 행운편지가 성공적으로 보내졌습니다!', 'success');

            // 직접 DOM 조작하여 빨간 배지 띄우기
            const dtNavNoti = document.getElementById('dt-nav-noti');
            if (dtNavNoti) {
                dtNavNoti.style.position = 'relative';
                let badge = document.getElementById('dt-noti-badge-red');
                if (!badge) {
                    badge = document.createElement('div');
                    badge.id = 'dt-noti-badge-red';
                    badge.style.cssText = 'position:absolute; top:0px; right:0px; width:10px; height:10px; background:red; border-radius:50%; z-index:10; border: 2px solid var(--header-bg);';
                    dtNavNoti.appendChild(badge);
                }
                badge.style.display = 'block';
            }
        }

        // 편지 상세 보기 모달 열기
        function openLetterDetailModal(index) {
            const letters = groupsData[activeGroup]?.letters || [];
            const letter = letters[index];
            if (!letter) return;

            document.getElementById('dt-detail-letter-to').textContent = `To. ${letter.to || '전체'}`;
            document.getElementById('dt-detail-letter-from').textContent = `From. ${letter.from || '익명'}`;
            document.getElementById('dt-detail-letter-content').textContent = `${letter.emoji || '💌'}\n${letter.text || ''}`;
            closeModal('dt-letter-inbox-modal');
            openModal('dt-letter-detail-modal');
        }

