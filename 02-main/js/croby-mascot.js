/* ══════════════════════════════════════════════════════════
   크로비(Croby) 마스코트 — 바닐라 JS 상태 머신
   상태: 'default' | 'dizzy' | 'sleepy'
   원본: # 크로비 사이드바 마스코트/handoff/croby-mascot-demo.html
   ══════════════════════════════════════════════════════════ */
(function () {
  var CONFIG = {
    idleMs: 20000,        // 무입력 → sleepy
    dizzyMs: 1200,        // dizzy 리액션 유지
    clickWindowMs: 900,   // 연속 클릭 판정 윈도우
    clicksToDizzy: 3,     // dizzy 트리거 클릭 수
    sayMs: 1800,          // 클릭 대사 표시 시간
    mutterMs: 2600,       // 혼잣말 표시 시간
    mutterMinGap: 8000,   // 혼잣말 최소 간격
    mutterMaxGap: 15000,  // 혼잣말 최대 간격
    typeMs: 55,            // 로봇 대사 타이핑 속도(글자당 ms)
    scaredHeightPx: 150,   // 이 높이(px) 이상 들어올리면 lifted → scared 전환
    angryAfterScaredMs: 3000 // scared 진입 후 angry까지 걸리는 시간
  };
  var CHARACTERS = {
    croby: {
      default: 'assets/croby/croby_default.png',
      dizzy:   'assets/croby/croby_dizzy.png',
      sleepy:  'assets/croby/croby_sleepy.png'
    },
    robot: {
      default: 'assets/rob/idle.png',
      dizzy:   'assets/rob/dizzy.png',
      sleepy:  'assets/rob/sleep.png',
      lifted:  'assets/rob/pulled.png',
      scared:  'assets/rob/scared.png',
      angry:   'assets/rob/angry.png',
      find:    'assets/rob/find.png',
      pencil:  'assets/rob/pencil.png'
    }
  };

  var character = (localStorage.getItem('clov_mascotCharacter') === 'robot') ? 'robot' : 'croby';

  function sprites() { return CHARACTERS[character] || CHARACTERS.croby; }

  var SLEEPY_BUBBLE = 'Zzz…'; // 잠들었을 때 대사는 캐릭터와 무관하게 공통 유지
  var TEXT = {
    croby: {
      dizzy: '어지러워…!',
      lines: [
        '안녕!', '오늘도 낙서 중~', '좋은 컷 떠올랐어!', '연필 어디 갔지…',
        '뭐 그려줄까?', '마감은 내일의 나에게!',
        '인생4컷 찍어 보는 게 어때?', '대표사진 등록해 보는 게 어때?',
        '완성된 4컷 사진이 있으면 입장하기 눌러봐!'
      ],
      mutters: ['흐음… 다음 컷은…', '슥슥…', '구도가 어렵네…', '아이디어 떠올라라~', '오늘 뭐 올라왔지?']
    },
    robot: {
      dizzy: '001011010101(어지러워..)',
      lines: ['Clov.에 온걸 환영해', greetLine, '인간 시대에 끝이 도래했다'],
      mutters: ['Clov.에 온걸 환영해', greetLine, '인간 시대에 끝이 도래했다']
    }
  };

  function texts() { return TEXT[character] || TEXT.croby; }
  function greetLine() { return '안녕 ' + getNickname() + ' 내 이름은 롭이야!'; }
  function resolveLine(item) { return typeof item === 'function' ? item() : item; }

  function getNickname() { return localStorage.getItem('clov_profile_nickname') || '사용자'; }

  /* 로봇 전용: 머리를 잡고 들어올릴 때의 대사(들어올림/무서움 단계는 고정 문구, 화남 단계는 사용자 이름 삽입) */
  var DRAG_LINES = { lifted: '오오 늘어난다..', scared: '너무 높아!!' };
  function getAngryLine() {
    return '날 내려놔, ' + getNickname() + '!';
  }

  /* 롭 전용: 클릭 시 가끔 등장하는 특수 리액션 — 대사와 함께 잠깐 다른 스프라이트로 바뀐다 */
  var ROBOT_CLICK_EXTRAS = [
    { spriteKey: 'find', getText: function () { return '기록된 추억을 되돌아보자, ' + getNickname() + '!'; } },
    { spriteKey: 'pencil', text: '추억을 남기는 습관은 좋은거야' }
  ];

  /* 클릭 한 번에 보여줄 대사(+선택적 스프라이트)를 고른다.
     로봇은 기존 대사 풀에 ROBOT_CLICK_EXTRAS(스프라이트 교체 리액션)를 더해서 뽑는다. */
  function pickReaction() {
    var pool = texts().lines.map(function (t) { return { text: resolveLine(t) }; });
    if (character === 'robot') {
      pool = pool.concat(ROBOT_CLICK_EXTRAS.map(function (r) {
        return { text: r.text || r.getText(), spriteKey: r.spriteKey };
      }));
    }
    var choice = pool[Math.floor(Math.random() * pool.length)];
    if (choice.text === lastLine && pool.length > 1) {
      choice = pool[(pool.indexOf(choice) + 1) % pool.length];
    }
    lastLine = choice.text;
    return choice;
  }

  // 위젯 DOM 동적 생성 (테스트 패널과 동일한 방식)
  var root = document.createElement('div');
  root.className = 'croby-mascot croby--default';
  root.id = 'croby';
  root.dataset.state = 'default';
  root.innerHTML =
    '<div class="croby-bubble" id="croby-bubble" hidden></div>' +
    '<button type="button" class="croby-hit" id="croby-hit" aria-label="마스코트">' +
      '<span class="croby-glitch" id="croby-glitch"></span>' +
      '<img class="croby-sprite" id="croby-sprite" src="' + sprites().default + '" alt="" draggable="false">' +
    '</button>';
  document.body.appendChild(root);

  var sprite = document.getElementById('croby-sprite');
  var bubble = document.getElementById('croby-bubble');
  var hit    = document.getElementById('croby-hit');
  var glitch = document.getElementById('croby-glitch');

  var mode = 'default';
  var say = '';
  var nudgeClass = '';
  var nudgeFlip = false;
  var clickTimes = [];
  var lastLine = '', lastMutter = '';
  var idleTimer, dizzyTimer, sayTimer, nudgeTimer, mutterTimer, glitchTimer, typeTimer;
  var typingFor = ''; // 현재 타이핑 중(또는 다 친) 대사 — 같은 텍스트로 재렌더될 때 처음부터 다시 치지 않도록
  var overrideSprite = null; // 클릭 리액션(find/pencil 등)이 default 상태의 idle 스프라이트를 잠깐 대신할 때 사용

  /* 로봇 전용: 터미널처럼 대사를 한 글자씩 타이핑 + 깜빡이는 커서 */
  function typeBubble(text) {
    clearInterval(typeTimer);
    bubble.innerHTML = '<span class="croby-type-text"></span><span class="croby-type-cursor"></span>';
    var textEl = bubble.querySelector('.croby-type-text');
    var prefix = '> ';
    var i = 0;
    textEl.textContent = prefix;
    typeTimer = setInterval(function () {
      if (i >= text.length) { clearInterval(typeTimer); typeTimer = null; return; }
      textEl.textContent += text[i];
      i++;
    }, CONFIG.typeMs);
  }

  /* 로봇 전용: 어지러울 때 근처에 빨간 0/1이 튀는 "오류 발생" 연출 */
  function spawnGlitch() {
    if (character !== 'robot') return;
    glitch.innerHTML = '';
    var count = 14;
    for (var i = 0; i < count; i++) {
      var bit = document.createElement('span');
      bit.className = 'croby-glitch-bit';
      bit.textContent = Math.random() < 0.5 ? '0' : '1';
      var angle = Math.random() * Math.PI * 2;
      var dist = 26 + Math.random() * 46;
      bit.style.left = (50 + (Math.random() * 70 - 35)) + '%';
      bit.style.top = (45 + (Math.random() * 60 - 30)) + '%';
      bit.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      bit.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
      bit.style.fontSize = (10 + Math.random() * 8) + 'px';
      bit.style.animationDelay = (Math.random() * 0.2) + 's';
      glitch.appendChild(bit);
    }
    clearTimeout(glitchTimer);
    glitchTimer = setTimeout(function () { glitch.innerHTML = ''; }, CONFIG.dizzyMs + 300);
  }

  /* 롭이 화나서 뿌리칠 때: 마우스 커서가 유리처럼 박살나는 연출 (2초간 숨겼다 복구) */
  var cursorShatterLayer, cursorRestoreTimer;
  function spawnCursorShatter(x, y) {
    if (!cursorShatterLayer) {
      cursorShatterLayer = document.createElement('div');
      cursorShatterLayer.className = 'croby-cursor-shatter';
      document.body.appendChild(cursorShatterLayer);
    }
    cursorShatterLayer.style.left = x + 'px';
    cursorShatterLayer.style.top = y + 'px';
    cursorShatterLayer.innerHTML = '';
    var count = 12;
    for (var i = 0; i < count; i++) {
      var shard = document.createElement('span');
      shard.className = 'croby-cursor-shard';
      var angle = Math.random() * Math.PI * 2;
      var dist = 18 + Math.random() * 42;
      shard.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      shard.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(1) + 'px');
      shard.style.setProperty('--rot', (Math.random() * 360).toFixed(0) + 'deg');
      shard.style.animationDelay = (Math.random() * 0.08) + 's';
      cursorShatterLayer.appendChild(shard);
    }
    document.documentElement.classList.add('croby-cursor-hidden');
    clearTimeout(cursorRestoreTimer);
    cursorRestoreTimer = setTimeout(function () {
      document.documentElement.classList.remove('croby-cursor-hidden');
      cursorShatterLayer.innerHTML = '';
    }, 2000);
  }

  function render() {
    if (mode !== 'default') overrideSprite = null; // default가 아니면 클릭 리액션 스프라이트는 무효
    sprite.src = overrideSprite || sprites()[mode];
    root.dataset.state = mode;
    root.dataset.character = character;
    root.className = 'croby-mascot croby--' + mode + (mode === 'default' && nudgeClass ? ' ' + nudgeClass : '');

    if (mode === 'default') {
      bubble.hidden = !say;
      if (!say) {
        clearInterval(typeTimer); typeTimer = null; typingFor = '';
        bubble.textContent = '';
      } else if (character === 'robot') {
        if (typingFor !== say) { typingFor = say; typeBubble(say); } // 이미 타이핑 중인 동일 대사는 재시작하지 않음
      } else {
        clearInterval(typeTimer); typeTimer = null; typingFor = '';
        bubble.textContent = say;
      }
      return;
    }

    clearInterval(typeTimer); typeTimer = null; typingFor = '';
    var text;
    if (mode === 'sleepy') text = SLEEPY_BUBBLE;
    else if (mode === 'lifted') text = DRAG_LINES.lifted;
    else if (mode === 'scared') text = DRAG_LINES.scared;
    else if (mode === 'angry') text = getAngryLine();
    else text = texts().dizzy;
    bubble.hidden = !text;
    bubble.textContent = (text && character === 'robot') ? '> ' + text : (text || '');
  }

  function setMode(next) { mode = next; render(); }

  function pick(pool, last) {
    var idx = Math.floor(Math.random() * pool.length);
    var line = resolveLine(pool[idx]);
    if (line === last) line = resolveLine(pool[(idx + 1) % pool.length]);
    return line;
  }

  function showSay(text, ms, spriteKey) {
    say = text;
    overrideSprite = spriteKey ? sprites()[spriteKey] : null;
    clearTimeout(sayTimer);
    sayTimer = setTimeout(function () { say = ''; overrideSprite = null; render(); }, ms);
    render();
  }

  /* idle → sleepy */
  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (mode === 'default') setMode('sleepy');
    }, CONFIG.idleMs);
  }

  /* 전역 활동 감지: 깨우기 + idle 리셋 */
  ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(function (ev) {
    window.addEventListener(ev, function () {
      resetIdle();
      if (mode === 'sleepy') setMode('default');
    }, { passive: true });
  });
  resetIdle();

  /* 클릭: 단일 = 흔들 + 대사 / 0.9초 내 3연타 = dizzy */
  hit.addEventListener('click', function () {
    if (justDragged) { justDragged = false; return; } // 드래그 직후 따라오는 click은 무시
    if (mode === 'sleepy') { clickTimes = []; setMode('default'); return; }
    var now = Date.now();
    clickTimes = clickTimes.filter(function (t) { return now - t < CONFIG.clickWindowMs; });
    clickTimes.push(now);
    if (clickTimes.length >= CONFIG.clicksToDizzy && mode !== 'dizzy') {
      clickTimes = [];
      setMode('dizzy');
      spawnGlitch();
      clearTimeout(dizzyTimer);
      dizzyTimer = setTimeout(function () {
        if (mode === 'dizzy') setMode('default');
      }, CONFIG.dizzyMs);
    } else if (mode === 'default') {
      /* 좌우 흔들기 — 키프레임 교대로 매번 재시작 */
      nudgeFlip = !nudgeFlip;
      nudgeClass = nudgeFlip ? 'croby--nudge' : 'croby--nudge2';
      clearTimeout(nudgeTimer);
      nudgeTimer = setTimeout(function () { nudgeClass = ''; render(); }, 380);
      /* 대사 한마디 (로봇은 가끔 find/pencil 리액션으로 스프라이트도 함께 바뀐다) */
      var reaction = pickReaction();
      showSay(reaction.text, CONFIG.sayMs, reaction.spriteKey);
    }
  });

  /* 롭 전용: 머리를 잡고 들어올리는 드래그 연출
     들어올림(pulled) → 일정 높이(scaredHeightPx) 이상 들어올리면 무서워함(scared, 버둥거림)
     → scared 진입 후 angryAfterScaredMs 뒤 화남(angry, 커서 박살 + 즉시 낙하) */
  var pendingDrag = false, isDragging = false, justDragged = false;
  var dragStartX = 0, dragStartY = 0, dockCenterX = 0, dockCenterY = 0;
  var lastClientX = 0, lastClientY = 0;
  var liftTimer2, angryEndTimer, dropCleanupTimer;

  function followPointer(clientX, clientY) {
    lastClientX = clientX; lastClientY = clientY;
    root.style.transform = 'translate(' + (clientX - dockCenterX).toFixed(1) + 'px,' + (clientY - dockCenterY).toFixed(1) + 'px)';
    // 잡고 있는 동안 일정 높이 이상 들어올리면 그제서야 무서워한다(scared)
    if (mode === 'lifted' && (dockCenterY - clientY) > CONFIG.scaredHeightPx) enterScared();
  }

  function enterScared() {
    mode = 'scared';
    render();
    clearTimeout(liftTimer2);
    liftTimer2 = setTimeout(triggerAngryDrop, CONFIG.angryAfterScaredMs);
  }

  function dropBack() {
    root.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
    root.style.transform = '';
    clearTimeout(dropCleanupTimer);
    dropCleanupTimer = setTimeout(function () { root.style.transition = ''; }, 420);
  }

  function startLift(clientX, clientY) {
    isDragging = true;
    pendingDrag = false;
    justDragged = true;
    clearTimeout(sayTimer);
    var dockRect = root.getBoundingClientRect();
    dockCenterX = dockRect.left + dockRect.width / 2;
    dockCenterY = dockRect.top + dockRect.height / 2;
    root.style.transition = 'none';
    mode = 'lifted';
    render();
    clearTimeout(liftTimer2);
    followPointer(clientX, clientY); // 이미 처음부터 임계 높이를 넘겨 잡았다면 바로 scared로 전환됨
  }

  function triggerAngryDrop() {
    if (!isDragging) return;
    isDragging = false;
    clearTimeout(liftTimer2);
    mode = 'angry';
    render();
    spawnCursorShatter(lastClientX, lastClientY);
    dropBack();
    clearTimeout(angryEndTimer);
    angryEndTimer = setTimeout(function () {
      if (mode === 'angry') { mode = 'default'; say = ''; render(); resetIdle(); }
    }, 1400);
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    clearTimeout(liftTimer2);
    dropBack();
    mode = 'default'; say = '';
    render();
    resetIdle();
  }

  hit.addEventListener('pointerdown', function (e) {
    if (character !== 'robot' || mode !== 'default') return;
    var rect = hit.getBoundingClientRect();
    if (e.clientY - rect.top > rect.height * 0.5) return; // 상단 절반(머리 부분)을 잡았을 때만 인정
    dragStartX = e.clientX; dragStartY = e.clientY;
    pendingDrag = true;
  });

  window.addEventListener('pointermove', function (e) {
    if (pendingDrag && !isDragging) {
      if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) > 6) startLift(e.clientX, e.clientY);
    } else if (isDragging) {
      followPointer(e.clientX, e.clientY);
    }
  });

  ['pointerup', 'pointercancel'].forEach(function (ev) {
    window.addEventListener(ev, function () {
      pendingDrag = false;
      endDrag();
    });
  });

  /* 방치 중 가끔 혼잣말 (default 상태에서만) */
  function scheduleMutter() {
    var delay = CONFIG.mutterMinGap + Math.random() * (CONFIG.mutterMaxGap - CONFIG.mutterMinGap);
    mutterTimer = setTimeout(function () {
      if (mode === 'default' && !say) {
        lastMutter = pick(texts().mutters, lastMutter);
        showSay(lastMutter, CONFIG.mutterMs);
      }
      scheduleMutter();
    }, delay);
  }
  scheduleMutter();

  render();

  /* 사용자설정에서 캐릭터 전환 시 호출 (components/clov-profile-modal.js) */
  window.CrobyMascot = {
    getCharacter: function () { return character; },
    setCharacter: function (id) {
      character = CHARACTERS[id] ? id : 'croby';
      clearInterval(typeTimer); typeTimer = null; typingFor = '';
      overrideSprite = null;
      render();
    }
  };
})();
