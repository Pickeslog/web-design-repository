import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './Invite.module.css'

// 원본: test-web-design/03-rooms/invite.html 전체 JSX 이식.
// 달라진 지점:
// - goBack()/submitCode()의 window.location.href='index.html?...' 하드 리다이렉트 →
//   navigate('/...')(SPA 이동). Dashboard가 아직 이 쿼리들을 읽어 처리하진 않지만,
//   URL 형태는 원본과 동일하게 유지해 나중에 이어 붙이기 쉽게 해뒀다.
// - 다크모드는 원본 그대로 이 화면 전용 localStorage 'clov_darkMode' 키 +
//   ?theme= 쿼리 우선순위를 유지했다(join_room은 'theme' 키를 쓰는 등, 원본 자체가
//   정적 페이지마다 독립된 다크모드 저장소를 썼던 것이라 그 동작을 그대로 보존).
export default function Invite() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState('CLOV-12')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const themeParam = searchParams.get('theme')
    let dark
    if (themeParam === 'dark') dark = true
    else if (themeParam === 'light') dark = false
    else dark = localStorage.getItem('clov_darkMode') === 'true'

    setIsDark(dark)
    document.documentElement.classList.toggle('dark-mode', dark)
    document.body.classList.toggle('dark-mode', dark)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function submitCode() {
    const trimmed = code.trim()
    if (trimmed.length < 4) {
      if (typeof window.clovAlert === 'function') {
        window.clovAlert('유효한 초대 코드를 입력해주세요.', { icon: '⚠️', type: 'warn' })
      }
      return
    }
    navigate(`/?action=invite&code=${encodeURIComponent(trimmed)}`)
  }

  function goBack() {
    navigate(`/?theme=${isDark ? 'dark' : 'light'}`)
  }

  return (
    <div className={styles.invitePage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>🤝 친구 초대하기</h1>
          <button className={styles.backBtn} onClick={goBack}>✕ 취소</button>
        </div>

        <div className={styles.inviteIcon}>📨</div>
        <p className={styles.inviteDesc}>친구에게 받은 6자리 초대코드를 입력하거나,<br />아래 코드를 복사해서 친구에게 전달하세요.</p>

        <input
          type="text"
          className={styles.codeInput}
          placeholder="CODE-XX"
          maxLength={8}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className={styles.btnSubmit} onClick={submitCode}>연동 및 디데이 시작</button>
      </div>
    </div>
  )
}
