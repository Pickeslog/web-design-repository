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

        // A-8 회원탈퇴: 계정 삭제 시 내가 남긴 기록의 작성자 표기를 '언노운'으로 익명화한다.
        // (추억·편지·폴라로이드 본문은 그대로 보존, 표기만 익명화)
        const CLOV_ANON_NAME = '언노운';
        function isAccountWithdrawn() {
            try { return localStorage.getItem('clov_withdrawn') === '1'; } catch (e) { return false; }
        }

        function saveGroupsData() {
            try {
                localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
            } catch (error) {
                // 저장 공간 초과(QuotaExceeded) 등 — 조용히 실패하지 않고 사용자에게 알린다
                if (typeof clovToast === 'function') {
                    clovToast('⚠️ 변경사항 저장에 실패했어요. 저장 공간을 확인해주세요.', 'warn');
                }
            }
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
                let name = participant.name || participant.icon || `참여자${index + 1}`;
                const id = participant.id || (type === 'mine' ? CURRENT_USER_ID : `${name}-${index}`);
                let icon = participant.icon || name.slice(0, 1);
                // A-8: 탈퇴한 계정(=나)의 작성자 표기를 익명화
                if ((type === 'mine' || id === CURRENT_USER_ID) && isAccountWithdrawn()) {
                    name = CLOV_ANON_NAME;
                    icon = '?';
                }
                return {
                    id,
                    name,
                    icon,
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

            // 약속 연결: 일정계획의 Schedule을 참조하는 id. null이면 자유 기록(FREE MEMORY).
            if (typeof post.scheduleId === 'undefined') {
                post.scheduleId = null;
            }

            return post;
        }

        const MEMORY_PHOTO_LIMIT = 30;

        // 추억 사진 압축의 핵심(데이터URL/이미지 src → 리사이즈된 JPEG 데이터URL).
        // 서버가 없어 사진을 base64로 localStorage(도메인당 약 5MB)에 저장하므로,
        // 원본을 그대로 넣으면 몇 장만으로도 용량이 초과된다("저장 공간이 부족해요" 모달).
        // 30장 한도를 감당하기 위해 640px·품질 0.5로 줄여 저장한다. (기존 1080px 0.7에서 하향)
        const MEMORY_PHOTO_MAXDIM = 640;
        const MEMORY_PHOTO_QUALITY = 0.5;
        function compressImageSrc(src, maxDim, quality, callback) {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                const scale = Math.min(1, maxDim / width, maxDim / height);
                width = Math.round(width * scale);
                height = Math.round(height * scale);

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                callback(canvas.toDataURL('image/jpeg', quality));
            };
            // 디코드 실패(손상/미지원 형식) 시 원본으로 폴백
            img.onerror = () => callback(src);
            img.src = src;
        }

        // 업로드 파일 → 압축 데이터URL (JPEG. 사진 용도라 투명도/애니메이션은 유지하지 않는다.)
        function compressMemoryPhoto(file, callback) {
            const reader = new FileReader();
            reader.onload = event => compressImageSrc(event.target.result, MEMORY_PHOTO_MAXDIM, MEMORY_PHOTO_QUALITY, callback);
            reader.readAsDataURL(file);
        }

        // 이미 저장돼 있던 원본(비압축) 사진들을 한 번에 재압축해 localStorage 용량을 회수한다.
        // 압축 기능 도입 이전에 저장된 대용량 base64가 5MB 한도를 이미 채우고 있으면,
        // 새 사진(압축본)조차 들어갈 자리가 없어 "저장 공간이 부족해요"가 계속 뜬다.
        // → 저장된 사진을 무손실이 아니라 '눈에 안 띄는 수준'으로 재압축해 공간을 확보한다(데이터는 보존).
        const STORAGE_COMPACT_SKIP_UNDER = 60 * 1024; // ~60KB 미만은 이미 충분히 작아 건드리지 않음
        function compactStoredPhotos() {
            return new Promise(resolve => {
                if (typeof groupsData === 'undefined') { resolve({ changed: false }); return; }
                const before = (localStorage.getItem('clov_groupsData') || '').length;
                const tasks = [];

                const maybe = (setter, url) => {
                    if (typeof url !== 'string' || !url.startsWith('data:image')) return;
                    if (url.length < STORAGE_COMPACT_SKIP_UNDER) return;
                    tasks.push(new Promise(done => {
                        compressImageSrc(url, MEMORY_PHOTO_MAXDIM, MEMORY_PHOTO_QUALITY, out => {
                            setter(out.length < url.length ? out : url); // 더 커지면 원본 유지
                            done();
                        });
                    }));
                };

                Object.keys(groupsData).forEach(gid => {
                    const group = groupsData[gid];
                    if (!group) return;
                    maybe(v => { group.photo = v; }, group.photo);
                    (group.posts || []).forEach(post => {
                        if (Array.isArray(post.photos)) {
                            post.photos.forEach((p, i) => maybe(v => { post.photos[i] = v; }, p));
                        }
                        maybe(v => { post.bg = v; }, post.bg);
                    });
                    (group.schedules || []).forEach(schedule => {
                        const sp = schedule.stagePhotos;
                        if (sp && typeof sp === 'object') {
                            Object.keys(sp).forEach(k => maybe(v => { sp[k] = v; }, sp[k]));
                        }
                    });
                });

                if (!tasks.length) { resolve({ changed: false }); return; }

                Promise.all(tasks).then(() => {
                    // post.bg는 photos[0]과 동기화 유지
                    Object.keys(groupsData).forEach(gid => {
                        ((groupsData[gid] && groupsData[gid].posts) || []).forEach(post => {
                            if (Array.isArray(post.photos)) post.bg = post.photos[0] || '';
                        });
                    });
                    let saved = true;
                    try {
                        localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
                    } catch (e) {
                        saved = false;
                    }
                    const after = (localStorage.getItem('clov_groupsData') || '').length;
                    resolve({ changed: true, saved, before, after });
                });
            });
        }
        window.compactStoredPhotos = compactStoredPhotos;
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

        // ── 약속 연결(추억 ↔ 일정계획) 공용 헬퍼 ─────────────────────────────
        // 추억(post.scheduleId)은 일정 데이터를 복제하지 않고 항상 여기서 원본을 조회한다.
        // → D-Day·4컷 진행률·완성 도장이 한 소스에서 동기화된다.
        function findScheduleById(scheduleId, groupId) {
            if (scheduleId === null || typeof scheduleId === 'undefined') return null;
            const gid = groupId || activeGroup;
            const schedules = (groupsData[gid] && groupsData[gid].schedules) || [];
            return schedules.find(schedule => String(schedule.id) === String(scheduleId)) || null;
        }

        // 영수증 도장 상태 (스펙 §2-3):
        // before   = 일정 연결 · 만남 전            → D-Day 도장만
        // pending  = 만남 당일/지남 · 4컷 미완성     → D-Day 도장 + '4컷 기록 대기' 점선 스탬프
        // complete = 인생4컷 완성(4/4)              → D-Day 도장 + '추억 완성' 도장 추가
        // free     = 일정 없음                       → FREE MEMORY 스탬프
        function getMemoryStampState(schedule) {
            if (!schedule) return 'free';
            const proofCount = typeof getScheduleProofCount === 'function' ? getScheduleProofCount(schedule) : 0;
            if (proofCount === 4) return 'complete';
            if (getDdayDiffDays(schedule.date) <= 0) return 'pending';
            return 'before';
        }

        // D-Day 도장 캡션: 미래/당일/과거 (도장 자체는 상태와 무관하게 빨강 고정·영구 유지)
        function getMemoryDdayCaption(diffDays) {
            if (diffDays > 0) return '함께할 그날까지';
            if (diffDays === 0) return '드디어 오늘';
            return '함께 보낸 그날';
        }

        const MEMORY_COMPLETE_STAMP_SRC = '../assets/stamps/memory-complete-stamp.png';

        // 약속 영수증 렌더 (크림 종이 + D-Day 도장 + 4컷 진행률 + 상태별 도장)
        // ★ 절대 규칙: D-Day 도장은 완료/과거에도 회색처리·축소·교체 금지 (빨강 #c0392b 고정).
        //   완성 도장은 D-Day 도장을 교체하지 않고 '추가'로 찍는다.
        function renderMemoryReceipt(schedule) {
            const state = getMemoryStampState(schedule);

            if (state === 'free') {
                return `
                    <div class="memory-receipt is-free">
                        <div class="mr-head">CLOV. MEMORIES</div>
                        <div class="mr-stamp-zone">
                            <div class="mr-free-stamp"><span class="mr-free-word">FREE</span><span class="mr-free-sub">MEMORY</span></div>
                        </div>
                        <div class="mr-rows">
                            <div class="mr-row"><span>DATE</span><span class="mr-dim">날짜 없음</span></div>
                            <div class="mr-row"><span>TYPE</span><span>FREE MEMORY</span></div>
                        </div>
                        <div class="mr-barcode"></div>
                    </div>
                `;
            }

            const diffDays = getDdayDiffDays(schedule.date);
            const proofCount = typeof getScheduleProofCount === 'function' ? getScheduleProofCount(schedule) : 0;
            const fourCutText = state === 'complete'
                ? '<span class="mr-ok">4/4 ✓</span>'
                : state === 'pending'
                    ? `<span class="mr-warn">${proofCount}/4</span>`
                    : `<span class="mr-dim">${proofCount}/4</span>`;
            const pendingStamp = state === 'pending' ? `
                <div class="mr-pending-stamp"><span class="mr-pending-word">4컷<br>기록 대기</span><span class="mr-pending-sub">PENDING</span></div>
            ` : '';
            const completeStamp = state === 'complete' ? `
                <img class="mr-complete-stamp" src="${MEMORY_COMPLETE_STAMP_SRC}" alt="추억 완성 도장">
            ` : '';

            return `
                <div class="memory-receipt is-${state}">
                    <div class="mr-head">CLOV. MEMORIES</div>
                    <div class="mr-stamp-zone">
                        <div class="mr-dday-stamp">
                            <span class="mr-dday-cap">${getMemoryDdayCaption(diffDays)}</span>
                            <span class="mr-dday-num">${calculateDday(schedule.date)}</span>
                        </div>
                        ${pendingStamp}
                    </div>
                    <div class="mr-title">${escapeHtml(schedule.title)}</div>
                    <div class="mr-rows">
                        <div class="mr-row"><span>DATE</span><span>${escapeHtml(String(schedule.date || '').replace(/-/g, '.'))}</span></div>
                        <div class="mr-row"><span>4컷</span>${fourCutText}</div>
                    </div>
                    <div class="mr-barcode"></div>
                    ${completeStamp}
                </div>
            `;
        }

        // 오늘 날짜 이후 중 가장 임박한(D-Day가 0 이하이거나 가장 0에 가까운 양수) 일정을 찾습니다.
