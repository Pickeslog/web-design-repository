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
    mutterMaxGap: 15000   // 혼잣말 최대 간격
  };
  var SPRITES = {
    default: 'assets/croby/croby_default.png',
    dizzy:   'assets/croby/croby_dizzy.png',
    sleepy:  'assets/croby/croby_sleepy.png'
  };
  var STATE_BUBBLES = { dizzy: '어지러워…!', sleepy: 'Zzz…' };
  var LINES = [
    '안녕!', '오늘도 낙서 중~', '좋은 컷 떠올랐어!', '연필 어디 갔지…',
    '뭐 그려줄까?', '마감은 내일의 나에게!',
    '인생4컷 찍어 보는 게 어때?', '대표사진 등록해 보는 게 어때?',
    '완성된 4컷 사진이 있으면 입장하기 눌러봐!'
  ];
  var MUTTERS = ['흐음… 다음 컷은…', '슥슥…', '구도가 어렵네…', '아이디어 떠올라라~', '오늘 뭐 올라왔지?'];

  // 위젯 DOM 동적 생성 (테스트 패널과 동일한 방식)
  var root = document.createElement('div');
  root.className = 'croby-mascot croby--default';
  root.id = 'croby';
  root.dataset.state = 'default';
  root.innerHTML =
    '<div class="croby-bubble" id="croby-bubble" hidden></div>' +
    '<button type="button" class="croby-hit" id="croby-hit" aria-label="크로비">' +
      '<img class="croby-sprite" id="croby-sprite" src="' + SPRITES.default + '" alt="" draggable="false">' +
    '</button>';
  document.body.appendChild(root);

  var sprite = document.getElementById('croby-sprite');
  var bubble = document.getElementById('croby-bubble');
  var hit    = document.getElementById('croby-hit');

  var mode = 'default';
  var say = '';
  var nudgeClass = '';
  var nudgeFlip = false;
  var clickTimes = [];
  var lastLine = '', lastMutter = '';
  var idleTimer, dizzyTimer, sayTimer, nudgeTimer, mutterTimer;

  function render() {
    sprite.src = SPRITES[mode];
    root.dataset.state = mode;
    root.className = 'croby-mascot croby--' + mode + (mode === 'default' && nudgeClass ? ' ' + nudgeClass : '');
    var text = mode === 'default' ? say : STATE_BUBBLES[mode];
    bubble.hidden = !text;
    bubble.innerHTML = text || '';
  }

  function setMode(next) { mode = next; render(); }

  function pick(pool, last) {
    var line = pool[Math.floor(Math.random() * pool.length)];
    if (line === last) line = pool[(pool.indexOf(line) + 1) % pool.length];
    return line;
  }

  function showSay(text, ms) {
    say = text;
    clearTimeout(sayTimer);
    sayTimer = setTimeout(function () { say = ''; render(); }, ms);
    render();
  }

  /* idle → sleepy */
  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (mode !== 'dizzy') setMode('sleepy');
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
    if (mode === 'sleepy') { clickTimes = []; setMode('default'); return; }
    var now = Date.now();
    clickTimes = clickTimes.filter(function (t) { return now - t < CONFIG.clickWindowMs; });
    clickTimes.push(now);
    if (clickTimes.length >= CONFIG.clicksToDizzy && mode !== 'dizzy') {
      clickTimes = [];
      setMode('dizzy');
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
      /* 대사 한마디 (단, XP 획득 등 외부 연동 시 덮어씌워짐) */
      var currentLines = LINES;
      if (typeof window.v5state !== 'undefined') {
        if (window.v5state.event === 'my_birthday') {
          currentLines = [
            '생일 정말 축하해! 오늘 하루 최고로 행복하길 바랄게!', 
            '태어나줘서 고마워!', 
            '오늘의 주인공은 바로 너야!', 
            '특별한 날인 만큼 예쁜 추억 많이 남기자!'
          ];
        } else if (window.v5state.event === 'friend_birthday') {
          var fName = window.v5state.friendName || '친구';
          currentLines = [
            '오늘은 ' + fName + '의 생일이야! 다 같이 축하해주자!', 
            fName + '에게 따뜻한 생일 축하 메시지를 남겨보는 건 어때?', 
            '생일 파티 준비는 잘 되어가고 있어?'
          ];
        }
      }
      
      lastLine = pick(currentLines, lastLine);
      window.lastMascotLine = lastLine; // grantXP에서 덮어씌울 때 참고하도록 전역 저장
      showSay(lastLine, CONFIG.sayMs);
      
      try {
        if (typeof window.v5LevelUp === 'function') {
          window.v5LevelUp();
        } else if (typeof window.levelUp === 'function') {
          window.levelUp();
        } else {
          showSay("levelUp 함수를 찾을 수 없어요!", 5000);
        }
      } catch (e) {
        showSay("에러: " + e.message, 5000);
      }
    }
  });

  /* 방치 중 가끔 혼잣말 (default 상태에서만) */
  function scheduleMutter() {
    var delay = CONFIG.mutterMinGap + Math.random() * (CONFIG.mutterMaxGap - CONFIG.mutterMinGap);
    mutterTimer = setTimeout(function () {
      if (mode === 'default' && !say) {
        lastMutter = pick(MUTTERS, lastMutter);
        showSay(lastMutter, CONFIG.mutterMs);
      }
      scheduleMutter();
    }, delay);
  }
  scheduleMutter();

  // 외부(desktop.js 등)에서 경험치 상승 시 말풍선을 띄울 수 있도록 API 노출
  window.ClovMascot = {
    say: function(text, ms) {
      if (mode === 'sleepy') setMode('default'); // 자고 있으면 깨움
      showSay(text, ms || 2500);
    }
  };

  render();
})();
