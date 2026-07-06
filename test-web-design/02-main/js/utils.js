        function formatDdayText(dayCount) {
            return `D+${dayCount} 일째`;
        }

        function animateDdayElement(elementId, targetNumber, duration = 1500) {
            const element = document.getElementById(elementId);
            if (!element) return;

            if (ddayAnimationFrames[elementId]) {
                cancelAnimationFrame(ddayAnimationFrames[elementId]);
            }

            const safeTarget = Math.max(1, Number(targetNumber) || 1);
            const isV5Span = elementId.endsWith('-v5dday');
            const formatVal = (val) => isV5Span ? String(val) : formatDdayText(val);

            const startCount = Math.min(1, safeTarget);
            const startTime = performance.now();
            element.classList.add('is-counting');
            element.innerText = formatVal(startCount);

            function updateCount(currentTime) {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const easeOutProgress = progress * (2 - progress);
                const currentCount = Math.floor(startCount + easeOutProgress * (safeTarget - startCount));

                element.innerText = formatVal(currentCount);

                if (progress < 1) {
                    ddayAnimationFrames[elementId] = requestAnimationFrame(updateCount);
                } else {
                    element.innerText = formatVal(safeTarget);
                    element.classList.remove('is-counting');
                    ddayAnimationFrames[elementId] = null;
                }
            }

            ddayAnimationFrames[elementId] = requestAnimationFrame(updateCount);
        }

        function animateDdayCount(targetNumber, duration = 1500) {
            const safeTarget = Math.max(1, Number(targetNumber) || 1);
            animateDdayElement('dt-dday', safeTarget, duration);
            animateDdayElement('mb-dday', safeTarget, duration);
            animateDdayElement('dt-v5dday', safeTarget, duration);
            animateDdayElement('mb-v5dday', safeTarget, duration);
        }

        // 1. 프로필 드롭다운 토글 기능 (기획서 <li> 메뉴화 반영)
        function toggleDropdown(id) {
            const dropdown = document.getElementById(id);
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }

        // 2. 모달 열기 / 닫기 기본 함수
        function openModal(id) {
            document.getElementById(id).style.display = 'flex';
            if(id === 'dt-noti-modal') {
                let badge = document.getElementById('dt-noti-badge-red');
                if(badge) badge.style.display = 'none';
            }
            if(id === 'dt-invite-modal') {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('roomCode') || 'CLOV-2002';
                const name = urlParams.get('roomName') || '단짝친구';
                const codeEl = document.getElementById('dt-current-room-code');
                const linkEl = document.getElementById('dt-current-room-link');
                const nameEl = document.getElementById('dt-share-room-name');
                if(codeEl) codeEl.value = code;
                if(linkEl) linkEl.value = window.location.origin + window.location.pathname + `?roomCode=${code}`;
                if(nameEl) nameEl.textContent = name;
            }
            // 열 때 프로필 드롭다운은 자연스럽게 닫아줌
            const mbDropOnOpen = document.getElementById('mb-drop');
            const dtDropOnOpen = document.getElementById('dt-drop');
            if (mbDropOnOpen) mbDropOnOpen.style.display = 'none';
            if (dtDropOnOpen) dtDropOnOpen.style.display = 'none';
            document.querySelectorAll('.clov-hdr-dropdown.open').forEach(d => d.classList.remove('open'));
        }

        function closeModal(id) {
            document.getElementById(id).style.display = 'none';
        }

        function copyCurrentRoomCode() {
            const el = document.getElementById('dt-current-room-code');
            if(!el || !el.value) return;
            if (navigator.clipboard) navigator.clipboard.writeText(el.value).then(() => clovToast(`초대 코드 [${el.value}] 복사되었어요! 📋`, 'success'));
            else { el.select(); document.execCommand('copy'); clovToast(`초대 코드 [${el.value}] 복사되었어요! 📋`, 'success'); }
        }
        function copyCurrentRoomLink() {
            const el = document.getElementById('dt-current-room-link');
            if(!el || !el.value) return;
            if (navigator.clipboard) navigator.clipboard.writeText(el.value).then(() => clovToast('초대 링크 복사되었어요! 🔗', 'success'));
            else { el.select(); document.execCommand('copy'); clovToast('초대 링크 복사되었어요! 🔗', 'success'); }
        }
        window.copyCurrentRoomCode = copyCurrentRoomCode;
        window.copyCurrentRoomLink = copyCurrentRoomLink;

        // 3. 하단 탭 메뉴 네비게이션 제어
        function switchTab(tabName) {
            // 모든 뷰 가리기
            document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
            // 모든 탭 스타일 비활성화
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

            // 선택된 탭 활성화
            document.getElementById(`tab-${tabName}`).classList.add('active');
            document.getElementById(`nav-${tabName}`).classList.add('active');

            // 상단 스크롤 상단으로 초기화
            document.getElementById('mobile-scroll-container').scrollTop = 0;

            if (tabName === 'feed' || tabName === 'space') {
                renderFeeds();
            }
        }

        // 3-2. 데스크톱 헤더 탭 메뉴 네비게이션 제어
        function switchDesktopTab(tabName) {
            // 모든 데스크톱 뷰 가리기
            document.querySelectorAll('.dt-page-view').forEach(view => view.classList.remove('active'));
            // 모든 데스크톱 탭 스타일 비활성화
            document.querySelectorAll('.dt-nav-item').forEach(item => item.classList.remove('active'));

            // 선택된 탭 활성화
            document.getElementById(`dt-tab-${tabName}`).classList.add('active');
            document.getElementById(`dt-nav-${tabName}`).classList.add('active');

            // 상단 스크롤 상단으로 초기화
            document.getElementById('desktop-scroll-container').scrollTop = 0;

            if (tabName === 'feed' || tabName === 'space') {
                renderFeeds();
            }
        }

        function escapeHtml(value) {
            return String(value ?? '')
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#039;');
        }

        function getParticipantType(participant, index) {
            if (participant.type) return participant.type;
            if (index === 0 || participant.name === '나') return 'mine';
            return 'friend';
        }

        function saveGroupsData() {
            localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
        }

        // post.participants는 "누가 함께했는가"만 나타낸다. 각자의 전체 기록(participants[].text)은
        // 더 이상 존재하지 않으며, 게시자(authorId) 한 명의 글 + 친구들의 한 줄 메시지(post.messages)로 대체되었다.
        // 과거 데이터의 participants[].text는 최초 정규화 시 post.messages로 1회 이관된다.
        function normalizeMemoryPost(post) {
            const participants = (post.participants && post.participants.length > 0)
                ? post.participants
                : [{ name: '나', icon: '나' }];

            post.participants = participants.map((participant, index) => {
                const type = getParticipantType(participant, index);
                const name = participant.name || participant.icon || `참여자${index + 1}`;
                const id = participant.id || (type === 'mine' ? CURRENT_USER_ID : `${name}-${index}`);
                return {
                    id,
                    name,
                    icon: participant.icon || name.slice(0, 1),
                    type,
                    text: participant.text
                };
            });

            if (!post.authorId) {
                const mineParticipant = post.participants.find(participant => participant.type === 'mine') || post.participants[0];
                post.authorId = mineParticipant.id;
            }

            if (!post.messages) {
                post.messages = post.participants
                    .filter(participant => participant.id !== post.authorId && participant.text)
                    .map(participant => ({ authorId: participant.id, text: participant.text }));
            }

            post.participants.forEach(participant => { delete participant.text; });

            // 사진은 여러 장을 지원한다. 과거 데이터의 단일 bg는 photos[0]으로 1회 이관한다.
            if (!Array.isArray(post.photos)) {
                post.photos = post.bg ? [post.bg] : [];
            }
            post.bg = post.photos[0] || '';

            return post;
        }

    window.compressImage = function(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
            };
        });
    };

        const MEMORY_PHOTO_LIMIT = 30;
        function getRecordPreviewText(value, maxLength = 16) {
            const cleanText = String(value || '').replace(/\s+/g, ' ').trim();
            if (cleanText.length <= maxLength) return cleanText;
            return `${cleanText.slice(0, maxLength - 1)}…`;
        }

        // 5. 기획서 CRUD 명세 구현 (새 글 추가 함수 - 모바일)
        // 일정 D-day 계산 및 처리 함수들
        function getDdayDiffDays(targetDateStr) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const target = new Date(targetDateStr);
            target.setHours(0, 0, 0, 0);

            const diffTime = target.getTime() - today.getTime();
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        function calculateDday(targetDateStr) {
            const diffDays = getDdayDiffDays(targetDateStr);

            if (diffDays === 0) {
                return "D-Day";
            } else if (diffDays > 0) {
                return `D-${diffDays}`;
            } else {
                return `D+${Math.abs(diffDays)}`;
            }
        }

        // 임박도에 따라 칩/스포트라이트 색을 바꿔 감성적인 긴장감을 더해주는 함수
        function getDdayAccent(diffDays) {
            if (diffDays < 0) {
                return { accent: '#94a3b8', glow: 'rgba(148, 163, 184, 0.25)' };
            }
            if (diffDays === 0) {
                return { accent: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)' };
            }
            if (diffDays <= 7) {
                return { accent: '#f59e0b', glow: 'rgba(245, 158, 11, 0.35)' };
            }
            return { accent: '#4ade80', glow: 'rgba(74, 222, 128, 0.32)' };
        }

        function formatFriendlyDate(dateStr) {
            const date = new Date(dateStr);
            const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
            return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekDays[date.getDay()]})`;
        }

        // 오늘 날짜 이후 중 가장 임박한(D-Day가 0 이하이거나 가장 0에 가까운 양수) 일정을 찾습니다.
