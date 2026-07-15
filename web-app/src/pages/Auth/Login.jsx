import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Login.module.css'
import SuccessOverlay from '../../components/SuccessOverlay'
import { getAccessToken, setAccessToken } from '../../utils/clovAuth'

// 원본: test-web-design/01-auth/login.html 전체(마크업 + <style> + <script>) JSX 이식.
// 기능/디자인은 그대로 두고 구조만 옮겼다. 달라진 지점:
// - accessToken이 있으면 바로 이동하던 <head> 인라인 스크립트 → useEffect + navigate(SPA 이동)
// - ClovSuccessOverlay.show({redirectUrl})의 하드 리다이렉트 → <SuccessOverlay onDone=navigate>
// - shake(id) 애니메이션은 원본과 동일하게 "클래스 제거 → reflow → 클래스 추가" 방식을
//   ref로 직접 구현(React state로 흉내내면 연속 클릭 시 재시작이 안 먹는 문제가 있어서다).
export default function Login() {
  const navigate = useNavigate()
  const emailRef = useRef(null)
  const pwInputRef = useRef(null)

  const [pwVisible, setPwVisible] = useState(false)
  const [pwHintShown, setPwHintShown] = useState(false)
  const [remember, setRemember] = useState(false)
  const [message, setMessage] = useState('')
  const [messageShown, setMessageShown] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const messageTimer = useRef(null)

  useEffect(() => {
    if (getAccessToken()) {
      navigate('/rooms/make', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function shake(ref) {
    const el = ref.current
    if (!el) return
    el.classList.remove(styles.shakeError)
    void el.offsetWidth
    el.classList.add(styles.shakeError)
    el.focus()
  }

  function enterNext(e, nextRef, submitFn) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (nextRef && nextRef.current) {
      nextRef.current.focus()
      return
    }
    if (submitFn) submitFn()
  }

  function togglePw() {
    const willBeVisible = !pwVisible
    setPwVisible(willBeVisible)
    setPwHintShown(willBeVisible)
  }

  function showMessage(text) {
    setMessage(text)
    setMessageShown(true)
    clearTimeout(messageTimer.current)
    messageTimer.current = setTimeout(() => setMessageShown(false), 2600)
  }

  function login() {
    const email = emailRef.current.value.trim()
    const pw = pwInputRef.current.value
    if (!/\S+@\S+\.\S+/.test(email)) { shake(emailRef); return }
    if (!pw) { shake(pwInputRef); return }
    setAccessToken(remember)
    setShowOverlay(true)
  }

  return (
    <div className={styles.loginPage}>
      <main className={styles.loginShell}>
        <section className={styles.memoryPanel} aria-label="Clov 소개">
          <div className={styles.brand}>
            <div className={styles.brandMark}>
              <img
                src="/legacy/assets/ai-style/clov_logo_half_leaf_cartoon_transparent.png"
                alt="Clov 로고"
                style={{ width: 28, height: 28, objectFit: 'contain' }}
              />
            </div>
            <span>Clov.</span>
          </div>
          <div className={styles.panelCopy}>
            <div className={styles.panelBadge}>우정이 자라는 공간, Clov!</div>
            <h1>친구와 기록한<br />순간으로 떠나는 여행</h1>
            <p>약속, 기록, 편지를 한 곳에서<br />다시 열어보고 우정을 이어갈 수 있어요.</p>
            <div className={styles.memoryStack} aria-hidden="true">
              <div className={styles.memoryNote}>
                <div className={styles.noteDate}>나</div>
                <div className={styles.noteText}>우리 사진 찍은거 언제 올려??</div>
              </div>
              <div className={styles.memoryNote}>
                <div className={styles.noteDate}>정우 </div>
                <div className={styles.noteText}>Clov.에 올려둘게!</div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.formPanel}>
          <div className={styles.formBox}>
            <div className={styles.formKicker}>Welcome Back</div>
            <h2 className={styles.formTitle}>로그인</h2>
            <p className={styles.formDesc}>이메일과 비밀번호로 Clov.에 다시 입장해 주세요.</p>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="email">이메일</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                </span>
                <input
                  ref={emailRef}
                  type="email"
                  id="email"
                  placeholder="사용자님의 이메일을 입력해주세요."
                  autoComplete="email"
                  onKeyDown={(e) => enterNext(e, pwInputRef)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputLabelRow}>
                <label className={styles.inputLabel} htmlFor="pw">비밀번호</label>
                <span className={`${styles.inputStatus} ${pwHintShown ? styles.show : ''}`}>
                  {pwHintShown ? '조심하세요! 비밀번호가 보여요!' : ''}
                </span>
              </div>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                </span>
                <input
                  ref={pwInputRef}
                  type={pwVisible ? 'text' : 'password'}
                  id="pw"
                  placeholder="비밀번호를 입력해주세요"
                  autoComplete="current-password"
                  onKeyDown={(e) => enterNext(e, null, login)}
                />
                <button
                  className={`${styles.inputSuffix} ${pwVisible ? styles.isVisible : ''}`}
                  type="button"
                  onClick={togglePw}
                  aria-label={pwVisible ? '비밀번호 숨기기' : '비밀번호 보이기'}
                  aria-pressed={pwVisible}
                >
                  <svg className={styles.eyeIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg className={styles.eyeOffIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18"></path>
                    <path d="M10.6 10.6A2 2 0 0 0 13.4 13.4"></path>
                    <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 4.1"></path>
                    <path d="M6.6 6.7C3.6 8.7 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4.2-.9"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.remember}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>로그인 유지</span>
              </label>
              <button
                className={styles.subLink}
                type="button"
                onClick={() => showMessage('비밀번호 찾기 기능은 OAuth2 연동 단계에서 연결할 예정입니다.')}
              >
                비밀번호 찾기
              </button>
            </div>

            <button className={styles.btnPrimary} type="button" onClick={login}>Clov. 입장하기</button>
            <div className={`${styles.message} ${messageShown ? styles.show : ''}`}>{message}</div>

            <div className={styles.divider}>간편 로그인</div>
            <div className={styles.socialRow}>
              <button className={styles.socialBtn} type="button" data-provider="kakao" data-label="카카오 로그인" aria-label="카카오 OAuth2 로그인">
                <span className={`${styles.socialLogo} ${styles.kakao}`} aria-hidden="true">
                  <svg viewBox="0 0 32 32" role="img"><path d="M16 7.2c-5.55 0-10.05 3.55-10.05 7.93 0 2.83 1.9 5.32 4.75 6.72l-.86 3.15c-.08.3.26.54.52.37l3.77-2.49c.6.09 1.22.14 1.87.14 5.55 0 10.05-3.55 10.05-7.93S21.55 7.2 16 7.2Z" fill="#191919" /></svg>
                </span>
              </button>
              <button className={styles.socialBtn} type="button" data-provider="naver" data-label="네이버 로그인" aria-label="네이버 OAuth2 로그인">
                <span className={`${styles.socialLogo} ${styles.naver}`} aria-hidden="true">
                  <svg viewBox="0 0 32 32" role="img"><path d="M18.5 16.4 13.25 8.8H8.8v14.4h4.7v-7.6l5.25 7.6h4.45V8.8h-4.7v7.6Z" fill="#fff" /></svg>
                </span>
              </button>
              <button className={styles.socialBtn} type="button" data-provider="google" data-label="구글 로그인" aria-label="구글 OAuth2 로그인">
                <span className={`${styles.socialLogo} ${styles.google}`} aria-hidden="true">
                  <svg viewBox="0 0 32 32" role="img">
                    <path d="M28.1 16.32c0-.86-.08-1.68-.22-2.48H16.3v4.69h6.63a5.66 5.66 0 0 1-2.46 3.72v3.04h3.98c2.33-2.15 3.65-5.31 3.65-8.97Z" fill="#4285f4" />
                    <path d="M16.3 28.2c3.33 0 6.12-1.1 8.15-2.91l-3.98-3.04c-1.1.74-2.52 1.18-4.17 1.18-3.2 0-5.92-2.16-6.89-5.07H5.3v3.14a12.28 12.28 0 0 0 11 6.7Z" fill="#34a853" />
                    <path d="M9.41 18.36a7.36 7.36 0 0 1 0-4.72V10.5H5.3a12.32 12.32 0 0 0 0 11l4.11-3.14Z" fill="#fbbc05" />
                    <path d="M16.3 8.57c1.81 0 3.44.62 4.72 1.85l3.52-3.52A11.98 11.98 0 0 0 16.3 3.8a12.28 12.28 0 0 0-11 6.7l4.11 3.14c.97-2.91 3.69-5.07 6.89-5.07Z" fill="#ea4335" />
                  </svg>
                </span>
              </button>
            </div>

            <div className={styles.signupLink}>아직 계정이 없으신가요? <Link to="/signup">회원가입</Link></div>
          </div>
        </section>
      </main>
      <SuccessOverlay show={showOverlay} durationMs={3000} onDone={() => navigate('/rooms/make')} />
    </div>
  )
}
