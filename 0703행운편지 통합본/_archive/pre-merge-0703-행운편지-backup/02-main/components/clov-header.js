/**
 * Clov 공통 헤더 컴포넌트
 *
 * 사용법:
 *   <div id="app-header"></div>
 *   <script src="../02-main/components/clov-header.js"></script>
 *   <script>
 *     ClovHeader.init({
 *       type: 'main',   // 'main' | 'sub' | 'home'
 *       ...options
 *     });
 *   </script>
 *
 * type별 옵션:
 *   main  — activeTab, backHref, avatarLabel, dropdownItems
 *   sub   — backHref, backLabel, title, avatarLabel
 *   home  — avatarLabel, dropdownItems, showMail, showBell
 */
(function () {
  'use strict';

  /* ── CSS 주입 ──────────────────────────────────────────── */
  var CSS = `
.clov-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--header-glass-bg, var(--header-bg, rgba(255,255,255,.88)));
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  border-bottom: 1px solid var(--border-color, var(--border, #eef2f0));
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
  transition: background .3s, border-color .3s;
}
body.dark-mode .clov-hdr {
  background: var(--header-glass-bg, rgba(9,13,10,.82));
  border-color: var(--border-color, #1e2f24);
}

.clov-hdr-left,
.clov-hdr-right { display: flex; align-items: center; gap: 10px; }

/* 로고 */
.clov-hdr-logo {
  font-size: 20px; font-weight: 800; cursor: pointer;
  color: var(--primary-green, var(--primary, #1b4332));
  letter-spacing: -.5px; transition: color .3s;
}
body.dark-mode .clov-hdr-logo { color: var(--primary-green, #4ade80); }

/* 뒤로가기 */
.clov-hdr-back {
  display: flex; align-items: center; gap: 4px;
  color: var(--text-muted, var(--muted, #61766a));
  font-size: 14px; font-weight: 600; text-decoration: none;
  padding: 4px 8px; border-radius: 8px; transition: background .15s, color .3s;
}
.clov-hdr-back:hover { background: var(--nav-item-bg-active, #e8f3ed); }
body.dark-mode .clov-hdr-back:hover { background: var(--nav-item-bg-active, #1e3a27); }
.clov-hdr-back-arrow { font-size: 20px; line-height: 1; }
.clov-hdr-title {
  font-size: 15px; font-weight: 700;
  color: var(--text-color, var(--text, #2c3e35));
  transition: color .3s;
}
body.dark-mode .clov-hdr-title { color: var(--text-color, #f0fdf4); }

/* 네비게이션 탭 (main 타입) */
.clov-hdr-nav { display: flex; align-items: center; gap: 2px; }
.clov-hdr-nav-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 11px; border-radius: 10px; border: none;
  background: none; cursor: pointer; font-size: 13px; font-weight: 600;
  color: var(--nav-item-color, #79ad90);
  transition: background .15s, color .15s;
}
.clov-hdr-nav-btn:hover,
.clov-hdr-nav-btn.active {
  background: var(--nav-item-bg-active, #e8f3ed);
  color: var(--nav-item-active, #1b4332);
}
body.dark-mode .clov-hdr-nav-btn:hover,
body.dark-mode .clov-hdr-nav-btn.active {
  background: var(--nav-item-bg-active, #1e3a27);
  color: var(--nav-item-active, #4ade80);
}
.clov-hdr-nav-icon-btn { padding: 7px 9px; }

/* 공통 아이콘 버튼 */
.clov-hdr-icon-btn {
  width: 34px; height: 34px; border-radius: 50%; border: none;
  background: none; cursor: pointer; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-muted, #61766a); transition: background .15s;
}
.clov-hdr-icon-btn:hover { background: var(--nav-item-bg-active, #e8f3ed); }
body.dark-mode .clov-hdr-icon-btn:hover { background: var(--nav-item-bg-active, #1e3a27); }

/* 다크모드 토글 — slide 애니메이션 보조 */
.clov-dark-toggle { overflow: hidden; position: relative; }
.clov-dark-toggle.slide-animation .clov-dark-icon {
  animation: clov-slide-out .2s ease forwards;
}
@keyframes clov-slide-out {
  0%   { transform: translateY(0); opacity: 1; }
  50%  { transform: translateY(-110%); opacity: 0; }
  51%  { transform: translateY(110%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* 아바타 */
.clov-hdr-avatar-wrap { position: relative; }
.clov-hdr-avatar {
  width: 34px; height: 34px; border-radius: 50%; border: none;
  background: var(--nav-item-bg-active, #e8f3ed);
  color: var(--primary-green, var(--primary, #1b4332));
  font-size: 13px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s, color .3s;
}
.clov-hdr-avatar:hover { background: var(--input-border, #d8ebd2); }
body.dark-mode .clov-hdr-avatar { color: var(--primary-green, #4ade80); }
body.dark-mode .clov-hdr-avatar:hover { background: var(--input-border, #22c55e33); }

.clov-hdr-dropdown {
  position: absolute; top: 42px; right: 0;
  background: var(--card-bg, #fff);
  border-radius: 12px; border: 1px solid var(--border-color, var(--border, #eef2f0));
  box-shadow: 0 10px 25px rgba(0,0,0,.12);
  list-style: none; display: none; width: 188px; overflow: hidden; z-index: 200;
  transition: background .3s, border-color .3s;
}
.clov-hdr-dropdown.open { display: block; }
.clov-hdr-dropdown li {
  padding: 10px 16px; font-size: 13px; cursor: pointer;
  color: var(--text-color, var(--text, #2c3e35)); transition: background .15s;
}
.clov-hdr-dropdown li:hover { background: var(--nav-item-bg-active, #e8f3ed); }
body.dark-mode .clov-hdr-dropdown { background: var(--card-bg, #151f18); border-color: var(--border-color, #1e2f24); }
body.dark-mode .clov-hdr-dropdown li { color: var(--text-color, #f0fdf4); }
body.dark-mode .clov-hdr-dropdown li:hover { background: var(--nav-item-bg-active, #1e3a27); }
`;

  function injectCSS() {
    if (document.getElementById('clov-hdr-style')) return;
    var s = document.createElement('style');
    s.id = 'clov-hdr-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── 다크모드 ─────────────────────────────────────────── */
  function currentIsDark() {
    return document.body.classList.contains('dark-mode');
  }

  function applyDark(dark) {
    document.body.classList.toggle('dark-mode', dark);
    localStorage.setItem('clov_theme', dark ? 'dark' : 'light');
    // 컴포넌트 버튼 아이콘 업데이트
    document.querySelectorAll('.clov-dark-icon').forEach(function (el) {
      el.textContent = dark ? '🌙' : '☀️';
    });
  }

  function initTheme(cfg) {
    // URL 파라미터 우선
    var p = new URLSearchParams(location.search);
    var urlTheme = p.get('theme');
    if (urlTheme === 'dark' || urlTheme === 'light') {
      applyDark(urlTheme === 'dark');
      return;
    }
    // localStorage 폴백 — 여러 키 지원 (페이지 간 호환)
    var saved =
      localStorage.getItem('clov_theme') ||
      (localStorage.getItem('clov_darkMode') === 'true' ? 'dark' : null) ||
      (localStorage.getItem('clov_dark') === 'true' ? 'dark' : null);
    if (saved) applyDark(saved === 'dark');
  }

  /* ── 렌더 헬퍼 ────────────────────────────────────────── */
  function darkBtn(useDesktopJs) {
    var icon = currentIsDark() ? '🌙' : '☀️';
    var onclick = useDesktopJs
      ? 'typeof toggleDarkMode==="function"?toggleDarkMode():ClovHeader.toggleDark()'
      : 'ClovHeader.toggleDark()';
    // main 타입에서는 기존 dt-dark-btn, toggle-icon 클래스 유지 (desktop.js 호환)
    if (useDesktopJs) {
      return '<button class="clov-hdr-icon-btn clov-dark-toggle dt-dark-btn" onclick="' + onclick + '" title="다크모드">'
        + '<span class="clov-dark-icon toggle-icon">' + icon + '</span></button>';
    }
    return '<button class="clov-hdr-icon-btn clov-dark-toggle" onclick="' + onclick + '" title="다크모드">'
      + '<span class="clov-dark-icon">' + icon + '</span></button>';
  }

  function avatarHTML(label, items) {
    if (!label) return '';
    var dropHtml = '';
    if (items && items.length) {
      dropHtml = '<ul class="clov-hdr-dropdown" id="clov-hdr-drop">'
        + items.map(function (it) {
          return '<li onclick="' + it.onclick + '">' + it.label + '</li>';
        }).join('')
        + '</ul>';
    }
    return '<div class="clov-hdr-avatar-wrap">'
      + '<button class="clov-hdr-avatar" onclick="ClovHeader._toggleDrop(this)">' + label + '</button>'
      + dropHtml
      + '</div>';
  }

  /* ── 타입별 렌더 ──────────────────────────────────────── */
  function renderMain(cfg) {
    var tabs = [
      { id: 'space',    icon: '🏠', label: '우정공간' },
      { id: 'feed',     icon: '📸', label: '추억피드' },
      { id: 'letter',   icon: '💌', label: '행운편지' },
      { id: 'schedule', icon: '📅', label: '일정계획' },
    ];
    var navHtml = tabs.map(function (t) {
      var active = cfg.activeTab === t.id ? ' active' : '';
      // dt-nav-item 클래스 유지 → switchDesktopTab()이 querySelectorAll('.dt-nav-item')로 비활성화
      return '<button class="clov-hdr-nav-btn dt-nav-item' + active + '" id="dt-nav-' + t.id + '"'
        + ' onclick="switchDesktopTab(\'' + t.id + '\')">'
        + '<span class="nav-icon">' + t.icon + '</span><span>' + t.label + '</span></button>';
    }).join('');
    navHtml += '<button class="clov-hdr-nav-btn dt-nav-item clov-hdr-nav-icon-btn" id="dt-nav-noti"'
      + ' onclick="openNotiModal()" title="알림">🔔</button>';
    navHtml += darkBtn(true);

    var backHref = cfg.backHref || '../03-rooms/makerooms.html';
    var dropdown = cfg.dropdownItems || [
      { label: '👥 방 변경하기',    onclick: "openModal('dt-group-modal')" },
      { label: '🤝 현재 방 코드 공유하기', onclick: "openModal('dt-invite-modal')" },
      { label: '개인정보 수정',    onclick: "document.getElementById('dt-profile-modal').style.display='flex';document.getElementById('clov-hdr-drop').style.display='none'" },
      { label: '로그아웃',        onclick: "window.location.href='../01-auth/login.html'" },
    ];

    return '<div class="clov-hdr-left">'
      + '<a href="' + backHref + '" class="clov-hdr-back" title="방 목록으로"><span class="clov-hdr-back-arrow">‹</span></a>'
      + '<span class="clov-hdr-logo" onclick="switchDesktopTab(\'space\')">🍀 Clov.</span>'
      + '</div>'
      + '<div class="clov-hdr-right">'
      + '<nav class="clov-hdr-nav">' + navHtml + '</nav>'
      + avatarHTML(cfg.avatarLabel || '김', dropdown)
      + '</div>';
  }

  function renderSub(cfg) {
    return '<div class="clov-hdr-left">'
      + '<a href="' + (cfg.backHref || '#') + '" onclick="' + (cfg.backOnclick || '') + (cfg.backOnclick ? '; return false;' : '') + '" class="clov-hdr-back">'
      + '<span class="clov-hdr-back-arrow">‹</span>'
      + (cfg.backLabel ? '<span>' + cfg.backLabel + '</span>' : '')
      + '</a>'
      + (cfg.title ? '<span class="clov-hdr-title">' + cfg.title + '</span>' : '')
      + '</div>'
      + '<div class="clov-hdr-right">'
      + darkBtn(false)
      + (cfg.avatarLabel ? '<div class="clov-hdr-avatar" style="cursor:default;pointer-events:none">' + cfg.avatarLabel + '</div>' : '')
      + '</div>';
  }

  function renderHome(cfg) {
    return '<div class="clov-hdr-left">'
      + '<span class="clov-hdr-logo">🍀 Clov.</span>'
      + '</div>'
      + '<div class="clov-hdr-right">'
      + (cfg.showMail !== false ? '<button class="clov-hdr-icon-btn" title="편지함" onclick="' + (cfg.onMail || '') + '">✉️</button>' : '')
      + (cfg.showBell !== false ? '<button class="clov-hdr-icon-btn" title="알림" onclick="' + (cfg.onBell || '') + '">🔔</button>' : '')
      + darkBtn(false)
      + avatarHTML(cfg.avatarLabel || '김', cfg.dropdownItems)
      + '</div>';
  }

  /* ── 공개 API ─────────────────────────────────────────── */
  window.ClovHeader = {
    init: function (cfg) {
      injectCSS();
      initTheme(cfg);

      var el = document.getElementById(cfg.containerId || 'app-header');
      if (!el) { console.warn('ClovHeader: container not found'); return; }
      el.className = 'clov-hdr';

      switch (cfg.type) {
        case 'main': el.innerHTML = renderMain(cfg); break;
        case 'sub':  el.innerHTML = renderSub(cfg);  break;
        case 'home': el.innerHTML = renderHome(cfg); break;
        default:     el.innerHTML = renderSub(cfg);  break;
      }

      // 드롭다운 외부 클릭 시 닫기
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.clov-hdr-avatar-wrap')) {
          document.querySelectorAll('.clov-hdr-dropdown.open').forEach(function (d) {
            d.classList.remove('open');
          });
        }
      });
    },

    toggleDark: function () {
      applyDark(!currentIsDark());
    },

    applyDark: applyDark,

    _toggleDrop: function (btn) {
      var drop = btn.nextElementSibling;
      if (drop) drop.classList.toggle('open');
    },
  };
})();
