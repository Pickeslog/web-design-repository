/**
 * Clov Modal System v1.0
 * 모든 alert/confirm/toast를 네이티브 브라우저 대화창 대신
 * Clov 디자인 시스템에 맞는 글래스모피즘 모달/토스트로 표시합니다.
 *
 * 사용법:
 *   clovAlert('복사되었습니다!', { icon: '✅', type: 'success' });
 *   clovAlert('내용을 입력해주세요.', { icon: '⚠️', type: 'warn' });
 *   clovToast('클립보드에 복사됐어요!', 'success');
 *   clovConfirm('정말 삭제할까요?', () => doDelete());
 */

(function () {
  /* data.js/desktop.js의 "Null Pointer Safe Patch"가 document.getElementById를
     몽키패치해 없는 id에 숨김 stub div를 만들어 반환한다. 그러면
     "이미 있으면 만들지 않기" 존재 체크가 stub에 속아 진짜 모달 DOM을 만들지 못하고,
     confirm/toast가 display:none stub 안에 그려져 화면에 안 보이는 버그가 생긴다.
     → 이 컴포넌트 내부 조회는 패치를 타지 않는 querySelector를 사용한다. */
  const $id = (id) => document.querySelector('#' + id);

  /* ─────────────────────────────────────────────
   * 0. 라인 아이콘 등록소 (Lucide 스타일 SVG)
   *   이모지 대신 쓰고 싶을 때 clovAlert/clovConfirm의 icon 옵션에
   *   CLOV_ICONS.trash 처럼 넘기면 원형 틴트 배지로 렌더된다.
   *   stroke=currentColor 라서 배지 색(type별)을 그대로 따라간다.
   * ───────────────────────────────────────────── */
  const svgIcon = (paths) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const CLOV_ICONS = {
    trash: svgIcon('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>'),
    warn: svgIcon('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>'),
    check: svgIcon('<path d="M20 6 9 17l-5-5"/>'),
    info: svgIcon('<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/>'),
  };
  window.CLOV_ICONS = CLOV_ICONS;

  /* 아이콘 문자열이 SVG면 innerHTML로 넣고 배지 스타일을 켠다. 이모지면 textContent. */
  function _renderIcon(iconEl, icon) {
    if (typeof icon === 'string' && icon.trim().startsWith('<svg')) {
      iconEl.innerHTML = icon;
      iconEl.classList.add('has-svg');
    } else {
      iconEl.textContent = icon;
      iconEl.classList.remove('has-svg');
    }
  }

  /* ─────────────────────────────────────────────
   * 1. 공통 CSS 주입 (한 번만)
   * ───────────────────────────────────────────── */
  if (!$id('__clov-modal-styles')) {
    const style = document.createElement('style');
    style.id = '__clov-modal-styles';
    style.textContent = `
      /* ── Clov Alert / Confirm 모달 ── */
      #__clov-alert-backdrop {
        display: none;
        position: fixed; inset: 0;
        background: rgba(0,0,0,.48);
        z-index: 99999;
        align-items: center;
        justify-content: center;
        animation: clovFadeIn .18s ease;
      }
      #__clov-alert-backdrop.open { display: flex; }
      #__clov-alert-box {
        background: #fff;
        border-radius: 22px;
        padding: 32px 28px 24px;
        min-width: 300px; max-width: 380px; width: 90%;
        box-shadow: 0 24px 60px rgba(0,0,0,.22);
        display: flex; flex-direction: column;
        gap: 16px; text-align: center;
        animation: clovSlideUp .22s cubic-bezier(.34,1.56,.64,1);
      }
      #__clov-alert-icon {
        font-size: 40px; line-height: 1;
      }
      /* SVG 라인 아이콘일 때: 이모지 대신 원형 틴트 배지 안에 아이콘을 담는다 */
      #__clov-alert-icon.has-svg {
        width: 60px; height: 60px;
        margin: 0 auto;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,.05);
        color: #1b4332;
      }
      #__clov-alert-icon.has-svg svg { width: 28px; height: 28px; display: block; }
      #__clov-alert-box.success .has-svg { background: #dcfce7; color: #16a34a; }
      #__clov-alert-box.warn    .has-svg { background: #fef3c7; color: #d97706; }
      #__clov-alert-box.error   .has-svg { background: #ffe4e6; color: #f43f5e; }
      #__clov-alert-box.info    .has-svg { background: #dbeafe; color: #2563eb; }
      #__clov-alert-msg {
        font-size: 15px; font-weight: 600;
        color: #1b4332; line-height: 1.55;
        white-space: pre-line;
      }
      #__clov-alert-actions {
        display: flex; gap: 8px; margin-top: 4px;
        justify-content: center;
      }
      .clov-modal-btn {
        flex: 1; padding: 12px 0;
        border: none; border-radius: 12px;
        font-size: 14px; font-weight: 700;
        cursor: pointer; transition: all .15s ease;
      }
      .clov-modal-btn.primary {
        background: #2d6a4f; color: #fff;
      }
      .clov-modal-btn.primary:hover { background: #1b4332; }
      .clov-modal-btn.secondary {
        background: rgba(0,0,0,.06); color: #555;
      }
      .clov-modal-btn.secondary:hover { background: rgba(0,0,0,.1); }
      .clov-modal-btn.danger {
        background: #fb7185; color: #fff;
      }
      .clov-modal-btn.danger:hover { background: #f43f5e; }

      /* type별 테마 */
      #__clov-alert-box.success #__clov-alert-msg { color: #1b4332; }
      #__clov-alert-box.warn #__clov-alert-msg    { color: #92400e; }
      #__clov-alert-box.error #__clov-alert-msg   { color: #991b1b; }
      #__clov-alert-box.info #__clov-alert-msg    { color: #1e3a5f; }

      /* ── Clov Toast ── */
      #__clov-toast-wrap {
        position: fixed; bottom: 28px; left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        display: flex; flex-direction: column;
        align-items: center; gap: 8px;
        pointer-events: none;
      }
      .clov-toast {
        background: rgba(29,53,44,.92);
        color: #fff;
        padding: 12px 22px;
        border-radius: 40px;
        font-size: 13.5px; font-weight: 700;
        box-shadow: 0 8px 28px rgba(0,0,0,.22);
        display: flex; align-items: center; gap: 8px;
        backdrop-filter: blur(10px);
        white-space: nowrap;
        animation: clovToastIn .22s cubic-bezier(.34,1.56,.64,1);
        transition: opacity .3s ease, transform .3s ease;
      }
      .clov-toast.success { background: rgba(22,101,52,.92); }
      .clov-toast.warn    { background: rgba(120,53,15,.88); }
      .clov-toast.error   { background: rgba(127,29,29,.9);  }
      .clov-toast.info    { background: rgba(30,58,138,.88); }
      .clov-toast.fade-out { opacity: 0; transform: translateY(10px); }

      @keyframes clovFadeIn  { from { opacity:0 } to { opacity:1 } }
      @keyframes clovSlideUp { from { opacity:0; transform:translateY(24px) scale(.97) } to { opacity:1; transform:none } }
      @keyframes clovToastIn { from { opacity:0; transform:translateY(12px) scale(.95) } to { opacity:1; transform:none } }
    `;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────────
   * 2. Alert 모달 DOM 생성
   * ───────────────────────────────────────────── */
  function ensureAlertEl() {
    if ($id('__clov-alert-backdrop')) return;
    const backdrop = document.createElement('div');
    backdrop.id = '__clov-alert-backdrop';
    backdrop.innerHTML = `
      <div id="__clov-alert-box" role="alertdialog" aria-modal="true">
        <div id="__clov-alert-icon"></div>
        <p id="__clov-alert-msg"></p>
        <div id="__clov-alert-actions"></div>
      </div>`;
    document.body.appendChild(backdrop);

    // backdrop 클릭으로 닫기 (alert 타입만)
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop && backdrop.dataset.closeOnBackdrop === 'true') {
        _closeAlert();
      }
    });

    // ESC 로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) {
        _closeAlert(false);
      }
    });
  }

  function _closeAlert(result) {
    const backdrop = $id('__clov-alert-backdrop');
    if (!backdrop) return;
    backdrop.classList.remove('open');
    backdrop._resolveCallback && backdrop._resolveCallback(result);
    backdrop._resolveCallback = null;
  }

  /* ─────────────────────────────────────────────
   * 3. Toast wrap DOM 생성
   * ───────────────────────────────────────────── */
  function ensureToastWrap() {
    if (!$id('__clov-toast-wrap')) {
      const wrap = document.createElement('div');
      wrap.id = '__clov-toast-wrap';
      document.body.appendChild(wrap);
    }
    return $id('__clov-toast-wrap');
  }

  /* ─────────────────────────────────────────────
   * 4. 공개 API
   * ───────────────────────────────────────────── */

  /**
   * clovAlert(message, options)
   * options = { icon, type:'success'|'warn'|'error'|'info', btnText, closeOnBackdrop }
   * Returns Promise<void>
   */
  window.clovAlert = function (message, options = {}) {
    return new Promise((resolve) => {
      ensureAlertEl();
      const backdrop = $id('__clov-alert-backdrop');
      const box      = $id('__clov-alert-box');
      const iconEl   = $id('__clov-alert-icon');
      const msgEl    = $id('__clov-alert-msg');
      const actionsEl = $id('__clov-alert-actions');

      const type    = options.type    || 'info';
      const icon    = options.icon    || { success:'✅', warn:'⚠️', error:'❌', info:'💬' }[type];
      const btnText = options.btnText || '확인';

      box.className = type;
      _renderIcon(iconEl, icon);
      msgEl.textContent  = message;
      backdrop.dataset.closeOnBackdrop = options.closeOnBackdrop !== false ? 'true' : 'false';

      actionsEl.innerHTML = `<button class="clov-modal-btn primary" id="__clov-alert-ok">${btnText}</button>`;
      $id('__clov-alert-ok').onclick = () => _closeAlert(true).then ? _closeAlert(true) : (_closeAlert(true), resolve());

      // promise 연결
      backdrop._resolveCallback = resolve;
      $id('__clov-alert-ok').onclick = () => {
        _closeAlert();
        resolve();
      };

      backdrop.classList.add('open');
      setTimeout(() => $id('__clov-alert-ok')?.focus(), 50);
    });
  };

  /**
   * clovConfirm(message, onConfirm, options)
   * options = { icon, type, confirmText, cancelText, confirmClass }
   * onConfirm 은 콜백 또는 null (Promise 방식)
   * Returns Promise<boolean>
   */
  window.clovConfirm = function (message, onConfirm, options = {}) {
    return new Promise((resolve) => {
      ensureAlertEl();
      const backdrop  = $id('__clov-alert-backdrop');
      const box       = $id('__clov-alert-box');
      const iconEl    = $id('__clov-alert-icon');
      const msgEl     = $id('__clov-alert-msg');
      const actionsEl = $id('__clov-alert-actions');

      const type        = options.type        || 'warn';
      const icon        = options.icon        || { success:'✅', warn:'⚠️', error:'🗑️', info:'💬' }[type];
      const confirmText = options.confirmText || '확인';
      const cancelText  = options.cancelText  || '취소';
      const confirmCls  = options.confirmClass || (type === 'error' ? 'danger' : 'primary');

      box.className = type;
      _renderIcon(iconEl, icon);
      msgEl.textContent  = message;
      backdrop.dataset.closeOnBackdrop = 'false';

      actionsEl.innerHTML = `
        <button class="clov-modal-btn secondary" id="__clov-confirm-cancel">${cancelText}</button>
        <button class="clov-modal-btn ${confirmCls}" id="__clov-confirm-ok">${confirmText}</button>`;

      backdrop._resolveCallback = resolve;

      $id('__clov-confirm-cancel').onclick = () => {
        _closeAlert();
        resolve(false);
      };
      $id('__clov-confirm-ok').onclick = () => {
        _closeAlert();
        resolve(true);
        onConfirm && onConfirm();
      };

      backdrop.classList.add('open');
      setTimeout(() => $id('__clov-confirm-ok')?.focus(), 50);
    });
  };

  /**
   * clovToast(message, type, duration)
   * type = 'success'|'warn'|'error'|'info'  (기본 'success')
   * duration = ms (기본 2400)
   */
  window.clovToast = function (message, type = 'success', duration = 2400) {
    const wrap = ensureToastWrap();
    const ICONS = { success:'✅', warn:'⚠️', error:'❌', info:'💬' };
    const toast = document.createElement('div');
    toast.className = `clov-toast ${type}`;
    toast.innerHTML = `<span>${ICONS[type] || '💬'}</span><span>${message}</span>`;
    wrap.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  /* 하위 호환: 이전 alert() 호출을 자동으로 교체하려면
     아래 주석을 해제하세요. (전역 override)
  window._nativeAlert = window.alert;
  window.alert = (msg) => clovAlert(msg, { type: 'info', icon: '💬' });
  */
})();
