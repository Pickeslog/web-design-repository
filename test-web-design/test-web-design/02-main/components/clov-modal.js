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
  /* ─────────────────────────────────────────────
   * 1. 공통 CSS 주입 (한 번만)
   * ───────────────────────────────────────────── */
  if (!document.getElementById('__clov-modal-styles')) {
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
    if (document.getElementById('__clov-alert-backdrop')) return;
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
    const backdrop = document.getElementById('__clov-alert-backdrop');
    if (!backdrop) return;
    backdrop.classList.remove('open');
    backdrop._resolveCallback && backdrop._resolveCallback(result);
    backdrop._resolveCallback = null;
  }

  /* ─────────────────────────────────────────────
   * 3. Toast wrap DOM 생성
   * ───────────────────────────────────────────── */
  function ensureToastWrap() {
    if (!document.getElementById('__clov-toast-wrap')) {
      const wrap = document.createElement('div');
      wrap.id = '__clov-toast-wrap';
      document.body.appendChild(wrap);
    }
    return document.getElementById('__clov-toast-wrap');
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
      const backdrop = document.getElementById('__clov-alert-backdrop');
      const box      = document.getElementById('__clov-alert-box');
      const iconEl   = document.getElementById('__clov-alert-icon');
      const msgEl    = document.getElementById('__clov-alert-msg');
      const actionsEl = document.getElementById('__clov-alert-actions');

      const type    = options.type    || 'info';
      const icon    = options.icon    || { success:'✅', warn:'⚠️', error:'❌', info:'💬' }[type];
      const btnText = options.btnText || '확인';

      box.className = type;
      iconEl.textContent = icon;
      msgEl.textContent  = message;
      backdrop.dataset.closeOnBackdrop = options.closeOnBackdrop !== false ? 'true' : 'false';

      actionsEl.innerHTML = `<button class="clov-modal-btn primary" id="__clov-alert-ok">${btnText}</button>`;
      document.getElementById('__clov-alert-ok').onclick = () => _closeAlert(true).then ? _closeAlert(true) : (_closeAlert(true), resolve());

      // promise 연결
      backdrop._resolveCallback = resolve;
      document.getElementById('__clov-alert-ok').onclick = () => {
        _closeAlert();
        resolve();
      };

      backdrop.classList.add('open');
      setTimeout(() => document.getElementById('__clov-alert-ok')?.focus(), 50);
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
      const backdrop  = document.getElementById('__clov-alert-backdrop');
      const box       = document.getElementById('__clov-alert-box');
      const iconEl    = document.getElementById('__clov-alert-icon');
      const msgEl     = document.getElementById('__clov-alert-msg');
      const actionsEl = document.getElementById('__clov-alert-actions');

      const type        = options.type        || 'warn';
      const icon        = options.icon        || { success:'✅', warn:'⚠️', error:'🗑️', info:'💬' }[type];
      const confirmText = options.confirmText || '확인';
      const cancelText  = options.cancelText  || '취소';
      const confirmCls  = options.confirmClass || (type === 'error' ? 'danger' : 'primary');

      box.className = type;
      iconEl.textContent = icon;
      msgEl.textContent  = message;
      backdrop.dataset.closeOnBackdrop = 'false';

      actionsEl.innerHTML = `
        <button class="clov-modal-btn secondary" id="__clov-confirm-cancel">${cancelText}</button>
        <button class="clov-modal-btn ${confirmCls}" id="__clov-confirm-ok">${confirmText}</button>`;

      backdrop._resolveCallback = resolve;

      document.getElementById('__clov-confirm-cancel').onclick = () => {
        _closeAlert();
        resolve(false);
      };
      document.getElementById('__clov-confirm-ok').onclick = () => {
        _closeAlert();
        resolve(true);
        onConfirm && onConfirm();
      };

      backdrop.classList.add('open');
      setTimeout(() => document.getElementById('__clov-confirm-ok')?.focus(), 50);
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
