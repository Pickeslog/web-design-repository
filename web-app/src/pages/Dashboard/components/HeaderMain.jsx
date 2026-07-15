import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../../store/useAppStore'

// 2단계 전환: 공통 헤더(§1.2, 원본 components/clov-header.js의 renderMain() 출력).
//
// 이 파일은 렌더링(HTML 생성) 부분만 옮긴 것이고, ClovHeader.init(cfg) 호출 자체는
// body-fragment.html에 원래 있던 인라인 <script>에 그대로 남겨뒀다 — init()은
// 렌더링 말고도 CSS 주입(injectCSS), 다크모드 복원(initTheme, localStorage 기반),
// 바깥 클릭 시 드롭다운 닫기(document.addEventListener) 세 가지 부수효과를 같이
// 하기 때문에, 그 부분까지 이 컴포넌트가 대신하려 하면 다크모드 복원이 조용히
// 빠지는 등 회귀 위험이 있다. 대신 Dashboard.jsx가 init()을 그대로 호출해 부수효과를
// 챙기고, init()이 #app-header에 문자열로 그려놓은 내용은 비운 뒤 이 컴포넌트를
// portal로 꽂는다(createPortal은 대상 노드의 기존 자식을 자동으로 지우지 않으므로
// 직접 비워야 한다) — 헤더는 전부 인라인 onclick 방식이라 "렌더 후 별도로
// addEventListener를 붙이는" 패턴이 없어서 이 교체가 안전하다(사용자설정 모달은
// 그 패턴이라 위험, 이번엔 손대지 않음).
//
// cfg는 원본 index.html의 실제 호출값(type:'main', activeTab:'space')만 반영했다.
// 다른 cfg 조합(sub/home 타입, 커스텀 dropdownItems 등)은 이 화면에서 안 쓰이므로
// 옮기지 않았다 — 필요해지면 그때 추가.
//
// 라우팅 연결(이번 작업): 원본은 ‹(방 목록)·로그아웃이 ../03-rooms/makerooms.html,
// ../01-auth/login.html 같은 상대경로 정적 파일 링크였다. 그 화면들은 아직 React로
// 옮기지 않았지만, 지금 있는 라우트 중 의미가 가장 가까운 곳으로 연결해뒀다.
// - ‹ → /rooms/make ("방 목록" 화면은 원본에서도 makerooms.html 하나가 목록+생성을
//   겸했던 것으로 보여, 우리 쪽에 이미 있는 방 만들기 placeholder에 잠정 연결. 실제
//   방 목록 화면이 생기면 이 링크만 바꾸면 된다.)
// - 로그아웃 → /login. window.ClovHeader.logout()을 그대로 부르면 내부에서
//   window.location.href로 완전 새로고침 이동을 해버려 SPA 라우팅이 깨지므로,
//   토큰 정리 로직만 그대로 복제하고 이동은 react-router navigate로 한다.
export default function HeaderMain() {
  const navigate = useNavigate()
  const clearUser = useAppStore((s) => s.clearUser)

  const handleLogout = () => {
    // window.ClovHeader.logout()의 토큰 정리 로직과 동일 — 원본을 호출하지 않는 이유는
    // 위 주석 참고(하드 리다이렉트 때문에 SPA 안에서는 쓸 수 없음).
    try {
      if (window.ClovAuth && typeof window.ClovAuth.clearAccessToken === 'function') {
        window.ClovAuth.clearAccessToken()
      } else {
        localStorage.removeItem('accessToken')
        sessionStorage.removeItem('accessToken')
      }
    } catch {
      // 정리 실패해도 로그아웃 자체는 진행
    }
    clearUser()
    document.getElementById('clov-hdr-drop')?.classList.remove('open')
    navigate('/login')
  }

  return (
    <>
      <div className="clov-hdr-left">
        <Link to="/rooms/make" className="clov-hdr-back" title="방 목록으로">
          <span className="clov-hdr-back-arrow">‹</span>
        </Link>
        <span className="clov-hdr-logo" onClick={() => window.switchDesktopTab('space')}>
          <img className="clov-hdr-logo-mark" src="../assets/ai-style/clov_logo_half_leaf_cartoon_transparent.png" alt="Clov 로고" />
          Clov.
        </span>
      </div>
      <div className="clov-hdr-right">
        <nav className="clov-hdr-nav">
          <button className="clov-hdr-nav-btn dt-nav-item active" id="dt-nav-space" onClick={() => window.switchDesktopTab('space')}>
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></svg>
            </span>
            <span>우정공간</span>
          </button>
          <button className="clov-hdr-nav-btn dt-nav-item" id="dt-nav-feed" onClick={() => window.switchDesktopTab('feed')}>
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" /><circle cx="12" cy="13" r="3.5" /></svg>
            </span>
            <span>추억피드</span>
          </button>
          <button className="clov-hdr-nav-btn dt-nav-item" id="dt-nav-letter" onClick={() => window.switchDesktopTab('letter')}>
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            </span>
            <span>행운편지</span>
          </button>
          <button className="clov-hdr-nav-btn dt-nav-item" id="dt-nav-schedule" onClick={() => window.switchDesktopTab('schedule')}>
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
            </span>
            <span>일정계획</span>
          </button>
          <button className="clov-hdr-nav-btn dt-nav-item clov-hdr-nav-icon-btn" id="dt-nav-noti" onClick={() => window.openNotiModal()} title="알림">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
          </button>
        </nav>
        <div className="clov-hdr-avatar-wrap">
          <button className="clov-hdr-avatar" onClick={(e) => { const drop = e.currentTarget.nextElementSibling; if (drop) drop.classList.toggle('open') }}>
            김
          </button>
          <ul className="clov-hdr-dropdown" id="clov-hdr-drop">
            <li onClick={() => window.openModal('dt-group-modal')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="3" /><path d="M2 20c0-3 2.5-5 6-5s6 2 6 5" /><circle cx="17" cy="9" r="2.3" /><path d="M15.2 14.6c2.3.5 3.6 2 3.8 4.4" /></svg> 방 변경하기
            </li>
            <li onClick={() => window.openModal('dt-invite-modal')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="2.3" /><circle cx="18" cy="6" r="2.3" /><circle cx="18" cy="18" r="2.3" /><path d="M8.1 10.8 15.9 7M8.1 13.2l7.8 3.6" /></svg> 현재 방 코드 공유하기
            </li>
            <li onClick={() => { window.openProfileModal(); document.getElementById('clov-hdr-drop')?.classList.remove('open') }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 13a7.97 7.97 0 0 0 0-2l2-1.6-2-3.4-2.4 1a8 8 0 0 0-1.7-1L15 3h-4l-.3 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a8 8 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 1.7 1L11 21h4l.3-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6z" /></svg> 사용자설정
            </li>
            <li onClick={handleLogout}>로그아웃</li>
          </ul>
        </div>
      </div>
    </>
  )
}
