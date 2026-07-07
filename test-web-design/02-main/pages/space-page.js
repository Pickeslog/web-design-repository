(function () {
  'use strict';
  var HTML = `
                            <div class="main-content-inner">
                                <div class="dashboard-card" id="dt-dashboard" style="padding:0; overflow:hidden; border-radius:18px;">
<div class="v5-scene" id="dt-v5scene" data-time="day" data-season="summer" data-level="3" data-event="none" data-bg-theme="field">
                                        <div class="scene-sky"></div>
                                        <div class="season-particles" id="dt-v5particles"></div>
                                        <div class="scene-balloons" id="dt-v5balloons"></div>
                                        <div class="v5-photo-rec" id="dt-v5photorec" onclick="v5PhotoRecClick(this)" title="클릭하면 우정 레벨업!">
                                            <div class="v5-photo-rec-shine"></div>
                                        </div>
                                        <div class="v5-photo-burst" id="dt-v5photoburst" aria-hidden="true"></div>
                                        <div class="hud-guard"></div>
                                        <div class="banner-hud">
                                            <div>
                                                <p class="hud-eyebrow" id="dt-v5eyebrow">우리 함께한 지</p>
                                                <p class="hud-dday">D+<span id="dt-v5dday">124</span> 일째</p>
                                            </div>
                                            <div class="hud-bottom">
                                                <div class="v5-photo-chip" id="dt-v5photochip">
                                                    <span class="v5-photo-chip-dot"></span>
                                                    <span class="v5-photo-chip-text"><span id="dt-v5chiplabel">여름</span> 추억 재생 중 · <span id="dt-v5chiptrack">124</span>번째 트랙</span>
                                                </div>
                                                <div class="lv-pill">
                                                    <div class="lv-pill-bg" id="dt-v5pillbg" style="width:68%"></div>
                                                    <div class="lv-pill-content">
                                                        <span class="lv-badge-icon" id="dt-v5lvicon" onclick="v5LevelUp()" title="클릭하면 레벨업!">Lv.3</span>
                                                        <span class="lv-badge-name" id="dt-v5lvname">초록 클로버 우정</span>
                                                        <span class="lv-pct" id="dt-v5lvpct">68%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style="grid-column: span 2;">
                                    <div class="main-photo-card">
                                        <div class="main-photo-wrapper">
                                            <img id="dt-main-photo" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="대표 사진" style="cursor: zoom-in;" onclick="openMainPhotoView(this)">
                                        </div>
                                        <div class="cover-summary">
                                            <div class="cover-kicker">우정공간 대표 커버</div>
                                            <div class="cover-title-row" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 8px;">
                                                <div class="title-input-box" style="position: relative;" onclick="event.stopPropagation(); const el=document.getElementById('dt-photo-title'); if(el) el.focus();" title="클릭하여 제목 수정">
                                                    <span class="title-bg-placeholder">제목을 입력하세요</span>
                                                    <span contenteditable="true" id="dt-photo-title" class="editable-title" onclick="event.stopPropagation()" style="cursor: text; flex: 1; min-width: 320px; outline: none; border: none; font-size: 18px; font-weight: 800; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; position: relative; z-index: 1; background: transparent;" oninput="handleTitleInput(this)" onkeydown="return onTitleKeyDown(event, this);" onblur="savePhotoTitle('dt')">우리가 고등학교때 찍은 사진</span>
                                                    <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;" onclick="event.stopPropagation();">
                                                        <span id="dt-title-count" style="font-size: 12px; color: var(--primary-green); font-weight: 700; background: rgba(27, 67, 50, 0.12); padding: 4px 10px; border-radius: 12px; white-space: nowrap;">28 / 40</span>
                                                        <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; white-space: nowrap;">(한글 20자 / 영어 40자)</span>
                                                    </div>
                                                </div>
                                                <div class="cover-avatar-stack" aria-label="참여 멤버">
                                                    <span class="cover-avatar">나</span>
                                                    <span class="cover-avatar">솔</span>
                                                    <span class="cover-avatar">민</span>
                                                    <span class="cover-avatar">준</span>
                                                </div>
                                                <button type="button" onclick="event.stopPropagation(); triggerPhotoUpload('dt');" title="대표 사진 변경하기" style="background: rgba(27, 67, 50, 0.08); border: 1px solid rgba(27, 67, 50, 0.15); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(27, 67, 50, 0.05);" onmouseover="this.style.background='rgba(27, 67, 50, 0.15)'" onmouseout="this.style.background='rgba(27, 67, 50, 0.08)'">
                                                    <span style="display:flex;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.5"/></svg></span>
                                                </button>
                                            </div>
                                            <div class="cover-meta-grid">
                                                <div class="cover-meta-item member-highlight-card" onclick="openMemberListModal(event)" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: rgba(248, 251, 249, 0.85); border: 1px solid rgba(27, 67, 50, 0.15); border-radius: 14px; box-shadow: 0 4px 14px rgba(8, 28, 22, 0.05); transition: all 0.25s ease;" title="클릭하여 참여 멤버 리스트 보기">
                                                    <div style="display: flex; align-items: center; gap: 12px;">
                                                        <div style="display: flex; align-items: center;">
                                                            <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--primary-green); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 1.5px solid white; z-index: 4;">나</div>
                                                            <div style="width: 30px; height: 30px; border-radius: 50%; background: #52b788; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 1.5px solid white; margin-left: -8px; z-index: 3;">솔</div>
                                                            <div style="width: 30px; height: 30px; border-radius: 50%; background: #74c69d; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 1.5px solid white; margin-left: -8px; z-index: 2;">민</div>
                                                            <div style="width: 30px; height: 30px; border-radius: 50%; background: #95d5b2; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 1.5px solid white; margin-left: -8px; z-index: 1;">준</div>
                                                        </div>
                                                        <div style="display: flex; flex-direction: column; gap: 1px;">
                                                            <span style="font-size: 11px; color: var(--text-muted); font-weight: 700; letter-spacing: -0.2px;">참여 멤버</span>
                                                            <span style="font-size: 14px; font-weight: 800; color: var(--text-color);">4명 함께하는 중</span>
                                                        </div>
                                                    </div>
                                                    <div style="background: rgba(27, 67, 50, 0.08); color: var(--primary-green); font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 16px; border: 1px solid rgba(27, 67, 50, 0.12); display: flex; align-items: center; gap: 4px;">
                                                        <span>멤버 보기</span>
                                                        <span style="font-size: 10px;">➔</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <section class="dashboard-schedule-section" style="margin-top: 20px;">
                                        <div class="section-title">
                                            <span>다가오는 약속</span>
                                            <div class="section-actions">
                                                <button class="btn-action-sm btn-schedule-new" type="button" onclick="openScheduleModal('dt')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px;"><path d="M12 5v14M5 12h14"/></svg>새 D-day 만들기</button>
                                            </div>
                                        </div>
                                        <div id="dt-schedule-banner-container" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;"></div>
                                    </section>
                                </div>
                                <section class="space-memory-preview">
                                    <div class="section-title">
                                        <span>참여자별 추억 증거 카드</span>
                                        <div class="section-actions">
                                            <button class="btn-action-sm btn-memory-write" type="button" data-open-write-modal onclick="openWriteModal()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>글쓰기</button>
                                            <button class="btn-action-sm" onclick="switchDesktopTab('feed')">전체 피드 보기</button>
                                        </div>
                                    </div>
                                    <div class="space-memory-grid" id="dt-space-memory-zone"></div>
                                </section>
                            </div>
`;

  window.SpacePage = {
    init: function () {
      var el = document.getElementById('dt-tab-space');
      if (el) el.innerHTML = HTML;
    }
  };
})();
