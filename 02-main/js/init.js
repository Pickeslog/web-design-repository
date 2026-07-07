
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
    


