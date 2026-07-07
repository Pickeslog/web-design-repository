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
        let activeFeedSort = 'new';   // 'new' = 최신순 / 'old' = 오래된순
        let activeFeedSearch = '';    // 소문자·trim된 검색어 (빈 문자열이면 검색 안 함)
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

