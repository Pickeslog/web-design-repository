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

        // 추억피드 게시글의 "나" 식별자. 참여자 id·게시자(authorId) 판정에 공용으로 사용한다.
        const CURRENT_USER_ID = 'me';

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
        let activeScheduleDensity = 'all';

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

        let defaultGroupsData = {
            friend: {
                name: "단짝친구",
                icon: "🍀",
                ddayLabel: "우리 함께한 지",
                ddayCount: 124,
                level: 3,
                levelName: "초록 클로버",
                progress: "65%",
                photo: (window.CLOV_MAIN_BASE || '../') + "../assets/banner-style/sleeping_cat.gif",
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
                        authorId: "sol",
                        participants: [
                            { name: "나", icon: "나", text: "문제 하나 풀어서 뿌듯" },
                            { id: "sol", name: "솔", icon: "솔" },
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
                        authorId: "min",
                        participants: [
                            { name: "나", icon: "나", text: "밀면이 냉면보다 낫다" },
                            { name: "솔", icon: "솔", text: "다음엔 1박 하고 싶다" },
                            { id: "min", name: "민", icon: "민" },
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
                        authorId: "jun",
                        participants: [
                            { name: "나", icon: "나", text: "드디어 끝났다는 실감이 안 났다" },
                            { name: "솔", icon: "솔", text: "눈물 참으려다 터졌다" },
                            { name: "민", icon: "민", text: "가운 반납 전에 사진 더 찍을걸" },
                            { id: "jun", name: "준", icon: "준" }
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
                    { from: "열정 코더 💻", text: "팀원 여러분! 다음 달 해커톤 대상 가봅시다! 이번 주 개발 스프린트 과제 다들 깃허브 PR 올려주세요! 🔥", favorite: false },
                    { from: "데브옵스 🍀", text: "서버 배포 스크립트 도커 연동 끝냈습니다. 테스트 해보시고 문제 있으면 슬랙으로 편하게 제보해주세요!", favorite: false }
                ]
            }
        };
        const DATA_VERSION = '4';
        let groupsData = JSON.parse(localStorage.getItem('clov_groupsData'));
        if (!groupsData || localStorage.getItem('clov_dataVersion') !== DATA_VERSION) {
            groupsData = defaultGroupsData;
            localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
            localStorage.setItem('clov_dataVersion', DATA_VERSION);
        } else {
            let modified = false;
            for (let key in groupsData) {
                if (groupsData[key] && (!groupsData[key].ddayCount || groupsData[key].ddayCount < 1)) {
                    groupsData[key].ddayCount = 1;
                    modified = true;
                }
            }
            if (modified) {
                localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
            }
        }

        // --- Clov Global API (Write Modal & Data Integration) ---
        window._clov = {
            getPosts: function(groupId) {
                const gid = groupId || (typeof activeGroup !== 'undefined' ? activeGroup : 'friend');
                if (typeof groupsData !== 'undefined' && groupsData[gid]) {
                    return groupsData[gid].posts || [];
                }
                try {
                    const stored = JSON.parse(localStorage.getItem('clov_groupsData') || '{}');
                    return stored[gid] ? (stored[gid].posts || []) : [];
                } catch(e) {
                    return [];
                }
            },
            addPost: function(newPost, groupId) {
                const gid = groupId || (typeof activeGroup !== 'undefined' ? activeGroup : 'friend');
                if (typeof groupsData === 'undefined' || !groupsData[gid]) return;
                if (!groupsData[gid].posts) groupsData[gid].posts = [];

                if (!newPost.selectedParticipantId && newPost.participants && newPost.participants.length > 0) {
                    newPost.selectedParticipantId = newPost.participants[0].id || 'me';
                } else if (!newPost.selectedParticipantId) {
                    newPost.selectedParticipantId = 'me';
                }

                groupsData[gid].posts.unshift(newPost);
                try {
                    localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
                } catch(e) {
                    console.error("저장 실패", e);
                }

                if (typeof clovToast === 'function') {
                    clovToast('🎉 새 추억 피드가 성공적으로 등록되었습니다!', 'success');
                }
                if (typeof addUnreadNotification === 'function') {
                    addUnreadNotification('✨ 새로운 추억', '새로운 추억 피드가 등록되었어요!');
                }
            },
            refreshFeed: function() {
                if (typeof setFeedFilter === 'function') {
                    setFeedFilter('all');
                } else if (typeof renderFeeds === 'function') {
                    renderFeeds();
                }
                if (typeof v5render === 'function') {
                    v5render();
                }
            }
        };

        const lifeFourCutScheduleExamples = [
            {
                id: 70101,
                title: "홍대 전시회 나들이",
                date: "2026-07-05",
                content: `<h3>🎟️ 홍대 전시회 나들이</h3>
<ul>
  <li><strong>제안하기:</strong> 보고 싶은 전시 링크 공유하기</li>
  <li><strong>일정 맞추기:</strong> 오후 2시 홍대입구역에서 만나기</li>
  <li><strong>약속 확정:</strong> 예매 내역과 이동 동선 확인</li>
  <li><strong>만남:</strong> 전시 보고 인생4컷 찍기</li>
</ul>`
            },
            {
                id: 70102,
                title: "한강 야간 피크닉",
                date: "2026-07-12",
                content: `<h3>🌙 한강 야간 피크닉</h3>
<ul>
  <li>돗자리, 간식, 보조배터리 챙기기</li>
  <li>여의나루역 3번 출구에서 만나기</li>
</ul>`
            },
            {
                id: 70103,
                title: "성수 카페 투어",
                date: "2026-07-19",
                content: `<h3>☕ 성수 카페 투어</h3>
<ul>
  <li>가고 싶은 카페 3곳 저장하기</li>
  <li>사진 잘 나오는 자리 먼저 체크하기</li>
</ul>`
            },
            {
                id: 70104,
                title: "여름 바다 당일치기",
                date: "2026-07-26",
                content: `<h3>🌊 여름 바다 당일치기</h3>
<ul>
  <li>기차 시간표 확인</li>
  <li>선크림, 수건, 여벌 옷 챙기기</li>
</ul>`
            },
            {
                id: 70105,
                title: "방탈출 성공 인증",
                date: "2026-08-02",
                content: `<h3>🔐 방탈출 성공 인증</h3>
<ul>
  <li>난이도 중간 방 예약</li>
  <li>성공하면 바로 인증샷 남기기</li>
</ul>`
            },
            {
                id: 70106,
                title: "생일 케이크 픽업",
                date: "2026-08-09",
                content: `<h3>🎂 생일 케이크 픽업</h3>
<ul>
  <li>레터링 문구 확정</li>
  <li>파티 전 케이크 픽업 담당 정하기</li>
</ul>`
            }
        ];

        function ensureLifeFourCutScheduleExamples() {
            const friendGroup = groupsData.friend;
            if (!friendGroup) return;
            if (!Array.isArray(friendGroup.schedules)) friendGroup.schedules = [];

            const existingKeys = new Set(friendGroup.schedules.map(schedule => schedule.id || schedule.title));
            let changed = false;
            lifeFourCutScheduleExamples.forEach(example => {
                if (existingKeys.has(example.id) || existingKeys.has(example.title)) return;
                friendGroup.schedules.push({ ...example });
                changed = true;
            });

            if (changed) {
                localStorage.setItem('clov_groupsData', JSON.stringify(groupsData));
            }
        }

        ensureLifeFourCutScheduleExamples();

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

        const MEMORY_PHOTO_LIMIT = 6;

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
            if (previousIndex === nextIndex) return;

            if (getEvidenceCardTheme() === 'coverflow' && Math.abs(nextIndex - previousIndex) > 1) {
                if (window._coverflowTimer) clearInterval(window._coverflowTimer);
                let currentStep = previousIndex;
                const stepDir = nextIndex > previousIndex ? 1 : -1;
                window._coverflowTimer = setInterval(() => {
                    currentStep += stepDir;
                    evidenceSlideDirection = stepDir > 0 ? 'past' : 'current';
                    activeEvidenceIndexes[activeGroup] = currentStep;
                    renderEvidenceViewers();
                    if (currentStep === nextIndex) {
                        clearInterval(window._coverflowTimer);
                        window._coverflowTimer = null;
                    }
                }, 45);
                return;
            }

            if (window._coverflowTimer) {
                clearInterval(window._coverflowTimer);
                window._coverflowTimer = null;
            }
            evidenceSlideDirection = nextIndex > previousIndex ? 'past' : 'current';
            activeEvidenceIndexes[activeGroup] = nextIndex;
            renderEvidenceViewers();
        }

        function renderMemoryCard(post, postIndex) {
            const normalizedPost = normalizeMemoryPost(post);
            const isMine = normalizedPost.authorId === CURRENT_USER_ID;
            const author = normalizedPost.participants.find(participant => participant.id === normalizedPost.authorId) || normalizedPost.participants[0];
            const authorLabel = isMine ? '내 기록' : `${author.name}의 기록`;
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
            const authorLabel = isMine ? '내 기록' : `${author.name}의 기록`;
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
                            <div class="cline-cards ${cardTheme === 'coverflow' && evidenceSlideDirection !== 'idle' ? 'slide-' + evidenceSlideDirection : ''}">
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

            renderGroundGrowth('dt-ground-growth');
            renderGroundGrowth('mb-ground-growth');
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
                clovToast('🍀 D-day가 저장되었어요!', 'success');
            }
        }

        function deleteSchedule(scheduleId) {
            clovConfirm('정말 이 약속을 삭제하시겠습니까?', () => {
                const schedules = groupsData[activeGroup].schedules || [];
                groupsData[activeGroup].schedules = schedules.filter(s => s.id !== scheduleId);
                if (selectedScheduleIds[activeGroup] === scheduleId) selectedScheduleIds[activeGroup] = null;
                updateScheduleUI();
                clovToast('🗑️ 일정이 삭제되었어요.', 'info');
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
        const fourCutState = { schedules: [], active: 0, posterTimer: null, ticks: [] };

        function fourCutMemories() {
            return ((groupsData[activeGroup] && groupsData[activeGroup].schedules) || [])
                .filter(sch => getScheduleProofCount(sch) === 4)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        function fourCutStopPoster() {
            if (fourCutState.posterTimer) clearInterval(fourCutState.posterTimer);
            fourCutState.posterTimer = null;
        }

        // 완성작들의 '만남' 컷으로 로비 포스터 슬라이드쇼를 3600ms 주기로 크로스페이드
        function fourCutStartPoster(schedules) {
            fourCutStopPoster();
            const wrap = document.getElementById('dt-fourcut-poster-slides');
            const np = document.getElementById('dt-fourcut-nowplaying');
            if (!wrap || !schedules.length) return;
            const slides = [...wrap.children];
            const show = (n) => {
                slides.forEach((s, k) => { s.style.opacity = k === n ? '1' : '0'; });
                if (np && schedules[n]) np.textContent = schedules[n].title;
            };
            let i = 0;
            show(0);
            fourCutState.posterTimer = setInterval(() => {
                i = (i + 1) % slides.length;
                show(i);
            }, 3600);
        }

        function openFourCutGallery() {
            fourCutCaptureTheaterTemplate();
            const schedules = fourCutMemories();
            fourCutState.schedules = schedules;
            fourCutState.active = 0;

            const allSchedules = (groupsData[activeGroup] && groupsData[activeGroup].schedules) || [];
            const upcomingCount = allSchedules.filter(sch => getDdayDiffDays(sch.date) >= 0).length;

            const doneCountEl = document.getElementById('dt-fourcut-done-count');
            const upcomingCountEl = document.getElementById('dt-fourcut-upcoming-count');
            const todayCountEl = document.getElementById('dt-fourcut-today-count');
            if (doneCountEl) doneCountEl.textContent = schedules.length;
            if (upcomingCountEl) upcomingCountEl.textContent = upcomingCount;
            if (todayCountEl) todayCountEl.textContent = schedules.length;

            const empty = document.getElementById('dt-fourcut-gallery-empty');
            const poster = document.getElementById('dt-fourcut-poster');
            const row = document.getElementById('dt-fourcut-row');
            if (empty) empty.style.display = schedules.length ? 'none' : 'block';
            if (poster) poster.style.display = schedules.length ? '' : 'none';
            if (row) row.style.display = schedules.length ? '' : 'none';

            const slidesWrap = document.getElementById('dt-fourcut-poster-slides');
            if (slidesWrap) {
                slidesWrap.innerHTML = schedules.map(sch => {
                    const photos = getGrowthStagePhotos(sch);
                    return `<div class="fourcut-poster-slide" style="background-image:url('${photos.meet || ''}')"></div>`;
                }).join('');
            }

            // 넷플릭스 "Trending Now" 행처럼, 완성작들을 포스터 카드로 가로 나열 — 클릭하면 그 완성작으로 바로 입장
            const rowCountEl = document.getElementById('dt-fourcut-row-count');
            const rowTrack = document.getElementById('dt-fourcut-row-track');
            if (rowCountEl) rowCountEl.textContent = schedules.length;
            if (rowTrack) {
                rowTrack.innerHTML = schedules.map((sch, i) => {
                    const photos = getGrowthStagePhotos(sch);
                    return `
                        <button class="fourcut-row-card" type="button" onclick="fourCutEnterAt(${i})">
                            <div class="fourcut-row-thumb" style="background-image:url('${photos.meet || ''}')"></div>
                            <span class="fourcut-row-badge">인생4컷</span>
                            <div class="fourcut-row-scrim"></div>
                            <span class="fourcut-row-title">${escapeHtml(sch.title)}</span>
                        </button>
                    `;
                }).join('');
            }

            // "입장하기" 버튼을 누른 자리에서 모달이 펼쳐져 나오는 FLIP 애니메이션
            // (First-Last-Invert-Play: 최종 위치/크기를 먼저 구하고, 시작 지점 기준 변환값을
            // 역산해서 순간이동처럼 보이게 앉힌 뒤, transform을 원상태(none)로 되돌리며 애니메이션한다)
            const triggerBtn = document.querySelector('.fourcut-gallery-btn');
            openModal('dt-fourcut-gallery-modal');
            fourCutStartPoster(schedules);
            const box = document.querySelector('#dt-fourcut-gallery-modal .modal-box');
            if (triggerBtn && box) {
                const startRect = triggerBtn.getBoundingClientRect();
                const endRect = box.getBoundingClientRect(); // openModal 직후라 이미 최종 레이아웃 반영됨
                const scaleX = startRect.width / endRect.width;
                const scaleY = startRect.height / endRect.height;
                const dx = (startRect.left + startRect.width / 2) - (endRect.left + endRect.width / 2);
                const dy = (startRect.top + startRect.height / 2) - (endRect.top + endRect.height / 2);

                box.style.transition = 'none';
                box.style.transformOrigin = 'center center';
                box.style.opacity = '0.5';
                box.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;

                void box.offsetWidth; // 강제 리플로우로 시작 상태 커밋
                box.style.transition = 'transform 0.42s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease';
                box.style.transform = 'translate(0, 0) scale(1, 1)';
                box.style.opacity = '1';

                const cleanup = () => {
                    box.style.transition = '';
                    box.style.transform = '';
                    box.style.transformOrigin = '';
                    box.style.opacity = '';
                    box.removeEventListener('transitionend', cleanup);
                };
                box.addEventListener('transitionend', cleanup);
            }
        }

        function closeFourCutGallery() {
            fourCutStopPoster();
            fourCutResetTheater();
            closeModal('dt-fourcut-gallery-modal');
        }

        window.openFourCutGallery = openFourCutGallery;
        window.closeFourCutGallery = closeFourCutGallery;

        // 같은 요소에 이전 단계(입장/착석/넘기기)의 애니메이션이 아직 남아있으면
        // 새 애니메이션과 겹쳐 최종 값이 불확실해질 수 있어, 항상 먼저 취소하고 새로 시작한다.
        function fourCutAnim(id, frames, opts) {
            const el = document.getElementById(id);
            if (!el) return null;
            el.getAnimations().forEach(a => a.cancel());
            return el.animate(frames, Object.assign({ fill: 'forwards', easing: 'cubic-bezier(.2,.8,.2,1)' }, opts));
        }

        // 극장을 처음 상태(커튼 닫힘·좌석 숨김·스크린 off·하우스 조명 ON)로 즉시 되돌림
        // 극장을 입장 전 초기 상태로 강제 복원 — 애니메이션을 취소하는 것만으로는
        // (특히 '나가기'로 중간에 빠져나온 뒤 재입장할 때) 커튼·스크린 등이 마지막 프레임에
        // 그대로 멈춰있을 수 있어, 각 요소의 인라인 스타일을 초기값으로 직접 못박아 되돌린다.
        // 커튼·스크린·조명 등 상영 관련 요소들을 입장 전 초기값으로 즉시 못박는다.
        // (애니메이션을 cancel()만 하면 되돌아갈 값이 캐스케이드에 의존하게 되므로,
        // '나가기' 직후·재입장 시 모두 이 함수로 확실하게 하드 리셋한다)
        // 극장 내부(커튼·스크린·조명 등)의 최초 마크업을 한 번만 캡처해둔다.
        // 애니메이션 취소/스타일 리셋에 의존하는 대신, 다음 입장 때는 이 원본으로 통째로
        // 갈아끼워서 이전 상영의 잔여 상태(열린 커튼 등)가 절대 남을 수 없게 한다 —
        // 새로고침했을 때와 동일한 효과를 컴포넌트 단위로만 재현하는 것.
        let fourCutTheaterPristineHTML = null;
        function fourCutCaptureTheaterTemplate() {
            if (fourCutTheaterPristineHTML !== null) return;
            const theater = document.getElementById('dt-fourcut-theater');
            if (theater) fourCutTheaterPristineHTML = theater.innerHTML;
        }

        function fourCutResetChildren() {
            const theater = document.getElementById('dt-fourcut-theater');
            if (theater && fourCutTheaterPristineHTML !== null) {
                theater.innerHTML = fourCutTheaterPristineHTML;
            }
            const sit = document.getElementById('dt-theater-sit');
            if (sit) sit.style.pointerEvents = 'none';
        }

        function fourCutResetTheater() {
            (fourCutState.ticks || []).forEach(clearTimeout);
            fourCutState.ticks = [];
            fourCutResetChildren();
            const theater = document.getElementById('dt-fourcut-theater');
            if (theater) {
                theater.getAnimations().forEach(a => a.cancel());
                theater.style.opacity = '0';
                theater.style.pointerEvents = 'none';
            }
        }

        function fourCutRenderScreen(index) {
            const sch = fourCutState.schedules[index];
            if (!sch) return;
            const stages = buildGrowthStages(sch);
            const photos = getGrowthStagePhotos(sch);

            const titleEl = document.getElementById('dt-theater-title');
            const dateEl = document.getElementById('dt-theater-date');
            const counterEl = document.getElementById('dt-theater-counter');
            if (titleEl) titleEl.textContent = sch.title;
            if (dateEl) dateEl.textContent = formatFriendlyDate(sch.date);
            if (counterEl) counterEl.textContent = (index + 1) + ' / ' + fourCutState.schedules.length;

            const strip = document.getElementById('dt-theater-strip');
            if (strip) {
                strip.innerHTML = stages.map(stage => `
                    <div class="fourcut-frame" style="background-image:url('${photos[stage.key] || ''}')">
                        <span class="fourcut-frame-label">${escapeHtml(stage.name)}</span>
                    </div>
                `).join('');
            }
        }

        function fourCutSpawnDust() {
            const w = document.getElementById('dt-theater-dustwrap');
            if (!w) return;
            w.innerHTML = '';
            for (let i = 0; i < 10; i++) {
                const d = document.createElement('div');
                d.className = 'fourcut-dust';
                const sz = 2 + Math.random() * 3;
                d.style.left = (10 + Math.random() * 80) + '%';
                d.style.bottom = (Math.random() * 40) + '%';
                d.style.width = sz + 'px';
                d.style.height = sz + 'px';
                d.style.setProperty('--dx', (Math.random() * 30 - 15) + 'px');
                d.style.animationDuration = (4 + Math.random() * 4) + 's';
                d.style.animationDelay = (Math.random() * 4) + 's';
                w.appendChild(d);
            }
        }

        // STEP 1 — 입장하기: 극장으로 전진, 하우스 조명 켜진 채 착석하기 버튼 등장
        function fourCutEnter() {
            fourCutResetTheater();
            if (!fourCutState.schedules.length) return;

            const theater = document.getElementById('dt-fourcut-theater');
            if (theater) {
                theater.style.pointerEvents = 'auto';
                theater.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 340, fill: 'forwards' });
            }
            fourCutRenderScreen(fourCutState.active);

            fourCutAnim('dt-theater-scene', [{ transform: 'scale(.68) translateY(-6px)' }, { transform: 'scale(1) translateY(0)' }], { duration: 1000, easing: 'cubic-bezier(.2,.7,.3,1)' });
            fourCutAnim('dt-theater-exit', [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 900 });

            const sit = document.getElementById('dt-theater-sit');
            if (sit) {
                sit.getAnimations().forEach(a => a.cancel());
                sit.style.pointerEvents = 'auto';
                sit.animate([{ opacity: 0, transform: 'translate(-50%,14px)' }, { opacity: 1, transform: 'translate(-50%,0)' }], { duration: 460, delay: 1000, fill: 'forwards' });
            }
        }

        // 완성작 행에서 특정 카드를 눌러 그 완성작으로 바로 입장
        function fourCutEnterAt(index) {
            if (!fourCutState.schedules[index]) return;
            fourCutState.active = index;
            fourCutEnter();
        }

        // STEP 2 — 착석하기: 앞좌석이 올라오고 소등 → 커튼 → 3·2·1 카운트다운 → 상영
        function fourCutSit() {
            const BOUNCE = 'cubic-bezier(.34,1.56,.64,1)';
            fourCutState.ticks = fourCutState.ticks || [];

            const sit = document.getElementById('dt-theater-sit');
            if (sit) {
                sit.getAnimations().forEach(a => a.cancel());
                sit.style.pointerEvents = 'none';
                sit.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, fill: 'forwards' });
            }

            fourCutAnim('dt-theater-seats', [{ transform: 'translateY(100%)' }, { transform: 'translateY(-5%)', offset: .8 }, { transform: 'translateY(0)' }], { duration: 680, delay: 80, easing: BOUNCE });
            fourCutAnim('dt-theater-scene', [{ transform: 'scale(1) translateY(0)' }, { transform: 'scale(1) translateY(1.2%)', offset: .5 }, { transform: 'scale(1) translateY(0)' }], { duration: 320, delay: 360 });
            fourCutAnim('dt-theater-house', [{ opacity: .5 }, { opacity: 0 }], { duration: 460, delay: 720 });
            fourCutAnim('dt-theater-curtl', [{ transform: 'translateX(0)' }, { transform: 'translateX(-104%)' }], { duration: 720, delay: 1180, easing: 'cubic-bezier(.5,0,.2,1)' });
            fourCutAnim('dt-theater-curtr', [{ transform: 'translateX(0)' }, { transform: 'translateX(104%)' }], { duration: 720, delay: 1180, easing: 'cubic-bezier(.5,0,.2,1)' });

            const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            let screenAt = 2020;
            if (!reducedMotion) {
                const tick = (n, t) => fourCutState.ticks.push(setTimeout(() => {
                    const el = document.getElementById('dt-theater-count');
                    const num = document.getElementById('dt-theater-countnum');
                    if (!el) return;
                    if (num) num.textContent = n;
                    el.getAnimations().forEach(a => a.cancel());
                    el.animate([
                        { opacity: 0, transform: 'translate(-50%,-50%) scale(1.5)' },
                        { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .35 },
                        { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .82 },
                        { opacity: 0, transform: 'translate(-50%,-50%) scale(.85)' }
                    ], { duration: 400, fill: 'forwards' });
                }, t));
                tick('3', 2060); tick('2', 2480); tick('1', 2900);
                screenAt = 3420;
            }

            fourCutAnim('dt-theater-beam', [{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: 1360 });
            fourCutSpawnDust();
            fourCutAnim('dt-theater-scrglow', [{ opacity: 0 }, { opacity: .95, offset: .3 }, { opacity: 0 }], { duration: 560, delay: screenAt });
            fourCutAnim('dt-theater-grain', [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: screenAt + 200 });
            fourCutAnim('dt-theater-spill', [{ opacity: 0 }, { opacity: 1 }], { duration: 560, delay: screenAt + 40 });
            fourCutAnim('dt-theater-shot', [{ opacity: 0 }, { opacity: 1, offset: .5 }, { opacity: .82, offset: .62 }, { opacity: 1 }], { duration: 720, delay: screenAt + 60 });
            fourCutAnim('dt-theater-nav', [{ opacity: 0 }, { opacity: 1 }], { duration: 440, delay: screenAt + 760 });
        }

        // 완성작 넘기기 — 재렌더 없이 DOM 직접 갱신 + 필름 어드밴스 전환
        function fourCutFilmAdvance(dir) {
            const strip = document.getElementById('dt-theater-strip');
            if (strip) {
                strip.getAnimations().forEach(a => a.cancel());
                strip.animate([
                    { transform: `translateX(${dir * 46}px)`, filter: 'blur(3px)', opacity: .2 },
                    { transform: 'translateX(0)', filter: 'blur(0)', opacity: 1 }
                ], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
            }
            fourCutAnim('dt-theater-scrglow', [{ opacity: 0 }, { opacity: .6, offset: .3 }, { opacity: 0 }], { duration: 300 });
        }

        function fourCutNav(dir) {
            const n = fourCutState.schedules.length;
            if (!n) return;
            fourCutState.active = (fourCutState.active + dir + n) % n;
            fourCutRenderScreen(fourCutState.active);
            fourCutFilmAdvance(dir);
        }

        // 나가기 — 극장 페이드아웃과 동시에 내부 마크업을 원본으로 통째로 갈아끼운다.
        // (전체가 어두워지며 사라지는 중이라 안 보이지만, 이렇게 해둬야 다음에 다시 입장했을 때
        // 직전 상영 상태가 남아있지 않고 항상 닫힌 커튼부터 새로고침한 것처럼 시작한다)
        function fourCutExit() {
            (fourCutState.ticks || []).forEach(clearTimeout);
            fourCutState.ticks = [];
            const theater = document.getElementById('dt-fourcut-theater');
            if (theater) {
                theater.getAnimations().forEach(a => a.cancel());
                theater.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, fill: 'forwards' });
                theater.style.pointerEvents = 'none';
            }
            fourCutResetChildren();
        }

        window.fourCutEnter = fourCutEnter;
        window.fourCutEnterAt = fourCutEnterAt;
        window.fourCutSit = fourCutSit;
        window.fourCutExit = fourCutExit;
        window.fourCutNav = fourCutNav;

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
        function renderGroundGrowth(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';

            // 레벨이 오를수록 클로버 개수가 훨씬 더 가파르게 늘어나서 들판이 무성해짐
            // (최대 777레벨이라 레벨을 그대로 곱하면 폭발하므로, 7단계 티어 인덱스(0~6) 기준으로 계산)
            const tierIdx = clovLevelTierIndex(friendshipLevel);
            const cloverCount = 6 + tierIdx * 5; // 6 ~ 36개
            // 레벨이 높을수록 클로버 한 포기 자체도 더 크고 무성하게 자람
            const baseScale = 0.7 + tierIdx * 0.12;

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
    


/* ══════════════════════ V5 BANNER ENGINE ══════════════════════ */
(function() {
  const NS = 'http://www.w3.org/2000/svg';
  const PREFIXES = ['dt', 'mb'];

  // State
  const v5state = { level: 3, time: 'day', season: 'summer', event: 'none', friendName: '민지' };

  // 레벨-이름/클로버 밀도 매핑은 이제 최대 777레벨까지 지원하는 clovLevelInfo()/
  // clovLevelTierIndex()(desktop.js 상단, 우정 레벨 시스템 섹션)를 그대로 재사용한다.

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
    const tierIdx = clovLevelTierIndex(v5state.level);
    const grp = (typeof groupsData !== 'undefined' && groupsData[activeGroup]) || {};
    const withinTier = v5state.level >= CLOV_MAX_LEVEL ? 100 : (typeof grp.levelProgress === 'number' ? grp.levelProgress : 0);
    const t = (tierIdx + withinTier / 100) / 6, B=GROUND_COLORS.barren, S=GROUND_COLORS[v5state.season];
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
    // 최대 777레벨을 감당하려고 레벨 그대로가 아니라 7단계 티어 인덱스(0~6) 기준으로 밀도를 정한다.
    const tierIdx = clovLevelTierIndex(v5state.level);
    const cfg = { clovers: 6 + tierIdx * 5, fourLeaf: Math.max(0, Math.round((tierIdx - 1) * 1.6)) };

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
        const maxSz = tierIdx === 6 ? 40 : 34;
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
    const info = clovLevelInfo(v5state.level);
    const isMax = v5state.level >= CLOV_MAX_LEVEL;
    const grp = (typeof groupsData !== 'undefined' && groupsData[activeGroup]) || {};
    const pct = isMax ? 100 : Math.round((typeof grp.levelProgress === 'number' ? grp.levelProgress : 0));
    const icon=document.getElementById(p+'-v5lvicon'); if(icon) icon.textContent = isMax ? '+777' : ('Lv.'+v5state.level);
    const name=document.getElementById(p+'-v5lvname'); if(name) name.textContent=info.name;
    const pillbg=document.getElementById(p+'-v5pillbg'); if(pillbg) pillbg.style.width=pct+'%';
    const pctEl=document.getElementById(p+'-v5lvpct'); if(pctEl) pctEl.textContent=pct+'%';
    const pillWrap = pillbg && pillbg.closest('.lv-pill');
    if (pillWrap) pillWrap.classList.toggle('is-full', pct >= 100 && !isMax);
    const eyebrow=document.getElementById(p+'-v5eyebrow');
    if(eyebrow){
      if(v5state.event==='my_birthday'||v5state.event==='friend_birthday'){
        eyebrow.textContent=v5state.event==='friend_birthday'?`🎉 ${v5state.friendName}님의 생일입니다!`:'🎂 생일 축하해요!';
        eyebrow.style.color='#ffeba0'; eyebrow.style.fontSize='13px'; eyebrow.style.textShadow='0 1px 6px rgba(255,200,0,0.6)';
      } else {
        const labelText = (typeof activeGroup !== 'undefined' && typeof groupsData !== 'undefined' && groupsData[activeGroup]) ? (groupsData[activeGroup].ddayLabel || '우리 함께한 지') : '우리 함께한 지';
        eyebrow.textContent = labelText;
        eyebrow.style.color='rgba(255,255,255,0.82)'; eyebrow.style.fontSize='11px'; eyebrow.style.textShadow='0 1px 5px rgba(0,0,0,0.45)';
      }
    }
    // sync dday
    const ddayEl = document.getElementById(p+'-v5dday');
    const mainDday = document.getElementById(p === 'dt' ? 'dt-dday' : 'mb-dday');
    if (ddayEl) {
      if (mainDday && mainDday.innerText) {
        const txt = mainDday.innerText || '1';
        ddayEl.textContent = txt.replace('D+','').replace(' 일째','').trim() || '1';
      } else if (typeof activeGroup !== 'undefined' && typeof groupsData !== 'undefined' && groupsData[activeGroup]) {
        if (!ddayEl.classList.contains('is-counting')) {
          ddayEl.textContent = Math.max(1, Number(groupsData[activeGroup].ddayCount) || 1);
        }
      }
    }
    // LP 턴테이블 배경 테마: 계절별 트랙 재생 칩
    const chipLabelEl = document.getElementById(p+'-v5chiplabel');
    if (chipLabelEl) chipLabelEl.textContent = V5_SEASON_LABEL[v5state.season] || '';
    const chipTrackEl = document.getElementById(p+'-v5chiptrack');
    if (chipTrackEl && ddayEl) chipTrackEl.textContent = ddayEl.textContent;
  }

  function v5render() {
    PREFIXES.forEach(p=>{
      const scene=document.getElementById(p+'-v5scene'); if(!scene) return;
      scene.dataset.time=v5state.time; scene.dataset.season=v5state.season;
      scene.dataset.level=v5state.level; scene.dataset.event=v5state.event;
      v5updateGround(p); v5updateMountains(p); v5updateCelestial(p);
      v5buildClovers(p); v5buildParticles(p); v5buildBalloons(p); v5updateHUD(p);
      v5ApplyWallpaperImage(p);
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

  // 배경 벽지 등록소 — 여기에 항목을 추가하고 계절별 이미지 4장만 넣으면
  // 사용자설정 배경 목록과 scene-sky 적용이 자동으로 따라온다 (CSS 수정 불필요).
  // 'field'(클로버 들판, 절차적 배경)는 항상 존재하는 기본값이라 이 목록에 넣지 않는다.
  const V5_WALLPAPERS = {
    'lp-turntable': {
      name: 'LP 턴테이블',
      icon: '💿',
      images: {
        spring: '../assets/ai-style/clov_LP_banner_spring_970x215.png',
        summer: '../assets/ai-style/clov_LP_banner_970x215.png',
        fall:   '../assets/ai-style/clov_LP_banner_autumn_970x215.png',
        winter: '../assets/ai-style/clov_LP_banner_winter_970x215.png',
      },
    },
  };
  window.V5_WALLPAPERS = V5_WALLPAPERS;

  // 배경 테마 "LP 턴테이블"의 레코드판 위치 계산 (사진은 background-size:cover이므로
  // 실제 렌더 크기에 맞춰 원본(970x215) 좌표를 스케일/오프셋 변환해야 정확히 겹친다)
  const V5_PHOTO_SRC = { w: 970, h: 215 };
  const V5_PHOTO_REC = { x: 619, y: -14, size: 279 };
  // 색종이 색상: clover-banner.html 원본 SEASON 설정값 그대로 (계절별로 다름)
  const V5_BURST_COLORS = {
    spring: ['#e05e8a','#f4a6c6','#ffd6e6','#fff3d6'],
    summer: ['#ffffff','#a3d5e8','#8ba84f','#c9dd9f'],
    fall:   ['#c2571e','#e08a3c','#f2c078','#ffe9c2'],
    winter: ['#3f7cb0','#8ec3e0','#cfe8f5','#ffffff'],
  };
  const V5_SEASON_LABEL = { spring: '봄', summer: '여름', fall: '가을', winter: '겨울' };

  // 현재 배경 테마(bgTheme)에 등록된 벽지가 있으면 계절에 맞는 이미지를 scene-sky에 적용
  function v5ApplyWallpaperImage(p) {
    const scene = document.getElementById(p+'-v5scene');
    const sky = scene && scene.querySelector('.scene-sky');
    if (!sky) return;
    const wp = V5_WALLPAPERS[scene.dataset.bgTheme];
    const src = wp && (wp.images[v5state.season] || wp.images.summer);
    sky.style.backgroundImage = src ? 'url(' + src + ')' : '';
  }
  window.v5ApplyWallpaperImage = v5ApplyWallpaperImage;

  function v5PositionPhotoRec(p) {
    const scene = document.getElementById(p+'-v5scene');
    const rec = document.getElementById(p+'-v5photorec');
    if (!scene || !rec) return;
    const w = scene.clientWidth, h = scene.clientHeight || V5_PHOTO_SRC.h;
    if (!w) return;
    const scale = Math.max(w / V5_PHOTO_SRC.w, h / V5_PHOTO_SRC.h);
    const offsetX = (w - V5_PHOTO_SRC.w * scale) / 2;
    const offsetY = (h - V5_PHOTO_SRC.h * scale) / 2;
    rec.style.left = (offsetX + V5_PHOTO_REC.x * scale) + 'px';
    rec.style.top = (offsetY + V5_PHOTO_REC.y * scale) + 'px';
    rec.style.width = (V5_PHOTO_REC.size * scale) + 'px';
    rec.style.height = (V5_PHOTO_REC.size * scale) + 'px';
  }
  window.v5PositionPhotoRec = v5PositionPhotoRec;

  // 색종이 + 음표 폭죽 스프라이트 — 원래 레코드판 클릭 전용이었으나, 다른 화면(인생4컷 완성 등)에서도
  // 재사용할 수 있도록 범용 함수로 분리. burstEl은 position:relative인 조상 안에 있는
  // .v5-photo-burst 컨테이너(width:0;height:0)면 되고, left/top으로 터지는 중심점을 잡아준다.
  function spawnConfettiBurst(burstEl, opts) {
    if (!burstEl) return;
    opts = opts || {};
    const colors = opts.colors || V5_BURST_COLORS.summer;
    const count = opts.count || 32;
    const spread = opts.spread || 110;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'v5-photo-confetti';
      const ang = Math.random() * Math.PI * 2, dist = spread * 0.42 + Math.random() * spread * 0.58, sz = 6 + Math.random() * 6;
      s.style.width = sz + 'px'; s.style.height = sz + 'px';
      s.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
      s.style.background = colors[i % colors.length];
      s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      s.style.setProperty('--dr', (Math.random() * 540 - 270) + 'deg');
      burstEl.appendChild(s);
      (function (node) { setTimeout(function () { node.remove(); }, 1000); })(s);
    }
    const glyphs = ['♪','♫','♬','♩'];
    for (let j = 0; j < 3; j++) {
      const n = document.createElement('span');
      n.className = 'v5-photo-note';
      const spreadX = (Math.random() * 2 - 1) * spread * 0.5, rise = -(70 + Math.random() * 60);
      n.textContent = glyphs[j % glyphs.length];
      n.style.fontSize = (15 + Math.random() * 11) + 'px';
      n.style.color = j % 2 ? '#fffdf7' : colors[j % colors.length];
      n.style.setProperty('--nx0', (spreadX * 0.3) + 'px');
      n.style.setProperty('--nx', spreadX + 'px');
      n.style.setProperty('--ny', rise + 'px');
      n.style.setProperty('--nr', (Math.random() * 50 - 25) + 'deg');
      n.style.animationDuration = (1.1 + Math.random() * 0.5) + 's';
      burstEl.appendChild(n);
      (function (node) { setTimeout(function () { node.remove(); }, 1700); })(n);
    }
  }
  window.spawnConfettiBurst = spawnConfettiBurst;

  // 레코드판 클릭 → 색종이 스프라이트 + 레벨업 (계절별 색상, clover-banner.html 기준)
  window.v5PhotoRecClick = function(el) {
    const scene = el.closest('.v5-scene');
    const season = (scene && scene.dataset.season) || 'summer';
    const colors = V5_BURST_COLORS[season] || V5_BURST_COLORS.summer;
    const burst = scene && scene.querySelector('.v5-photo-burst');
    if (burst) {
      const recRect = el.getBoundingClientRect(), sceneRect = scene.getBoundingClientRect();
      burst.style.left = (recRect.left - sceneRect.left + recRect.width / 2) + 'px';
      burst.style.top = (recRect.top - sceneRect.top + recRect.height / 2) + 'px';
      spawnConfettiBurst(burst, { colors, spread: Math.max(90, recRect.width * 0.55) });
    }
    if (typeof v5LevelUp === 'function') v5LevelUp();
  };


  // 테스트 패널 동적 생성 (DOM 타이밍 문제 방지)
  (function() {
    const panel = document.createElement('aside');
    panel.className = 'v5-test-panel';
    panel.innerHTML = `
      <p class="tp-title" id="tpToggle"><span>🎛️ 배너 테마 테스트</span><span class="tp-chevron">▾</span></p>
      <div class="tp-body" id="tpBody">
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
          <input type="range" id="v5lvSlider" min="1" max="777" value="3" step="1" style="flex:1;accent-color:#1b4332;cursor:pointer;">
          <span id="v5lvSliderVal" style="font-size:12px;font-weight:900;color:#1b4332;min-width:16px;text-align:center;">3</span>
        </div>
        <div id="v5lvDesc" style="font-size:10px;color:#5c7a6a;font-weight:700;text-align:center;margin-bottom:4px;">초록 클로버 우정</div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:10px;color:#5c7a6a;font-weight:700;white-space:nowrap;">진행률</span>
          <input type="range" id="v5progressSlider" min="0" max="100" value="0" step="1" style="flex:1;accent-color:#1b4332;cursor:pointer;">
          <span id="v5progressSliderVal" style="font-size:12px;font-weight:900;color:#1b4332;min-width:28px;text-align:center;">0%</span>
        </div>
      </div>
      <div class="tp-divider"></div>
      <div class="tp-row">
        <span class="tp-label tp-label-pink">💌 편지함 테스트</span>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <input type="range" id="letterTestSlider" min="0" max="8" value="2" step="1" class="tp-slider-pink" style="flex:1;cursor:pointer;">
          <span id="letterTestSliderVal" class="tp-pink-val">2</span>
        </div>
        <div class="tp-btns">
          <button class="tp-btn tp-btn-pink" id="letterTestZero" type="button">📭 0개로 비우기</button>
          <button class="tp-btn tp-btn-pink" id="letterTestFull" type="button">📬 가득 채우기</button>
          <button class="tp-btn tp-btn-pink" id="letterTestRestore" type="button">↺ 원래대로</button>
        </div>
      </div>
      <div class="tp-divider"></div>
      <button class="tp-reset" id="v5resetBtn">⏱ 현재 시간으로 복귀</button>
      </div>
    `;
    document.body.appendChild(panel);
    const tpToggle = document.getElementById('tpToggle');
    if (tpToggle) {
      tpToggle.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
      });
    }
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
        if(descEl) descEl.textContent = clovLevelInfo(v5state.level).name;
        v5render();
      });
    }
    // 진행률(%) 슬라이더 바인딩 — 레벨과 별개로 게이지 %만 즉시 테스트
    const progressSlider = document.getElementById('v5progressSlider');
    if(progressSlider && !progressSlider._v5bound) {
      progressSlider._v5bound = true;
      progressSlider.addEventListener('input', function() {
        const valEl = document.getElementById('v5progressSliderVal');
        if(valEl) valEl.textContent = this.value + '%';
        if(typeof groupsData !== 'undefined' && groupsData[activeGroup]) {
          groupsData[activeGroup].levelProgress = +this.value;
        }
        v5render();
      });
    }
    // 편지함 테스트 바인딩
    const letterFillerPool = [
      { from: "단짝친구 🍀", text: "오늘 하루도 고생 많았어. 내일은 더 좋은 일만 가득하길!", favorite: false },
      { from: "단짝친구 🍀", text: "네가 있어서 요즘 하루하루가 든든해. 항상 고마워!", favorite: false },
      { from: "단짝친구 🍀", text: "다음 주말엔 미뤄뒀던 약속 꼭 잡자, 보고 싶다!", favorite: false },
      { from: "단짝친구 🍀", text: "힘든 일 있으면 언제든 말해. 내가 옆에 있을게.", favorite: false },
      { from: "단짝친구 🍀", text: "요즘 부쩍 웃을 일이 많아진 건 다 너 덕분이야.", favorite: false },
      { from: "단짝친구 🍀", text: "사소한 순간에도 네 생각이 나. 좋은 친구를 둬서 행운이다.", favorite: false }
    ];
    function applyLetterTestCount(n) {
      if (typeof groupsData === 'undefined' || typeof activeGroup === 'undefined') return;
      const g = groupsData[activeGroup];
      if (!g) return;
      if (!window._letterTestBackup) window._letterTestBackup = {};
      if (!window._letterTestBackup[activeGroup]) {
        window._letterTestBackup[activeGroup] = JSON.parse(JSON.stringify(g.letters || []));
      }
      const backup = window._letterTestBackup[activeGroup];
      let letters;
      if (n <= backup.length) {
        letters = backup.slice(0, n);
      } else {
        letters = backup.concat(
          Array.from({ length: n - backup.length }, (_, i) => letterFillerPool[i % letterFillerPool.length])
        );
      }
      g.letters = letters;
      const valEl = document.getElementById('letterTestSliderVal');
      const sliderEl = document.getElementById('letterTestSlider');
      if (valEl) valEl.textContent = n;
      if (sliderEl) sliderEl.value = n;
      if (typeof renderLetters === 'function') renderLetters();
    }
    const letterSlider = document.getElementById('letterTestSlider');
    if (letterSlider && !letterSlider._v5bound) {
      letterSlider._v5bound = true;
      letterSlider.addEventListener('input', function() {
        applyLetterTestCount(+this.value);
      });
    }
    const letterZeroBtn = document.getElementById('letterTestZero');
    if (letterZeroBtn && !letterZeroBtn._v5bound) {
      letterZeroBtn._v5bound = true;
      letterZeroBtn.addEventListener('click', () => applyLetterTestCount(0));
    }
    const letterFullBtn = document.getElementById('letterTestFull');
    if (letterFullBtn && !letterFullBtn._v5bound) {
      letterFullBtn._v5bound = true;
      letterFullBtn.addEventListener('click', () => applyLetterTestCount(8));
    }
    const letterRestoreBtn = document.getElementById('letterTestRestore');
    if (letterRestoreBtn && !letterRestoreBtn._v5bound) {
      letterRestoreBtn._v5bound = true;
      letterRestoreBtn.addEventListener('click', () => {
        if (window._letterTestBackup && window._letterTestBackup[activeGroup]) {
          applyLetterTestCount(window._letterTestBackup[activeGroup].length);
        }
      });
    }
  }
  // 패널이 위에서 동적 생성됐으므로 바로 바인딩 가능
  v5bindButtons(); v5syncButtons();

  // 초기화 (별 미리 생성)
  PREFIXES.forEach(p=>v5buildStars(p));
  v5detectNow(); v5render();
  PREFIXES.forEach(p=>v5PositionPhotoRec(p));
  window.addEventListener('resize', function(){ PREFIXES.forEach(p=>v5PositionPhotoRec(p)); });

  // 기존 updateFriendshipUI와 연동
  const _origUpdateFriendshipUI = window.updateFriendshipUI;
  window.updateFriendshipUI = function() {
    if(_origUpdateFriendshipUI) _origUpdateFriendshipUI.apply(this, arguments);
    if(typeof friendshipLevel!=='undefined') v5state.level=friendshipLevel;
    const sl=document.getElementById('v5lvSlider'), sv=document.getElementById('v5lvSliderVal'), sd=document.getElementById('v5lvDesc');
    if(sl) sl.value=v5state.level;
    if(sv) sv.textContent=v5state.level;
    if(sd) sd.textContent=clovLevelInfo(v5state.level).name;
    const grp = (typeof groupsData !== 'undefined' && groupsData[activeGroup]) || {};
    const pctNow = v5state.level >= CLOV_MAX_LEVEL ? 100 : Math.round(typeof grp.levelProgress === 'number' ? grp.levelProgress : 0);
    const psl=document.getElementById('v5progressSlider'), psv=document.getElementById('v5progressSliderVal');
    if(psl) psl.value=pctNow;
    if(psv) psv.textContent=pctNow + '%';
    v5render();
  };
})();
/* ══════════════════════ END V5 BANNER ENGINE ══════════════════════ */





