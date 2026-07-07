/**
 * Clov 공용 사용자설정(프로필) 모달 컴포넌트
 *
 * 사용법:
 *   <script src="../02-main/components/clov-header.js?v=9"></script>
 *   <script src="../02-main/components/clov-modal.js?v=1"></script>
 *   <script src="../02-main/components/clov-profile-modal.js?v=1"></script>
 *   <script>ClovProfileModal.init();</script>
 *
 * 이 컴포넌트는 모달 HTML을 document.body에 주입하고, 여닫기/저장/테마 전환에
 * 필요한 모든 함수를 전역(window)에 등록한다. index.html, makerooms.html 등
 * "⚙️ 사용자설정" 진입점이 있는 모든 페이지에서 그대로 가져다 쓸 수 있다.
 *
 * 페이지마다 있을 수도, 없을 수도 있는 기능(다크모드 토글 로직, 행운편지 상자,
 * 참여자별 추억 증거 카드 등)은 typeof 체크로 감싸서, 없는 페이지에서도
 * 에러 없이 "설정값만 저장되는" 형태로 동작한다 — 그 페이지를 나중에
 * 방문했을 때 저장된 설정이 그대로 반영된다.
 */
(function () {
  'use strict';

  // 이 스크립트 자신의 실제 로드 경로를 기준으로 02-main/ 폴더의 절대 URL을 잡아둔다.
  // (document.currentScript는 최초 동기 실행 중에만 유효하므로 여기서 바로 캡처)
  // index.html/makerooms.html처럼 폴더 깊이가 다른 페이지에서 공유되고,
  // http://localhost:3000/... 로 열든 file:///C:/... 로 직접 열든 항상 정확하게 풀리도록
  // "/02-main/..." 같은 사이트-루트 절대경로 대신 이 값을 기준으로 삼는다.
  var MAIN_BASE = (function () {
    var src = document.currentScript && document.currentScript.src;
    return src ? src.replace(/components\/clov-profile-modal\.js.*$/, '') : '../02-main/';
  })();
  window.CLOV_MAIN_BASE = MAIN_BASE;

  // 비밀번호 표시/숨김 토글 아이콘 — is-visible 클래스로 CSS가 눈/슬래시-눈을 전환(injectCSS 참고)
  var PW_TOGGLE_ICON_HTML =
    '<svg class="pwt-icon-eye" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
    '<svg class="pwt-icon-eye-off" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';

  function renderModalHTML() {
    return `
    <div class="modal-overlay" id="dt-profile-modal" onclick="if(event.target===this) closeModal('dt-profile-modal')">
        <div class="modal-box profile-edit-modal">
            <div class="profile-modal-head">
                <div>
                    <span class="profile-modal-kicker">SETTINGS</span>
                    <h3>사용자설정</h3>
                </div>
                <button class="profile-modal-close" type="button" onclick="closeModal('dt-profile-modal')" aria-label="닫기">×</button>
            </div>

            <div class="profile-modal-body">
                <nav class="settings-rail">
                    <div class="settings-rail-identity">
                        <div class="settings-rail-avatar" id="dt-profile-avatar-circle">
                            <span id="dt-profile-avatar-initial">김</span>
                            <img id="dt-profile-avatar-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="프로필 사진">
                        </div>
                        <span class="settings-rail-name" id="dt-profile-preview-name">김예린</span>
                    </div>

                    <div class="settings-nav-scroll" id="dt-settings-nav">
                        <div class="settings-nav-group">
                            <p class="settings-nav-label">계정</p>
                            <div class="settings-nav-item active" data-pane="account" onclick="switchSettingsPane('account')">개인정보 수정</div>
                        </div>
                        <div class="settings-nav-group">
                            <p class="settings-nav-label">화면</p>
                            <div class="settings-nav-item" data-pane="theme" onclick="switchSettingsPane('theme')">테마 설정</div>
                        </div>
                    </div>
                </nav>

                <section class="profile-form-panel">
                    <div class="settings-pane" id="dt-settings-pane-account">
                        <div class="profile-form-section">
                            <div class="profile-section-title">기본 정보</div>
                            <div class="modal-form-group field-wrap">
                                <label class="field-label">프로필 사진</label>
                                <div class="profile-avatar-upload">
                                    <button class="profile-avatar-upload-circle" id="dt-profile-avatar-circle-2" type="button" onclick="triggerProfileAvatarUpload()" aria-label="프로필 사진 변경">
                                        <span id="dt-profile-avatar-initial-2">김</span>
                                        <img id="dt-profile-avatar-img-2" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="프로필 사진">
                                    </button>
                                    <span class="profile-avatar-upload-hint">클릭하여 사진을 변경하세요</span>
                                    <input type="file" id="dt-profile-avatar-file" accept="image/*" onchange="handleProfileAvatarUpload(event)">
                                </div>
                            </div>
                            <div class="modal-form-group field-wrap">
                                <label class="field-label" for="dt-profile-name">이름 / 닉네임</label>
                                <input class="text-input" type="text" id="dt-profile-name" placeholder="예: 김예린" maxlength="16" oninput="updateProfilePreview()">
                            </div>
                        </div>

                        <div class="profile-form-section">
                            <div class="profile-section-title">연락처</div>
                            <div class="modal-form-group field-wrap">
                                <label class="field-label" for="dt-profile-email">이메일</label>
                                <input class="text-input" type="email" id="dt-profile-email" placeholder="예: clov@example.com">
                            </div>
                            <div class="modal-form-group field-wrap">
                                <label class="field-label" for="dt-profile-birth">생년월일</label>
                                <input class="text-input" type="date" id="dt-profile-birth">
                            </div>
                        </div>

                        <div class="profile-form-section">
                            <div class="profile-section-title">비밀번호 변경</div>
                            <div class="modal-form-group field-wrap">
                                <label class="field-label" for="dt-profile-pw-current">현재 비밀번호</label>
                                <div class="profile-password-field">
                                    <input class="text-input" type="password" id="dt-profile-pw-current" placeholder="현재 비밀번호 입력">
                                    <button type="button" class="profile-pw-toggle" onclick="toggleProfilePassword('dt-profile-pw-current', this)">${PW_TOGGLE_ICON_HTML}</button>
                                </div>
                            </div>
                            <div class="modal-form-group field-wrap">
                                <label class="field-label" for="dt-profile-pw-new">새 비밀번호</label>
                                <div class="profile-password-field">
                                    <input class="text-input" type="password" id="dt-profile-pw-new" placeholder="8자 이상">
                                    <button type="button" class="profile-pw-toggle" onclick="toggleProfilePassword('dt-profile-pw-new', this)">${PW_TOGGLE_ICON_HTML}</button>
                                </div>
                            </div>
                            <div class="modal-form-group field-wrap">
                                <label class="field-label" for="dt-profile-pw-confirm">새 비밀번호 확인</label>
                                <div class="profile-password-field">
                                    <input class="text-input" type="password" id="dt-profile-pw-confirm" placeholder="동일하게 입력" oninput="checkProfilePasswordMatch()">
                                    <button type="button" class="profile-pw-toggle" onclick="toggleProfilePassword('dt-profile-pw-confirm', this)">${PW_TOGGLE_ICON_HTML}</button>
                                </div>
                                <div class="profile-hint" id="dt-profile-pw-hint"></div>
                            </div>
                        </div>
                    </div>

                    <div class="settings-pane" id="dt-settings-pane-theme" style="display:none;">
                        <div class="profile-form-section">
                            <div class="profile-section-title">테마</div>
                            <ul class="settings-list theme-option-list" id="dt-theme-option-list">
                                <li class="theme-option" data-mode="light" onclick="setThemeMode('light')">
                                    <span class="settings-list-label">라이트모드</span>
                                </li>
                                <li class="theme-option" data-mode="dark" onclick="setThemeMode('dark')">
                                    <span class="settings-list-label">다크모드</span>
                                </li>
                            </ul>
                        </div>

                        <div class="profile-form-section">
                            <div class="profile-section-title">바탕화면</div>
                            <ul class="settings-list theme-option-list" id="dt-appbg-theme-list">
                                <li class="theme-option" data-appbg-theme="default" onclick="setAppBackground('default')">
                                    <span class="settings-list-label">우드 &amp; 클로버 (기본)</span>
                                </li>
                                <!-- 추가 바탕화면은 CLOV_APP_BACKGROUNDS 등록소에서 renderAppBackgroundOptions()가 채운다 -->
                            </ul>
                        </div>

                        <div class="profile-form-section">
                            <div class="profile-section-title">대시보드 배경</div>
                            <ul class="settings-list theme-option-list" id="dt-bg-theme-list">
                                <!-- 벽지 목록은 desktop.js의 V5_WALLPAPERS 등록소에서 renderBgWallpaperOptions()가 채운다 -->
                            </ul>
                        </div>

                        <div class="profile-form-section">
                            <div class="profile-section-title">대표 사진</div>
                            <ul class="settings-list theme-option-list" id="dt-mainphoto-theme-list">
                                <li class="theme-option" data-mainphoto-theme="default" onclick="setMainPhotoTheme('default')">
                                    <span class="settings-list-label">기본 사진</span>
                                </li>
                                <!-- 추가 대표 사진은 CLOV_MAIN_PHOTOS 등록소에서 renderMainPhotoOptions()가 채운다 -->
                            </ul>
                        </div>

                        <div class="profile-form-section">
                            <div class="profile-section-title">대표 커버 장식</div>
                            <ul class="settings-list theme-option-list" id="dt-cover-theme-list">
                                <li class="theme-option is-disabled">
                                    <span class="settings-list-label">준비중</span>
                                </li>
                            </ul>
                        </div>

                        <div class="profile-form-section">
                            <div class="profile-section-title">우정편지 테마</div>
                            <ul class="settings-list theme-option-list" id="dt-letterbox-theme-list">
                                <li class="theme-option" data-letterbox-theme="giftbox" onclick="setLetterBoxTheme('giftbox')">
                                    <span class="settings-list-label">선물상자</span>
                                </li>
                                <li class="theme-option" data-letterbox-theme="mailbox" onclick="setLetterBoxTheme('mailbox')">
                                    <span class="settings-list-label">우체통</span>
                                </li>
                            </ul>
                        </div>

                        <div class="profile-form-section">
                            <div class="profile-section-title">참여자별 추억 증거 카드</div>
                            <ul class="settings-list theme-option-list" id="dt-evidence-theme-list">
                                <li class="theme-option" data-evidence-theme="wire" onclick="setEvidenceCardTheme('wire')">
                                    <span class="settings-list-label">빨랫줄</span>
                                </li>
                                <li class="theme-option" data-evidence-theme="coverflow" onclick="setEvidenceCardTheme('coverflow')">
                                    <span class="settings-list-label">겹침 카드</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>

            <div class="profile-modal-actions" id="dt-profile-modal-actions">
                <div class="profile-modal-actions-row" id="dt-profile-actions-account">
                    <button class="btn-sub profile-footer-btn secondary" type="button" onclick="confirmDeleteProfileAccount()">계정 탈퇴</button>
                    <div class="profile-modal-action-group">
                        <button class="btn-sub profile-footer-btn secondary" type="button" onclick="closeModal('dt-profile-modal')">취소</button>
                        <button class="btn-main profile-footer-btn primary" type="button" onclick="saveProfileModal()">저장하기</button>
                    </div>
                </div>
                <div class="profile-modal-actions-row" id="dt-profile-actions-theme" style="display:none;">
                    <div class="profile-modal-action-group" style="margin-left:auto;">
                        <button class="btn-main profile-footer-btn primary" type="button" onclick="closeModal('dt-profile-modal')">닫기</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
  }

  function injectHTML() {
    if (document.getElementById('dt-profile-modal')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = renderModalHTML();
    document.body.appendChild(wrap.firstElementChild);
  }

  // 비밀번호 표시/숨김 아이콘 — 버튼의 is-visible 클래스 여부로 CSS가 눈/슬래시-눈 아이콘을 전환한다
  // (desktop.css를 안 쓰는 페이지(makerooms.html 등)에서도 동작하도록 컴포넌트가 직접 주입)
  function injectCSS() {
    if (document.getElementById('clov-profile-modal-style')) return;
    var s = document.createElement('style');
    s.id = 'clov-profile-modal-style';
    s.textContent =
      '.profile-pw-toggle{display:inline-flex;align-items:center;justify-content:center;}' +
      '.profile-pw-toggle .pwt-icon-eye-off{display:none;}' +
      '.profile-pw-toggle.is-visible .pwt-icon-eye{display:none;}' +
      '.profile-pw-toggle.is-visible .pwt-icon-eye-off{display:inline-flex;}';
    document.head.appendChild(s);
  }

  /* ── 다크모드: 페이지에 toggleDarkMode()가 있으면 그걸 쓰고(index.html),
     없으면 ClovHeader.applyDark()로 폴백(makerooms.html 등) ── */
  function isCurrentlyDark() {
    return document.body.classList.contains('dark-mode');
  }

  function setThemeMode(mode) {
    var wantDark = mode === 'dark';
    if (typeof toggleDarkMode === 'function') {
      if (isCurrentlyDark() !== wantDark) toggleDarkMode();
    } else if (window.ClovHeader && typeof ClovHeader.applyDark === 'function') {
      ClovHeader.applyDark(wantDark);
    }
    updateThemeOptionUI();
  }

  function updateThemeOptionUI() {
    var mode = isCurrentlyDark() ? 'dark' : 'light';
    document.querySelectorAll('#dt-theme-option-list .theme-option').forEach(function (li) {
      li.classList.toggle('active', li.dataset.mode === mode);
    });
  }

  /* ── 행운편지 테마 (선물상자 / 우체통) — 해당 UI가 없는 페이지에선 설정값만 저장 ── */
  function getLetterBoxTheme() {
    return localStorage.getItem('clov_letterBoxTheme') || 'giftbox';
  }

  function applyLetterBoxTheme(theme) {
    var trigger = document.getElementById('dt-letter-box-trigger');
    if (trigger) trigger.classList.toggle('theme-mailbox', theme === 'mailbox');
  }

  function updateLetterBoxThemeUI() {
    var theme = getLetterBoxTheme();
    document.querySelectorAll('#dt-letterbox-theme-list .theme-option').forEach(function (li) {
      li.classList.toggle('active', li.dataset.letterboxTheme === theme);
    });
  }

  function setLetterBoxTheme(theme) {
    localStorage.setItem('clov_letterBoxTheme', theme);
    applyLetterBoxTheme(theme);
    updateLetterBoxThemeUI();
    clovToast(theme === 'mailbox' ? '📮 우체통 테마로 바꿨어요!' : '🎁 선물상자 테마로 바꿨어요!', 'success');
  }

  /* ── 대표 커버 장식 (LP 플레이어 / 심플) — 해당 UI가 없는 페이지에선 설정값만 저장 ── */
  function getCoverTheme() {
    return localStorage.getItem('clov_coverTheme') || 'lp';
  }

  function applyCoverTheme(theme) {
    document.querySelectorAll('.v5-scene').forEach(function (scene) {
      scene.classList.toggle('theme-no-lp', theme === 'none');
    });
  }

  function updateCoverThemeUI() {
    var theme = getCoverTheme();
    document.querySelectorAll('#dt-cover-theme-list .theme-option').forEach(function (li) {
      li.classList.toggle('active', li.dataset.coverTheme === theme);
    });
  }

  function setCoverTheme(theme) {
    localStorage.setItem('clov_coverTheme', theme);
    applyCoverTheme(theme);
    updateCoverThemeUI();
    clovToast(theme === 'none' ? '🌤️ 심플 커버로 바꿨어요!' : '💿 LP 플레이어 커버로 바꿨어요!', 'success');
  }

  /* ── 대표 사진 (커버 사진) — CLOV_MAIN_PHOTOS 등록소.
     대표 사진은 다른 테마 항목과 달리 앱 설정값이 아니라 그룹별 실제 데이터
     (groupsData[activeGroup].photo)라서, 여기서 고르면 그 값을 바로 덮어써서
     사용자가 직접 업로드한 것과 동일하게 저장/동기화된다.
     'default'는 그룹의 원래 사진(defaultGroupsData)으로 되돌리는 항목이라 등록소에 넣지 않는다.
     주의: image 경로는 반드시 MAIN_BASE + 상대경로로 적을 것 (file:// 직접 열기 대응). */
  window.CLOV_MAIN_PHOTOS = window.CLOV_MAIN_PHOTOS || {};
  window.CLOV_MAIN_PHOTOS['sleeping-cat'] = {
    name: '잠자는 고양이',
    icon: '🐱',
    image: MAIN_BASE + '../assets/banner-style/sleeping_cat.gif',
  };
  window.CLOV_MAIN_PHOTOS['sleeping-white-cat-clover'] = {
    name: '네잎클로버 고양이',
    icon: '🍀',
    image: MAIN_BASE + '../assets/banner-style/sleeping_white_cat_clover.gif',
  };
  window.CLOV_MAIN_PHOTOS['charging-robot'] = {
    name: '충전하는 로봇',
    icon: '🤖',
    image: MAIN_BASE + '../assets/banner-style/charging_white_robot.gif',
  };
  window.CLOV_MAIN_PHOTOS['resting-coffee'] = {
    name: '쉬어가는 커피',
    icon: '☕',
    image: MAIN_BASE + '../assets/banner-style/resting_coffee_steam.gif',
  };
  window.CLOV_MAIN_PHOTOS['toaster'] = {
    name: '토스터',
    icon: '🍞',
    image: MAIN_BASE + '../assets/banner-style/toaster_bread_pop_tall_no_slot.gif',
  };

  // "대표 사진" 목록에 CLOV_MAIN_PHOTOS 등록소 항목을 채워 넣는다.
  function renderMainPhotoOptions() {
    var list = document.getElementById('dt-mainphoto-theme-list');
    if (!list) return;
    Object.keys(window.CLOV_MAIN_PHOTOS).forEach(function (id) {
      if (list.querySelector('[data-mainphoto-theme="' + id + '"]')) return;
      var mp = window.CLOV_MAIN_PHOTOS[id];
      var li = document.createElement('li');
      li.className = 'theme-option';
      li.dataset.mainphotoTheme = id;
      li.onclick = function () { setMainPhotoTheme(id); };
      li.innerHTML = '<span class="settings-list-label">' + mp.name + '</span>';
      list.appendChild(li);
    });
  }

  function updateMainPhotoThemeUI() {
    renderMainPhotoOptions();
    if (typeof groupsData === 'undefined' || typeof activeGroup === 'undefined' || !groupsData[activeGroup]) return;
    var currentPhoto = groupsData[activeGroup].photo;
    var defaultPhoto = (typeof defaultGroupsData !== 'undefined' && defaultGroupsData[activeGroup]) ? defaultGroupsData[activeGroup].photo : '';
    // '기본 사진'과 등록소 항목이 우연히 같은 이미지를 가리킬 수 있어(예: 기본값 자체를 등록소 사진으로
    // 바꾼 경우), 둘 다 동시에 켜지지 않도록 등록소 쪽 구체적인 항목을 우선한다.
    var matchedRegistryId = null;
    Object.keys(window.CLOV_MAIN_PHOTOS).forEach(function (id) {
      if (window.CLOV_MAIN_PHOTOS[id].image === currentPhoto) matchedRegistryId = id;
    });
    document.querySelectorAll('#dt-mainphoto-theme-list .theme-option').forEach(function (li) {
      var id = li.dataset.mainphotoTheme;
      if (id === 'default') {
        li.classList.toggle('active', !matchedRegistryId && currentPhoto === defaultPhoto);
      } else {
        li.classList.toggle('active', id === matchedRegistryId);
      }
    });
  }

  function setMainPhotoTheme(id) {
    if (typeof groupsData === 'undefined' || typeof activeGroup === 'undefined' || !groupsData[activeGroup]) return;
    var photoUrl, name, icon;
    if (id === 'default') {
      photoUrl = (typeof defaultGroupsData !== 'undefined' && defaultGroupsData[activeGroup]) ? defaultGroupsData[activeGroup].photo : '';
      name = '기본 사진';
      icon = '🖼️';
    } else {
      var mp = window.CLOV_MAIN_PHOTOS[id];
      if (!mp) return;
      photoUrl = mp.image;
      name = mp.name;
      icon = mp.icon;
    }
    groupsData[activeGroup].photo = photoUrl;
    if (typeof updateDashboardPhotos === 'function') updateDashboardPhotos();
    try { localStorage.setItem('clov_groupsData', JSON.stringify(groupsData)); } catch (e) {}
    updateMainPhotoThemeUI();
    if (typeof clovToast === 'function') clovToast(icon + ' ' + name + '(으)로 대표 사진을 바꿨어요!', 'success');
  }

  /* ── 바탕화면 (앱 전체 배경, body 대상) — CLOV_APP_BACKGROUNDS 등록소.
     대시보드 배너(.v5-scene) 배경과는 별개다: 이건 로그인/피드/편지 등 전체 화면의
     바닥 배경(global-theme.css의 body 그라디언트)을 바꾸는 목록이다.
     'default'(우드&클로버, 기존 그라디언트)는 항상 존재하는 기본값이라 등록소에 넣지 않는다.
     주의: image 경로는 반드시 MAIN_BASE(02-main/ 폴더 기준 절대 URL) + 상대경로로 적을 것 —
     '/02-main/...' 같은 사이트-루트 절대경로는 http://localhost:.../로 열 때만 맞고,
     file:///C:/...로 직접 열면 드라이브 루트를 가리켜버려 깨진다(ERR_FILE_NOT_FOUND). */
  window.CLOV_APP_BACKGROUNDS = window.CLOV_APP_BACKGROUNDS || {};
  window.CLOV_APP_BACKGROUNDS['lp-wood-desk'] = {
    name: 'LP 우드 데스크',
    icon: '💿',
    image: MAIN_BASE + 'background-concepts/clov_lp_background_concept_1920x1080.png',
  };
  window.CLOV_APP_BACKGROUNDS['lp-album-collection'] = {
    name: 'LP 앨범 컬렉션',
    icon: '🎶',
    image: MAIN_BASE + 'background-concepts/clov_lp_background_concept_02_1920x1080.png',
  };
  window.CLOV_APP_BACKGROUNDS['clover-coast'] = {
    name: '클로버 해안 엽서',
    icon: '🌊',
    image: MAIN_BASE + 'background-concepts/clov_lp_background_concept_03_coast_1920x1080.png',
  };
  window.CLOV_APP_BACKGROUNDS['neon-clover-city'] = {
    name: '네온 클로버 시티',
    icon: '🌆',
    image: MAIN_BASE + 'background-concepts/clov_spiderverse_city_background_1920x1080.png',
  };
  window.CLOV_APP_BACKGROUNDS['minimal-clover'] = {
    name: '미니멀 클로버',
    icon: '🍃',
    image: MAIN_BASE + 'background-concepts/clov_minimal_monographic_background_1920x1080.png',
  };
  window.CLOV_APP_BACKGROUNDS['botanical-blueprint'] = {
    name: '보태니컬 클로버 청사진',
    icon: '📐',
    image: MAIN_BASE + 'background-concepts/clov_botanical_blueprint_background_1920x1080.png',
  };

  function getAppBackground() {
    return localStorage.getItem('clov_appBackground') || 'default';
  }

  // "바탕화면" 목록에 CLOV_APP_BACKGROUNDS 등록소 항목을 채워 넣는다.
  function renderAppBackgroundOptions() {
    var list = document.getElementById('dt-appbg-theme-list');
    if (!list) return;
    Object.keys(window.CLOV_APP_BACKGROUNDS).forEach(function (id) {
      if (list.querySelector('[data-appbg-theme="' + id + '"]')) return;
      var bg = window.CLOV_APP_BACKGROUNDS[id];
      var li = document.createElement('li');
      li.className = 'theme-option';
      li.dataset.appbgTheme = id;
      li.onclick = function () { setAppBackground(id); };
      li.innerHTML = '<span class="settings-list-label">' + bg.name + '</span>';
      list.appendChild(li);
    });
  }

  function applyAppBackground(id) {
    document.body.dataset.appBg = id;
    var bg = id !== 'default' && window.CLOV_APP_BACKGROUNDS[id];
    // body는 .window-content/.main-content(불투명 배경)에 항상 가려지므로, 실제 눈에 보이는
    // 그 두 레이어에도 같이 적용해야 화면에 반영된다.
    var targets = [document.body].concat([].slice.call(document.querySelectorAll('.window-content, .main-content')));
    targets.forEach(function (el) {
      el.style.backgroundImage = bg && bg.image ? 'url(' + bg.image + ')' : '';
      el.style.backgroundSize = bg && bg.image ? 'cover' : '';
      el.style.backgroundPosition = bg && bg.image ? 'center' : '';
      el.style.backgroundAttachment = bg && bg.image ? 'fixed' : '';
    });
  }

  function updateAppBackgroundUI() {
    renderAppBackgroundOptions();
    var id = getAppBackground();
    document.querySelectorAll('#dt-appbg-theme-list .theme-option').forEach(function (li) {
      li.classList.toggle('active', li.dataset.appbgTheme === id);
    });
  }

  function setAppBackground(id) {
    localStorage.setItem('clov_appBackground', id);
    applyAppBackground(id);
    updateAppBackgroundUI();
    var bg = window.CLOV_APP_BACKGROUNDS[id];
    var name = id === 'default' ? '우드 & 클로버' : (bg ? bg.name : id);
    var icon = id === 'default' ? '🪵' : (bg ? bg.icon : '🎨');
    clovToast(icon + ' ' + name + ' 바탕화면으로 바꿨어요!', 'success');
  }

  /* ── 배경 테마 (V5_WALLPAPERS 등록소) — 해당 UI가 없는 페이지에선 설정값만 저장 ── */
  function getBgTheme() {
    var theme = localStorage.getItem('clov_bgTheme') || 'lp-turntable';
    if (theme === 'photo' || theme === 'field') theme = 'lp-turntable'; // 구버전 저장값(photo/클로버 들판) 마이그레이션
    return theme;
  }

  // 사용자설정의 "배경" 목록에 V5_WALLPAPERS 등록소 항목을 채워 넣는다.
  // desktop.js가 늦게 로드되는 페이지 순서를 고려해, 등록소가 아직 없으면 조용히 넘어간다.
  function renderBgWallpaperOptions() {
    var list = document.getElementById('dt-bg-theme-list');
    if (!list || !window.V5_WALLPAPERS) return;
    Object.keys(window.V5_WALLPAPERS).forEach(function (id) {
      if (list.querySelector('[data-bg-theme="' + id + '"]')) return;
      var wp = window.V5_WALLPAPERS[id];
      var li = document.createElement('li');
      li.className = 'theme-option';
      li.dataset.bgTheme = id;
      li.onclick = function () { setBgTheme(id); };
      li.innerHTML = '<span class="settings-list-label">' + wp.name + '</span>';
      list.appendChild(li);
    });
  }

  function applyBgTheme(theme) {
    document.querySelectorAll('.v5-scene').forEach(function (scene) {
      scene.dataset.bgTheme = theme;
      var p = scene.id.replace('-v5scene', '');
      if (typeof window.v5PositionPhotoRec === 'function') window.v5PositionPhotoRec(p);
      if (typeof window.v5ApplyWallpaperImage === 'function') window.v5ApplyWallpaperImage(p);
    });
  }

  function updateBgThemeUI() {
    renderBgWallpaperOptions();
    var theme = getBgTheme();
    document.querySelectorAll('#dt-bg-theme-list .theme-option').forEach(function (li) {
      li.classList.toggle('active', li.dataset.bgTheme === theme);
    });
  }

  function setBgTheme(theme) {
    localStorage.setItem('clov_bgTheme', theme);
    applyBgTheme(theme);
    updateBgThemeUI();
    var wp = window.V5_WALLPAPERS && window.V5_WALLPAPERS[theme];
    var name = wp ? wp.name : theme;
    var icon = wp ? wp.icon : '🎨';
    clovToast(icon + ' ' + name + ' 배경으로 바꿨어요!', 'success');
  }

  /* ── 참여자별 추억 증거 카드 테마 (빨랫줄 / 겹침 카드) — 해당 UI가 없는 페이지에선 설정값만 저장 ── */
  function getEvidenceCardTheme() {
    return localStorage.getItem('clov_evidenceCardTheme') || 'wire';
  }

  function updateEvidenceCardThemeUI() {
    var theme = getEvidenceCardTheme();
    document.querySelectorAll('#dt-evidence-theme-list .theme-option').forEach(function (li) {
      li.classList.toggle('active', li.dataset.evidenceTheme === theme);
    });
  }

  function setEvidenceCardTheme(theme) {
    localStorage.setItem('clov_evidenceCardTheme', theme);
    updateEvidenceCardThemeUI();
    if (typeof renderEvidenceViewers === 'function') renderEvidenceViewers();
    clovToast(theme === 'coverflow' ? '📸 겹침 카드 테마로 바꿨어요!' : '🧷 빨랫줄 테마로 바꿨어요!', 'success');
  }

  /* ── 계정 탭 ── */
  var profileModalAvatarBase64 = '';

  function loadProfileModalData() {
    var profile = {};
    try { profile = JSON.parse(localStorage.getItem('clov_profile') || '{}'); } catch (e) {}

    var nameInput = document.getElementById('dt-profile-name');
    var emailInput = document.getElementById('dt-profile-email');
    var birthInput = document.getElementById('dt-profile-birth');
    if (nameInput) nameInput.value = profile.name || '';
    if (emailInput) emailInput.value = profile.email || '';
    if (birthInput) birthInput.value = profile.birth || '';

    profileModalAvatarBase64 = profile.avatarBase64 || '';
    [['dt-profile-avatar-img', 'dt-profile-avatar-initial'], ['dt-profile-avatar-img-2', 'dt-profile-avatar-initial-2']].forEach(function (pair) {
      var img = document.getElementById(pair[0]);
      var initial = document.getElementById(pair[1]);
      if (!img || !initial) return;
      if (profileModalAvatarBase64) {
        img.src = profileModalAvatarBase64;
        img.style.display = 'block';
        initial.style.display = 'none';
      } else {
        img.style.display = 'none';
        initial.style.display = 'block';
      }
    });

    var pwHint = document.getElementById('dt-profile-pw-hint');
    if (pwHint) { pwHint.textContent = ''; pwHint.className = 'profile-hint'; }
    ['dt-profile-pw-current', 'dt-profile-pw-new', 'dt-profile-pw-confirm'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });

    updateProfilePreview();
  }

  function updateProfilePreview() {
    var nameInput = document.getElementById('dt-profile-name');
    var previewName = document.getElementById('dt-profile-preview-name');
    var initial = document.getElementById('dt-profile-avatar-initial');
    var initial2 = document.getElementById('dt-profile-avatar-initial-2');
    var name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : '김예린';
    if (previewName) previewName.textContent = name;
    if (initial) initial.textContent = name.slice(0, 1) || '김';
    if (initial2) initial2.textContent = name.slice(0, 1) || '김';
  }

  function toggleProfilePassword(inputId, button) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    if (button) button.classList.toggle('is-visible', show);
  }

  function checkProfilePasswordMatch() {
    var next = document.getElementById('dt-profile-pw-new');
    var confirmEl = document.getElementById('dt-profile-pw-confirm');
    var hint = document.getElementById('dt-profile-pw-hint');
    if (!next || !confirmEl || !hint) return true;
    if (!confirmEl.value) {
      hint.textContent = '';
      hint.className = 'profile-hint';
      return true;
    }
    var matched = next.value === confirmEl.value;
    hint.textContent = matched ? '새 비밀번호가 일치합니다.' : '새 비밀번호가 일치하지 않습니다.';
    hint.className = 'profile-hint ' + (matched ? 'is-ok' : 'is-error');
    return matched;
  }

  function saveProfileModal() {
    if (!checkProfilePasswordMatch()) return;
    var nameInput = document.getElementById('dt-profile-name');
    var emailInput = document.getElementById('dt-profile-email');
    var birthInput = document.getElementById('dt-profile-birth');

    var profile = {};
    try { profile = JSON.parse(localStorage.getItem('clov_profile') || '{}'); } catch (e) {}
    profile.name = nameInput ? nameInput.value.trim() : '';
    profile.email = emailInput ? emailInput.value.trim() : '';
    profile.birth = birthInput ? birthInput.value : '';
    if (profileModalAvatarBase64) profile.avatarBase64 = profileModalAvatarBase64;

    localStorage.setItem('clov_profile', JSON.stringify(profile));
    updateProfilePreview();
    closeModal('dt-profile-modal');
    clovToast('프로필이 저장되었습니다! 🍀', 'success');
  }

  function confirmDeleteProfileAccount() {
    clovConfirm('정말 탈퇴하시겠어요? 계정은 삭제되지만 남긴 추억·편지·폴라로이드는 그대로 보존돼요. 작성자 표기만 \'언노운\'으로 익명화됩니다.', function () {
      try { localStorage.setItem('clov_withdrawn', '1'); } catch (e) {}
      // 저장된 추억 데이터의 내 작성자 표기를 즉시 익명화해 영속화
      if (typeof groupsData !== 'undefined' && typeof normalizeMemoryPost === 'function') {
        Object.keys(groupsData).forEach(function (g) {
          (groupsData[g].posts || []).forEach(function (post) { normalizeMemoryPost(post); });
        });
        if (typeof saveGroupsData === 'function') saveGroupsData();
      }
      closeModal('dt-profile-modal');
      if (typeof renderFeeds === 'function') renderFeeds();
      clovToast('계정을 탈퇴했어요 · 남긴 기록은 \'언노운\'으로 보존돼요', 'info');
    }, { icon: (window.CLOV_ICONS && CLOV_ICONS.logout) || '🚪', type: 'error', confirmText: '탈퇴', cancelText: '취소' });
  }

  function triggerProfileAvatarUpload() {
    var fileInput = document.getElementById('dt-profile-avatar-file');
    if (fileInput) fileInput.click();
  }

  function handleProfileAvatarUpload(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      clovAlert('이미지 파일(JPG, PNG, GIF, WEBP 등)만 업로드할 수 있습니다.', { icon: '⚠️', type: 'warn' });
      event.target.value = '';
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      profileModalAvatarBase64 = e.target.result;
      [['dt-profile-avatar-img', 'dt-profile-avatar-initial'], ['dt-profile-avatar-img-2', 'dt-profile-avatar-initial-2']].forEach(function (pair) {
        var img = document.getElementById(pair[0]);
        var initial = document.getElementById(pair[1]);
        if (img && initial) {
          img.src = e.target.result;
          img.style.display = 'block';
          initial.style.display = 'none';
        }
      });
    };
    reader.readAsDataURL(file);
  }

  /* ── 모달 열기 / 탭 전환 ── */
  function openProfileModal() {
    document.querySelectorAll('.clov-hdr-dropdown.open').forEach(function (el) { el.classList.remove('open'); });
    loadProfileModalData();
    switchSettingsPane('account');
    openModal('dt-profile-modal');
  }

  function switchSettingsPane(pane) {
    document.querySelectorAll('#dt-settings-nav .settings-nav-item').forEach(function (li) {
      li.classList.toggle('active', li.dataset.pane === pane);
    });
    var accountPane = document.getElementById('dt-settings-pane-account');
    var themePane = document.getElementById('dt-settings-pane-theme');
    if (accountPane) accountPane.style.display = pane === 'account' ? '' : 'none';
    if (themePane) themePane.style.display = pane === 'theme' ? '' : 'none';
    var accountActions = document.getElementById('dt-profile-actions-account');
    var themeActions = document.getElementById('dt-profile-actions-theme');
    if (accountActions) accountActions.style.display = pane === 'account' ? '' : 'none';
    if (themeActions) themeActions.style.display = pane === 'theme' ? '' : 'none';
    if (pane === 'theme') { updateThemeOptionUI(); updateAppBackgroundUI(); updateBgThemeUI(); updateCoverThemeUI(); updateMainPhotoThemeUI(); updateLetterBoxThemeUI(); updateEvidenceCardThemeUI(); }
  }

  /* ── 전역 등록 (주입된 HTML의 onclick 속성이 전역 스코프에서 호출하므로 필요) ── */
  window.openProfileModal = openProfileModal;
  window.switchSettingsPane = switchSettingsPane;
  window.setThemeMode = setThemeMode;
  window.updateThemeOptionUI = updateThemeOptionUI;
  window.getAppBackground = getAppBackground;
  window.applyAppBackground = applyAppBackground;
  window.updateAppBackgroundUI = updateAppBackgroundUI;
  window.setAppBackground = setAppBackground;
  window.getBgTheme = getBgTheme;
  window.applyBgTheme = applyBgTheme;
  window.updateBgThemeUI = updateBgThemeUI;
  window.setBgTheme = setBgTheme;
  window.getCoverTheme = getCoverTheme;
  window.applyCoverTheme = applyCoverTheme;
  window.updateCoverThemeUI = updateCoverThemeUI;
  window.setCoverTheme = setCoverTheme;
  window.renderMainPhotoOptions = renderMainPhotoOptions;
  window.updateMainPhotoThemeUI = updateMainPhotoThemeUI;
  window.setMainPhotoTheme = setMainPhotoTheme;
  window.getLetterBoxTheme = getLetterBoxTheme;
  window.applyLetterBoxTheme = applyLetterBoxTheme;
  window.updateLetterBoxThemeUI = updateLetterBoxThemeUI;
  window.setLetterBoxTheme = setLetterBoxTheme;
  window.getEvidenceCardTheme = getEvidenceCardTheme;
  window.updateEvidenceCardThemeUI = updateEvidenceCardThemeUI;
  window.setEvidenceCardTheme = setEvidenceCardTheme;
  window.loadProfileModalData = loadProfileModalData;
  window.updateProfilePreview = updateProfilePreview;
  window.toggleProfilePassword = toggleProfilePassword;
  window.checkProfilePasswordMatch = checkProfilePasswordMatch;
  window.saveProfileModal = saveProfileModal;
  window.confirmDeleteProfileAccount = confirmDeleteProfileAccount;
  window.triggerProfileAvatarUpload = triggerProfileAvatarUpload;
  window.handleProfileAvatarUpload = handleProfileAvatarUpload;

  window.ClovProfileModal = {
    init: function () {
      injectHTML();
      injectCSS();
      // init()이 body 상단(letter-box-trigger 등이 아직 파싱되기 전)에서 호출될 수 있으므로,
      // 페이지 콘텐츠가 전부 파싱된 뒤로 테마 적용을 미룬다.
      var applyTheme = function () { applyAppBackground(getAppBackground()); applyLetterBoxTheme(getLetterBoxTheme()); applyCoverTheme(getCoverTheme()); applyBgTheme(getBgTheme()); };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyTheme);
      } else {
        applyTheme();
      }
    }
  };
})();
