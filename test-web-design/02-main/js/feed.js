
        function setFeedFilter(filterName) {
            activeFeedFilter = filterName;
            document.querySelectorAll('.feed-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.filter === filterName);
            });
            renderFeeds();
        }

        function setFeedSort(sortName) {
            activeFeedSort = sortName === 'old' ? 'old' : 'new';
            document.querySelectorAll('.feed-sort-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.sort === activeFeedSort);
            });
            renderFeeds();
        }

        function setFeedSearch(query) {
            activeFeedSearch = String(query || '').trim().toLowerCase();
            document.querySelectorAll('.feed-search-clear').forEach(btn => {
                btn.hidden = !activeFeedSearch;
            });
            renderFeeds();
        }

        function clearFeedSearch() {
            activeFeedSearch = '';
            document.querySelectorAll('.feed-search-input').forEach(input => { input.value = ''; });
            document.querySelectorAll('.feed-search-clear').forEach(btn => { btn.hidden = true; });
            renderFeeds();
        }

        // 정렬용 전체 날짜 키("YYYY-MM-DD"). 일자가 없으면 "-00"으로 채우고, 파싱 불가는 빈 문자열
        function getPostDateKey(post) {
            const raw = String(post.date || '').replace(/\./g, '-');
            const full = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (full) return `${full[1]}-${full[2]}-${full[3]}`;
            const ym = raw.match(/^(\d{4})-(\d{2})/);
            return ym ? `${ym[1]}-${ym[2]}-00` : '';
        }

        // 검색어가 제목·부제·본문·날짜·태그·참여자 이름·참여자 메시지 중 하나라도 포함되면 true
        function postMatchesFeedSearch(post, query) {
            if (!query) return true;
            const haystack = [
                post.title, post.subtitle, post.text, post.date,
                ...(post.tags || []),
                ...((post.participants || []).map(participant => participant.name)),
                ...((post.messages || []).map(message => message.text))
            ].filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(query);
        }

        function getPostMonthKey(post) {
            const rawDate = String(post.date || '').replace(/\./g, '-');
            const match = rawDate.match(/^(\d{4})-(\d{2})/);
            return match ? `${match[1]}-${match[2]}` : 'unknown';
        }

        function formatFeedMonthLabel(monthKey) {
            if (monthKey === 'all') return '전체';
            if (monthKey === 'unknown') return '날짜 미정';
            const [year, month] = monthKey.split('-');
            return `${year}.${month}`;
        }

        function getFeedMonths(posts) {
            const monthMap = new Map();
            posts.forEach(post => {
                const key = getPostMonthKey(post);
                monthMap.set(key, (monthMap.get(key) || 0) + 1);
            });
            return [...monthMap.entries()]
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([key, count]) => ({ key, count }));
        }

        function setFeedMonth(monthKey) {
            activeFeedMonth = monthKey;
            closeMonthPicker();
            renderFeeds();
        }

        function renderFeedMonthControls(posts, visibleCount) {
            const months = getFeedMonths(posts);
            if (activeFeedMonth !== 'all' && !months.some(month => month.key === activeFeedMonth)) {
                activeFeedMonth = 'all';
            }

            const summaryText = `${formatFeedMonthLabel(activeFeedMonth)} · ${visibleCount}개`;
            ['dt-feed-month-summary', 'mb-feed-month-summary'].forEach(id => {
                const summary = document.getElementById(id);
                if (summary) summary.innerText = summaryText;
            });
        }

        function getMemoryHashtags(post) {
            const rawTags = post.tags || [];
            const legacyTags = rawTags.some(tag => String(tag).includes('명 기록') || String(tag).includes('장면') || String(tag).includes('장소'));
            if (rawTags.length > 0 && !legacyTags) {
                return rawTags;
            }

            const monthLabel = formatFeedMonthLabel(getPostMonthKey(post)).replace('.', '년') + '월';
            return [
                '#소중한순간',
                post.authorId === CURRENT_USER_ID ? '#내기록' : '#친구기록',
                `#${monthLabel}`
            ];
        }

        function renderFeeds() {
            const zones = [
                document.getElementById('dynamic-feed-zone'),
                document.getElementById('full-feed-zone'),
                document.getElementById('dt-dynamic-feed-zone'),
                document.getElementById('dt-full-feed-zone')
            ];

            const currentPosts = groupsData[activeGroup].posts || [];
            const filteredPosts = currentPosts
                .filter(post => {
                    const normalizedPost = normalizeMemoryPost(post);
                    if (activeFeedMonth !== 'all' && getPostMonthKey(normalizedPost) !== activeFeedMonth) {
                        return false;
                    }
                    if (activeFeedFilter === 'others' && !normalizedPost.participants.some(participant => participant.type !== 'mine')) {
                        return false;
                    }
                    if (activeFeedSearch && !postMatchesFeedSearch(normalizedPost, activeFeedSearch)) {
                        return false;
                    }
                    return true;
                });

            // 날짜 기준 정렬(최신순/오래된순). 날짜 파싱 불가 항목은 항상 맨 뒤로.
            const sortedPosts = filteredPosts.slice().sort((a, b) => {
                const da = getPostDateKey(a);
                const db = getPostDateKey(b);
                if (da === db) return 0;
                if (!da) return 1;
                if (!db) return -1;
                return activeFeedSort === 'old' ? da.localeCompare(db) : db.localeCompare(da);
            });

            const htmlContent = sortedPosts.length > 0
                ? sortedPosts
                    .map(post => renderMemoryCard(post, currentPosts.indexOf(post)))
                    .join('')
                : `<div class="feed-empty-state">${activeFeedSearch
                    ? '검색어와 일치하는 추억이 없습니다.<br>다른 단어로 찾아보세요.'
                    : '선택한 조건에 맞는 추억이 아직 없습니다.<br>새 추억을 남기면 이 월별 보관함에 바로 정리됩니다.'}</div>`;

            zones.forEach(zone => {
                if (zone) zone.innerHTML = htmlContent;
            });

            renderFeedMonthControls(currentPosts, sortedPosts.length);
            renderEvidenceViewers();
        }

        function getSelectedPostTags(prefix) {
            const choiceSelector = prefix === 'dt' ? '.dt-feed-tag-choice' : '.mb-feed-tag-choice';
            const customInput = document.getElementById(prefix === 'dt' ? 'dt-custom-tags' : 'custom-tags');
            const selectedTags = [...document.querySelectorAll(choiceSelector)]
                .filter(input => input.checked)
                .map(input => input.value.trim())
                .filter(Boolean);
            const customTags = (customInput?.value || '')
                .split(/[\s,]+/)
                .map(tag => tag.trim())
                .filter(Boolean)
                .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
            return [...new Set([...selectedTags, ...customTags])].slice(0, 5);
        }

        function resetPostModal(prefix) {
            const customInput = document.getElementById(prefix === 'dt' ? 'dt-custom-tags' : 'custom-tags');
            const choiceSelector = prefix === 'dt' ? '.dt-feed-tag-choice' : '.mb-feed-tag-choice';
            if (customInput) customInput.value = '';
            document.querySelectorAll(choiceSelector).forEach((input, index) => {
                input.checked = index === 0;
            });
        }

        function addNewPost() {
            const titleInput = document.getElementById('post-title');
            const contentInput = document.getElementById('post-content');

            if (!titleInput.value || !contentInput.value) {
                clovAlert('제목과 내용을 모두 작성해주세요.', { icon: '✏️', type: 'warn' });
                return;
            }

            const today = new Date();
            const dateString = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

            // 활성 그룹 데이터 세팅
            groupsData[activeGroup].posts.unshift({
                date: dateString,
                title: titleInput.value,
                subtitle: "새로운 장소",
                text: contentInput.value,
                bg: "",
                selectedParticipantId: "me",
                participants: [{ id: "me", name: "나", icon: "나", type: "mine", text: getRecordPreviewText(contentInput.value) }],
                tags: getSelectedPostTags('mb')
            });
            activeEvidenceIndexes[activeGroup] = 0;
            saveGroupsData();

            // 입력 필드 초기화 및 팝업 닫기
            titleInput.value = '';
            contentInput.value = '';
            resetPostModal('mb');
            closeModal('mb-post-modal');

            // 리렌더링 후 완료 알림
            setFeedFilter('all');
            clovToast('🎉 새 추억 피드가 등록되었습니다!', 'success');
            if(typeof addUnreadNotification === 'function') addUnreadNotification('✨ 새로운 추억', '친구가 새로운 추억 피드를 남겼어요!');
          }

        // 5-2. 기획서 CRUD 명세 구현 (새 글 추가 함수 - 데스크톱)
        function addNewDesktopPost() {
            const titleInput = document.getElementById('dt-post-title');
            const contentInput = document.getElementById('dt-post-content');

            if (!titleInput.value || !contentInput.value) {
                clovAlert('제목과 내용을 모두 작성해주세요.', { icon: '✏️', type: 'warn' });
                return;
            }

            const today = new Date();
            const dateString = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

            // 활성 그룹 데이터 세팅
            groupsData[activeGroup].posts.unshift({
                date: dateString,
                title: titleInput.value,
                subtitle: "새로운 장소",
                text: contentInput.value,
                bg: "",
                selectedParticipantId: "me",
                participants: [{ id: "me", name: "나", icon: "나", type: "mine", text: getRecordPreviewText(contentInput.value) }],
                tags: getSelectedPostTags('dt')
            });
            activeEvidenceIndexes[activeGroup] = 0;
            saveGroupsData();

            // 입력 필드 초기화 및 팝업 닫기
            titleInput.value = '';
            contentInput.value = '';
            resetPostModal('dt');
            closeModal('dt-post-modal');

            // 리렌더링 후 완료 알림
            setFeedFilter('all');
            clovToast('🎉 새 추억 피드가 등록되었습니다!', 'success');
            
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

        function getFeedMonthCounts(posts) {
            const counts = {};
            getFeedMonths(posts).forEach(month => {
                counts[month.key] = month.count;
            });
            return counts;
        }

        function getDefaultMonthPickerYear(posts) {
            if (/^\d{4}-\d{2}$/.test(activeFeedMonth)) {
                return Number(activeFeedMonth.slice(0, 4));
            }
            const firstMonth = getFeedMonths(posts)[0];
            return firstMonth ? Number(firstMonth.key.slice(0, 4)) : new Date().getFullYear();
        }

        function renderMonthPicker() {
            const popover = document.getElementById('month-picker-popover');
            const yearLabel = document.getElementById('month-picker-year');
            const grid = document.getElementById('month-picker-grid');
            if (!popover || !yearLabel || !grid) return;

            const allBtn = document.getElementById('month-picker-all-btn');
            if (allBtn) allBtn.classList.toggle('active', activeFeedMonth === 'all');

            const posts = groupsData[activeGroup].posts || [];
            const counts = getFeedMonthCounts(posts);
            yearLabel.innerText = `${monthPickerYear}년`;
            grid.innerHTML = Array.from({ length: 12 }, (_, index) => {
                const month = String(index + 1).padStart(2, '0');
                const key = `${monthPickerYear}-${month}`;
                const count = counts[key] || 0;
                return `
                    <button class="month-picker-month ${activeFeedMonth === key ? 'active' : ''} ${count === 0 ? 'empty' : ''}" type="button" onclick="setFeedMonth('${key}')">
                        ${index + 1}월
                        <span>${count}개</span>
                    </button>
                `;
            }).join('');
        }

        function positionMonthPicker(trigger) {
            const popover = document.getElementById('month-picker-popover');
            if (!popover || !trigger) return;
            const rect = trigger.getBoundingClientRect();
            const width = Math.min(320, window.innerWidth - 32);
            const left = Math.min(Math.max(16, rect.right - width), window.innerWidth - width - 16);
            const top = Math.min(rect.bottom + 10, window.innerHeight - 360);
            popover.style.width = `${width}px`;
            popover.style.left = `${left}px`;
            popover.style.top = `${Math.max(16, top)}px`;
        }

        function toggleMonthPicker(event) {
            event.stopPropagation();
            const trigger = event.currentTarget;
            const popover = document.getElementById('month-picker-popover');
            if (!popover) return;
            const isOpen = popover.classList.contains('open');

            document.querySelectorAll('.month-picker-trigger').forEach(btn => btn.classList.remove('active'));
            if (isOpen) {
                closeMonthPicker();
                return;
            }

            monthPickerYear = getDefaultMonthPickerYear(groupsData[activeGroup].posts || []);
            renderMonthPicker();
            positionMonthPicker(trigger);
            popover.classList.add('open');
            trigger.classList.add('active');
        }

        function closeMonthPicker() {
            const popover = document.getElementById('month-picker-popover');
            if (popover) popover.classList.remove('open');
            document.querySelectorAll('.month-picker-trigger').forEach(btn => btn.classList.remove('active'));
        }

        function moveMonthPickerYear(direction) {
            monthPickerYear += direction;
            renderMonthPicker();
        }

