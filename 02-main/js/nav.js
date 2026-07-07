        function selectGroup(groupKey) {
            activeGroup = groupKey;

            // 모달 닫기
            closeModal('dt-group-modal');
            closeModal('mb-group-modal');

            // 활성 그룹 스타일 업데이트
            updateGroupModalUI();

            const currentGroup = groupsData[activeGroup];
            friendshipLevel = currentGroup.level;

            // D-day 내용 업데이트
            const dtLabel = document.getElementById('dt-dday-label') || document.getElementById('dt-v5eyebrow');
            if (dtLabel) dtLabel.innerText = currentGroup.ddayLabel;
            const mbLabel = document.getElementById('mb-dday-label') || document.getElementById('mb-v5eyebrow');
            if (mbLabel) mbLabel.innerText = currentGroup.ddayLabel;
            animateDdayCount(currentGroup.ddayCount);

            // UI 일괄 업데이트 (레벨 배지, 게이지 바, 클로버 재생성)
            updateFriendshipUI();
            renderFeeds();
            renderLetters();

            // 로고 변경 시뮬레이션
            document.querySelectorAll('.logo').forEach(logo => {
                logo.innerHTML = `${currentGroup.icon} ${currentGroup.name}`;
            });

            clovToast(`👥 [${currentGroup.icon} ${currentGroup.name}] 그룹으로 전환되었습니다.`, 'success');
        }

        // 그룹 모달 안의 선택 상태 스타일 제어
        function updateGroupModalUI() {
            // 데스크톱 그룹 버튼 갱신
            document.querySelectorAll('.dt-group-btn').forEach(btn => {
                btn.style.background = 'var(--bg-light)';
                btn.style.color = 'var(--text-color)';
                btn.style.borderColor = 'var(--border-color)';
            });
            // 모바일 그룹 버튼 갱신
            document.querySelectorAll('.mb-group-btn').forEach(btn => {
                btn.style.background = 'var(--bg-light)';
                btn.style.color = 'var(--text-color)';
                btn.style.borderColor = 'var(--border-color)';
            });

            // 선택된 버튼 활성화 스타일
            const groupKeys = ['friend', 'family', 'study'];
            const activeIndex = groupKeys.indexOf(activeGroup);
            if (activeIndex !== -1) {
                const dtActiveBtn = document.querySelectorAll('.dt-group-btn')[activeIndex];
                const mbActiveBtn = document.querySelectorAll('.mb-group-btn')[activeIndex];
                if (dtActiveBtn) {
                    dtActiveBtn.style.background = 'var(--nav-item-bg-active)';
                    dtActiveBtn.style.color = 'var(--primary-green)';
                    dtActiveBtn.style.borderColor = 'var(--accent-green)';
                }
                if (mbActiveBtn) {
                    mbActiveBtn.style.background = 'var(--nav-item-bg-active)';
                    mbActiveBtn.style.color = 'var(--primary-green)';
                    mbActiveBtn.style.borderColor = 'var(--accent-green)';
                }
            }
        }
        // 9. 다크모드 제어 기능
        const urlParamsMain = new URLSearchParams(window.location.search);
        const themeParamMain = urlParamsMain.get('theme');
        const groupIdParam = urlParamsMain.get('groupId');
        let isDarkMode = false;
        if (themeParamMain === 'dark') {
            isDarkMode = true;
            localStorage.setItem('clov_darkMode', 'true');
        } else if (themeParamMain === 'light') {
            isDarkMode = false;
            localStorage.setItem('clov_darkMode', 'false');
        } else {
            isDarkMode = localStorage.getItem('clov_darkMode') === 'true';
        }
        
        if (groupIdParam && groupsData[groupIdParam]) {
            activeGroup = groupIdParam;
        }
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        // 해/달 토글 아이콘은 body.dark-mode 기준 CSS(clov-header.js)가 알아서 전환하므로
        // 여기서 아이콘 텍스트를 따로 맞춰줄 필요가 없다
        function toggleDarkMode() {
            isDarkMode = !isDarkMode;
            localStorage.setItem('clov_darkMode', isDarkMode);

            const icons = document.querySelectorAll('.dt-dark-btn .toggle-icon, .mb-dark-btn .toggle-icon');

            icons.forEach(icon => {
                icon.classList.remove('slide-animation');
                void icon.offsetWidth; // 리플로우 강제 유발 (애니메이션 재시작)
                icon.classList.add('slide-animation');
            });

            // 해/달 아이콘은 body.dark-mode 기준 CSS가 알아서 전환하므로 텍스트 교체가 더 이상 필요 없다

            if (isDarkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            updateGroupModalUI(); // 버튼들에 다크모드 변수 테마 강제 리프레시
        }
