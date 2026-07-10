
        // 화면 밖 클릭 시 드롭다운 닫기 및 모달 바깥 클릭 시 닫기 이벤트 핸들러
        window.onclick = function (event) {
            if (!event.target.matches('.profile-btn')) {
                const mbDropOutside = document.getElementById('mb-drop');
                const dtDropOutside = document.getElementById('dt-drop');
                if (mbDropOutside) mbDropOutside.style.display = 'none';
                if (dtDropOutside) dtDropOutside.style.display = 'none';
            }
            if (!event.target.closest('.clov-hdr-avatar-wrap')) {
                document.querySelectorAll('.clov-hdr-dropdown.open').forEach(d => d.classList.remove('open'));
            }
            const monthPicker = document.getElementById('month-picker-popover');
            if (monthPicker && !event.target.closest('.month-picker-popover') && !event.target.closest('.month-picker-trigger')) {
                closeMonthPicker();
            }
            if (event.target.classList.contains('modal-overlay')) {
                event.target.style.display = 'none';
            }
        }

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeMemoryDetail();
                closeScheduleSidebar('dt');
                closeScheduleSidebar('mb');
                closeMonthPicker();
            }
        });

        window.onload = function () {
            updateDashboardEnvironment();
            setInterval(updateDashboardEnvironment, 60000);

            renderFeeds();
            renderLetters();
            updateFriendshipUI();
            updateGroupModalUI();
            animateDdayCount(groupsData[activeGroup].ddayCount);

            // 압축 도입 이전에 저장된 대용량 원본 사진을 1회 재압축해 localStorage 공간을 회수한다.
            // (이미 한도가 꽉 차 새 사진조차 못 올라가는 "저장 공간이 부족해요" 상태를 데이터 손실 없이 해소)
            if (typeof compactStoredPhotos === 'function' && localStorage.getItem('clov_photo_compacted_v1') !== '1') {
                compactStoredPhotos().then(result => {
                    localStorage.setItem('clov_photo_compacted_v1', '1');
                    if (result && result.changed && result.saved) {
                        const freedKB = Math.max(0, Math.round((result.before - result.after) / 1024));
                        if (freedKB > 0) {
                            renderFeeds();
                            updateFriendshipUI();
                            if (typeof clovToast === 'function') {
                                clovToast(`🧹 저장 공간을 정리했어요 (약 ${freedKB}KB 확보). 이제 사진을 더 올릴 수 있어요.`, 'success', 3600);
                            }
                        }
                    }
                });
            }
        }

        function forceTheme(type, value) {
            localStorage.setItem('clov_banner_' + type, value);
            ['dt-dashboard', 'mb-dashboard'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.dataset[type] = value;
                    if (type === 'season') {
                        updateSeasonalParticles(el, value);
                    }
                }
            });
        }

        function resetTheme() {
            localStorage.removeItem('clov_banner_time');
            localStorage.removeItem('clov_banner_season');
            updateDashboardEnvironment();
            clovToast('테마가 현재 시간으로 초기화되었어요.', 'info');
        }
    


