// 2단계 전환: 우정공간(대시보드) 탭 본문 뼈대(§3.2 ①~④, 원본 pages/space-page.js의 HTML 템플릿 문자열).
// 원본은 SpacePage.init()이 이 마크업 전체를 innerHTML로 #dt-tab-space에 주입했다.
// 지금은 이 컴포넌트가 그 자리를 대신하고, 안의 빈 컨테이너
// (#dt-schedule-banner-container, #dt-space-memory-zone 등)는 여전히 js/space.js가
// 채운다 — 그 함수들은 전부 getElementById 기반이라 껍데기가 React든 원본 innerHTML
// 문자열이든 구분하지 않는다. v5-scene의 data-time/data-season/data-level/data-event/
// data-bg-theme 속성은 js/v5-banner.js·croby-mascot.js가 계절/시간대별 연출을 고를 때
// 읽는 값이라 값도 원본 초기값(day/summer/3/none/field) 그대로 유지했다.
export default function SpaceTabContent() {
  return (
    <div className="main-content-inner">
      <div className="dashboard-card" id="dt-dashboard" style={{ padding: 0, overflow: 'hidden', borderRadius: 18 }}>
        <div className="v5-scene" id="dt-v5scene" data-time="day" data-season="summer" data-level="3" data-event="none" data-bg-theme="field">
          <div className="scene-sky" />
          <div className="season-particles" id="dt-v5particles" />
          <div className="scene-balloons" id="dt-v5balloons" />
          <div className="v5-photo-rec" id="dt-v5photorec" onClick={(e) => window.v5PhotoRecClick(e.currentTarget)} title="클릭하면 우정 레벨업!">
            <div className="v5-photo-rec-shine" />
          </div>
          <div className="v5-photo-burst" id="dt-v5photoburst" aria-hidden="true" />
          <div className="hud-guard" />
          <div className="banner-hud">
            <div>
              <p className="hud-eyebrow" id="dt-v5eyebrow">우리 함께한 지</p>
              <p className="hud-dday">
                D+<span id="dt-v5dday">124</span> 일째
              </p>
            </div>
            <div className="hud-bottom">
              <div className="v5-photo-chip" id="dt-v5photochip">
                <span className="v5-photo-chip-dot" />
                <span className="v5-photo-chip-text">
                  <span id="dt-v5chiplabel">여름</span> 추억 재생 중 · <span id="dt-v5chiptrack">124</span>번째 트랙
                </span>
              </div>
              <div className="lv-pill">
                <div className="lv-pill-bg" id="dt-v5pillbg" style={{ width: '68%' }} />
                <div className="lv-pill-content">
                  <span className="lv-badge-icon" id="dt-v5lvicon" onClick={() => window.v5LevelUp()} title="클릭하면 레벨업!">Lv.3</span>
                  <span className="lv-badge-name" id="dt-v5lvname">초록 클로버 우정</span>
                  <span className="lv-pct" id="dt-v5lvpct">68%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ gridColumn: 'span 2' }}>
        <div className="main-photo-card">
          <div className="main-photo-wrapper">
            <img
              id="dt-main-photo"
              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
              alt="대표 사진"
              style={{ cursor: 'zoom-in' }}
              onClick={(e) => window.openMainPhotoView(e.currentTarget)}
            />
          </div>
          <div className="cover-summary">
            <div className="cover-kicker">우정공간 대표 커버</div>
            <div className="cover-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
              <div
                className="title-input-box"
                style={{ position: 'relative' }}
                onClick={(e) => {
                  e.stopPropagation()
                  const el = document.getElementById('dt-photo-title')
                  if (el) el.focus()
                }}
                title="클릭하여 제목 수정"
              >
                <span className="title-bg-placeholder">제목을 입력하세요</span>
                <span
                  contentEditable="true"
                  suppressContentEditableWarning
                  id="dt-photo-title"
                  className="editable-title"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    cursor: 'text',
                    flex: 1,
                    minWidth: 320,
                    outline: 'none',
                    border: 'none',
                    fontSize: 18,
                    fontWeight: 800,
                    color: 'var(--text-color)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    position: 'relative',
                    zIndex: 1,
                    background: 'transparent',
                  }}
                  onInput={(e) => window.handleTitleInput(e.currentTarget)}
                  onKeyDown={(e) => window.onTitleKeyDown(e, e.currentTarget)}
                  onBlur={() => window.savePhotoTitle('dt')}
                >
                  우리가 고등학교때 찍은 사진
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <span id="dt-title-count" style={{ fontSize: 12, color: 'var(--primary-green)', fontWeight: 700, background: 'rgba(27, 67, 50, 0.12)', padding: '4px 10px', borderRadius: 12, whiteSpace: 'nowrap' }}>
                    28 / 40
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>(한글 20자 / 영어 40자)</span>
                </div>
              </div>
              <div className="cover-avatar-stack" aria-label="참여 멤버">
                <span className="cover-avatar">나</span>
                <span className="cover-avatar">솔</span>
                <span className="cover-avatar">민</span>
                <span className="cover-avatar">준</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  window.triggerPhotoUpload('dt')
                }}
                title="대표 사진 변경하기"
                style={{
                  background: 'rgba(27, 67, 50, 0.08)',
                  border: '1px solid rgba(27, 67, 50, 0.15)',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(27, 67, 50, 0.05)',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(27, 67, 50, 0.15)' }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(27, 67, 50, 0.08)' }}
              >
                <span style={{ display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                </span>
              </button>
            </div>
            <div className="cover-meta-grid">
              <div
                className="cover-meta-item member-highlight-card"
                onClick={(e) => window.openMemberListModal(e)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  background: 'rgba(248, 251, 249, 0.85)',
                  border: '1px solid rgba(27, 67, 50, 0.15)',
                  borderRadius: 14,
                  boxShadow: '0 4px 14px rgba(8, 28, 22, 0.05)',
                  transition: 'all 0.25s ease',
                }}
                title="클릭하여 참여 멤버 리스트 보기"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="member-mini-avatars" style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, border: '1.5px solid white', zIndex: 4 }}>나</div>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#52b788', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, border: '1.5px solid white', marginLeft: -8, zIndex: 3 }}>솔</div>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#74c69d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, border: '1.5px solid white', marginLeft: -8, zIndex: 2 }}>민</div>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#95d5b2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, border: '1.5px solid white', marginLeft: -8, zIndex: 1 }}>준</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: -0.2 }}>참여 멤버</span>
                    <span className="member-count-text" style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-color)' }}>4명 함께하는 중</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(27, 67, 50, 0.08)', color: 'var(--primary-green)', fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 16, border: '1px solid rgba(27, 67, 50, 0.12)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>멤버 보기</span>
                  <span style={{ fontSize: 10 }}>➔</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <section className="dashboard-schedule-section" style={{ marginTop: 20 }}>
          <div className="section-title">
            <div className="section-actions">
              <button className="btn-action-sm btn-schedule-new" type="button" onClick={() => window.openScheduleModal('dt')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-2px', marginRight: 4 }}><path d="M12 5v14M5 12h14" /></svg>
                새 D-day 만들기
              </button>
            </div>
          </div>
          <div id="dt-schedule-banner-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} />
        </section>
      </div>
      <section className="space-memory-preview">
        <div className="section-title">
          <span>참여자별 추억 증거 카드</span>
          <div className="section-actions">
            <button className="btn-action-sm btn-memory-write" type="button" data-open-write-modal="" onClick={() => window.openWriteModal()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-2px', marginRight: 4 }}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
              글쓰기
            </button>
            <button className="btn-action-sm" onClick={() => window.switchDesktopTab('feed')}>전체 피드 보기</button>
          </div>
        </div>
        <div className="space-memory-grid" id="dt-space-memory-zone" />
      </section>
    </div>
  )
}
