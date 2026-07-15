import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styles from './JoinRoom.module.css'

// 원본: test-web-design/03-rooms/join_room.html 전체 JSX 이식.
// 달라진 지점:
// - 로고/"홈으로 돌아가기" 링크(원본 href="index.html")는 대시보드 루트 "/"로 연결.
// - 완료 패널의 location.href='../02-main/index.html?tab=join' → navigate('/')(SPA 이동).
// - 다크모드는 원본 그대로 이 화면 전용 localStorage 'theme' 키 + document.body 클래스
//   토글을 유지했다(대시보드가 쓰는 'clov_theme' 키와는 별개 — 원본 자체가 정적 페이지마다
//   독립된 다크모드 저장소를 썼던 것이라 그 동작을 그대로 보존했다).
// - clovToast/clovAlert(components/clov-modal.js)는 index.html에 전역 스크립트로
//   이미 로드해뒀다(다른 화면들도 공용으로 쓸 수 있도록).
export default function JoinRoom() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [darkMode, setDarkMode] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [appliedCode, setAppliedCode] = useState('')

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark'
    setDarkMode(isDark)
    document.body.classList.toggle('dark-mode', isDark)

    const prefilled = searchParams.get('code') || searchParams.get('roomCode')
    if (prefilled) setRoomCode(prefilled.toUpperCase())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleDarkMode() {
    const next = !darkMode
    setDarkMode(next)
    document.body.classList.toggle('dark-mode', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  function submitJoinRoom() {
    const code = roomCode.trim().toUpperCase()
    if (code.length < 5) {
      setInvalid(true)
      return
    }
    setInvalid(false)

    try {
      const joinReqs = JSON.parse(localStorage.getItem('clov_joinRequests')) || []
      joinReqs.unshift({
        id: 'req_' + Date.now(),
        name: '새로운 친구 (' + code.slice(-4) + ')',
        code,
        date: '방금 전',
        status: 'pending',
      })
      localStorage.setItem('clov_joinRequests', JSON.stringify(joinReqs))
    } catch (e) {
      console.error('가입 신청 저장 실패', e)
    }

    setAppliedCode(code)
    setSubmitted(true)

    if (typeof window.clovAlert === 'function') {
      window.clovAlert(`🍀 [${code}] 방에 가입 신청을 보냈습니다!\n참여 멤버 중 1명이 수락하면 입장이 완료됩니다.`, { icon: '🤝', type: 'success' })
    }
  }

  return (
    <div className={styles.joinRoomPage}>
      <div className={styles.desktopWindow}>
        <div className={styles.desktopBrowserBar}>
          <div className={styles.browserDot} />
          <div className={styles.browserDot} />
          <div className={styles.browserDot} />
        </div>
        <div className={styles.windowContent}>
          <header className={styles.header}>
            <Link to="/" className={styles.logo}>
              <img src="/legacy/assets/ai-style/clov_logo_half_leaf_cartoon_transparent.png" alt="Clov 로고" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              Clov.
            </Link>
            <div className={styles.headerActions}>
              <button className={styles.iconBtn} onClick={toggleDarkMode} title="다크모드 토글">
                <span className={styles.toggleIcon}>
                  <svg className={styles.iconSun} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
                  <svg className={styles.iconMoon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                </span>
              </button>
              <button className={styles.iconBtn} onClick={() => window.clovToast && window.clovToast('받은 행운편지함을 엽니다.', 'info')} title="행운편지">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
              </button>
              <button className={styles.avatarBtn} title="프로필">김</button>
            </div>
          </header>
          <main className={styles.mainContent}>
            {!submitted && (
              <div className={styles.formContainer}>
                <Link to="/" className={styles.backLink}>← 홈으로 돌아가기</Link>
                <div className={styles.pageHeading}>
                  <h2>방 접속하기</h2>
                  <p>친구에게 전달받은 우정공간의<br />고유 방 코드를 입력하여 접속하세요.</p>
                </div>
                <div className={`${styles.inputGroup} ${invalid ? styles.invalid : ''}`}>
                  <label htmlFor="room-code">방 코드 입력</label>
                  <input
                    type="text"
                    id="room-code"
                    placeholder="CLOV-XXXX-XXXX"
                    maxLength={20}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  />
                  <span className={styles.warningText}>유효하지 않은 코드 형식입니다.</span>
                </div>
                <button className={styles.btnMain} onClick={submitJoinRoom}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 4 }}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5M15 12H3" /></svg>
                  방 접속하기
                </button>
              </div>
            )}

            {submitted && (
              <div className={`${styles.formContainer} ${styles.successPanelInner} ${styles.active}`}>
                <div className={styles.successIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>
                </div>
                <h3>가입 신청이 완료되었습니다!</h3>
                <p>
                  우정공간(<b style={{ color: 'var(--primary-green)' }}>{appliedCode}</b>)에 입장 신청을 보냈습니다.
                  <br />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'inline-block', marginTop: 8, lineHeight: 1.5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -1, marginRight: 2 }}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>
                    방장 권한이 없으므로 참여 멤버 중 1명만 수락하면 즉시 방에 입장할 수 있습니다.
                  </span>
                </p>
                <button className={styles.btnMain} style={{ marginTop: 10 }} onClick={() => navigate('/')}>메인(알림)으로 이동</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
