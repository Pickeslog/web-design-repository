/* ══════════════════════ V5 BANNER ENGINE ══════════════════════ */
(function() {
  const NS = 'http://www.w3.org/2000/svg';
  const PREFIXES = ['dt', 'mb'];

  // State
  const v5state = { level: 3, time: 'day', season: 'summer', event: 'none', friendName: '민지' };
  window.v5state = v5state; // 전역 스코프(window)에 노출시켜 마스코트(croby-mascot.js)와 연동

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
    if (typeof window.levelUp === 'function') {
      window.levelUp();
    } else if (typeof levelUp === 'function') {
      levelUp();
    } else {
      if (window.ClovMascot && typeof window.ClovMascot.say === 'function') {
        window.ClovMascot.say("v5-banner: levelUp 함수를 찾을 수 없어요!", 5000);
      }
    }
    
    if(typeof window.friendshipLevel !== 'undefined') {
      v5state.level = window.friendshipLevel;
    } else if(typeof friendshipLevel !== 'undefined') {
      v5state.level = friendshipLevel;
    }
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
        <span class="tp-label tp-label-pink" style="color:#1b4332;">⚙️ 제한 설정 & 테스트</span>
        <div class="tp-btns" style="display:flex; flex-direction:column; gap:4px;">
          <button class="tp-btn on" id="limitToggleBtn" style="flex:1;">하루 3회 교감 제한: ON</button>
          <button class="tp-btn" id="forcePassiveBtn" style="flex:1; background:#fff3cd; color:#856404;">✨ 어제자 방치형 보상 즉시 발생</button>
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

    // 3회 제한 토글 바인딩
    const limitToggleBtn = document.getElementById('limitToggleBtn');
    if(limitToggleBtn && !limitToggleBtn._v5bound) {
      limitToggleBtn._v5bound = true;
      limitToggleBtn.addEventListener('click', () => {
        window.CLOV_DISABLE_CLICK_LIMIT = !window.CLOV_DISABLE_CLICK_LIMIT;
        if (window.CLOV_DISABLE_CLICK_LIMIT) {
          limitToggleBtn.classList.remove('on');
          limitToggleBtn.textContent = '하루 3회 교감 제한: OFF (무제한)';
          limitToggleBtn.style.background = '#f1f5f9';
          limitToggleBtn.style.color = '#334155';
        } else {
          limitToggleBtn.classList.add('on');
          limitToggleBtn.textContent = '하루 3회 교감 제한: ON';
          limitToggleBtn.style.background = ''; // 원래 스타일로 복귀
          limitToggleBtn.style.color = '';
        }
      });
    }

    // 방치형 보상 강제 발생 버튼 바인딩
    const forcePassiveBtn = document.getElementById('forcePassiveBtn');
    if(forcePassiveBtn && !forcePassiveBtn._v5bound) {
      forcePassiveBtn._v5bound = true;
      forcePassiveBtn.addEventListener('click', () => {
        if (typeof window.forcePassiveTest === 'function') {
            window.forcePassiveTest();
        } else {
            alert("테스트 함수(window.forcePassiveTest)를 찾을 수 없습니다.");
        }
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
        
        let infoName = '새싹';
        if (typeof clovLevelInfo === 'function') {
            infoName = clovLevelInfo(v5state.level).name;
        }
        if(descEl) descEl.textContent = infoName;
        v5render();

        // 실제 메모리에 있는 로직용 레벨도 동기화
        if (typeof window.forceLevelTest === 'function') {
            window.forceLevelTest(v5state.level);
        }
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





