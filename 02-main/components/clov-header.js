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

  // 이 스크립트 자신의 실제 로드 경로 기준으로 02-main/ 폴더의 절대 URL을 잡아둔다.
  // (clov-profile-modal.js의 MAIN_BASE와 동일한 방식 — file://로 직접 열어도 깨지지 않도록)
  var MAIN_BASE = (function () {
    var src = document.currentScript && document.currentScript.src;
    return src ? src.replace(/components\/clov-header\.js.*$/, '') : '../02-main/';
  })();
  var LOGO_SRC = MAIN_BASE + '../assets/ai-style/clov_logo_half_leaf_cartoon_transparent.png';

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
  background: var(--header-glass-bg, var(--header-bg, rgba(20,21,14,.82)));
  border-color: var(--border-color, #2a2c1e);
}

.clov-hdr-left,
.clov-hdr-right { display: flex; align-items: center; gap: 10px; }

/* 로고 */
.clov-hdr-logo {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 20px; font-weight: 800; cursor: pointer;
  color: var(--primary-green, var(--primary, #1b4332));
  letter-spacing: -.5px; transition: color .3s;
}
body.dark-mode .clov-hdr-logo { color: var(--primary-green, var(--primary, #9ccc65)); }
.clov-hdr-logo-mark { width: 24px; height: 24px; object-fit: contain; display: block; }

/* 뒤로가기 */
.clov-hdr-back {
  display: flex; align-items: center; gap: 4px;
  color: var(--text-muted, var(--muted, #61766a));
  font-size: 14px; font-weight: 600; text-decoration: none;
  padding: 4px 8px; border-radius: 8px; transition: background .15s, color .3s;
}
.clov-hdr-back:hover { background: var(--nav-item-bg-active, #e8f3ed); }
body.dark-mode .clov-hdr-back:hover { background: var(--nav-item-bg-active, #2b3020); }
.clov-hdr-back-arrow { font-size: 20px; line-height: 1; }
.clov-hdr-title {
  font-size: 15px; font-weight: 700;
  color: var(--text-color, var(--text, #2c3e35));
  transition: color .3s;
}
body.dark-mode .clov-hdr-title { color: var(--text-color, #eef0e2); }

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
  background: var(--nav-item-bg-active, #2b3020);
  color: var(--nav-item-active, #9ccc65);
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
body.dark-mode .clov-hdr-icon-btn:hover { background: var(--nav-item-bg-active, #2b3020); }

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
/* 해/달 아이콘은 body.dark-mode 유무로 CSS가 자동 전환 — JS는 textContent를 더 이상 건드리지 않는다 */
.clov-dark-icon { display: inline-flex; }
.clov-dark-icon .clov-icon-moon { display: none; }
body.dark-mode .clov-dark-icon .clov-icon-sun { display: none; }
body.dark-mode .clov-dark-icon .clov-icon-moon { display: inline-flex; }

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
body.dark-mode .clov-hdr-avatar { color: var(--primary-green, var(--primary, #9ccc65)); }
body.dark-mode .clov-hdr-avatar:hover { background: var(--input-border, #6b8f4733); }

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
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px; font-size: 13px; cursor: pointer;
  color: var(--text-color, var(--text, #2c3e35)); transition: background .15s;
}
.clov-hdr-dropdown li:hover { background: var(--nav-item-bg-active, #e8f3ed); }
body.dark-mode .clov-hdr-dropdown { background: var(--card-bg, #1e2016); border-color: var(--border-color, #2a2c1e); }
body.dark-mode .clov-hdr-dropdown li { color: var(--text-color, #eef0e2); }
body.dark-mode .clov-hdr-dropdown li:hover { background: var(--nav-item-bg-active, #2b3020); }
.nav-icon svg, .clov-hdr-dropdown li svg, .clov-hdr-nav-icon-btn svg, .clov-hdr-icon-btn svg { display: block; flex-shrink: 0; }

/* 톱니바퀴(사용자설정) 아이콘 — 항목에 호버하는 동안 계속 회전 */
.clov-hdr-dropdown li:hover .icon-gear { animation: clov-gear-spin 0.9s ease-in-out 1; }
@keyframes clov-gear-spin { from { transform: rotate(0deg); } to { transform: rotate(180deg); } }
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
    // 아이콘은 body.dark-mode 기준 CSS가 알아서 전환하므로 여기서는 더 이상 손댈 게 없다
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
  // 해/달 라인 아이콘 — body.dark-mode 여부는 CSS(.clov-dark-icon .clov-icon-*)가 판단하므로
  // 두 아이콘을 항상 같이 그려두고 보이는 쪽만 CSS로 스위칭한다 (JS는 텍스트를 더 이상 바꾸지 않음)
  var ICON_SUN = '<svg class="clov-icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  var ICON_MOON = '<svg class="clov-icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  var DARK_ICON_HTML = ICON_SUN + ICON_MOON;

  // 네비/드롭다운용 라인 아이콘 (Tabler 톤에 맞춘 얇은 stroke SVG, currentColor로 라이트/다크 자동 대응)
  var ICON_HOME = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></svg>';
  var ICON_CAMERA = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  var ICON_MAIL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
  var ICON_CALENDAR = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  var ICON_BELL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>';
  var ICON_USERS = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><path d="M2 20c0-3 2.5-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.3"/><path d="M15.2 14.6c2.3.5 3.6 2 3.8 4.4"/></svg>';
  var ICON_SHARE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="6" r="2.3"/><circle cx="18" cy="18" r="2.3"/><path d="M8.1 10.8 15.9 7M8.1 13.2l7.8 3.6"/></svg>';
  // Phosphor "Gear" 아이콘(PiGear) — 드롭다운 li 호버 시 아래 CSS(.icon-gear 회전) 규칙으로 톱니바퀴가 돈다
  var ICON_SETTINGS = '<svg class="icon-gear" width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"/></svg>';

  function darkBtn(useDesktopJs) {
    var onclick = useDesktopJs
      ? 'typeof toggleDarkMode==="function"?toggleDarkMode():ClovHeader.toggleDark()'
      : 'ClovHeader.toggleDark()';
    // main 타입에서는 기존 dt-dark-btn, toggle-icon 클래스 유지 (desktop.js 호환)
    if (useDesktopJs) {
      return '<button class="clov-hdr-icon-btn clov-dark-toggle dt-dark-btn" onclick="' + onclick + '" title="다크모드">'
        + '<span class="clov-dark-icon toggle-icon">' + DARK_ICON_HTML + '</span></button>';
    }
    return '<button class="clov-hdr-icon-btn clov-dark-toggle" onclick="' + onclick + '" title="다크모드">'
      + '<span class="clov-dark-icon">' + DARK_ICON_HTML + '</span></button>';
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
      { id: 'space',    icon: ICON_HOME,     label: '우정공간' },
      { id: 'feed',     icon: ICON_CAMERA,   label: '추억피드' },
      { id: 'letter',   icon: ICON_MAIL,     label: '행운편지' },
      { id: 'schedule', icon: ICON_CALENDAR, label: '일정계획' },
    ];
    var navHtml = tabs.map(function (t) {
      var active = cfg.activeTab === t.id ? ' active' : '';
      // dt-nav-item 클래스 유지 → switchDesktopTab()이 querySelectorAll('.dt-nav-item')로 비활성화
      return '<button class="clov-hdr-nav-btn dt-nav-item' + active + '" id="dt-nav-' + t.id + '"'
        + ' onclick="switchDesktopTab(\'' + t.id + '\')">'
        + '<span class="nav-icon">' + t.icon + '</span><span>' + t.label + '</span></button>';
    }).join('');
    navHtml += '<button class="clov-hdr-nav-btn dt-nav-item clov-hdr-nav-icon-btn" id="dt-nav-noti"'
      + ' onclick="openNotiModal()" title="알림">' + ICON_BELL + '</button>';

    var backHref = cfg.backHref || '../03-rooms/makerooms.html';
    var dropdown = cfg.dropdownItems || [
      { label: ICON_USERS + ' 방 변경하기',    onclick: "openModal('dt-group-modal')" },
      { label: ICON_SHARE + ' 현재 방 코드 공유하기', onclick: "openModal('dt-invite-modal')" },
      { label: ICON_SETTINGS + ' 사용자설정',    onclick: "openProfileModal();document.getElementById('clov-hdr-drop').classList.remove('open')" },
      { label: '로그아웃',        onclick: "ClovAuth.clearAccessToken();window.location.href='../01-auth/login.html'" },
    ];

    return '<div class="clov-hdr-left">'
      + '<a href="' + backHref + '" class="clov-hdr-back" title="방 목록으로"><span class="clov-hdr-back-arrow">‹</span></a>'
      + '<span class="clov-hdr-logo" onclick="switchDesktopTab(\'space\')"><img class="clov-hdr-logo-mark" src="' + LOGO_SRC + '" alt="Clov 로고">Clov.</span>'
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
      + '<span class="clov-hdr-logo"><img class="clov-hdr-logo-mark" src="' + LOGO_SRC + '" alt="Clov 로고">Clov.</span>'
      + '</div>'
      + '<div class="clov-hdr-right">'
      + (cfg.showMail !== false ? '<button class="clov-hdr-icon-btn" title="편지함" onclick="' + (cfg.onMail || '') + '">' + ICON_MAIL + '</button>' : '')
      + (cfg.showBell !== false ? '<button class="clov-hdr-icon-btn" title="알림" onclick="' + (cfg.onBell || '') + '">' + ICON_BELL + '</button>' : '')
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
