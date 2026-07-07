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
                // opacity/pointer-events는 애니메이션이 취소되는 시점·순서에 따라 미묘하게
                // 어긋날 여지가 있어서, display:none으로 아예 렌더링 자체를 끊어 애니메이션
                // 상태와 무관하게 확실히 안 보이도록 이중으로 막는다.
                theater.style.display = 'none';
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
                // fourCutResetTheater()가 display:none으로 꺼뒀으니 다시 렌더링되게 되돌린다
                theater.style.display = '';
                theater.style.pointerEvents = 'auto';
                theater.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 340, fill: 'forwards' });
                // 애니메이션과 별개로 실제 바탕(인라인) 값도 1로 맞춰둔다 — 그래야 나중에
                // 이 애니메이션이 취소되는 시점에 옛 바탕값(0)으로 되돌아가지 않는다.
                theater.style.opacity = '1';
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
                // 애니메이션이 페이드아웃을 보여주는 동안, 실제 인라인 스타일(바탕값)도 같이 0으로
                // 못박아둔다 — 안 그러면 이 애니메이션이 (예: 곧바로 X를 눌러) 중간에 취소될 때
                // enter() 이후로 갱신된 적 없는 옛 바탕값으로 되돌아가 커튼이 다시 보이는 문제가 있었다.
                theater.style.opacity = '0';
                theater.style.pointerEvents = 'none';
                // 페이드아웃이 끝난 뒤에는 display:none으로 렌더링 자체를 끊어서, opacity/애니메이션
                // 상태가 무엇이 됐든(취소·경합 등) 화면에 다시 보일 방법 자체를 없앤다.
                fourCutState.ticks.push(setTimeout(() => {
                    if (document.getElementById('dt-fourcut-theater') === theater) {
                        theater.style.display = 'none';
                    }
                }, 340));
            }
            fourCutResetChildren();
        }

        window.fourCutEnter = fourCutEnter;
        window.fourCutEnterAt = fourCutEnterAt;
        window.fourCutSit = fourCutSit;
        window.fourCutExit = fourCutExit;
        window.fourCutNav = fourCutNav;

        // 일정 세부 기입 내용 저장 및 양방향 실시간 동기화
