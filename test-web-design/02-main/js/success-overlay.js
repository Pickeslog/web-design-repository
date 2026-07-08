/* Clov. 로그인 성공 오버레이 — 공통 컴포넌트
   사용: ClovSuccessOverlay.show({ redirectUrl, durationMs, onDone }) */
(function () {
  var WELCOME_LINES = [
    function (name) { return '돌아온걸 환영해요. ' + name + '님!'; },
    function (name) { return name + '님, Clov.와 함께 기록할 준비는 되셨나요?'; },
    function () { return 'Clov. 가 당신만을 기다리고 있었어요!'; },
    function () { return 'Clov. 에서 기록의 재미를 느껴봐요!'; }
  ];
  var EASTER_EGGS = [
    '롭의 머리를 잡고 위로 들어올려보세요',
    '롭을 빠르게 세 번 클릭해보세요',
    '롭을 너무 오래 들고 있으면 화를 낼지도 몰라요'
  ];

  function getNickname() {
    return localStorage.getItem('clov_profile_nickname') || '사용자';
  }
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  var LEAVES = [
    { left: '6%',  size: 8,  duration: 4.6, delay: 0    },
    { left: '16%', size: 6,  duration: 5.4, delay: 1.4  },
    { left: '27%', size: 9,  duration: 4.0, delay: 0.6  },
    { left: '39%', size: 7,  duration: 5.8, delay: 2.1  },
    { left: '52%', size: 8,  duration: 4.3, delay: 0.9  },
    { left: '64%', size: 6,  duration: 5.1, delay: 1.7  },
    { left: '76%', size: 9,  duration: 4.8, delay: 0.3  },
    { left: '88%', size: 7,  duration: 5.6, delay: 2.4  }
  ];
  function buildLeaves() {
    return LEAVES.map(function (l) {
      return '<span class="clov-success-leaf" style="left:' + l.left + ';width:' + l.size + 'px;height:' + l.size + 'px;' +
        'animation-duration:' + l.duration + 's;animation-delay:' + l.delay + 's;"></span>';
    }).join('');
  }

  var root = null;
  function build() {
    if (root) return root;
    root = document.createElement('div');
    root.className = 'clov-success-overlay';
    root.innerHTML =
      '<div class="clov-success-leaves">' + buildLeaves() + '</div>' +
      '<svg class="clov-success-wave" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">' +
        '<path class="clov-success-wave-back" d="M0 30 Q75 0 150 30 T300 30 V60 H0 Z"/>' +
        '<path class="clov-success-wave-front" d="M0 40 Q75 15 150 40 T300 40 V60 H0 Z"/>' +
      '</svg>' +
      '<div class="clov-success-stage">' +
        '<div class="clov-success-check">' +
          '<svg viewBox="0 0 120 120">' +
            '<defs><linearGradient id="clovSuccessGradient" x1="0" y1="0" x2="1" y2="1">' +
              '<stop offset="0%" stop-color="#50d990"/><stop offset="100%" stop-color="#16874b"/>' +
            '</linearGradient></defs>' +
            '<circle class="clov-success-circle" cx="60" cy="60" r="52" transform="rotate(-90 60 60)"/>' +
            '<path class="clov-success-tick" d="M40 62 L54 76 L84 46"/>' +
          '</svg>' +
        '</div>' +
        '<div class="clov-success-text"></div>' +
        '<div class="clov-success-egg-hint"><span class="clov-success-egg-label">이스터에그</span><span class="clov-success-egg-text"></span></div>' +
      '</div>';
    document.body.appendChild(root);
    return root;
  }

  function show(opts) {
    opts = opts || {};
    var duration = opts.durationMs || 3000;
    var el = build();

    var line = pickRandom(WELCOME_LINES);
    el.querySelector('.clov-success-text').textContent = line(getNickname());
    el.querySelector('.clov-success-egg-text').textContent = pickRandom(EASTER_EGGS);

    // 재생 시마다 draw/줌 애니메이션이 처음부터 다시 돌게 클래스를 리셋
    el.classList.remove('is-active', 'is-zoomout', 'is-warp');
    void el.offsetWidth; // reflow로 리스타트 보장
    requestAnimationFrame(function () { el.classList.add('is-active'); });

    setTimeout(function () {
      el.classList.add('is-zoomout');
      setTimeout(function () {
        el.classList.remove('is-zoomout');
        el.classList.add('is-warp');
        setTimeout(function () {
          if (opts.redirectUrl) {
            window.location.href = opts.redirectUrl;
          } else if (typeof opts.onDone === 'function') {
            opts.onDone();
          }
        }, 340);
      }, 320);
    }, duration);
  }

  window.ClovSuccessOverlay = { show: show };
})();
