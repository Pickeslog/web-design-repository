        function getClosestSchedule() {
            const schedules = groupsData[activeGroup].schedules || [];
            if (schedules.length === 0) return null;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let closest = null;
            let minDiff = Infinity;

            schedules.forEach(sch => {
                const target = new Date(sch.date);
                target.setHours(0, 0, 0, 0);
                const diff = target.getTime() - today.getTime();

                // 오늘 포함 미래 일정
                if (diff >= 0) {
                    if (diff < minDiff) {
                        minDiff = diff;
                        closest = sch;
                    }
                }
            });

            // 만약 미래 일정이 하나도 없으면 전체 중 가장 첫번째 일정을 보여줌
            if (!closest) {
                closest = schedules[0];
            }
            return closest;
        }

        // 오늘 날짜를 <input type="date">가 쓰는 yyyy-mm-dd 형식으로 반환
        function getTodayDateStr() {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }

        function openScheduleModal(viewType, scheduleId) {
            const prefix = viewType === 'mb' ? 'mb' : 'dt';
            const modalTitle = document.getElementById(`${prefix}-schedule-modal-title`);
            const titleInput = document.getElementById(`${prefix}-input-schedule-title`);
            const dateInput = document.getElementById(`${prefix}-input-schedule-date`);
            const bodyInput = document.getElementById(`${prefix}-input-schedule-body`);
            const idInput = document.getElementById(`${prefix}-input-schedule-id`);

            const schedule = (scheduleId !== undefined && scheduleId !== null)
                ? (groupsData[activeGroup].schedules || []).find(s => s.id === scheduleId)
                : null;

            if (schedule) {
                if (modalTitle) modalTitle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:5px;"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>약속 정보 수정하기';
                if (titleInput) titleInput.value = schedule.title;
                // 수정 시에도 오늘 이전 날짜로는 옮길 수 없도록 생성 때와 동일하게 제한
                if (dateInput) { dateInput.value = schedule.date; dateInput.min = getTodayDateStr(); }
                if (bodyInput) bodyInput.innerHTML = schedule.content || '';
                if (idInput) idInput.value = schedule.id;
            } else {
                if (modalTitle) modalTitle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:5px;"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>다가오는 약속, D-day 새로 세기';
                if (titleInput) titleInput.value = '';
                // 새 약속은 지난 날짜(어제 이전)로 D-day를 맞출 수 없도록 오늘부터 선택 가능
                if (dateInput) { dateInput.value = ''; dateInput.min = getTodayDateStr(); }
                if (bodyInput) bodyInput.innerHTML = '';
                if (idInput) idInput.value = '';
            }

            openModal(`${prefix}-schedule-modal`);
        }

        function saveSchedule(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const titleInput = document.getElementById(`${prefix}-input-schedule-title`);
            const dateInput = document.getElementById(`${prefix}-input-schedule-date`);
            const bodyInput = document.getElementById(`${prefix}-input-schedule-body`);
            const idInput = document.getElementById(`${prefix}-input-schedule-id`);

            if (titleInput && dateInput) {
                const newTitle = titleInput.value.trim();
                const newDate = dateInput.value;
                const newBody = bodyInput ? bodyInput.innerHTML : '';

                if (!newTitle || !newDate) {
                    clovAlert('일정 제목과 날짜를 입력해주세요.', { icon: '🗓️', type: 'warn' });
                    return;
                }

                const schId = idInput ? idInput.value : "";
                const existingSch = schId ? groupsData[activeGroup].schedules.find(s => s.id == schId) : null;

                // 이미 저장돼있던 날짜를 그대로 두는 게 아니라 오늘 이전의 새 날짜로 옮기려는 경우만 막는다
                if (newDate < getTodayDateStr() && !(existingSch && existingSch.date === newDate)) {
                    clovAlert(schId ? '일정은 오늘 이후 날짜로만 수정할 수 있어요.' : '새 약속은 오늘 이후 날짜로만 만들 수 있어요.', { icon: '🗓️', type: 'warn' });
                    return;
                }

                if (schId) {
                    // 수정 모드
                    if (existingSch) {
                        existingSch.title = newTitle;
                        existingSch.date = newDate;
                        existingSch.content = newBody;
                    }
                } else {
                    // 추가 모드
                    const schedules = groupsData[activeGroup].schedules || [];
                    const maxId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) : 0;
                    const newSch = {
                        id: maxId + 1,
                        title: newTitle,
                        date: newDate,
                        content: newBody || `<h3>📝 ${escapeHtml(newTitle)} 메모</h3>\n<p>이곳을 클릭해 약속에 대한 메모를 남겨보세요.</p>`
                    };
                    schedules.push(newSch);
                    // 새로 만든 약속을 바로 스포트라이트로 펼쳐서 보여줌
                    selectedScheduleIds[activeGroup] = newSch.id;
                }

                updateScheduleUI();
                closeModal(`${prefix}-schedule-modal`);
                if (typeof grantXP === 'function') {
                    const xpAdd = typeof CLOV_XP_SCHEDULE_ADD !== 'undefined' ? CLOV_XP_SCHEDULE_ADD : 3;
                    grantXP(xpAdd, 'schedule_add');
                    setTimeout(() => {
                        if (typeof clovToast === 'function')
                            clovToast(`약속 등록 +${xpAdd} XP`, 'success');
                    }, 500);
                } else {
                    clovToast('D-day가 저장되었어요!', 'success');
                }
            }
        }

        function deleteSchedule(scheduleId) {
            clovConfirm('정말 이 약속을 삭제하시겠습니까?', () => {
                const schedules = groupsData[activeGroup].schedules || [];
                const deletedSch = schedules.find(s => s.id === scheduleId);
                
                let xpToRevoke = typeof CLOV_XP_SCHEDULE_ADD !== 'undefined' ? CLOV_XP_SCHEDULE_ADD : 3;
                if (deletedSch) {
                    const completeCount = typeof getScheduleProofCount === 'function' ? getScheduleProofCount(deletedSch) : 0;
                    if (completeCount === 4) {
                        xpToRevoke += (typeof CLOV_XP_SCHEDULE_COMPLETE !== 'undefined' ? CLOV_XP_SCHEDULE_COMPLETE : 15);
                    }
                }

                groupsData[activeGroup].schedules = schedules.filter(s => s.id !== scheduleId);
                if (selectedScheduleIds[activeGroup] === scheduleId) selectedScheduleIds[activeGroup] = null;
                updateScheduleUI();
                clovToast('🗑️ 일정이 삭제되었어요.', 'info');
                
                if (typeof revokeXP === 'function') {
                    revokeXP(xpToRevoke);
                }
            }, { icon: '🗑️', type: 'error', confirmText: '삭제', cancelText: '취소' });
        }

        function updateScheduleUI() {
            const currentGroup = groupsData[activeGroup];
            const closest = getClosestSchedule();

            // 데스크톱 다중 배너 업데이트 (최대 3개, 없으면 빈 슬롯 표시)
            const dtBannerContainer = document.getElementById('dt-schedule-banner-container');
            if (dtBannerContainer) {
                const schedules = currentGroup.schedules || [];
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let futureSchedules = schedules.filter(sch => {
                    const target = new Date(sch.date);
                    target.setHours(0, 0, 0, 0);
                    return (target.getTime() - today.getTime()) >= 0;
                }).sort((a, b) => new Date(a.date) - new Date(b.date));

                let pastSchedules = schedules.filter(sch => {
                    const target = new Date(sch.date);
                    target.setHours(0, 0, 0, 0);
                    return (target.getTime() - today.getTime()) < 0;
                }).sort((a, b) => new Date(b.date) - new Date(a.date));

                const top3 = [...futureSchedules, ...pastSchedules].slice(0, 3);

                dtBannerContainer.innerHTML = '';
                for (let i = 0; i < 3; i++) {
                    const sch = top3[i];
                    if (sch) {
                        const ddayText = calculateDday(sch.date);
                        const diffDays = getDdayDiffDays(sch.date);
                        const { accent } = getDdayAccent(diffDays);
                        const badgeStyle = `background-color: ${accent};`;
                        const formattedDate = sch.date.replace(/-/g, '.');
                        dtBannerContainer.innerHTML += `
                            <div class="schedule-banner" onclick="switchDesktopTab('schedule'); selectScheduleChip('dt', ${sch.id})" style="margin-top: 0; cursor: pointer;">
                                <div class="schedule-info">
                                    <span class="schedule-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg></span>
                                    <span class="schedule-title">${escapeHtml(sch.title)}</span>
                                    <span class="schedule-date">${formattedDate}</span>
                                </div>
                                <div class="schedule-dday-badge" style="${badgeStyle}">${ddayText}</div>
                            </div>
                        `;
                    } else {
                        dtBannerContainer.innerHTML += `
                            <div class="schedule-banner" onclick="openScheduleModal('dt')" style="margin-top: 0; cursor: pointer; opacity: 0.65; border: 1px dashed rgba(255,255,255,0.3); background: rgba(0,0,0,0.05);">
                                <div class="schedule-info">
                                    <span class="schedule-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></span>
                                    <span class="schedule-title">새로운 약속 만들기</span>
                                    <span class="schedule-date">클릭하여 일정을 추가해보세요</span>
                                </div>
                            </div>
                        `;
                    }
                }
            }

            // 모바일 배너 업데이트
            const mbTitle = document.getElementById('mb-schedule-title');
            const mbDate = document.getElementById('mb-schedule-date');
            const mbDday = document.getElementById('mb-schedule-dday');

            if (closest) {
                const ddayText = calculateDday(closest.date);
                const formattedDate = closest.date.replace(/-/g, '.');

                if (mbTitle) mbTitle.innerText = closest.title;
                if (mbDate) mbDate.innerText = formattedDate;
                if (mbDday) mbDday.innerText = ddayText;
            } else {
                const noScheduleMsg = "등록된 일정이 없습니다.";

                if (mbTitle) mbTitle.innerText = noScheduleMsg;
                if (mbDate) mbDate.innerText = "";
                if (mbDday) mbDday.innerText = "D-Day";
            }

            // 다중 일정 카드 리스트 렌더링
            renderScheduleList('dt');
            renderScheduleList('mb');
        }

        // 일정계획 탭에서 특정 D-day 칩을 선택해 스포트라이트로 펼쳐보기
        function selectScheduleChip(viewType, scheduleId) {
            selectedScheduleIds[activeGroup] = scheduleId;
            renderScheduleList('dt');
            renderScheduleList('mb');

            // 일정 상세 배너가 맨 위에 있으므로 해당 뷰의 맨 위로 스크롤
            const scrollContainer = viewType === 'dt'
                ? document.getElementById('desktop-scroll-container')
                : document.getElementById('mobile-scroll-container');
            if (scrollContainer) {
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        function setScheduleDensity(density) {
            activeScheduleDensity = density;
            renderScheduleList('dt');
            renderScheduleList('mb');
        }

        function buildGrowthStages(schedule) {
            return [
                { key: 'proposal', number: 1, name: '제안하기', date: addDaysToDate(schedule.date, -7) },
                { key: 'coordinate', number: 2, name: '일정 맞추기', date: addDaysToDate(schedule.date, -3) },
                { key: 'confirm', number: 3, name: '약속 확정', date: addDaysToDate(schedule.date, -1) },
                { key: 'meet', number: 4, name: '만남', date: schedule.date }
            ];
        }

        function getGrowthStagePhotos(schedule) {
            if (!schedule.stagePhotos || typeof schedule.stagePhotos !== 'object') {
                schedule.stagePhotos = {};
            }
            return schedule.stagePhotos;
        }

        // 인생4컷 단계 언락 규칙 (인생4컷_기획정리.md 기준)
        // - 1단계(제안하기): 항상 열림
        // - 2단계(일정 맞추기): 1단계 사진이 있어야 열림 (날짜 조건 없음)
        // - 3단계(약속 확정): 2단계 사진 + 오늘 >= 약속일 이어야 열림 — 날짜 조건이 걸리는 유일한 단계
        // - 4단계(만남): 3단계 사진이 있어야 열림 (날짜 조건 없음)
        // 상태는 세 가지뿐이다: locked / active / done
        function getGrowthStageStatus(stage, schedule) {
            const photos = getGrowthStagePhotos(schedule);
            if (photos[stage.key]) return 'done';

            switch (stage.key) {
                case 'proposal':
                    return 'active';
                case 'coordinate':
                    return photos.proposal ? 'active' : 'locked';
                case 'confirm':
                    if (!photos.coordinate) return 'locked';
                    return getDdayDiffDays(schedule.date) <= 0 ? 'active' : 'locked';
                case 'meet':
                    return photos.confirm ? 'active' : 'locked';
                default:
                    return 'locked';
            }
        }

        function getGrowthStageMessage(stage, schedule, status) {
            const photos = getGrowthStagePhotos(schedule);
            switch (stage.key) {
                case 'proposal':
                    return status === 'done' ? '제안 완료' : '첫 약속의 순간을 올려주세요';
                case 'coordinate':
                    if (status === 'locked') return '제안하기 사진을 먼저 올려주세요';
                    return status === 'done' ? '일정 맞추기 완료' : '준비와 기대를 기록해보세요';
                case 'confirm':
                    if (status === 'locked') {
                        return photos.coordinate ? '약속 당일부터 열려요' : '일정 맞추기 사진을 먼저 올려주세요';
                    }
                    return status === 'done' ? '약속 확정 완료' : '오늘의 약속을 인증해보세요';
                case 'meet':
                    if (status === 'locked') return '약속 확정 사진을 올리면 열려요';
                    return status === 'done' ? '만남 완료' : '만남의 마지막 장면을 남겨주세요';
                default:
                    return '';
            }
        }

        function showStageLockedGuidanceModal(message) {
            showProofResultModal({
                title: '아직 열리지 않았어요',
                message: escapeHtml(message)
            });
        }

        function getScheduleProofCount(schedule) {
            const photos = getGrowthStagePhotos(schedule);
            return buildGrowthStages(schedule).filter(stage => photos[stage.key]).length;
        }

        function getVisibleSchedulesByDensity(sortedSchedules) {
            const byClosest = [...sortedSchedules].sort((a, b) => {
                const aDiff = Math.abs(getDdayDiffDays(a.date));
                const bDiff = Math.abs(getDdayDiffDays(b.date));
                return aDiff - bDiff;
            });
            if (activeScheduleDensity === 'proof') {
                return byClosest.filter(schedule => getScheduleProofCount(schedule) < 4);
            }
            if (activeScheduleDensity === 'upcoming') {
                return byClosest.filter(schedule => getDdayDiffDays(schedule.date) >= 0);
            }
            if (activeScheduleDensity === 'done') {
                return byClosest.filter(schedule => getScheduleProofCount(schedule) === 4);
            }
            return byClosest;
        }

        const stageUploadIconSvg = `
            <svg class="strip-upload-svg" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.35 6.9l1.28-2.05h4.74l1.28 2.05H18a2.7 2.7 0 0 1 2.7 2.7v6.85a2.7 2.7 0 0 1-2.7 2.7H6a2.7 2.7 0 0 1-2.7-2.7V9.6A2.7 2.7 0 0 1 6 6.9h2.35z" fill="currentColor" opacity=".14"/>
                <path d="M8.35 6.9l1.28-2.05h4.74l1.28 2.05H18a2.7 2.7 0 0 1 2.7 2.7v6.85a2.7 2.7 0 0 1-2.7 2.7H6a2.7 2.7 0 0 1-2.7-2.7V9.6A2.7 2.7 0 0 1 6 6.9h2.35z" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round"/>
                <circle cx="12" cy="13" r="3.35" fill="none" stroke="currentColor" stroke-width="1.65"/>
                <path d="M17.35 9.45h.1" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>
            </svg>
        `;

        function compressStagePhoto(file, callback) {
            const reader = new FileReader();
            reader.onload = event => {
                const img = new Image();
                img.onload = () => {
                    const maxWidth = 520;
                    const maxHeight = 700;
                    let { width, height } = img;
                    const scale = Math.min(1, maxWidth / width, maxHeight / height);
                    width = Math.round(width * scale);
                    height = Math.round(height * scale);

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    callback(canvas.toDataURL('image/jpeg', 0.64));
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }

        function showProofResultModal({
            title,
            message,
            complete = false,
            primaryText,
            secondaryText,
            showSecondary,
            onPrimary,
            onSecondary
        }) {
            const modal = document.getElementById('dt-proof-result-modal');
            const titleEl = document.getElementById('dt-proof-result-title');
            const messageEl = document.getElementById('dt-proof-result-message');
            const primary = document.getElementById('dt-proof-result-primary');
            const secondary = document.getElementById('dt-proof-result-secondary');
            if (!modal || !titleEl || !messageEl || !primary || !secondary) {
                clovAlert(title, { icon: '💬', type: 'info' });
                return;
            }

            titleEl.textContent = title;
            messageEl.innerHTML = message;
            primary.textContent = primaryText || (complete ? '인생네컷 만들기' : '확인');
            secondary.textContent = secondaryText || (complete ? '나중에 하기' : '취소');
            primary.onclick = onPrimary || closeProofResultModal;
            secondary.onclick = onSecondary || closeProofResultModal;
            secondary.style.display = (showSecondary || complete) ? 'block' : 'none';
            modal.style.display = 'flex';
        }

        function closeProofResultModal() {
            const modal = document.getElementById('dt-proof-result-modal');
            if (modal) modal.style.display = 'none';
        }

        // 인생4컷이 막 완성된 순간 — LP 레코드판 클릭 때 쓰던 색종이+음표 폭죽을
        // "인생 4컷 완성!" 모달의 체크 아이콘 위치에서 재생해 축하해준다.
        function celebrateFourCutComplete() {
            const box = document.querySelector('#dt-proof-result-modal .modal-box');
            const icon = document.getElementById('dt-proof-result-icon');
            const burst = document.getElementById('dt-proof-burst');
            if (!box || !icon || !burst || typeof spawnConfettiBurst !== 'function') return;
            const iconRect = icon.getBoundingClientRect();
            const boxRect = box.getBoundingClientRect();
            burst.style.left = (iconRect.left - boxRect.left + iconRect.width / 2) + 'px';
            burst.style.top = (iconRect.top - boxRect.top + iconRect.height / 2) + 'px';
            spawnConfettiBurst(burst, { spread: 130 }); // 색상은 spawnConfettiBurst 기본값(여름 팔레트) 사용

            // 인생4컷 완성 = 일정 완료 → XP 지급
            if (typeof grantXP === 'function') {
                const xpDone = typeof CLOV_XP_SCHEDULE_COMPLETE !== 'undefined' ? CLOV_XP_SCHEDULE_COMPLETE : 15;
                grantXP(xpDone, 'schedule_done');
                setTimeout(() => {
                    if (typeof clovToast === 'function')
                        clovToast(`인생4컷 완성! 일정 달성 +${xpDone} XP`, 'success');
                }, 800);
            }
        }

        function showLockedStagePhotoModal() {
            showProofResultModal({
                title: '이미 업로드됐어요',
                message: '한 번 등록한 인증사진은 변경할 수 없어요.'
            });
        }

        function requestStagePhotoUpload(scheduleId, stageKey, inputId) {
            const schedule = (groupsData[activeGroup].schedules || []).find(s => s.id === scheduleId);
            if (!schedule) return;

            const photos = getGrowthStagePhotos(schedule);
            if (photos[stageKey]) {
                showLockedStagePhotoModal();
                return;
            }

            const stage = buildGrowthStages(schedule).find(item => item.key === stageKey);
            if (!stage) return;
            const status = getGrowthStageStatus(stage, schedule);
            if (status !== 'active') {
                showStageLockedGuidanceModal(getGrowthStageMessage(stage, schedule, status));
                return;
            }

            showProofResultModal({
                title: '업로드 전 확인',
                message: `${escapeHtml(stage ? stage.name : '단계')} 인증사진은 한 번 업로드하면 변경할 수 없어요.<br>이 사진으로 등록할까요?`,
                primaryText: '사진 선택하기',
                secondaryText: '취소',
                showSecondary: true,
                onPrimary: () => {
                    closeProofResultModal();
                    const input = document.getElementById(inputId);
                    if (!input) return;
                    input.value = '';
                    input.click();
                }
            });
        }

        function uploadStagePhoto(scheduleId, stageKey, input) {
            const file = input.files && input.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                clovAlert('이미지 파일(JPG, PNG, GIF, WEBP 등)만 업로드할 수 있습니다.', { icon: '⚠️', type: 'warn' });
                input.value = '';
                return;
            }

            const schedule = (groupsData[activeGroup].schedules || []).find(s => s.id === scheduleId);
            if (!schedule) return;
            const photos = getGrowthStagePhotos(schedule);

            if (photos[stageKey]) {
                input.value = '';
                showLockedStagePhotoModal();
                return;
            }

            compressStagePhoto(file, dataUrl => {
                photos[stageKey] = dataUrl;

                try {
                    localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
                } catch (error) {
                    delete photos[stageKey];
                    showProofResultModal({
                        title: '저장 공간이 부족해요',
                        message: '이미지를 더 작은 파일로 다시 올려주세요.'
                    });
                    return;
                }

                renderScheduleList('dt');
                renderScheduleList('mb');

                const stage = buildGrowthStages(schedule).find(item => item.key === stageKey);
                const isComplete = getScheduleProofCount(schedule) === 4;
                if (isComplete) {
                    showProofResultModal({
                        title: '인생 4컷 완성!',
                        message: '네 단계의 인증샷이 모두 모였어요.<br>이제 인생네컷으로 만들어 볼까요?',
                        complete: true
                    });
                    celebrateFourCutComplete();
                } else {
                    showProofResultModal({
                        title: '인증사진 업로드',
                        message: `${escapeHtml(stage ? stage.name : '단계')} 인증사진이 업로드됐어요.`
                    });
                }
            });
        }

        function scrollGrowthCards(viewType, direction) {
            const viewport = document.getElementById(`${viewType}-growth-card-viewport`);
            if (!viewport) return;
            const firstCard = viewport.querySelector('.growth-card');
            const list = viewport.querySelector('.growth-card-list');
            const gap = list ? parseFloat(getComputedStyle(list).columnGap || getComputedStyle(list).gap || '14') : 14;
            const amount = firstCard ? firstCard.getBoundingClientRect().width + gap : 190;
            viewport.scrollBy({ left: direction * amount, behavior: 'smooth' });
        }

        function getJourneyTypeMeta(type) {
            const meta = {
                social: { icon: '🍀', label: '약속', accent: '#52b788', glow: 'rgba(82,183,136,0.34)' },
                study: { icon: '📚', label: '준비', accent: '#60a5fa', glow: 'rgba(96,165,250,0.28)' },
                memory: { icon: '📸', label: '기록', accent: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
                rest: { icon: '✨', label: '정리', accent: '#a78bfa', glow: 'rgba(167,139,250,0.28)' }
            };
            return meta[type] || meta.social;
        }

        function addDaysToDate(dateStr, days) {
            const date = new Date(dateStr);
            date.setDate(date.getDate() + days);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        }

        function buildJourneyMilestones(schedules) {
            const sorted = [...schedules].sort((a, b) => new Date(a.date) - new Date(b.date));
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const milestones = [{
                id: 'today',
                sourceId: null,
                title: '오늘의 위치',
                date: todayStr,
                type: 'rest',
                stage: '지금 여기',
                locked: false,
                isToday: true
            }];

            sorted.forEach((sch, index) => {
                const baseId = sch.id;
                const eventType = /시험|스터디|공부|코드|해커톤|리뷰/i.test(sch.title) ? 'study' : 'social';
                milestones.push({
                    id: `${baseId}-idea`,
                    sourceId: baseId,
                    title: `${sch.title} 이야기 꺼내기`,
                    date: addDaysToDate(sch.date, -14),
                    type: 'rest',
                    stage: '약속 씨앗',
                    locked: index > 0
                });
                milestones.push({
                    id: `${baseId}-prep`,
                    sourceId: baseId,
                    title: `${sch.title} 준비`,
                    date: addDaysToDate(sch.date, -7),
                    type: eventType === 'study' ? 'study' : 'rest',
                    stage: '준비 체크',
                    locked: index > 0
                });
                milestones.push({
                    id: `${baseId}-check`,
                    sourceId: baseId,
                    title: `${sch.title} 최종 확인`,
                    date: addDaysToDate(sch.date, -3),
                    type: eventType,
                    stage: '마지막 점검',
                    locked: index > 0
                });
                milestones.push({
                    id: `${baseId}-event`,
                    sourceId: baseId,
                    title: sch.title,
                    date: sch.date,
                    type: eventType,
                    stage: '약속 당일',
                    locked: index > 0
                });
                milestones.push({
                    id: `${baseId}-memory`,
                    sourceId: baseId,
                    title: `${sch.title} 추억 남기기`,
                    date: addDaysToDate(sch.date, 1),
                    type: 'memory',
                    stage: '추억 전환',
                    locked: index > 0
                });
            });

            return milestones.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        function getMilestonesByDensity(milestones) {
            const completed = milestones
                .filter(item => !item.isToday && getDdayDiffDays(item.date) < 0)
                .slice(-1);
            const upcoming = milestones.filter(item => getDdayDiffDays(item.date) >= 0 || item.isToday);
            if (activeScheduleDensity === 'compact') {
                return [...completed, ...upcoming.filter(item => item.isToday || item.stage === '약속 당일')]
                    .slice(0, 3);
            }
            if (activeScheduleDensity === 'standard') {
                return [...completed, ...upcoming].slice(0, 6);
            }
            return [...completed, ...upcoming].slice(0, Math.max(9, upcoming.length));
        }

        function getJourneyPathD(count, height) {
            const points = Array.from({ length: count }, (_, index) => {
                const y = 56 + (index * 132);
                const x = index % 2 === 0 ? 34 : 66;
                return { x, y };
            });
            if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${height - 40}`;
            let d = `M ${points[0].x} ${points[0].y}`;
            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                const midY = (prev.y + curr.y) / 2;
                d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
            }
            return d;
        }

        function renderScheduleList(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const zone = document.getElementById(`${prefix}-schedule-list-zone`);
            if (!zone) return;

            const schedules = groupsData[activeGroup].schedules || [];

            if (schedules.length === 0) {
                zone.innerHTML = `<div class="spotlight-empty">아직 함께 세어볼 D-day가 없어요.<br>상단의 추가 버튼을 눌러 첫 약속을 만들어보세요!</div>`;
                return;
            }

            const sortedSchedules = [...schedules].sort((a, b) => new Date(a.date) - new Date(b.date));

            let selectedId = selectedScheduleIds[activeGroup];
            if (!selectedId || !sortedSchedules.some(s => s.id === selectedId)) {
                const closest = getClosestSchedule();
                selectedId = closest ? closest.id : sortedSchedules[0].id;
                selectedScheduleIds[activeGroup] = selectedId;
            }
            const selectedSchedule = sortedSchedules.find(s => s.id === selectedId) || sortedSchedules[0];

            const visibleSchedules = getVisibleSchedulesByDensity(sortedSchedules);
            const proofCount = sortedSchedules.filter(schedule => getScheduleProofCount(schedule) < 4).length;
            const upcomingCount = sortedSchedules.filter(schedule => getDdayDiffDays(schedule.date) >= 0).length;
            const doneCount = sortedSchedules.filter(schedule => getScheduleProofCount(schedule) === 4).length;

            const cards = visibleSchedules.map(sch => {
                const stages = buildGrowthStages(sch);
                const photos = getGrowthStagePhotos(sch);
                const completeCount = getScheduleProofCount(sch);
                const progress = Math.max(12, Math.round((completeCount / stages.length) * 100));
                const diffDays = getDdayDiffDays(sch.date);
                const { accent, glow } = getDdayAccent(diffDays);
                const ddayText = calculateDday(sch.date);
                const isSelected = sch.id === selectedSchedule.id;
                const isComplete = completeCount === 4;
                const stageHtml = stages.map((stage, stageIndex) => {
                    const status = getGrowthStageStatus(stage, sch);
                    const message = getGrowthStageMessage(stage, sch, status);
                    const photo = photos[stage.key];
                    const inputId = `${prefix}-stage-upload-${sch.id}-${stage.key}`;
                    const photoHtml = photo
                        ? `<div class="strip-frame-photo" style="background-image:url('${photo}')"></div>`
                        : status === 'locked'
                            ? `
                                <span class="strip-frame-number">${stage.number}</span>
                                <span class="strip-lock-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>
                            `
                            : `
                                <span class="strip-frame-number">${stage.number}</span>
                                <span class="strip-rec-badge"><span class="strip-rec-dot"></span>REC</span>
                                <span class="strip-upload-icon">${stageUploadIconSvg}</span>
                                <span class="strip-upload-hint">업로드</span>
                            `;
                    const clickAction = photo
                        ? `showLockedStagePhotoModal()`
                        : status === 'locked'
                            ? `showStageLockedGuidanceModal('${escapeHtml(message)}')`
                            : `requestStagePhotoUpload(${sch.id}, '${stage.key}', '${inputId}')`;
                    const perforation = stageIndex > 0 ? `<div class="strip-perforation"></div>` : '';
                    return `
                        ${perforation}
                        <div class="strip-frame strip-frame--${status} ${photo ? 'strip-frame--locked-proof' : status === 'active' ? 'strip-frame--uploadable' : ''}" title="${escapeHtml(message)}" onclick="event.stopPropagation(); ${clickAction};">
                            ${photoHtml}
                            <span class="strip-frame-label">${stage.number}. ${escapeHtml(stage.name)}</span>
                            <input id="${inputId}" type="file" accept="image/*" hidden onchange="uploadStagePhoto(${sch.id}, '${stage.key}', this)">
                        </div>
                    `;
                }).join('');

                return `
                    <article class="growth-card four-cut ${isSelected ? 'is-selected' : ''} ${isComplete ? 'is-complete' : ''}" style="--growth-accent:${accent}; --growth-glow:${glow}; --growth-progress:${progress}%;" onclick="selectScheduleChip('${viewType}', ${sch.id})">
                        <div class="strip-header">
                            <div class="strip-title-wrap">
                                <span class="strip-kicker ${isComplete ? '' : 'is-shooting'}">${isComplete ? '' : '<span class="strip-kicker-dot"></span>'}${isComplete ? 'COMPLETE' : 'NOW SHOOTING'}</span>
                                <span class="strip-title">${escapeHtml(sch.title)}</span>
                            </div>
                            <span class="growth-dday-pill">${escapeHtml(ddayText)}</span>
                        </div>
                        <div class="strip-body">
                            <div class="strip-frames">${stageHtml}</div>
                        </div>
                        <div class="strip-footer">
                            <span class="strip-footer-brand">clov. memories</span>
                            <span class="strip-footer-count">${isComplete ? '인생4컷 완성 🍀' : `${completeCount}/4 업로드 완료`}</span>
                        </div>
                    </article>
                `;
            }).join('');

            const diffDays = getDdayDiffDays(selectedSchedule.date);
            const { accent, glow } = getDdayAccent(diffDays);
            const ddayText = calculateDday(selectedSchedule.date);
            const friendlyDate = formatFriendlyDate(selectedSchedule.date);
            const ddayPhrase = diffDays < 0 ? '함께 보낸 그날로부터' : diffDays === 0 ? '바로 오늘, 약속의 날!' : '함께할 그날까지';
            const stampColor = diffDays < 0 ? '#2e5233' : '#c0392b';  // 지난 약속=초록, 그 외=빨강

            zone.innerHTML = `
                <section class="growth-shell">
                    <div class="growth-detail receipt" style="--stamp:${stampColor};">
                        <div class="receipt-paper">
                            <div class="receipt-zigzag"></div>
                            <div class="receipt-head">
                                <div class="receipt-brand">CLOV. MEMORIES</div>
                                <div class="receipt-sub">★  약 속 메 모  ★</div>
                            </div>
                            <div class="receipt-stamp-wrap">
                                <div class="receipt-stamp">
                                    <span class="receipt-stamp-label">${escapeHtml(ddayPhrase)}</span>
                                    <span class="receipt-stamp-dday">${escapeHtml(ddayText)}</span>
                                </div>
                            </div>
                            <div class="receipt-title">${escapeHtml(selectedSchedule.title)}</div>
                            <div class="receipt-meta">
                                <div><span>DATE</span><span>${escapeHtml(friendlyDate)}</span></div>
                                <div><span>D-DAY</span><span>${escapeHtml(ddayText)}</span></div>
                            </div>
                            <div class="receipt-memo-label">— MEMO ————————————</div>
                            <div class="receipt-memo" contenteditable="true"
                                 id="${prefix}-schedule-content-${selectedSchedule.id}"
                                 onblur="saveScheduleContent('${viewType}', ${selectedSchedule.id})"
                                 placeholder="✎ 메모를 추가해 보세요">${selectedSchedule.content || ''}</div>
                            <div class="receipt-barcode"></div>
                            <div class="receipt-actions">
                                <button onclick="openScheduleModal('${viewType}', ${selectedSchedule.id})">수정</button>
                                <button class="danger" onclick="deleteSchedule(${selectedSchedule.id})">삭제</button>
                            </div>
                        </div>
                    </div>
                    <div class="growth-hero">
                        <div>
                            <span class="growth-kicker">LIFE FOUR CUT</span>
                            <span class="growth-title">전체 약속 보기</span>
                            <span class="growth-subtitle">제안하기부터 만남까지, 네 장의 인증사진이 모이면 인생4컷처럼 완성됩니다.</span>
                        </div>
                        <div class="growth-density" aria-label="일정 필터">
                            <button class="${activeScheduleDensity === 'all' ? 'active' : ''}" onclick="setScheduleDensity('all')">전체 <span>${sortedSchedules.length}</span></button>
                            <button class="${activeScheduleDensity === 'proof' ? 'active' : ''}" onclick="setScheduleDensity('proof')">인증 가능 <span>${proofCount}</span></button>
                            <button class="${activeScheduleDensity === 'upcoming' ? 'active' : ''}" onclick="setScheduleDensity('upcoming')">다가오는 약속 <span>${upcomingCount}</span></button>
                            <button class="${activeScheduleDensity === 'done' ? 'active' : ''}" onclick="setScheduleDensity('done')">완료된 약속 <span>${doneCount}</span></button>
                            <button class="fourcut-gallery-btn" type="button" onclick="openFourCutGallery()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px;"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"></path><path d="M13 6v1.5M13 16.5V18M13 11v2"></path></svg>입장하기</button>
                        </div>
                    </div>
                    <div class="growth-card-rail">
                        <button class="carousel-btn" type="button" aria-label="이전 약속 보기" onclick="scrollGrowthCards('${viewType}', -1)">‹</button>
                        <div class="growth-card-viewport" id="${viewType}-growth-card-viewport">
                            <div class="growth-card-list">${cards || '<div class="growth-filter-empty">이 필터에 맞는 약속이 아직 없어요.</div>'}</div>
                        </div>
                        <button class="carousel-btn" type="button" aria-label="다음 약속 보기" onclick="scrollGrowthCards('${viewType}', 1)">›</button>
                    </div>
                </section>
            `;
        }

        // 인생4컷 극장 상태 — 완성작 목록과 현재 상영 중인 인덱스, 진행 중인 타이머
        function saveScheduleContent(viewType, scheduleId) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const id = `${prefix}-schedule-content-${scheduleId}`;
            const el = document.getElementById(id);
            if (el) {
                const newContent = el.innerHTML;

                // 메모리 데이터 업데이트
                const sch = groupsData[activeGroup].schedules.find(s => s.id === scheduleId);
                if (sch) {
                    sch.content = newContent;
                }

                // 데스크톱 <-> 모바일 양방향 실시간 동기화
                const otherPrefix = viewType === 'dt' ? 'mb' : 'dt';
                const otherId = `${otherPrefix}-schedule-content-${scheduleId}`;
                const otherEl = document.getElementById(otherId);
                if (otherEl && otherEl.innerHTML !== newContent) {
                    otherEl.innerHTML = newContent;
                }
            }
        }

        // 일정 생성 모달 "＋ 단계 넣기" — 제안·일정·확정·만남 4단계 스캐폴드를 커서 위치에 삽입
        function insertScheduleSteps(editorId) {
            const editor = document.getElementById(editorId);
            if (!editor) return;
            editor.focus();
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);            // 커서를 에디터 끝으로
            sel.removeAllRanges();
            sel.addRange(range);
            const scaffold =
                '<h3>약속 준비 4단계</h3>' +
                '<ul>' +
                '<li><b>제안하기</b> — </li>' +
                '<li><b>일정 맞추기</b> — </li>' +
                '<li><b>약속 확정</b> — </li>' +
                '<li><b>만남</b> — </li>' +
                '</ul><p><br></p>';
            document.execCommand('insertHTML', false, scaffold);
        }
        window.insertScheduleSteps = insertScheduleSteps;

        // 레벨이 오를수록 맨땅이었던 지면에 클로버가 하나둘 빽빽하게 자라나도록 채워주는 함수 (잡초 X, 전부 클로버)
        // 초기 실행 시 피드 데이터 및 우정 레벨 UI 로드
        function toggleScheduleSidebar(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const sidebar = document.getElementById(`${prefix}-schedule-detail-sidebar`);
            if (sidebar) {
                sidebar.classList.toggle('open');
            }
        }

        function closeScheduleSidebar(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const sidebar = document.getElementById(`${prefix}-schedule-detail-sidebar`);
            if (sidebar) {
                sidebar.classList.remove('open');
            }
        }

        function addDetailSchedule(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const timeInput = document.getElementById(`${prefix}-detail-time`);
            const contentInput = document.getElementById(`${prefix}-detail-content`);
            const list = document.getElementById(`${prefix}-detail-timeline-list`);

            if (timeInput && contentInput && list && timeInput.value && contentInput.value) {
                const newItem = document.createElement('div');
                newItem.className = 'detail-timeline-item';
                newItem.innerHTML = `
                    <div class="detail-timeline-time">${escapeHtml(timeInput.value)}</div>
                    <div class="detail-timeline-content">
                        <div>${escapeHtml(contentInput.value)}</div>
                        <div class="timeline-meta">
                            <span><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:2px;"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5"/></svg>나</span>
                            <span><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px;margin-right:2px;"><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>알림</span>
                        </div>
                    </div>
                `;
                list.appendChild(newItem);

                const items = Array.from(list.children);
                items.sort((a, b) => {
                    const timeA = a.querySelector('.detail-timeline-time').innerText;
                    const timeB = b.querySelector('.detail-timeline-time').innerText;
                    return timeA.localeCompare(timeB);
                });
                list.innerHTML = '';
                items.forEach(item => list.appendChild(item));

                contentInput.value = '';
            }
        }

