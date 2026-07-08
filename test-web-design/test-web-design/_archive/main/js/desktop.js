// --- Null Pointer Safe Patch ---
const _origGetEl = document.getElementById.bind(document);
const _dummyContainer = document.createElement('div');
_dummyContainer.style.display = 'none';
document.getElementById = function(id) {
    let el = _origGetEl(id);
    if (!el) {
        el = document.createElement('div');
        el.id = id;
        if (document.body) {
            if (!_dummyContainer.parentNode) document.body.appendChild(_dummyContainer);
            _dummyContainer.appendChild(el);
        }
    }
    return el;
};
// -------------------------------

        // 👥 그룹 전환용 인메모리 데이터 저장소
        let activeGroup = 'friend'; // 기본값: 단짝친구
        let activeFeedFilter = 'all';
        let activeFeedMonth = 'all';
        let monthPickerYear = new Date().getFullYear();
        let activeEvidenceIndexes = {
            friend: 0,
            family: 0,
            study: 0
        };
        let evidenceSlideDirection = 'idle';
        const ddayAnimationFrames = {};

        // 일정계획 탭에서 현재 스포트라이트로 펼쳐 보고 있는 일정의 id (그룹별로 기억)
        let selectedScheduleIds = {
            friend: null,
            family: null,
            study: null
        };
        let activeScheduleDensity = 'standard';

        function formatDdayText(dayCount) {
            return `D+${dayCount} \uC77C\uC9F8`;
        }

        function animateDdayElement(elementId, targetNumber, duration = 1500) {
            const element = document.getElementById(elementId);
            if (!element) return;

            if (ddayAnimationFrames[elementId]) {
                cancelAnimationFrame(ddayAnimationFrames[elementId]);
            }

            const safeTarget = Math.max(0, Number(targetNumber) || 0);
            const startTime = performance.now();
            element.classList.add('is-counting');
            element.innerText = formatDdayText(0);

            function updateCount(currentTime) {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                const easeOutProgress = progress * (2 - progress);
                const currentCount = Math.floor(easeOutProgress * safeTarget);

                element.innerText = formatDdayText(currentCount);

                if (progress < 1) {
                    ddayAnimationFrames[elementId] = requestAnimationFrame(updateCount);
                } else {
                    element.innerText = formatDdayText(safeTarget);
                    element.classList.remove('is-counting');
                    ddayAnimationFrames[elementId] = null;
                }
            }

            ddayAnimationFrames[elementId] = requestAnimationFrame(updateCount);
        }

        function animateDdayCount(targetNumber, duration = 1500) {
            animateDdayElement('dt-dday', targetNumber, duration);
            animateDdayElement('mb-dday', targetNumber, duration);
        }

        let defaultGroupsData = {
            friend: {
                name: "단짝친구",
                icon: "🍀",
                ddayLabel: "우리 함께한 지",
                ddayCount: 124,
                level: 3,
                levelName: "초록 클로버",
                progress: "65%",
                photo: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=500&q=80",
                photoTitle: "우리가 고등학교때 찍은 사진 📸",
                schedules: [
                    {
                        id: 1,
                        title: "제주도 여름 우정 여행",
                        date: "2026-07-09",
                        content: `<h3>🏝️ 제주도 여행 상세 계획</h3>
<ul>
  <li><strong>1일차:</strong> 공항 도착 ➔ 렌트카 수령 ➔ 협재 해수욕장 ➔ 숙소 체크인</li>
  <li><strong>2일차:</strong> 성산일출봉 일출 ➔ 우도 당일치기 ➔ 흑돼지 저녁 식사</li>
  <li><strong>3일차:</strong> 기념품 숍 투어 ➔ 애월 카페거리 ➔ 공항 이동</li>
</ul>
<br>
<h3>🎒 준비물 리스트</h3>
<ul>
  <li>신분증, 면허증</li>
  <li>세면도구 및 여벌 옷</li>
  <li>카메라 및 충전기</li>
</ul>`
                    },
                    {
                        id: 2,
                        title: "중간고사 시험공부 스터디",
                        date: "2026-10-20",
                        content: `<h3>📚 중간고사 준비 과목</h3>
<ul>
  <li>자료구조: 트리와 그래프 복습</li>
  <li>네트워크: TCP/IP 3-way handshake 요약</li>
</ul>`
                    }
                ],
                posts: [
                    {
                        date: "2026.06.20",
                        title: "첫 한강 피크닉",
                        subtitle: "뚝섬 한강",
                        text: "떡볶이 먹고 돗자리 펴고 오래 웃었다.",
                        bg: "",
                        participants: [
                            { name: "나", icon: "나", text: "떡볶이 진짜 맛있었다" },
                            { name: "솔", icon: "솔", text: "돗자리 날린 게 웃겼다" }
                        ],
                        tags: ["2명 기록", "같은 장소"]
                    },
                    {
                        date: "2026.06.15",
                        title: "성수 스터디 카페",
                        subtitle: "성수동 카페",
                        text: "문제 풀고 커피 마시며 집중한 날.",
                        bg: "https://picsum.photos/seed/cafe1/400/300",
                        participants: [
                            { name: "나", icon: "나", text: "문제 하나 풀어서 뿌듯" },
                            { name: "솔", icon: "솔", text: "커피가 생각보다 좋았다" },
                            { name: "민", icon: "민", text: "조용해서 집중 잘 됐다" },
                            { name: "준", icon: "준", text: "다음에도 여기 오자" }
                        ],
                        tags: ["4명 기록", "같은 장소"]
                    },
                    {
                        date: "2026.06.08",
                        title: "홍대 분식 + 노래방",
                        subtitle: "홍익대 앞",
                        text: "떡볶이 두 그릇 먹고 노래방 세 시간. 목이 쉬었다.",
                        bg: "https://picsum.photos/seed/hongdae/400/300",
                        participants: [
                            { name: "나", icon: "나", text: "고음 한 번 질렀다가 다들 귀 막았다" },
                            { name: "솔", icon: "솔", text: "분식이 더 맛있었어" },
                            { name: "민", icon: "민", text: "노래방 사장님이 눈치를 줬다" }
                        ],
                        tags: ["3명 기록", "밤의 기억"]
                    },
                    {
                        date: "2026.05.31",
                        title: "영화관 야간 상영",
                        subtitle: "CGV 강남",
                        text: "마지막 회차 보고 새벽 버스 타고 집 갔다.",
                        bg: "",
                        participants: [
                            { name: "나", icon: "나", text: "결말에서 소름 돋았다" },
                            { name: "솔", icon: "솔", text: "옆에서 울었다고 비밀로 해줘" }
                        ],
                        tags: ["2명 기록", "심야 코스"]
                    },
                    {
                        date: "2026.05.24",
                        title: "부산 당일 여행 🌊",
                        subtitle: "해운대 해수욕장",
                        text: "KTX 타고 내려가서 밀면 먹고 바다 보고 올라왔다.",
                        bg: "https://picsum.photos/seed/busan/400/300",
                        participants: [
                            { name: "나", icon: "나", text: "밀면이 냉면보다 낫다" },
                            { name: "솔", icon: "솔", text: "다음엔 1박 하고 싶다" },
                            { name: "민", icon: "민", text: "모래사장에서 넘어진 건 비밀" },
                            { name: "준", icon: "준", text: "기차 안에서 내내 잤다" }
                        ],
                        tags: ["4명 기록", "여행"]
                    },
                    {
                        date: "2026.05.10",
                        title: "어린이날 놀이공원 🎢",
                        subtitle: "에버랜드",
                        text: "티익스프레스 세 번 탔다. 다리가 풀렸다.",
                        bg: "https://picsum.photos/seed/park/400/300",
                        participants: [
                            { name: "나", icon: "나", text: "세 번째 탈 때는 진심으로 무서웠다" },
                            { name: "솔", icon: "솔", text: "귀신의 집은 절대 안 간다" },
                            { name: "준", icon: "준", text: "솜사탕 혼자 다 먹었다" }
                        ],
                        tags: ["3명 기록", "기념일"]
                    },
                    {
                        date: "2026.04.27",
                        title: "봄 벚꽃 피크닉 🌸",
                        subtitle: "여의도 한강공원",
                        text: "돗자리 펴고 치킨 시켜서 꽃구경 했다.",
                        bg: "https://picsum.photos/seed/cherry/400/300",
                        participants: [
                            { name: "나", icon: "나", text: "꽃이 진짜 예뻤다" },
                            { name: "솔", icon: "솔", text: "치킨이 더 예뻤다" }
                        ],
                        tags: ["2명 기록", "계절 기록"]
                    },
                    {
                        date: "2026.04.12",
                        title: "방탈출 도전 🔐",
                        subtitle: "홍대 방탈출 카페",
                        text: "15분 남기고 탈출 성공. 마지막 자물쇠에서 식은땀 흘렸다.",
                        bg: "",
                        participants: [
                            { name: "나", icon: "나", text: "마지막 힌트 쓰자는 말 못한 게 후회" },
                            { name: "솔", icon: "솔", text: "나 혼자 다 푼 거나 다름없다" },
                            { name: "민", icon: "민", text: "해독 잘해서 기분 좋았다" },
                            { name: "준", icon: "준", text: "다음엔 더 어려운 방 가자" }
                        ],
                        tags: ["4명 기록", "도전"]
                    },
                    {
                        date: "2026.03.28",
                        title: "동창회 뒤풀이",
                        subtitle: "강남 포차",
                        text: "오랜만에 다 모였다. 세 시간 동안 근황 토크.",
                        bg: "https://picsum.photos/seed/party/400/300",
                        participants: [
                            { name: "나", icon: "나", text: "다들 이렇게 잘 살고 있었구나" },
                            { name: "솔", icon: "솔", text: "취해서 택시 타고 갔다" },
                            { name: "민", icon: "민", text: "다음 모임 내가 잡겠다고 했다" }
                        ],
                        tags: ["3명 기록", "오랜만"]
                    },
                    {
                        date: "2026.03.14",
                        title: "화이트데이 카페 투어 ☕",
                        subtitle: "연남동 일대",
                        text: "세 군데 돌고 사진만 오십 장 찍었다.",
                        bg: "https://picsum.photos/seed/white/400/300",
                        participants: [
                            { name: "나", icon: "나", text: "에스프레소 세 잔 마시고 심장이 튀었다" },
                            { name: "솔", icon: "솔", text: "인스타 올릴 사진 건졌다" }
                        ],
                        tags: ["2명 기록", "카페 투어"]
                    },
                    {
                        date: "2026.02.22",
                        title: "졸업식 날 📜",
                        subtitle: "학교 대강당",
                        text: "가운 입고 사진 찍고 밥 먹고 울었다.",
                        bg: "https://picsum.photos/seed/grad/400/300",
                        participants: [
                            { name: "나", icon: "나", text: "드디어 끝났다는 실감이 안 났다" },
                            { name: "솔", icon: "솔", text: "눈물 참으려다 터졌다" },
                            { name: "민", icon: "민", text: "가운 반납 전에 사진 더 찍을걸" },
                            { name: "준", icon: "준", text: "꽃다발 받았을 때 진짜 행복했다" }
                        ],
                        tags: ["4명 기록", "기념일", "특별한 날"]
                    },
                    {
                        date: "2026.01.01",
                        title: "새해 해돋이 🌅",
                        subtitle: "정동진",
                        text: "밤새 버스 타고 가서 해 보고 바로 잠들었다.",
                        bg: "https://picsum.photos/seed/sunrise/400/300",
                        participants: [
                            { name: "나", icon: "나", text: "해는 예뻤는데 너무 추웠다" },
                            { name: "솔", icon: "솔", text: "버스에서 목 꺾이게 잤다" },
                            { name: "준", icon: "준", text: "소원 빌었는데 비밀이다" }
                        ],
                        tags: ["3명 기록", "새해", "여행"]
                    }
                ],
                letters: [
                    { from: "단짝친구 🍀", text: "너라는 친구를 만난 건 내 인생 최고의 행운이야. 오늘 코딩하다가 막히는 거 있으면 언제든 말해라 파이팅!", favorite: false },
                    { from: "단짝친구 🍀", text: "날씨 좋은데 주말에 리프레시 하러 한강이나 한 번 더 때리자!", favorite: false }
                ]
            },
            family: {
                name: "우리가족",
                icon: "👨‍👩‍👧‍👦",
                ddayLabel: "우리 가족이 모인 지",
                ddayCount: 8520,
                level: 5,
                levelName: "사랑이 가득한 가족",
                progress: "100%",
                photo: "https://images.unsplash.com/photo-1542037104857-ffbc0b91268c?auto=format&fit=crop&w=500&q=80",
                photoTitle: "우리 가족의 행복한 순간 👨‍👩‍👧‍👦",
                schedules: [
                    {
                        id: 1,
                        title: "가족 가을 단풍 온천 여행",
                        date: "2026-10-15",
                        content: `<h3>♨️ 온천 가족 여행 코스</h3>
<ul>
  <li><strong>오전:</strong> 다 함께 아침 출발 ➔ 휴게소 간식 ➔ 온천 지구 도착</li>
  <li><strong>오후:</strong> 온천 대욕장 이용 ➔ 가족탕 휴식 ➔ 일식 코스요리 저녁 식사</li>
  <li><strong>이튿날:</strong> 호텔 조식 ➔ 단풍길 산책 ➔ 귀가</li>
</ul>
<br>
<h3>🎁 가족 여행 준비물</h3>
<ul>
  <li>여벌 옷 및 세면도구</li>
  <li>부모님 비상 약품</li>
  <li>카메라 및 가벼운 간식</li>
</ul>`
                    },
                    {
                        id: 2,
                        title: "어버이날 가족 외식",
                        date: "2026-05-08",
                        content: `<h3>🌸 어버이날 기념 한정식 외식</h3>
<ul>
  <li>카네이션 및 편지 증정</li>
  <li>가족 사진 촬영</li>
</ul>`
                    }
                ],
                posts: [
                    {
                        date: "2026.05.08",
                        title: "어버이날 저녁 식사 🌸",
                        text: "편지와 카네이션을 드리고 함께 저녁을 먹었다.",
                        bg: ""
                    },
                    {
                        date: "2026.04.10",
                        title: "봄맞이 홈파티 🧹",
                        text: "청소 끝내고 짜장면을 먹은 편한 하루.",
                        bg: "https://picsum.photos/400/202"
                    }
                ],
                letters: [
                    { from: "엄마 ❤️", text: "우리 딸/아들, 항상 객지에서 고생이 많아. 밥은 굶지 말고 영양제 꼭 챙겨먹으렴. 늘 사랑하고 응원해!", favorite: false },
                    { from: "아빠 👨", text: "이번 주말에 엄마가 갈비찜 해둔다는데 시간되면 내려와라. 운전 조심하고 늘 건강해라.", favorite: false }
                ]
            },
            study: {
                name: "코딩 스터디",
                icon: "💻",
                ddayLabel: "스터디 시작한 지",
                ddayCount: 42,
                level: 2,
                levelName: "열정적인 새싹",
                progress: "45%",
                photo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80",
                photoTitle: "첫 오프라인 스터디 단체사진 💻",
                schedules: [
                    {
                        id: 1,
                        title: "해커톤 연합 대회 출격",
                        date: "2026-06-30",
                        content: `<h3>🚀 해커톤 대회 준비 타임라인</h3>
<ul>
  <li><strong>~D-3:</strong> 핵심 UI 기획 및 백엔드 CRUD API 개발 완료</li>
  <li><strong>~D-2:</strong> 프론트엔드-백엔드 연동 및 통합 디버깅</li>
  <li><strong>~D-1:</strong> AWS 서버 배포 완료 및 최종 데모 리허설</li>
  <li><strong>D-Day:</strong> 대회 당일 프레젠테이션 및 심사위원 질의응답</li>
</ul>
<br>
<h3>💻 개발 스택 & 도구</h3>
<ul>
  <li>Frontend: React / HTML5 / CSS3</li>
  <li>Backend: Spring Boot, MySQL</li>
  <li>DevOps: Docker, AWS EC2</li>
</ul>`
                    },
                    {
                        id: 2,
                        title: "프로젝트 1차 코드 리뷰",
                        date: "2026-07-15",
                        content: `<h3>🔍 코드 리뷰 과제</h3>
<ul>
  <li>Restful API 설계 규칙 확인</li>
  <li>예외 처리 공통 포맷 적용 검토</li>
</ul>`
                    }
                ],
                posts: [
                    {
                        date: "2026.06.22",
                        title: "알고리즘 스터디 3주차",
                        text: "BFS 문제를 풀고 코드 리뷰까지 마쳤다.",
                        bg: ""
                    },
                    {
                        date: "2026.06.18",
                        title: "깃허브 세팅 완료 🚀",
                        text: "프로젝트 저장소와 기본 빌드를 정리했다.",
                        bg: "https://picsum.photos/400/203"
                    }
                ],
                letters: [
                    { from: "방장 코더 💻", text: "팀원 여러분! 다음 달 해커톤 대상 가봅시다! 이번 주 개발 스프린트 과제 다들 깃허브 PR 올려주세요! 🔥", favorite: false },
                    { from: "데브옵스 🍀", text: "서버 배포 스크립트 도커 연동 끝냈습니다. 테스트 해보시고 문제 있으면 슬랙으로 편하게 제보해주세요!", favorite: false }
                ]
            }
        };
        const DATA_VERSION = '3';
        let groupsData = JSON.parse(localStorage.getItem('clov_groupsData'));
        if (!groupsData || localStorage.getItem('clov_dataVersion') !== DATA_VERSION) {
            groupsData = defaultGroupsData;
            localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
            localStorage.setItem('clov_dataVersion', DATA_VERSION);
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
            // 열 때 프로필 드롭다운은 자연스럽게 닫아줌
            document.getElementById('mb-drop').style.display = 'none';
            document.getElementById('dt-drop').style.display = 'none';
        }

        function closeModal(id) {
            document.getElementById(id).style.display = 'none';
        }

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

        function getMemoryDetailText(post, participant) {
            if (!post || !participant) return '';
            if (participant.fullText) return participant.fullText;
            if (participant.type === 'mine' && post.text) return post.text;
            return participant.text || post.text || '';
        }

        function getParticipantType(participant, index) {
            if (participant.type) return participant.type;
            if (index === 0 || participant.name === '나') return 'mine';
            if (index === 1) return 'friend';
            return 'group';
        }

        function normalizeMemoryPost(post) {
            const participants = (post.participants && post.participants.length > 0)
                ? post.participants
                : [{ name: '나', icon: '나', text: post.text || '' }];

            post.participants = participants.map((participant, index) => {
                const name = participant.name || participant.icon || `참여자${index + 1}`;
                return {
                    ...participant,
                    id: participant.id || `${name}-${index}`,
                    name,
                    icon: participant.icon || name.slice(0, 1),
                    type: getParticipantType(participant, index),
                    text: participant.text || ''
                };
            });

            if (!post.selectedParticipantId) {
                post.selectedParticipantId = post.participants[0].id;
            }
            return post;
        }

        function setFeedFilter(filterName) {
            activeFeedFilter = filterName;
            document.querySelectorAll('.feed-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.filter === filterName);
            });
            renderFeeds();
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

            const controls = [
                { key: 'all', count: posts.length },
                ...months
            ];
            const controlsHtml = controls.map(month => `
                <button class="feed-month-btn ${month.key === activeFeedMonth ? 'active' : ''}" onclick="setFeedMonth('${escapeHtml(month.key)}')">
                    <strong>${escapeHtml(formatFeedMonthLabel(month.key))}</strong>
                    <span>${month.count}개 추억</span>
                </button>
            `).join('');

            ['dt-feed-month-rail', 'mb-feed-month-rail'].forEach(id => {
                const zone = document.getElementById(id);
                if (zone) zone.innerHTML = controlsHtml;
            });

            const summaryText = `${formatFeedMonthLabel(activeFeedMonth)} · ${visibleCount}개`;
            ['dt-feed-month-summary', 'mb-feed-month-summary'].forEach(id => {
                const summary = document.getElementById(id);
                if (summary) summary.innerText = summaryText;
            });
        }

        function getSelectedParticipant(post) {
            const normalizedPost = normalizeMemoryPost(post);
            if (activeFeedFilter === 'mine') {
                return normalizedPost.participants.find(participant => participant.type === 'mine') || normalizedPost.participants[0];
            }
            if (activeFeedFilter === 'others') {
                return normalizedPost.participants.find(participant => participant.type !== 'mine') || normalizedPost.participants[0];
            }
            return normalizedPost.participants.find(participant => participant.id === normalizedPost.selectedParticipantId) || normalizedPost.participants[0];
        }

        function getMemoryHashtags(post, selectedParticipant) {
            const rawTags = post.tags || [];
            const legacyTags = rawTags.some(tag => String(tag).includes('명 기록') || String(tag).includes('장면') || String(tag).includes('장소'));
            if (rawTags.length > 0 && !legacyTags) {
                return rawTags;
            }

            const monthLabel = formatFeedMonthLabel(getPostMonthKey(post)).replace('.', '년') + '월';
            return [
                '#소중한순간',
                selectedParticipant.type === 'mine' ? '#내기록' : '#친구기록',
                `#${monthLabel}`
            ];
        }

        function setMemoryParticipant(postIndex, participantId) {
            const post = groupsData[activeGroup].posts[postIndex];
            if (!post) return;
            post.selectedParticipantId = participantId;
            setFeedFilter('all');
        }

        function getEvidenceIndex() {
            const posts = groupsData[activeGroup].posts || [];
            const savedIndex = activeEvidenceIndexes[activeGroup] || 0;
            return Math.min(Math.max(savedIndex, 0), Math.max(posts.length - 1, 0));
        }

        function setEvidenceIndex(index) {
            const posts = groupsData[activeGroup].posts || [];
            if (posts.length === 0) return;
            const previousIndex = getEvidenceIndex();
            const nextIndex = Math.min(Math.max(index, 0), posts.length - 1);
            evidenceSlideDirection = nextIndex > previousIndex ? 'past' : nextIndex < previousIndex ? 'current' : 'idle';
            activeEvidenceIndexes[activeGroup] = nextIndex;
            renderEvidenceViewers();
        }

        function moveEvidence(direction) {
            const currentIndex = getEvidenceIndex();
            setEvidenceIndex(currentIndex + direction);
        }

        function renderMemoryCard(post, postIndex) {
            const normalizedPost = normalizeMemoryPost(post);
            const selectedParticipant = getSelectedParticipant(normalizedPost);
            const styleBg = normalizedPost.bg ? `background-image: url('${escapeHtml(normalizedPost.bg)}');` : '';
            const authorLabel = selectedParticipant.type === 'mine' ? '내 기록' : `${selectedParticipant.name}의 기록`;
            const detailParticipantId = encodeURIComponent(selectedParticipant.id);
            const imageContent = normalizedPost.bg
                ? ''
                : `<span class="memory-clover-placeholder">🍀</span><span class="memory-image-text">사진이 없는 추억은<br>클로버로 보관됩니다</span>`;

            const presenceTiles = normalizedPost.participants.map(participant => `
                <button class="presence-tile ${escapeHtml(participant.type)} ${participant.id === selectedParticipant.id ? 'active' : ''}" onclick="event.stopPropagation(); setMemoryParticipant(${postIndex}, '${escapeHtml(participant.id)}')">
                    <span class="presence-dot">${escapeHtml(participant.icon || participant.name.slice(0, 1))}</span>
                    <span class="presence-name-label">${escapeHtml(participant.name)}</span>
                </button>
            `).join('');

            const tags = getMemoryHashtags(normalizedPost, selectedParticipant);
            const tagsHtml = `
                <div class="memory-footer-tags">
                    ${tags.map((tag, index) => `<div class="memory-tag ${index === 0 ? 'highlight' : ''}">${escapeHtml(tag)}</div>`).join('')}
                </div>
            `;

            return `
                <div class="memory-card polaroid-card ${escapeHtml(selectedParticipant.type)}">
                    <div class="polaroid-photo${normalizedPost.bg ? '' : ' is-empty'}" style="${styleBg}">
                        <span class="author-badge">${escapeHtml(authorLabel)}</span>
                        ${imageContent}
                    </div>
                    <div class="polaroid-caption">
                        <div class="polaroid-presence-row">
                            ${presenceTiles}
                        </div>
                        <div class="memory-meta-row">
                            <span class="memory-date">${escapeHtml(normalizedPost.date)}</span>
                            ${normalizedPost.subtitle ? `<span class="memory-subtitle">${escapeHtml(normalizedPost.subtitle)}</span>` : ''}
                        </div>
                        <div class="memory-title">${escapeHtml(normalizedPost.title)}</div>
                        <div class="my-record-box ${escapeHtml(selectedParticipant.type)}">
                            <div class="my-record-header">
                                <div class="my-record-title">${escapeHtml(authorLabel)}</div>
                                <button type="button" class="record-more-btn" onclick="event.stopPropagation(); openMemoryDetail(${postIndex}, '${detailParticipantId}')">···더보기</button>
                            </div>
                            <div class="my-record-text">${escapeHtml(getMemoryDetailText(normalizedPost, selectedParticipant))}</div>
                        </div>
                        ${tagsHtml}
                    </div>
                </div>
            `;
        }

        function openMemoryDetail(postIndex, encodedParticipantId) {
            const isDarkMode = document.documentElement.classList.contains('dark-mode');
            window.location.href = `memory_detail.html?groupId=${activeGroup}&postId=${postIndex}&participantId=${encodedParticipantId}&theme=${isDarkMode ? 'dark' : 'light'}`;
        }

        function closeMemoryDetail() {
            const sheet = document.getElementById('memory-detail-sheet');
            const backdrop = document.getElementById('memory-detail-backdrop');
            if (!sheet || !backdrop) return;

            backdrop.classList.remove('open');
            sheet.classList.remove('open');
            sheet.setAttribute('aria-hidden', 'true');
        }

        const chevronLeftSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 6 9 12 15 18"></polyline></svg>`;
        const chevronRightSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>`;

        function renderEvidenceViewer(viewType) {
            const posts = groupsData[activeGroup].posts || [];
            if (posts.length === 0) {
                return `
                    <div class="memory-evidence-viewer">
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
            const currentPost = posts[currentIndex];
            const isLatest = currentIndex === 0;
            const isOldest = currentIndex === posts.length - 1;
            const timeLabel = isLatest ? '현재 근황' : `${currentIndex + 1}번째 과거 기록`;
            const timeline = posts.map((post, index) => `
                <button class="evidence-dot ${index === currentIndex ? 'active' : ''}" onclick="setEvidenceIndex(${index})">
                    <strong>${index === 0 ? '현재' : '과거'}</strong>
                    <span>${escapeHtml(post.date || '')}</span>
                </button>
            `).join('');

            const total = posts.length;

            // 팬 슬롯: 왼쪽=더 오래된 게시글(+1), 가운데=현재(0), 오른쪽=더 최근(-1)
            const fanDefs = [
                { delta: +1, cls: 'fan-left' },
                { delta:  0, cls: 'fan-center' },
                { delta: -1, cls: 'fan-right' },
            ];

            const cards = fanDefs.map(({ delta, cls }) => {
                const postIdx = currentIndex + delta;
                if (postIdx < 0 || postIdx >= total) return '';
                const isActive = delta === 0;
                return `
                    <div class="polaroid-fan-slot ${cls}${isActive ? ' is-active' : ''}"
                         ${!isActive ? `onclick="event.stopPropagation(); setEvidenceIndex(${postIdx})"` : ''}>
                        ${renderMemoryCard(posts[postIdx], postIdx)}
                    </div>`;
            }).join('');

            return `
                <div class="memory-evidence-viewer ${viewType === 'mobile' ? 'mobile-evidence' : 'desktop-evidence'}">
                    <div class="evidence-status-bar">
                        <span class="evidence-time-label">${escapeHtml(timeLabel)}</span>
                        <span class="evidence-counter">${currentIndex + 1} / ${total}</span>
                    </div>
                    <div class="polaroid-fan evidence-slide-${evidenceSlideDirection}">
                        ${cards}
                    </div>
                    <div class="evidence-nav-row">
                        <button class="evidence-nav-sm" onclick="moveEvidence(1)" ${isOldest ? 'disabled' : ''}>
                            ${chevronLeftSvg} 과거
                        </button>
                        <div class="evidence-timeline">${timeline}</div>
                        <button class="evidence-nav-sm" onclick="moveEvidence(-1)" ${isLatest ? 'disabled' : ''}>
                            현재 ${chevronRightSvg}
                        </button>
                    </div>
                </div>
            `;
        }

        function renderEvidenceViewers() {
            const dtZone = document.getElementById('dt-space-memory-zone');
            const mbZone = document.getElementById('mb-space-memory-zone');
            if (dtZone) dtZone.innerHTML = renderEvidenceViewer('desktop');
            if (mbZone) mbZone.innerHTML = renderEvidenceViewer('mobile');
        }

        // 4. 피드 리스트 동적 렌더링 함수
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
                    if (activeFeedFilter === 'others') {
                        return normalizedPost.participants.some(participant => participant.type !== 'mine');
                    }
                    return true;
                });
            const htmlContent = filteredPosts.length > 0
                ? filteredPosts
                    .map(post => renderMemoryCard(post, currentPosts.indexOf(post)))
                    .join('')
                : `<div class="feed-empty-state">선택한 조건에 맞는 추억이 아직 없습니다.<br>새 추억을 남기면 이 월별 보관함에 바로 정리됩니다.</div>`;

            zones.forEach(zone => {
                if (zone) zone.innerHTML = htmlContent;
            });

            renderFeedMonthControls(currentPosts, filteredPosts.length);
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

        function getRecordPreviewText(value, maxLength = 16) {
            const cleanText = String(value || '').replace(/\s+/g, ' ').trim();
            if (cleanText.length <= maxLength) return cleanText;
            return `${cleanText.slice(0, maxLength - 1)}…`;
        }

        // 5. 기획서 CRUD 명세 구현 (새 글 추가 함수 - 모바일)
        function addNewPost() {
            const titleInput = document.getElementById('post-title');
            const contentInput = document.getElementById('post-content');

            if (!titleInput.value || !contentInput.value) {
                alert('제목과 내용을 모두 작성해주세요.');
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

            // 입력 필드 초기화 및 팝업 닫기
            titleInput.value = '';
            contentInput.value = '';
            resetPostModal('mb');
            closeModal('mb-post-modal');

            // 리렌더링 후 완료 알림
            setFeedFilter('all');
              alert('🎉 새 추억 피드가 성공적으로 등록되었습니다!');
              if(typeof addUnreadNotification === 'function') addUnreadNotification('✨ 새로운 추억', '친구가 새로운 추억 피드를 남겼어요!');
          }

        // 5-2. 기획서 CRUD 명세 구현 (새 글 추가 함수 - 데스크톱)
        function addNewDesktopPost() {
            const titleInput = document.getElementById('dt-post-title');
            const contentInput = document.getElementById('dt-post-content');

            if (!titleInput.value || !contentInput.value) {
                alert('제목과 내용을 모두 작성해주세요.');
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

            // 입력 필드 초기화 및 팝업 닫기
            titleInput.value = '';
            contentInput.value = '';
            resetPostModal('dt');
            closeModal('dt-post-modal');

            // 리렌더링 후 완료 알림
            setFeedFilter('all');
            alert('🎉 새 추억 피드가 성공적으로 등록되었습니다!');
            
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

        // 6. 친구 코드 연동 기능 시뮬레이션 - 모바일
        function connectFriend() {
            const code = document.getElementById('partner-code').value;
            if (!code.trim()) {
                alert('상대방의 초대 코드를 입력해주세요!');
                return;
            }
            // 디데이 날짜 변경 시뮬레이션 효과
            groupsData[activeGroup].ddayCount = 1;
            animateDdayCount(1, 900);
            closeModal('mb-invite-modal');
            alert(`🤝 [${code}] 파트너와 성공적으로 1:1 연동이 완료되어 오늘부터 디데이를 시작합니다!`);
        }

        // 6-2. 친구 코드 연동 기능 시뮬레이션 - 데스크톱
        function connectDesktopFriend() {
            const code = document.getElementById('dt-partner-code').value;
            if (!code.trim()) {
                alert('상대방의 초대 코드를 입력해주세요!');
                return;
            }
            // 디데이 날짜 변경 시뮬레이션 효과
            groupsData[activeGroup].ddayCount = 1;
            animateDdayCount(1, 900);
            closeModal('dt-invite-modal');
            alert(`🤝 [${code}] 파트너와 성공적으로 1:1 연동이 완료되어 오늘부터 디데이를 시작합니다!`);
        }

        // 7. 우정 레벨 및 클로버 비주얼 인터랙션 제어
        let friendshipLevel = 3;

        const levelIcons = {
            1: "🌱",
            2: "🌿",
            3: "💚",
            4: "🍀",
            5: "✨"
        };

        function updateFriendshipUI() {
            const levelNames = {
                1: "새싹 클로버",
                2: "성장기 클로버",
                3: "초록 클로버",
                4: "희망의 클로버",
                5: "행운의 네잎클로버"
            };
            const levelIcon = levelIcons[friendshipLevel] || "🍀";
            const levelText = `${levelIcon} 우정 Lv.${friendshipLevel} ${levelNames[friendshipLevel] || "클로버"}`;

            
            ['dt', 'mb'].forEach(p => {
                const elIcon = document.getElementById(p + '-lvIcon');
                const elName = document.getElementById(p + '-lvName');
                if(elIcon) elIcon.innerText = 'Lv.' + friendshipLevel;
                if(elName) elName.innerText = levelNames[friendshipLevel] || "클로버 우정";
            });

            

            // 레벨별 색상 테마 전환 (대시보드 카드 전체에 컬러가 진화하듯 반영)
            const dtDashboard = document.getElementById('dt-dashboard');
            const mbDashboard = document.getElementById('mb-dashboard');
            if (dtDashboard) dtDashboard.dataset.level = friendshipLevel;
            if (mbDashboard) mbDashboard.dataset.level = friendshipLevel;

            const progressPercentages = {
                1: "20%",
                2: "45%",
                3: "65%",
                4: "85%",
                5: "100%"
            };
            const fillWidth = progressPercentages[friendshipLevel] || "65%";
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

            renderGroundGrowth('dt-ground-growth');
            renderGroundGrowth('mb-ground-growth');
        }

        // 레벨업 순간 대시보드 카드에 충격파 펄스 애니메이션을 재생
        function triggerLevelPulse() {
            ['dt-dashboard', 'mb-dashboard'].forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                el.classList.remove('levelup-pulse');
                void el.offsetWidth; // 강제 리플로우로 애니메이션 재실행 보장
                el.classList.add('levelup-pulse');
            });
        }

        function levelUp() {
            friendshipLevel = (friendshipLevel % 5) + 1; // 1 ~ 5 순환
            groupsData[activeGroup].level = friendshipLevel; // 현재 그룹의 레벨 상태에 저장
            updateFriendshipUI();
            triggerLevelPulse();
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
            if (dtTitle) dtTitle.innerText = currentGroup.photoTitle;
            if (mbTitle) mbTitle.innerText = currentGroup.photoTitle;
        }

        function savePhotoTitle(viewType) {
            const id = viewType === 'dt' ? 'dt-photo-title' : 'mb-photo-title';
            const el = document.getElementById(id);
            if (el) {
                const newTitle = el.innerText.trim();
                if (newTitle !== "") {
                    groupsData[activeGroup].photoTitle = newTitle;
                    // 동기화 (데스크톱과 모바일 양쪽 화면의 제목을 동일하게 유지)
                    const otherId = viewType === 'dt' ? 'mb-photo-title' : 'dt-photo-title';
                    const otherEl = document.getElementById(otherId);
                    if (otherEl) otherEl.innerText = newTitle;
                } else {
                    // 빈 값이면 기존 저장된 값으로 복원
                    el.innerText = groupsData[activeGroup].photoTitle;
                }
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
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        tempPhotoDataUrl = evt.target.result;
                        dropZone.style.display = 'none';
                        previewContainer.style.display = 'block';
                        previewImage.src = tempPhotoDataUrl;
                    };
                    reader.readAsDataURL(file);
                }
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

        function openScheduleModal(viewType, scheduleId) {
            if (scheduleId !== undefined && scheduleId !== null) {
                window.location.href = `schedule_detail.html?action=edit&groupId=${activeGroup}&id=${scheduleId}&theme=${isDarkMode ? 'dark' : 'light'}`;
            } else {
                window.location.href = `schedule_detail.html?action=create&groupId=${activeGroup}&theme=${isDarkMode ? 'dark' : 'light'}`;
            }
        }

        // 빠른 선택 칩: 캘린더를 펼쳐보지 않고도 몇 주/몇 개월 뒤로 D-day를 바로 맞출 수 있게 함
        function applyDatePreset(viewType, daysFromToday) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const dateInput = document.getElementById(`${prefix}-input-schedule-date`);
            if (!dateInput) return;

            const target = new Date();
            target.setDate(target.getDate() + daysFromToday);

            const yyyy = target.getFullYear();
            const mm = String(target.getMonth() + 1).padStart(2, '0');
            const dd = String(target.getDate()).padStart(2, '0');
            dateInput.value = `${yyyy}-${mm}-${dd}`;
        }

        function saveSchedule(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const titleInput = document.getElementById(`${prefix}-input-schedule-title`);
            const dateInput = document.getElementById(`${prefix}-input-schedule-date`);
            const idInput = document.getElementById(`${prefix}-input-schedule-id`);

            if (titleInput && dateInput) {
                const newTitle = titleInput.value.trim();
                const newDate = dateInput.value;

                if (!newTitle || !newDate) {
                    alert("일정 제목과 날짜를 입력해주세요.");
                    return;
                }

                const schId = idInput ? idInput.value : "";

                if (schId) {
                    // 수정 모드
                    const sch = groupsData[activeGroup].schedules.find(s => s.id == schId);
                    if (sch) {
                        sch.title = newTitle;
                        sch.date = newDate;
                    }
                } else {
                    // 추가 모드
                    const schedules = groupsData[activeGroup].schedules || [];
                    const maxId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) : 0;
                    const newSch = {
                        id: maxId + 1,
                        title: newTitle,
                        date: newDate,
                        content: `<h3>📝 ${newTitle} 메모</h3>\n<p>이곳을 클릭해 약속에 대한 메모를 남겨보세요.</p>`
                    };
                    schedules.push(newSch);
                    // 새로 만든 약속을 바로 스포트라이트로 펼쳐서 보여줌
                    selectedScheduleIds[activeGroup] = newSch.id;
                }

                updateScheduleUI();
                closeModal(`${prefix}-schedule-modal`);
                alert("🍀 D-day가 정상적으로 반영되었습니다!");
            }
        }

        function deleteSchedule(scheduleId) {
            if (!confirm("정말 이 약속을 삭제하시겠습니까?")) return;
            const schedules = groupsData[activeGroup].schedules || [];
            groupsData[activeGroup].schedules = schedules.filter(s => s.id !== scheduleId);

            if (selectedScheduleIds[activeGroup] === scheduleId) {
                selectedScheduleIds[activeGroup] = null;
            }

            updateScheduleUI();
            alert("🗑️ 일정이 성공적으로 삭제되었습니다.");
        }

        function updateScheduleUI() {
            const currentGroup = groupsData[activeGroup];
            const closest = getClosestSchedule();

            // 데스크톱 배너 업데이트
            const dtTitle = document.getElementById('dt-schedule-title');
            const dtDate = document.getElementById('dt-schedule-date');
            const dtDday = document.getElementById('dt-schedule-dday');

            // 모바일 배너 업데이트
            const mbTitle = document.getElementById('mb-schedule-title');
            const mbDate = document.getElementById('mb-schedule-date');
            const mbDday = document.getElementById('mb-schedule-dday');

            if (closest) {
                const ddayText = calculateDday(closest.date);
                const formattedDate = closest.date.replace(/-/g, '.');

                if (dtTitle) dtTitle.innerText = closest.title;
                if (dtDate) dtDate.innerText = formattedDate;
                if (dtDday) dtDday.innerText = ddayText;

                if (mbTitle) mbTitle.innerText = closest.title;
                if (mbDate) mbDate.innerText = formattedDate;
                if (mbDday) mbDday.innerText = ddayText;
            } else {
                const noScheduleMsg = "등록된 일정이 없습니다.";
                if (dtTitle) dtTitle.innerText = noScheduleMsg;
                if (dtDate) dtDate.innerText = "";
                if (dtDday) dtDday.innerText = "D-Day";

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
                { key: 'seed', icon: '🌱', name: '약속 씨앗', date: addDaysToDate(schedule.date, -14), description: '약속을 처음 심은 단계' },
                { key: 'sprout', icon: '🌿', name: 'D-day 새싹', date: addDaysToDate(schedule.date, -7), description: '기대감이 자라는 단계' },
                { key: 'clover', icon: '🍀', name: '만남 클로버', date: schedule.date, description: '함께 만나는 날' },
                { key: 'bloom', icon: '📸', name: '추억 꽃', date: addDaysToDate(schedule.date, 1), description: '추억 피드로 남길 단계' }
            ];
        }

        function getGrowthStageState(stage, activeIndex, index) {
            const diffDays = getDdayDiffDays(stage.date);
            if (index < activeIndex || diffDays < 0) return 'complete';
            if (index === activeIndex) return 'active';
            return 'future';
        }

        function getGrowthActiveIndex(stages) {
            const nextIndex = stages.findIndex(stage => getDdayDiffDays(stage.date) >= 0);
            return nextIndex === -1 ? stages.length - 1 : nextIndex;
        }

        function getVisibleSchedulesByDensity(sortedSchedules) {
            const futureFirst = [...sortedSchedules].sort((a, b) => {
                const aDiff = Math.abs(getDdayDiffDays(a.date));
                const bDiff = Math.abs(getDdayDiffDays(b.date));
                return aDiff - bDiff;
            });
            if (activeScheduleDensity === 'compact') return futureFirst.slice(0, 3);
            if (activeScheduleDensity === 'standard') return futureFirst.slice(0, 6);
            return sortedSchedules;
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
                zone.innerHTML = `<div class="spotlight-empty">🍀 아직 함께 세어볼 D-day가 없어요.<br>상단의 추가 버튼을 눌러 첫 약속을 만들어보세요!</div>`;
                return;
            }

            const sortedSchedules = [...schedules].sort((a, b) => new Date(a.date) - new Date(b.date));

            // 선택된 일정이 없거나(최초 진입) 삭제되어 더 이상 없다면 가장 가까운 일정을 기본으로 펼쳐 보여줌
            let selectedId = selectedScheduleIds[activeGroup];
            if (!selectedId || !sortedSchedules.some(s => s.id === selectedId)) {
                const closest = getClosestSchedule();
                selectedId = closest ? closest.id : sortedSchedules[0].id;
                selectedScheduleIds[activeGroup] = selectedId;
            }
            const selectedSchedule = sortedSchedules.find(s => s.id === selectedId) || sortedSchedules[0];

            const visibleSchedules = getVisibleSchedulesByDensity(sortedSchedules);
            const densityLabels = {
                compact: '핵심 약속',
                standard: '주간 약속',
                detailed: '전체 약속'
            };

            const cards = visibleSchedules.map((sch, index) => {
                const stages = buildGrowthStages(sch);
                const activeIndex = getGrowthActiveIndex(stages);
                const completeCount = stages.filter((stage, stageIndex) => getGrowthStageState(stage, activeIndex, stageIndex) === 'complete').length;
                const progress = Math.max(12, Math.round((completeCount / stages.length) * 100));
                const diffDays = getDdayDiffDays(sch.date);
                const { accent, glow } = getDdayAccent(diffDays);
                const ddayText = calculateDday(sch.date);
                const activeStage = stages[activeIndex] || stages[stages.length - 1];
                const isSelected = sch.id === selectedSchedule.id;
                const isComplete = activeIndex === stages.length - 1 && getDdayDiffDays(stages[stages.length - 1].date) < 0;
                const isLocked = index > 0 && getDdayDiffDays(visibleSchedules[index - 1].date) >= 0 && activeScheduleDensity === 'detailed';
                const stageHtml = stages.map((stage, stageIndex) => {
                    const state = getGrowthStageState(stage, activeIndex, stageIndex);
                    return `
                        <div class="growth-stage ${state}">
                            <span class="growth-stage-dot">${state === 'complete' ? '✓' : stage.icon}</span>
                            <span class="growth-stage-name">${escapeHtml(stage.name)}</span>
                        </div>
                    `;
                }).join('');

                return `
                    <article class="growth-card ${isSelected ? 'is-selected' : ''} ${isComplete ? 'is-complete' : ''} ${isLocked ? 'is-locked' : ''}" style="--growth-accent:${accent}; --growth-glow:${glow}; --growth-progress:${progress}%;" onclick="selectScheduleChip('${viewType}', ${sch.id})">
                        <div class="growth-card-header">
                            <div>
                                <div class="growth-card-title">${escapeHtml(sch.title)}</div>
                                <div class="growth-card-date">${escapeHtml(formatFriendlyDate(sch.date))}</div>
                            </div>
                            <span class="growth-dday-pill">${escapeHtml(ddayText)}</span>
                        </div>
                        <div class="growth-stage-track">${stageHtml}</div>
                        <div class="growth-progress"><span></span></div>
                        <div class="growth-status-line">
                            <span>${isLocked ? '이전 약속을 먼저 지나가면 열려요' : '약속이 추억으로 자라는 중'}</span>
                            <span class="growth-next">${escapeHtml(activeStage.name)} · ${escapeHtml(activeStage.description)}</span>
                        </div>
                    </article>
                `;
            }).join('');

            const diffDays = getDdayDiffDays(selectedSchedule.date);
            const { accent, glow } = getDdayAccent(diffDays);
            const ddayText = calculateDday(selectedSchedule.date);
            const friendlyDate = formatFriendlyDate(selectedSchedule.date);
            const ddayPhrase = diffDays < 0 ? '함께 보낸 그날로부터' : diffDays === 0 ? '바로 오늘, 약속의 날!' : '함께할 그날까지';

            zone.innerHTML = `
                <section class="growth-shell">
                    <div class="pull-handle-trigger" onclick="toggleScheduleSidebar('${viewType}')"></div>
                    <div class="growth-detail" style="--chip-accent:${accent}; --chip-glow:${glow};">
                        <div class="spotlight-actions">
                            <button onclick="openScheduleModal('${viewType}', ${selectedSchedule.id})">⚙️ 수정</button>
                            <button class="danger" onclick="deleteSchedule(${selectedSchedule.id})">🗑️ 삭제</button>
                        </div>
                        <div class="spotlight-label">${escapeHtml(ddayPhrase)}</div>
                        <div class="spotlight-dday">${escapeHtml(ddayText)}</div>
                        <div class="spotlight-title">${escapeHtml(selectedSchedule.title)}</div>
                        <div class="spotlight-date">${escapeHtml(friendlyDate)}</div>
                        <div class="spotlight-note" contenteditable="true"
                             id="${prefix}-schedule-content-${selectedSchedule.id}"
                             onblur="saveScheduleContent('${viewType}', ${selectedSchedule.id})"
                             placeholder="이곳을 클릭해 약속에 대한 메모를 남겨보세요.">${selectedSchedule.content || ''}</div>
                        <div class="journey-lock-note">이 약속이 지나면 추억 피드에 기록 후보로 이어지는 흐름을 우선 검증합니다.</div>
                    </div>
                    <div class="growth-hero">
                        <div>
                            <span class="growth-kicker">CLOVER GROWTH PATH</span>
                            <span class="growth-title">${escapeHtml(densityLabels[activeScheduleDensity])}이 자라는 길</span>
                            <span class="growth-subtitle">약속 씨앗이 D-day 새싹을 지나 만남 클로버가 되고, 다음 날 추억 꽃으로 피어납니다.</span>
                        </div>
                        <div class="growth-density" aria-label="일정 표시 밀도">
                            <button class="${activeScheduleDensity === 'compact' ? 'active' : ''}" onclick="setScheduleDensity('compact')">3 핵심</button>
                            <button class="${activeScheduleDensity === 'standard' ? 'active' : ''}" onclick="setScheduleDensity('standard')">6 주간</button>
                            <button class="${activeScheduleDensity === 'detailed' ? 'active' : ''}" onclick="setScheduleDensity('detailed')">전체</button>
                        </div>
                    </div>
                    <div class="growth-card-list">${cards}</div>
                </section>
            `;
        }

        // 일정 세부 기입 내용 저장 및 양방향 실시간 동기화
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

        // 레벨이 오를수록 맨땅이었던 지면에 클로버가 하나둘 빽빽하게 자라나도록 채워주는 함수 (잡초 X, 전부 클로버)
        function renderGroundGrowth(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';

            // 레벨이 오를수록 클로버 개수가 훨씬 더 가파르게 늘어나서 들판이 무성해짐
            const cloverCount = friendshipLevel * 6; // 6 ~ 30개
            // 레벨이 높을수록 클로버 한 포기 자체도 더 크고 무성하게 자람
            const baseScale = 0.7 + friendshipLevel * 0.12;

            for (let i = 0; i < cloverCount; i++) {
                const sprout = document.createElement('span');
                sprout.className = 'ground-sprout';
                sprout.innerText = '🍀';

                const leftRandom = 2 + Math.random() * 96; // 지면 가로 전체에 고루 분포
                const bottomRandom = Math.random() * 18; // 지면 능선 부근에 뿌리내린 듯 배치
                const scale = baseScale + Math.random() * 0.4;
                const swayDuration = 3 + Math.random() * 2;
                const swayDelay = Math.random() * 2;
                const growDelay = Math.random() * 0.9;

                sprout.style.left = `${leftRandom}%`;
                sprout.style.bottom = `${bottomRandom}%`;
                sprout.style.fontSize = `${13 * scale}px`;
                sprout.style.zIndex = String(Math.round(bottomRandom));
                sprout.style.animation = `sproutGrow 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) ${growDelay}s backwards, sproutSway ${swayDuration}s ease-in-out ${swayDelay}s infinite`;

                container.appendChild(sprout);
            }
        }

        // 8. 그룹 변경 기능 실행 로직
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
            document.getElementById('dt-dday-label').innerText = currentGroup.ddayLabel;
            document.getElementById('mb-dday-label').innerText = currentGroup.ddayLabel;
            animateDdayCount(currentGroup.ddayCount);

            // UI 일괄 업데이트 (레벨 배지, 게이지 바, 클로버 재생성)
            updateFriendshipUI();
            renderFeeds();
            renderLetters();

            // 로고 변경 시뮬레이션
            document.querySelectorAll('.logo').forEach(logo => {
                logo.innerHTML = `${currentGroup.icon} ${currentGroup.name}`;
            });

            alert(`👥 [${currentGroup.icon} ${currentGroup.name}] 그룹으로 성공적으로 전환되었습니다.`);
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

        // 행운 편지 즐겨찾기 필터 상태 ('all' | 'favorite')
        let activeLetterFilter = 'all';

        // 편지함 동적 렌더링 (즐겨찾기 토글 및 필터링 기능 추가)
        function renderLetters() {
            // write 탭이면 편지 목록 렌더링 안 함
            if (activeLetterFilter === 'write') return;

            const currentGroup = groupsData[activeGroup];
            const mbZone = document.getElementById('mb-letter-zone');
            const dtZone = document.getElementById('dt-letter-zone');
            const dtWriteZone = document.getElementById('dt-letter-write-zone');
            const mbWriteZone = document.getElementById('mb-letter-write-zone');

            // 편지 목록 zone 표시 복원, 작성 zone 숨김
            if (dtZone) dtZone.style.display = 'grid';
            if (mbZone) mbZone.style.display = 'block';
            if (dtWriteZone) dtWriteZone.style.display = 'none';
            if (mbWriteZone) mbWriteZone.style.display = 'none';

            let mbHtml = '';
            let dtHtml = '';

            currentGroup.letters.forEach((letter, index) => {
                if (activeLetterFilter === 'favorite' && !letter.favorite) return;
                const activeClass = letter.favorite ? '' : 'inactive';
                const itemHtml = `
                    <div class="letter-item" style="cursor: pointer;" onclick="openLetterDetailModal(${index})">
                        <button class="letter-favorite-btn ${activeClass}" onclick="event.stopPropagation(); toggleLetterFavorite(${index})" title="즐겨찾기 토글">
                            ⭐
                        </button>
                        <strong>To. ${letter.to || '전체'}</strong><br>
                        <strong>From. ${letter.from}</strong><br>
                        "${letter.text}"
                    </div>
                `;
                mbHtml += itemHtml;
                dtHtml += itemHtml;
            });

            const noLettersMsg = '<p style="font-size:15px; color:var(--text-muted); font-weight:500; text-align:center; padding: 30px 0;">💌 아직 편지가 없어요. 첫 번째 행운 편지를 남겨봐요!</p>';

            if (mbZone) mbZone.innerHTML = mbHtml || noLettersMsg;
            if (dtZone) dtZone.innerHTML = dtHtml || noLettersMsg;
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

        let activeLetterRecipient = { dt: "모두에게", mb: "모두에게" };

        function selectRecipient(prefix, chipElement) {
            document.querySelectorAll(`#${prefix}-recipient-selector .recipient-chip`).forEach(c => c.classList.remove('active'));
            chipElement.classList.add('active');
            activeLetterRecipient[prefix] = chipElement.getAttribute('data-recipient');
        }

        function submitInlineLetter(prefix) {
            const textEl = document.getElementById(`${prefix}-letter-text`);
            if (!textEl) return;
            const text = textEl.value.trim();
            if (!text) {
                alert("편지 내용을 입력해주세요.");
                return;
            }

            const currentGroup = groupsData[activeGroup];
            if (!currentGroup.letters) currentGroup.letters = [];

            currentGroup.letters.unshift({
                to: activeLetterRecipient[prefix],
                from: "나 🍀",
                text: text,
                favorite: false,
                isMine: true
            });

            localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
            
            textEl.value = '';
            setLetterFilter('all');
            alert("따뜻한 마음이 성공적으로 전달되었습니다! 💌");
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
                if (dtLetterZone) dtLetterZone.style.display = 'grid';
                if (mbLetterZone) mbLetterZone.style.display = 'block';
                renderLetters();
            } else if (filterType === 'favorite') {
                if (dtFavBtn) dtFavBtn.classList.add('active');
                if (mbFavBtn) mbFavBtn.classList.add('active');
                if (dtLetterZone) dtLetterZone.style.display = 'grid';
                if (mbLetterZone) mbLetterZone.style.display = 'block';
                renderLetters();
            } else if (filterType === 'write') {
                if (dtWriteBtn) dtWriteBtn.classList.add('active');
                if (mbWriteBtn) mbWriteBtn.classList.add('active');
                if (dtWriteZone) dtWriteZone.style.display = 'block';
                if (mbWriteZone) mbWriteZone.style.display = 'block';
            }
        }

        // 모두에게 보내기 토글 (버튼 방식)
        function toggleLetterToAllBtn(prefix) {
            const btn = document.getElementById(`${prefix}-letter-to-all-btn`);
            const input = document.getElementById(`${prefix}-letter-to`);
            if (btn && input) {
                const isActive = btn.classList.contains('active-pill');
                if (isActive) {
                    btn.classList.remove('active-pill');
                    btn.style.background = 'var(--nav-item-bg-active)';
                    btn.style.color = 'var(--primary-green)';
                    input.value = '';
                    input.disabled = false;
                } else {
                    btn.classList.add('active-pill');
                    btn.style.background = 'var(--primary-green)';
                    btn.style.color = '#fff';
                    input.value = '모두';
                    input.disabled = true;
                }
                updateLetterPreview(prefix);
            }
        }

        // 이모지 칩 선택
        function selectLetterEmoji(btn, viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const modal = document.getElementById(`${prefix}-letter-modal`);
            if (modal) {
                modal.querySelectorAll('.letter-emoji-chip').forEach(c => c.classList.remove('active'));
            }
            btn.classList.add('active');
            selectedLetterEmoji[prefix] = btn.dataset.emoji;
            updateLetterPreview(prefix);
        }

        // 편지 미리보기 업데이트
        function updateLetterPreview(prefix) {
            const toVal = (document.getElementById(`${prefix}-letter-to`)?.value || '').trim();
            const fromVal = (document.getElementById(`${prefix}-letter-from`)?.value || '').trim();
            const contentVal = (document.getElementById(`${prefix}-letter-content`)?.value || '').trim();
            const previewEl = document.getElementById(`${prefix}-letter-preview`);
            const previewContent = document.getElementById(`${prefix}-letter-preview-content`);

            if (!contentVal) {
                if (previewEl) previewEl.style.display = 'none';
                return;
            }

            const emoji = selectedLetterEmoji[prefix] || '💌';
            const toDisplay = toVal || '모두';
            const fromDisplay = fromVal || '익명';

            if (previewContent) {
                previewContent.innerHTML = `<strong>To. ${toDisplay}</strong><br><strong>From. ${fromDisplay} ${emoji}</strong><br>"${contentVal}"`;
            }
            if (previewEl) {
                previewEl.style.display = 'block';
            }
        }

        // 편지 제출 (데이터에 추가 + 리렌더링)
        function submitLetter(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const toVal = (document.getElementById(`${prefix}-letter-to`)?.value || '').trim();
            const fromVal = (document.getElementById(`${prefix}-letter-from`)?.value || '').trim();
            const contentVal = (document.getElementById(`${prefix}-letter-content`)?.value || '').trim();

            if (!contentVal) {
                alert('편지 내용을 작성해주세요! ✍️');
                return;
            }

            const emoji = selectedLetterEmoji[prefix] || '💌';
            const toDisplay = toVal || '모두';
            const fromDisplay = fromVal ? `${fromVal} ${emoji}` : `익명 ${emoji}`;

            // 현재 그룹의 letters 배열에 추가
            const currentGroup = groupsData[activeGroup];
            if (!currentGroup.letters) {
                currentGroup.letters = [];
            }

            currentGroup.letters.unshift({
                to: toDisplay,
                from: fromDisplay,
                text: contentVal,
                favorite: false,
                isMine: true
            });

            // 모달 닫기
            closeModal(`${prefix}-letter-modal`);

            // 편지함 리렌더링
            renderLetters();

            // 성공 알림
            alert(`${emoji} 행운편지가 성공적으로 보내졌습니다!`);
            
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
            window.location.href = `letter_detail.html?groupId=${activeGroup}&index=${index}&theme=${isDarkMode ? 'dark' : 'light'}`;
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
        window.addEventListener('DOMContentLoaded', () => {
            const icons = document.querySelectorAll('.dt-dark-btn .toggle-icon, .mb-dark-btn .toggle-icon');
            icons.forEach(icon => {
                icon.innerText = isDarkMode ? '🌙' : '☀️';
            });
        });
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

        function toggleDarkMode() {
            isDarkMode = !isDarkMode;
            localStorage.setItem('clov_darkMode', isDarkMode);

            const icons = document.querySelectorAll('.dt-dark-btn .toggle-icon, .mb-dark-btn .toggle-icon');

            icons.forEach(icon => {
                icon.classList.remove('slide-animation');
                void icon.offsetWidth; // 리플로우 강제 유발 (애니메이션 재시작)
                icon.classList.add('slide-animation');
            });

            // 아이콘이 화면 밖으로 사라지는 타이밍(약 200ms)에 텍스트 교체
            setTimeout(() => {
                icons.forEach(icon => {
                    icon.innerText = isDarkMode ? '🌙' : '☀️';
                });
            }, 200);

            if (isDarkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            updateGroupModalUI(); // 버튼들에 다크모드 변수 테마 강제 리프레시
        }

        // 화면 밖 클릭 시 드롭다운 닫기 및 모달 바깥 클릭 시 닫기 이벤트 핸들러
        window.onclick = function (event) {
            if (!event.target.matches('.profile-btn')) {
                document.getElementById('mb-drop').style.display = 'none';
                document.getElementById('dt-drop').style.display = 'none';
            }
            const monthPicker = document.getElementById('month-picker-popover');
            if (monthPicker && !event.target.closest('.month-picker-popover') && !event.target.closest('.month-picker-trigger')) {
                closeMonthPicker();
            }
            if (event.target.classList.contains('modal-overlay')) {
                event.target.style.display = 'none';
            }
        }

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
                            <span>👤 나</span>
                            <span>🔔 알림</span>
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
            alert('테마가 현재 시간으로 초기화되었습니다.');
        }
    


/* ══════════════════════ V5 BANNER ENGINE ══════════════════════ */
(function() {
  const NS = 'http://www.w3.org/2000/svg';
  const PREFIXES = ['dt', 'mb'];

  // State
  const v5state = { level: 3, time: 'day', season: 'summer', event: 'none', friendName: '민지' };

  const V5_LVL = {
    1: { name:'약속의 씨앗',       pct:15,  clovers:2,  sprouts:0, fourLeaf:0 },
    2: { name:'설렘의 새싹',       pct:38,  clovers:8,  sprouts:0, fourLeaf:0 },
    3: { name:'초록 클로버 우정',   pct:68,  clovers:15, sprouts:0, fourLeaf:0 },
    4: { name:'자라나는 클로버 들판', pct:85, clovers:25, sprouts:0, fourLeaf:2 },
    5: { name:'단단한 네잎 클로버', pct:100, clovers:36, sprouts:0, fourLeaf:7 },
  };

  const GROUND_COLORS = {
    barren: { top:'#9a7a50', bot:'#664c28' },
    spring: { top:'#7dd97e', bot:'#4a9e5c' },
    summer: { top:'#28ae62', bot:'#186e3e' },
    fall:   { top:'#dfc040', bot:'#b89020' },
    winter: { top:'#c4d8d0', bot:'#96b4aa' },
  };
  const MTN_COLORS = {
    spring: { far:'rgba(138,195,138,0.90)', near:'rgba(86,158,90,0.97)' },
    summer: { far:'rgba(68,145,98,0.90)',   near:'rgba(38,115,68,0.97)' },
    fall:   { far:'rgba(156,118,56,0.90)',  near:'rgba(122,86,36,0.97)' },
    winter: { far:'rgba(190,210,220,0.90)', near:'rgba(148,170,184,0.97)' },
  };
  const CEL = {
    morning: { w:38, h:38, top:'64%', left:'74%', bg:'radial-gradient(circle at 38% 38%, #fffde2 0%, #ffd95c 55%, #ffbe38 100%)', shadow:'0 0 28px 10px rgba(255,218,78,0.55)' },
    day:     { w:48, h:48, top:'15%', left:'78%', bg:'radial-gradient(circle at 38% 38%, #fffae0 0%, #ffcc60 55%, #ffb038 100%)', shadow:'0 0 42px 15px rgba(255,200,68,0.45)' },
    evening: { w:46, h:46, top:'60%', left:'13%', bg:'radial-gradient(circle at 38% 38%, #ffe8d0 0%, #ff8c28 55%, #ff5010 100%)', shadow:'0 0 38px 12px rgba(255,100,18,0.52)' },
    night:   { w:36, h:36, top:'13%', left:'80%', bg:'radial-gradient(circle at 35% 38%, #ffffff 0%, #dce8f4 55%, #b0c8e0 100%)', shadow:'0 0 22px 7px rgba(178,210,240,0.35)',
               craters: [{w:'28%',h:'28%',top:'18%',left:'50%'},{w:'18%',h:'18%',top:'50%',left:'22%'},{w:'12%',h:'12%',top:'36%',left:'65%'}] },
  };

  function hexRgb(h) { return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]; }
  function lerpColor(h1,h2,t) {
    const [r1,g1,b1]=hexRgb(h1), [r2,g2,b2]=hexRgb(h2);
    return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
  }

  function v5updateGround(p) {
    const el = document.getElementById(p+'-v5ground'); if(!el) return;
    const t=(v5state.level-1)/4, B=GROUND_COLORS.barren, S=GROUND_COLORS[v5state.season];
    el.style.background = `linear-gradient(180deg, ${lerpColor(B.top,S.top,t)} 0%, ${lerpColor(B.bot,S.bot,t)} 100%)`;
  }

  function v5updateMountains(p) {
    const m=MTN_COLORS[v5state.season];
    const f=document.getElementById(p+'-v5mtnFar'), n=document.getElementById(p+'-v5mtnNear');
    if(f) f.setAttribute('fill',m.far);
    if(n) n.setAttribute('fill',m.near);
  }

  function v5buildStars(p) {
    const layer=document.getElementById(p+'-v5stars'); if(!layer) return;
    layer.innerHTML='';
    for(let i=0;i<58;i++){
      const s=document.createElement('div'); s.className='star';
      const sz=Math.random()*2+0.8;
      s.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*68}%;--d:${2.2+Math.random()*3.5}s;--dl:${-Math.random()*6}s;`;
      layer.appendChild(s);
    }
  }

  function v5updateCelestial(p) {
    const el=document.getElementById(p+'-v5cel'); if(!el) return;
    const c=CEL[v5state.time];
    el.style.cssText=`width:${c.w}px;height:${c.h}px;top:${c.top};left:${c.left};transform:translate(-50%,-50%);background:${c.bg};box-shadow:${c.shadow};`;
    el.innerHTML='';
    if(c.craters) c.craters.forEach(cr=>{
      const d=document.createElement('div'); d.className='crater';
      d.style.cssText=`width:${cr.w};height:${cr.h};top:${cr.top};left:${cr.left};transform:translate(-50%,-50%);`;
      el.appendChild(d);
    });
  }

  function makeSVGClover(fourLeaf=false) {
    const svg=document.createElementNS(NS,'svg'); svg.setAttribute('viewBox','0 0 40 52'); svg.setAttribute('overflow','visible'); svg.classList.add('clover-svg');
    const stem=document.createElementNS(NS,'path'); stem.setAttribute('d','M20 26 Q18 38 20 50'); stem.setAttribute('stroke-width','2.2'); stem.setAttribute('fill','none'); stem.setAttribute('stroke-linecap','round'); stem.classList.add('clov-stem'); svg.appendChild(stem);
    const g=document.createElementNS(NS,'g'); g.setAttribute('transform','translate(20,22)');
    const leafD='M 0,0 L -6,-6 C -15,-15 -12,-25 -4,-23 C -1.5,-22 0,-17 0,-17 C 0,-17 1.5,-22 4,-23 C 12,-25 15,-15 6,-6 Z';
    const chevronD='M -9,-14 C -4,-18 -1,-12 0,-15 C 1,-12 4,-18 9,-14';
    [45,135,225,315].forEach((angle,i)=>{
      const leaf=document.createElementNS(NS,'path'); leaf.setAttribute('d',leafD); leaf.setAttribute('transform',`rotate(${angle})`); leaf.classList.add('clov-leaf'); if(i%2===1)leaf.classList.add('shade'); g.appendChild(leaf);
      const ch=document.createElementNS(NS,'path'); ch.setAttribute('d',chevronD); ch.setAttribute('transform',`rotate(${angle})`); ch.setAttribute('stroke-width','1.5'); ch.setAttribute('stroke-linecap','round'); ch.setAttribute('fill','none'); ch.classList.add('clov-vein'); g.appendChild(ch);
      const mv=document.createElementNS(NS,'path'); mv.setAttribute('d','M 0,0 Q 0.5,-8 0,-14'); mv.setAttribute('transform',`rotate(${angle})`); mv.setAttribute('stroke-width','0.6'); mv.setAttribute('stroke-linecap','round'); mv.setAttribute('fill','none'); mv.setAttribute('stroke-opacity','0.45'); mv.classList.add('clov-vein'); g.appendChild(mv);
    });
    svg.appendChild(g); return svg;
  }

  function v5buildClovers(p) {
    const field=document.getElementById(p+'-v5clovers'); if(!field) return;
    field.innerHTML='';
    const cfg=V5_LVL[v5state.level];

    // 모바일은 클로버 수 절반으로 줄임
    const isMobile = (p === 'mb');
    const count = isMobile ? Math.ceil(cfg.clovers * 0.5) : cfg.clovers;
    const fourLeaf = isMobile ? Math.ceil(cfg.fourLeaf * 0.5) : cfg.fourLeaf;

    // 균등 배치: x축을 슬롯으로 나눠 각 슬롯 안에서 jitter (랜덤성 적당히 추가)
    const DEPTH_BANDS = 3; // 원경/중경/근경
    const perBand = Math.ceil(count / DEPTH_BANDS);
    const positions = [];

    for(let band = 0; band < DEPTH_BANDS; band++){
      const bandCount = Math.min(perBand, count - positions.length);
      if(bandCount <= 0) break;
      // band 0 = 원경(깊음), band 2 = 근경(가까움)
      const depthMin = band / DEPTH_BANDS;
      const depthMax = (band + 1) / DEPTH_BANDS;

      // x를 슬롯으로 균등 분할
      const slotW = 94 / bandCount;
      for(let i = 0; i < bandCount; i++){
        // 20% 확률로 인접 band 깊이로 튀어 더 자연스럽게
        let dMin = depthMin, dMax = depthMax;
        if(Math.random() < 0.2) {
          const jump = Math.random() < 0.5 ? -1 : 1;
          dMin = Math.max(0, depthMin + jump * (1/DEPTH_BANDS) * 0.5);
          dMax = Math.min(1, depthMax + jump * (1/DEPTH_BANDS) * 0.5);
        }
        const depth = dMin + Math.random() * (dMax - dMin);
        const maxSz = v5state.level === 5 ? 40 : 34;
        const sz = maxSz - depth * (maxSz - 16);
        // x: 슬롯 중앙 + ±45% 지터 (랜덤성 강화, 뭉침은 방지)
        const slotCenter = 3 + slotW * (i + 0.5);
        const jitter = (Math.random() - 0.5) * slotW * 0.9;
        const x = Math.max(2, Math.min(98, slotCenter + jitter));
        positions.push({
          x, depth,
          bottom: -8 + depth * 48,
          size: sz,
          rot: (Math.random() - 0.5) * 42,  // 회전 범위 살짝 더 넓게
          op: 1 - depth * 0.42,
        });
      }
    }

    // 깊이 내림차순 정렬 (원경 먼저 그려 근경이 위에 겹치게)
    positions.sort((a,b) => b.depth - a.depth).forEach((pos, idx) => {
      const wrap = document.createElement('div'); wrap.className = 'clover-wrap';
      const h = pos.size * (44/32);
      wrap.style.cssText = `left:${pos.x}%;bottom:${pos.bottom}px;width:${pos.size}px;height:${h}px;transform:translateX(-50%) rotate(${pos.rot}deg);opacity:${pos.op};z-index:${200 - Math.round(pos.bottom)};`;
      const anim = document.createElement('div'); anim.className = 'clover-anim';
      const dur = 2.8 + Math.random() * 2.5, delay = -(Math.random() * dur);
      anim.style.setProperty('--sw', dur+'s'); anim.style.setProperty('--sd', delay+'s');
      const svg = makeSVGClover(idx < fourLeaf);
      svg.style.cssText = 'width:100%;height:100%;display:block;';
      anim.appendChild(svg); wrap.appendChild(anim); field.appendChild(wrap);
    });
  }

  function v5buildParticles(p) {
    const c=document.getElementById(p+'-v5particles'); if(!c) return; c.innerHTML='';
    if(v5state.event==='my_birthday'||v5state.event==='friend_birthday'){
      const colors=['#ff7675','#74b9ff','#55efc4','#ffeaa7','#a29bfe','#fd79a8','#ff9ff3'];
      for(let i=0;i<45;i++){
        const el=document.createElement('div'), dur=3.5+Math.random()*5, dl=-Math.random()*dur;
        el.classList.add('ptcl','confetti');
        el.style.setProperty('--d',dur+'s'); el.style.setProperty('--dl',dl+'s');
        el.style.setProperty('--dx',(Math.random()-0.5)*150+'px'); el.style.setProperty('--dr',Math.random()*720+'deg');
        el.style.setProperty('--drx',Math.random()*720+'deg'); el.style.setProperty('--dry',Math.random()*720+'deg');
        el.style.left=Math.random()*100+'%'; el.style.top='-20px';
        const szW=4+Math.random()*5, szH=7+Math.random()*7;
        el.style.width=szW+'px'; el.style.height=(Math.random()>0.4?szW:szH)+'px';
        if(Math.random()>0.6) el.style.borderRadius='50%';
        el.style.background=colors[i%colors.length]; c.appendChild(el);
      }
      return;
    }
    const cfgs={
      spring:{type:'blossom',count:18,colors:['#ffb7d5','#ffc8e0','#ffd2e8','#ffdff0']},
      summer:{type:'firefly',count:15},
      fall:{type:'leaf',count:15,colors:['#e67e22','#c0392b','#d35400','#e8a030']},
      winter:{type:'snow',count:30,sizes:[3,4,4,5,5,6,7]},
    };
    const cfg=cfgs[v5state.season]; if(!cfg) return;
    for(let i=0;i<cfg.count;i++){
      const el=document.createElement('div'), dur=4.5+Math.random()*6, dl=-Math.random()*dur, dx=(Math.random()-0.5)*65;
      el.classList.add('ptcl',cfg.type);
      el.style.setProperty('--d',dur+'s'); el.style.setProperty('--dl',dl+'s'); el.style.setProperty('--dx',dx+'px');
      if(cfg.type==='blossom'){el.style.left=Math.random()*100+'%';el.style.top='-12px';const sz=6+Math.random()*5;el.style.width=sz+'px';el.style.height=sz+'px';el.style.background=cfg.colors[i%cfg.colors.length];}
      else if(cfg.type==='firefly'){el.style.left=(Math.random()*88)+'%';el.style.top=(18+Math.random()*62)+'%';el.style.setProperty('--dy',(-8-Math.random()*18)+'px');el.style.setProperty('--dl2',(-Math.random()*3)+'s');}
      else if(cfg.type==='leaf'){el.style.left=Math.random()*100+'%';el.style.top='-12px';const sz=8+Math.random()*6;el.style.width=sz+'px';el.style.height=sz+'px';el.style.background=cfg.colors[i%cfg.colors.length];el.style.setProperty('--dr',(80+Math.random()*260)+'deg');}
      else if(cfg.type==='snow'){el.style.left=Math.random()*100+'%';el.style.top='-10px';const sz=cfg.sizes[i%cfg.sizes.length];el.style.width=sz+'px';el.style.height=sz+'px';}
      c.appendChild(el);
    }
  }

  function v5buildBalloons(p) {
    const c=document.getElementById(p+'-v5balloons'); if(!c) return; c.innerHTML='';
    if(v5state.event!=='my_birthday') return;
    const colors=['#ff7675','#74b9ff','#ffeaa7','#a29bfe','#55efc4','#fd79a8'];
    for(let i=0;i<7;i++){
      const b=document.createElement('div'); b.className='balloon';
      b.style.setProperty('--bc',colors[i%colors.length]);
      b.style.left=(5+Math.random()*90)+'%';
      const dur=10+Math.random()*10, dl=-Math.random()*dur;
      b.style.setProperty('--bd',dur+'s'); b.style.setProperty('--bdl',dl+'s');
      b.style.setProperty('--bx',((Math.random()-0.5)*60)+'px');
      b.style.transform=`scale(${0.75+Math.random()*0.5})`;
      c.appendChild(b);
    }
  }

  function v5updateHUD(p) {
    const cfg=V5_LVL[v5state.level];
    const icon=document.getElementById(p+'-v5lvicon'); if(icon) icon.textContent='Lv.'+v5state.level;
    const name=document.getElementById(p+'-v5lvname'); if(name) name.textContent=cfg.name;
    const pillbg=document.getElementById(p+'-v5pillbg'); if(pillbg) pillbg.style.width=cfg.pct+'%';
    const pct=document.getElementById(p+'-v5lvpct'); if(pct) pct.textContent=cfg.pct+'%';
    const eyebrow=document.getElementById(p+'-v5eyebrow');
    if(eyebrow){
      if(v5state.event==='my_birthday'||v5state.event==='friend_birthday'){
        eyebrow.textContent=v5state.event==='friend_birthday'?`🎉 ${v5state.friendName}님의 생일입니다!`:'🎂 생일 축하해요!';
        eyebrow.style.color='#ffeba0'; eyebrow.style.fontSize='13px'; eyebrow.style.textShadow='0 1px 6px rgba(255,200,0,0.6)';
      } else {
        eyebrow.textContent='우리 함께한 지';
        eyebrow.style.color='rgba(255,255,255,0.82)'; eyebrow.style.fontSize='11px'; eyebrow.style.textShadow='0 1px 5px rgba(0,0,0,0.45)';
      }
    }
    // sync dday
    const ddayEl = document.getElementById(p+'-v5dday');
    const mainDday = document.getElementById(p === 'dt' ? 'dt-dday' : 'mb-dday');
    if(ddayEl && mainDday) {
      const txt = mainDday.innerText || '0';
      ddayEl.textContent = txt.replace('D+','').replace(' 일째','');
    }
  }

  function v5render() {
    PREFIXES.forEach(p=>{
      const scene=document.getElementById(p+'-v5scene'); if(!scene) return;
      scene.dataset.time=v5state.time; scene.dataset.season=v5state.season;
      scene.dataset.level=v5state.level; scene.dataset.event=v5state.event;
      v5updateGround(p); v5updateMountains(p); v5updateCelestial(p);
      v5buildClovers(p); v5buildParticles(p); v5buildBalloons(p); v5updateHUD(p);
    });
  }

  function v5detectNow() {
    const h=new Date().getHours(), mo=new Date().getMonth()+1;
    v5state.time=h>=5&&h<10?'morning':h>=10&&h<17?'day':h>=17&&h<20?'evening':'night';
    v5state.season=mo>=3&&mo<=5?'spring':mo>=6&&mo<=8?'summer':mo>=9&&mo<=11?'fall':'winter';
    v5state.event='none';
  }

  function v5syncButtons() {
    document.querySelectorAll('[data-v5ctrl]').forEach(b=>{
      b.classList.toggle('on', b.dataset.v5val===v5state[b.dataset.v5ctrl]);
    });
  }

  // 레벨업 연동 (기존 levelUp과 sync)
  window.v5LevelUp = function() {
    if(typeof levelUp==='function') levelUp();
    if(typeof friendshipLevel!=='undefined') v5state.level=friendshipLevel;
    v5render();
  };

  // 기존 레벨 UI와 sync
  function v5syncLevel() {
    if(typeof friendshipLevel!=='undefined') v5state.level=friendshipLevel;
    v5render();
  }


  // 테스트 패널 동적 생성 (DOM 타이밍 문제 방지)
  (function() {
    const panel = document.createElement('aside');
    panel.className = 'v5-test-panel';
    panel.innerHTML = `
      <p class="tp-title">🎛️ 배너 테마 테스트</p>
      <div class="tp-row">
        <span class="tp-label">🎉 이벤트</span>
        <div class="tp-btns">
          <button class="tp-btn on" data-v5ctrl="event" data-v5val="none">없음</button>
          <button class="tp-btn" data-v5ctrl="event" data-v5val="my_birthday">내 생일 🎂</button>
          <button class="tp-btn" data-v5ctrl="event" data-v5val="friend_birthday">친구 생일 🎉</button>
        </div>
      </div>
      <div class="tp-row">
        <span class="tp-label">⏰ 시간대</span>
        <div class="tp-btns">
          <button class="tp-btn" data-v5ctrl="time" data-v5val="morning">아침</button>
          <button class="tp-btn on" data-v5ctrl="time" data-v5val="day">낮</button>
          <button class="tp-btn" data-v5ctrl="time" data-v5val="evening">저녁</button>
          <button class="tp-btn" data-v5ctrl="time" data-v5val="night">밤</button>
        </div>
      </div>
      <div class="tp-row">
        <span class="tp-label">🌿 계절</span>
        <div class="tp-btns">
          <button class="tp-btn" data-v5ctrl="season" data-v5val="spring">봄</button>
          <button class="tp-btn on" data-v5ctrl="season" data-v5val="summer">여름</button>
          <button class="tp-btn" data-v5ctrl="season" data-v5val="fall">가을</button>
          <button class="tp-btn" data-v5ctrl="season" data-v5val="winter">겨울</button>
        </div>
      </div>
      <div class="tp-row">
        <span class="tp-label">💚 우정 레벨</span>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <input type="range" id="v5lvSlider" min="1" max="5" value="3" step="1" style="flex:1;accent-color:#1b4332;cursor:pointer;">
          <span id="v5lvSliderVal" style="font-size:12px;font-weight:900;color:#1b4332;min-width:16px;text-align:center;">3</span>
        </div>
        <div id="v5lvDesc" style="font-size:10px;color:#5c7a6a;font-weight:700;text-align:center;margin-bottom:4px;">초록 클로버 우정</div>
      </div>
      <div class="tp-divider"></div>
      <button class="tp-reset" id="v5resetBtn">⏱ 현재 시간으로 복귀</button>
    `;
    document.body.appendChild(panel);
  })();

  // 버튼 바인딩 (DOMContentLoaded로 패널 렌더 후 실행)
  function v5bindButtons() {
    document.querySelectorAll('[data-v5ctrl]').forEach(btn=>{
      // avoid double-binding
      if(btn._v5bound) return;
      btn._v5bound = true;
      btn.addEventListener('click',()=>{
        v5state[btn.dataset.v5ctrl]=btn.dataset.v5val;
        v5syncButtons(); v5render();
      });
    });
    const resetBtn = document.getElementById('v5resetBtn');
    if(resetBtn && !resetBtn._v5bound) {
      resetBtn._v5bound = true;
      resetBtn.addEventListener('click',()=>{
        v5detectNow(); v5syncButtons(); v5render();
      });
    }
    // 레벨 슬라이더 바인딩
    const slider = document.getElementById('v5lvSlider');
    if(slider && !slider._v5bound) {
      slider._v5bound = true;
      slider.addEventListener('input', function() {
        v5state.level = +this.value;
        const descEl = document.getElementById('v5lvDesc');
        const valEl  = document.getElementById('v5lvSliderVal');
        if(valEl) valEl.textContent = this.value;
        if(descEl) descEl.textContent = V5_LVL[v5state.level].name;
        v5render();
      });
    }
  }
  // 패널이 위에서 동적 생성됐으므로 바로 바인딩 가능
  v5bindButtons(); v5syncButtons();

  // 초기화 (별 미리 생성)
  PREFIXES.forEach(p=>v5buildStars(p));
  v5detectNow(); v5render();

  // 기존 updateFriendshipUI와 연동
  const _origUpdateFriendshipUI = window.updateFriendshipUI;
  window.updateFriendshipUI = function() {
    if(_origUpdateFriendshipUI) _origUpdateFriendshipUI.apply(this, arguments);
    if(typeof friendshipLevel!=='undefined') v5state.level=friendshipLevel;
    const sl=document.getElementById('v5lvSlider'), sv=document.getElementById('v5lvSliderVal'), sd=document.getElementById('v5lvDesc');
    if(sl) sl.value=v5state.level;
    if(sv) sv.textContent=v5state.level;
    if(sd) sd.textContent=V5_LVL[v5state.level].name;
    v5render();
  };
})();
/* ══════════════════════ END V5 BANNER ENGINE ══════════════════════ */





        // 행운 편지 작성 관련 함수 추가
        function openLetterModal(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const modalId = prefix + '-letter-modal';
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'flex';
                // 초기화
                document.getElementById(prefix + '-letter-to').value = '';
                document.getElementById(prefix + '-letter-from').value = '';
                document.getElementById(prefix + '-letter-content').value = '';
                const chips = modal.querySelectorAll('.letter-emoji-chip');
                chips.forEach(c => c.classList.remove('active'));
                if(chips.length > 0) chips[0].classList.add('active');
                
                const preview = document.getElementById(prefix + '-letter-preview');
                if(preview) preview.style.display = 'none';
            }
        }

        function toggleLetterToAllBtn(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const input = document.getElementById(prefix + '-letter-to');
            if (input.value === '모두에게') {
                input.value = '';
            } else {
                input.value = '모두에게';
            }
        }

        function selectLetterEmoji(btn, viewType) {
            const modal = btn.closest('.modal-box');
            modal.querySelectorAll('.letter-emoji-chip').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
        }

        function submitLetter(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const modal = document.getElementById(prefix + '-letter-modal');
            const to = document.getElementById(prefix + '-letter-to').value.trim();
            const from = document.getElementById(prefix + '-letter-from').value.trim();
            const content = document.getElementById(prefix + '-letter-content').value.trim();
            const activeEmojiBtn = modal.querySelector('.letter-emoji-chip.active');
            const emoji = activeEmojiBtn ? activeEmojiBtn.dataset.emoji : '💌';

            if (!to || !from || !content) {
                alert('받는 사람, 보내는 사람, 내용을 모두 입력해주세요!');
                return;
            }

            // 여기서 실제로는 groupsData나 letters 배열에 저장하는 로직이 들어갑니다.
            // 일단 성공 알림 후 모달 닫기
            alert('편지가 성공적으로 작성되었습니다! 💌');
            closeModal(prefix + '-letter-modal');
        }

        function toggleInlineLetterWrite(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const inlineId = prefix + '-inline-letter-write';
            const inlineBox = document.getElementById(inlineId);
            if (inlineBox) {
                if (inlineBox.style.display === 'none') {
                    inlineBox.style.display = 'block';
                    // 초기화
                    document.getElementById(prefix + '-letter-to').value = '';
                    document.getElementById(prefix + '-letter-from').value = '';
                    document.getElementById(prefix + '-letter-content').value = '';
                    const chips = inlineBox.querySelectorAll('.letter-emoji-chip');
                    chips.forEach(c => c.classList.remove('active'));
                    if(chips.length > 0) chips[0].classList.add('active');
                } else {
                    inlineBox.style.display = 'none';
                }
            }
        }

        // submitLetter 수정 (인라인 UI 닫기)
        function submitLetter(viewType) {
            const prefix = viewType === 'dt' ? 'dt' : 'mb';
            const inlineId = prefix + '-inline-letter-write';
            const to = document.getElementById(prefix + '-letter-to').value.trim();
            const from = document.getElementById(prefix + '-letter-from').value.trim();
            const content = document.getElementById(prefix + '-letter-content').value.trim();

            if (!to || !from || !content) {
                alert('받는 사람, 보내는 사람, 내용을 모두 입력해주세요!');
                return;
            }

            alert('편지가 성공적으로 작성되었습니다! 💌');
            const inlineBox = document.getElementById(inlineId);
            if(inlineBox) inlineBox.style.display = 'none';
        }
