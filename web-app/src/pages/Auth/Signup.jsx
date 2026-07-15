import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Signup.module.css'

// 원본: test-web-design/01-auth/signup.html 전체(마크업 + <style> + <script>) JSX 이식.
// 5단계 위저드(이메일/비번 → 약관 → 프로필사진 → 닉네임/생일 → 완료) 로직을 그대로 옮겼다.
// 달라진 지점: 마지막 단계의 window.location.href='login.html' 하드 리다이렉트 →
// navigate('/login')(SPA 이동). 그 외 유효성 검사·흔들림 애니메이션·전체동의 동기화·
// 생년월일 휠 모달 로직은 원본과 동일하게 재구현했다.

const NOW_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: NOW_YEAR - 1900 + 1 }, (_, i) => String(NOW_YEAR - i))
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))

const TERMS_CONTENT = {
  service: (
    <>
      <h4>제1조 (목적)</h4>
      <p>이 약관은 [회사명](이하 "회사")가 제공하는 친구 기록 서비스 "Clov."(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
      <h4>제2조 (용어의 정의)</h4>
      <p>① "서비스"란 회사가 제공하는 약속·기록·편지 등 친구 간 추억 기록 관련 제반 서비스를 의미합니다.<br />② "회원"이란 이 약관에 동의하고 회사와 이용계약을 체결하여 서비스를 이용하는 자를 말합니다.<br />③ "게시물"이란 회원이 서비스 이용 과정에서 게시한 문자, 사진, 파일 등 일체의 정보를 말합니다.</p>
      <h4>제3조 (약관의 효력 및 변경)</h4>
      <p>① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.<br />② 회사는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관계 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있으며, 개정 시 적용일자 및 개정사유를 명시하여 적용일 7일 전(회원에게 불리한 변경은 30일 전)부터 서비스 내 공지합니다.<br />③ 회원이 개정 약관의 적용에 동의하지 않는 경우 이용계약을 해지할 수 있으며, 공지 후에도 계속 서비스를 이용하면 개정 약관에 동의한 것으로 봅니다.</p>
      <h4>제4조 (이용계약의 성립)</h4>
      <p>이용계약은 회원이 되고자 하는 자가 약관 내용에 동의한 후 회사가 정한 가입 절차를 완료하고, 회사가 이를 승낙함으로써 성립합니다. 회사는 실명이 아니거나 타인의 명의를 이용한 경우, 허위 정보를 기재한 경우 승낙을 거부하거나 사후에 이용계약을 해지할 수 있습니다.</p>
      <h4>제5조 (회사의 의무)</h4>
      <p>회사는 관련 법령과 이 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적·안정적으로 서비스를 제공하기 위해 노력합니다. 또한 회원의 개인정보를 관련 법령에 따라 보호합니다.</p>
      <h4>제6조 (회원의 의무)</h4>
      <p>회원은 다음 각 호의 행위를 해서는 안 됩니다.<br />1. 타인의 정보 도용 또는 허위 정보 등록<br />2. 회사 또는 제3자의 저작권 등 지식재산권 침해<br />3. 회사의 서비스 운영을 고의로 방해하는 행위<br />4. 공공질서 및 미풍양속에 반하는 내용의 게시물 유포<br />5. 관계 법령에 위반되는 행위</p>
      <h4>제7조 (서비스의 제공 및 변경·중단)</h4>
      <p>① 회사는 연중무휴, 1일 24시간 서비스 제공을 원칙으로 하되, 시스템 점검 등 운영상 필요한 경우 서비스의 전부 또는 일부를 일시 중단할 수 있습니다.<br />② 회사는 서비스의 내용을 변경할 수 있으며, 이 경우 변경 내용을 사전에 공지합니다.</p>
      <h4>제8조 (계약해지 및 이용제한)</h4>
      <p>회원은 언제든지 서비스 내 설정 메뉴를 통해 이용계약 해지(회원 탈퇴)를 신청할 수 있으며, 회사는 관련 법령이 정하는 바에 따라 이를 즉시 처리합니다. 회원이 제6조를 위반한 경우 회사는 사전 통지 후 이용을 제한하거나 계약을 해지할 수 있습니다.</p>
      <h4>제9조 (면책조항)</h4>
      <p>회사는 천재지변 또는 이에 준하는 불가항력, 회원의 귀책사유로 인한 서비스 이용 장애에 대해서는 책임을 지지 않습니다.</p>
      <h4>제10조 (분쟁해결 및 관할법원)</h4>
      <p>이 약관과 관련하여 회사와 회원 간에 발생한 분쟁에 대해서는 대한민국 법을 적용하며, 소송이 제기될 경우 민사소송법상의 관할법원에 제기합니다.</p>
      <p style={{ marginTop: 14, color: 'var(--muted)', fontSize: '.72rem' }}>부칙 — 이 약관은 2026년 7월 8일부터 적용됩니다.</p>
    </>
  ),
  privacy: (
    <>
      <p>[회사명](이하 "회사")는 「개인정보보호법」 등 관계 법령을 준수하며, 다음과 같이 개인정보 처리방침을 수립·공개합니다.</p>
      <h4>1. 수집하는 개인정보 항목 및 수집방법</h4>
      <p>① 회원가입 시 다음 정보를 수집합니다.<br />- 필수: 이메일, 비밀번호, 닉네임<br />- 선택: 생년월일, 프로필 사진<br />② 서비스 이용 과정에서 접속 로그, 쿠키, 접속 IP 정보, 기기정보가 자동으로 생성되어 수집될 수 있습니다.<br />③ 수집 방법: 회원가입 화면을 통한 이용자의 직접 입력, 서비스 이용 과정의 자동 수집.</p>
      <h4>2. 개인정보의 수집 및 이용목적</h4>
      <p>회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.<br />1. 회원 식별 및 본인 확인, 부정 이용 방지<br />2. 약속·기록·편지 등 서비스 제공 및 콘텐츠 저장<br />3. 생일 등 기념일 안내 기능 제공(생년월일 입력 시)<br />4. 서비스 개선을 위한 통계 분석<br />5. (선택 동의 시) 이벤트·소식 등 마케팅 정보 안내</p>
      <h4>3. 개인정보의 보유 및 이용기간</h4>
      <p>회사는 원칙적으로 개인정보 수집·이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 다만 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관계 법령의 규정에 의해 보존할 필요가 있는 경우 회사는 관계 법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.</p>
      <h4>4. 개인정보의 파기절차 및 방법</h4>
      <p>회원 탈퇴 등 개인정보의 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일 형태의 정보는 복구할 수 없는 기술적 방법을 사용하여 삭제하며, 종이 문서에 기록된 개인정보는 분쇄하거나 소각합니다.</p>
      <h4>5. 개인정보의 제3자 제공</h4>
      <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 이용자가 사전에 동의하였거나 법령의 규정에 의거한 경우는 예외로 합니다.</p>
      <h4>6. 개인정보 처리위탁</h4>
      <p>회사는 원활한 서비스 제공을 위하여 필요한 경우 개인정보 처리업무를 외부에 위탁할 수 있으며, 위탁 시에는 위탁받는 자 및 위탁업무 내용을 사전에 공지합니다.</p>
      <h4>7. 이용자 및 법정대리인의 권리와 행사방법</h4>
      <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회, 수정할 수 있으며 가입 해지를 요청할 수 있습니다. 개인정보 조회, 수정을 위해서는 설정 화면을, 가입 해지(동의 철회)를 위해서는 회원탈퇴 메뉴를 이용할 수 있습니다.</p>
      <h4>8. 쿠키의 설치·운영 및 거부</h4>
      <p>회사는 이용자에게 맞춤화된 서비스를 제공하기 위해 쿠키를 사용할 수 있습니다. 이용자는 웹브라우저 옵션 설정을 통해 쿠키 저장을 거부할 수 있으며, 이 경우 서비스 이용에 일부 어려움이 있을 수 있습니다.</p>
      <h4>9. 개인정보의 안전성 확보조치</h4>
      <p>회사는 개인정보의 안전성 확보를 위해 비밀번호 암호화, 접근권한 관리, 접속기록 보관 등 기술적·관리적 조치를 취하고 있습니다.</p>
      <h4>10. 개인정보 보호책임자</h4>
      <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지는 개인정보 보호책임자를 지정하고 있습니다.<br />- 성명: [담당자명]<br />- 연락처: [이메일 주소] / [전화번호]</p>
      <h4>11. 정책 변경에 따른 공지</h4>
      <p>이 개인정보 처리방침은 법령·정책 또는 보안기술의 변경에 따라 내용이 추가·삭제 및 수정될 수 있으며, 변경 시 서비스 내 공지사항을 통해 시행 7일 전부터 공지합니다.</p>
      <p style={{ marginTop: 14, color: 'var(--muted)', fontSize: '.72rem' }}>공고일자: 2026년 7월 8일 · 시행일자: 2026년 7월 8일</p>
    </>
  ),
}

const LOGO_MESSAGES = ['오늘도 추억 한 잎 저장', 'Clov.가 조용히 자라는 중', '친구와의 약속을 기다려요', '작은 기록도 오래 남아요']

function getPasswordChecks(value) {
  const hasLetter = /[A-Za-z]/.test(value)
  const hasNumber = /[0-9]/.test(value)
  const hasSpecial = /[^A-Za-z0-9]/.test(value)
  const typeCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length
  const lengthOk = value.length >= 8 && value.length <= 20
  return { lengthOk, comboOk: typeCount >= 2, ok: lengthOk && typeCount >= 2 }
}

function todayPadded() {
  const d = new Date()
  return { month: String(d.getMonth() + 1).padStart(2, '0'), day: String(d.getDate()).padStart(2, '0') }
}

export default function Signup() {
  const navigate = useNavigate()
  const emailRef = useRef(null)
  const pwInputRef = useRef(null)
  const nicknameRef = useRef(null)
  const termsBoxRef = useRef(null)

  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pwVisible, setPwVisible] = useState(false)
  const [pwHintShown, setPwHintShown] = useState(false)
  const [nickname, setNickname] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [welcomeName, setWelcomeName] = useState('클로버')

  const [chk1, setChk1] = useState(false)
  const [chk2, setChk2] = useState(false)
  const [chk3, setChk3] = useState(false)
  const chkAll = chk1 && chk2 && chk3
  const [pulseAll, setPulseAll] = useState(false)
  const [openPanel, setOpenPanel] = useState(null)

  const [profileImageUrl, setProfileImageUrl] = useState(null)

  const [birthModalOpen, setBirthModalOpen] = useState(false)
  const [birthNudgeOpen, setBirthNudgeOpen] = useState(false)
  const today = useMemo(todayPadded, [])
  const [birthYear, setBirthYear] = useState('2007')
  const [birthMonth, setBirthMonth] = useState(today.month)
  const [birthDay, setBirthDay] = useState(today.day)

  const [logoPop, setLogoPop] = useState(null)

  function shake(ref) {
    const el = ref.current
    if (!el) return
    el.classList.remove(styles.shakeError)
    void el.offsetWidth
    el.classList.add(styles.shakeError)
    el.focus()
  }
  function shakeBox() {
    const el = termsBoxRef.current
    if (!el) return
    el.classList.remove(styles.shakeBoxError)
    void el.offsetWidth
    el.classList.add(styles.shakeBoxError)
  }

  function validateStep0() {
    const emailOk = /\S+@\S+\.\S+/.test(email.trim())
    if (!emailOk) { shake(emailRef); return false }
    if (!getPasswordChecks(pw).ok) { shake(pwInputRef); return false }
    return true
  }
  function validateStep1() {
    const ok = chk1 && chk2
    if (!ok) shakeBox()
    return ok
  }
  function validateStep3() {
    const nicknameOk = /^[가-힣A-Za-z0-9]{1,12}$/.test(nickname.trim())
    if (!nicknameOk) { shake(nicknameRef); return false }
    return true
  }

  function goStep(n, opts = {}) {
    if (n === 1 && !validateStep0()) return
    if (n === 2 && !validateStep1()) return
    if (n === 4 && !validateStep3()) return
    if (n === 4 && !opts.skipBirthNudge && !birthdate.trim()) {
      setBirthNudgeOpen(true)
      return
    }
    if (n === 4) {
      const emailName = email.trim().split('@')[0]
      const finalName = nickname.trim() || emailName || '클로버'
      setWelcomeName(finalName)
      let profile = {}
      try { profile = JSON.parse(localStorage.getItem('clov_profile') || '{}') } catch { /* noop */ }
      profile.name = finalName
      if (email.trim()) profile.email = email.trim()
      if (birthdate.trim()) profile.birth = birthdate.trim()
      localStorage.setItem('clov_profile', JSON.stringify(profile))
    }
    setStep(n)
  }

  function enterNext(e, nextRef, submitFn) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (nextRef && nextRef.current) { nextRef.current.focus(); return }
    if (submitFn) submitFn()
  }

  function togglePw() {
    const willBeVisible = !pwVisible
    setPwVisible(willBeVisible)
    setPwHintShown(willBeVisible)
  }

  function toggleTermsPanel(kind) {
    setOpenPanel((prev) => (prev === kind ? null : kind))
  }

  function toggle(which) {
    if (which === 1) setChk1((v) => !v)
    if (which === 2) setChk2((v) => !v)
    if (which === 3) setChk3((v) => !v)
  }
  function toggleAll() {
    const will = !chkAll
    setChk1(will); setChk2(will); setChk3(will)
    if (will) setPulseAll(true)
  }
  function handleTermsKey(e, action) {
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); action() }
    else if (e.key === 'Enter') { e.preventDefault(); goStep(2) }
  }

  function openBirthModal() {
    const match = birthdate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    setBirthYear(match ? match[1] : '2007')
    setBirthMonth(match ? match[2] : today.month)
    setBirthDay(match ? match[3] : today.day)
    setBirthModalOpen(true)
  }
  function saveBirthModal() {
    setBirthdate(`${birthYear}-${birthMonth}-${birthDay}`)
    setBirthModalOpen(false)
  }

  function previewProfileImage(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setProfileImageUrl(reader.result)
    reader.readAsDataURL(file)
  }

  function playLogoEvent() {
    setLogoPop({ text: LOGO_MESSAGES[Math.floor(Math.random() * LOGO_MESSAGES.length)], key: Date.now() })
  }

  const pwChecks = getPasswordChecks(pw)
  let strengthCount = 0
  if (pw.length >= 8) strengthCount++
  if (pwChecks.comboOk) strengthCount++
  if (pw.length >= 12) strengthCount++
  if (/[^A-Za-z0-9]/.test(pw) && pwChecks.comboOk) strengthCount++
  const strengthClass = strengthCount <= 1 ? styles.onWeak : strengthCount <= 2 ? styles.onMid : styles.onStrong

  return (
    <div className={styles.signupPage}>
      <div className={styles.cardWrap}>
        <div className={styles.card}>
          <div className={styles.logoArea}>
            <div className={styles.logoIcon} onClick={playLogoEvent}>
              <img src="/legacy/assets/ai-style/clov_logo_half_leaf_cartoon_transparent.png" alt="Clov 로고" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
              {logoPop && (
                <span key={logoPop.key} className={styles.logoPop} onAnimationEnd={() => setLogoPop(null)}>
                  {logoPop.text}
                </span>
              )}
            </div>
            <div className={styles.logoText}>Clov.</div>
            <div className={styles.logoSub}>약속이 추억으로 자라는 친구 전용 기록공간</div>
          </div>

          <div className={styles.stepBar}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`${styles.stepDot} ${i < step ? styles.done : ''} ${i === step ? styles.active : ''}`} />
            ))}
          </div>

          {/* STEP 0 */}
          <div className={`${styles.stepView} ${step === 0 ? styles.active : ''}`}>
            <div className={styles.inputGrid}>
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
                    placeholder="example@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="8~20자, 영문/숫자/특수문자 중 2가지 이상"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    onKeyDown={(e) => enterNext(e, null, () => goStep(1))}
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
                <div className={styles.pwStrength}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`${styles.pwSeg} ${i < strengthCount ? strengthClass : ''}`} />
                  ))}
                </div>
                <div className={styles.pwRules}>
                  <span className={`${styles.pwRule} ${pwChecks.lengthOk ? styles.met : ''}`}>8~20자</span>
                  <span className={`${styles.pwRule} ${pwChecks.comboOk ? styles.met : ''}`}>영문/숫자/특수문자 중 2가지 이상</span>
                </div>
              </div>
            </div>
            <button className={styles.btnPrimary} style={{ marginTop: 18 }} onClick={() => goStep(1)}>다음 단계 →</button>
          </div>

          {/* STEP 1 */}
          <div className={`${styles.stepView} ${step === 1 ? styles.active : ''}`}>
            <div className={styles.formTitle}>거의 다 왔어요!</div>
            <div className={styles.formDesc}>아래 약관에 동의하시면<br />Clov. 여정이 시작됩니다.</div>
            <div className={styles.termsBox} ref={termsBoxRef}>
              <div
                className={`${styles.termsRow} ${styles.termsAll}`}
                tabIndex={0}
                role="checkbox"
                aria-checked={chkAll}
                onClick={toggleAll}
                onKeyDown={(e) => handleTermsKey(e, toggleAll)}
              >
                <div
                  className={`${styles.termsCheck} ${chkAll ? styles.checked : ''} ${pulseAll ? styles.pulse : ''}`}
                  onAnimationEnd={() => setPulseAll(false)}
                >
                  ✓
                  {pulseAll && <span className={styles.chkRipple} />}
                </div>
                <div className={styles.termsLabel}><strong>전체 동의</strong> (필수 + 선택 포함)</div>
              </div>
              <div className={styles.termsDivider} />
              <div className={styles.termsItem}>
                <div
                  className={styles.termsRow}
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={chk1}
                  onClick={() => toggle(1)}
                  onKeyDown={(e) => handleTermsKey(e, () => toggle(1))}
                >
                  <div className={`${styles.termsCheck} ${chk1 ? styles.checked : ''}`}>✓</div>
                  <div className={styles.termsLabel}><strong>[필수]</strong> 서비스 이용약관 동의</div>
                  <button
                    type="button"
                    className={`${styles.termsToggle} ${openPanel === 'service' ? styles.open : ''}`}
                    aria-expanded={openPanel === 'service'}
                    aria-label="서비스 이용약관 내용 보기"
                    onClick={(e) => { e.stopPropagation(); toggleTermsPanel('service') }}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                </div>
                <div className={`${styles.termsPanel} ${openPanel === 'service' ? styles.open : ''}`}>
                  <div className={styles.termsPanelInner}>{TERMS_CONTENT.service}</div>
                </div>
              </div>
              <div className={styles.termsItem}>
                <div
                  className={styles.termsRow}
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={chk2}
                  onClick={() => toggle(2)}
                  onKeyDown={(e) => handleTermsKey(e, () => toggle(2))}
                >
                  <div className={`${styles.termsCheck} ${chk2 ? styles.checked : ''}`}>✓</div>
                  <div className={styles.termsLabel}><strong>[필수]</strong> 개인정보 처리방침 동의</div>
                  <button
                    type="button"
                    className={`${styles.termsToggle} ${openPanel === 'privacy' ? styles.open : ''}`}
                    aria-expanded={openPanel === 'privacy'}
                    aria-label="개인정보 처리방침 내용 보기"
                    onClick={(e) => { e.stopPropagation(); toggleTermsPanel('privacy') }}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                </div>
                <div className={`${styles.termsPanel} ${openPanel === 'privacy' ? styles.open : ''}`}>
                  <div className={styles.termsPanelInner}>{TERMS_CONTENT.privacy}</div>
                </div>
              </div>
              <div
                className={styles.termsRow}
                tabIndex={0}
                role="checkbox"
                aria-checked={chk3}
                onClick={() => toggle(3)}
                onKeyDown={(e) => handleTermsKey(e, () => toggle(3))}
              >
                <div className={`${styles.termsCheck} ${chk3 ? styles.checked : ''}`}>✓</div>
                <div className={styles.termsLabel}><strong>[선택]</strong> 마케팅 정보 수신 동의</div>
              </div>
            </div>
            <button className={styles.btnPrimary} onClick={() => goStep(2)}>Clov. 시작하기</button>
            <button className={styles.btnSecondary} onClick={() => goStep(0)}>← 이전으로</button>
          </div>

          {/* STEP 2 */}
          <div className={`${styles.stepView} ${step === 2 ? styles.active : ''}`}>
            <div className={styles.profileSetup}>
              <div className={styles.profileTitle}>프로필은 무엇으로 하실건가요?</div>
              <div className={styles.profileDesc}>친구들이 알아볼 수 있는<br />사진을 골라주세요.</div>
              <div className={styles.profilePicker}>
                <div className={styles.profilePreview}>
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="프로필 미리보기" />
                  ) : (
                    <img src="/legacy/assets/ai-style/clov_logo_half_leaf_cartoon_transparent.png" alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                  )}
                </div>
                <label className={styles.profileUpload} aria-label="프로필 이미지 등록">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" /><circle cx="12" cy="13" r="3.5" /></svg>
                  <input type="file" accept="image/*" onChange={previewProfileImage} />
                </label>
              </div>
            </div>
            <button className={styles.btnPrimary} style={{ marginTop: 22 }} onClick={() => goStep(3)}>다음</button>
            <button className={styles.btnSecondary} onClick={() => goStep(1)}>← 이전으로</button>
          </div>

          {/* STEP 3 */}
          <div className={`${styles.stepView} ${step === 3 ? styles.active : ''}`}>
            <div className={styles.profileSetup}>
              <div className={styles.profileTitle}>닉네임과 생년월일을 알려주세요</div>
              <div className={styles.profileDesc}>친구들에게 보여질 이름과<br />생일(선택)을 정해주세요.</div>
              <div className={styles.profileFieldsBox} style={{ textAlign: 'left' }}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor="nickname">닉네임</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" /></svg>
                    </span>
                    <input
                      ref={nicknameRef}
                      type="text"
                      id="nickname"
                      placeholder="친구들이 부를 이름"
                      autoComplete="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      onKeyDown={(e) => enterNext(e, null, () => goStep(4))}
                    />
                  </div>
                </div>
                <div className={styles.inputGroup} style={{ marginTop: 14 }}>
                  <label className={styles.inputLabel} htmlFor="birthdate">생년월일 <span>선택</span></label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
                    </span>
                    <input type="text" id="birthdate" placeholder="YYYY-MM-DD" autoComplete="bday" readOnly value={birthdate} onClick={openBirthModal} />
                  </div>
                </div>
              </div>
            </div>
            <button className={styles.btnPrimary} style={{ marginTop: 22 }} onClick={() => goStep(4)}>프로필 저장하기 →</button>
            <button className={styles.btnSecondary} onClick={() => goStep(2)}>← 이전으로</button>
          </div>

          {/* STEP 4 */}
          <div className={`${styles.stepView} ${step === 4 ? styles.active : ''}`}>
            <div className={styles.successWrap}>
              <div className={styles.successIcon}>✓</div>
              <div className={styles.successTitle}>가입 완료!</div>
              <div className={styles.successSub}><span>{welcomeName}</span>님의 우정공간이 준비됐어요.<br />이제 친구를 초대하고 첫 약속을 만들어 볼까요? 🌱</div>
              <button className={styles.btnPrimary} onClick={() => navigate('/login')}>로그인하러 가기 →</button>
            </div>
          </div>

          {/* 소셜 */}
          {step === 0 && (
            <div>
              <div className={styles.divider}>또는</div>
              <div className={styles.socialRow}>
                <button className={styles.socialBtn} type="button" data-provider="kakao" data-label="카카오 로그인" aria-label="카카오 OAuth2 회원가입">
                  <span className={`${styles.socialLogo} ${styles.kakao}`} aria-hidden="true">
                    <svg viewBox="0 0 32 32" role="img"><path d="M16 7.2c-5.55 0-10.05 3.55-10.05 7.93 0 2.83 1.9 5.32 4.75 6.72l-.86 3.15c-.08.3.26.54.52.37l3.77-2.49c.6.09 1.22.14 1.87.14 5.55 0 10.05-3.55 10.05-7.93S21.55 7.2 16 7.2Z" fill="#191919" /></svg>
                  </span>
                </button>
                <button className={styles.socialBtn} type="button" data-provider="naver" data-label="네이버 로그인" aria-label="네이버 OAuth2 회원가입">
                  <span className={`${styles.socialLogo} ${styles.naver}`} aria-hidden="true">
                    <svg viewBox="0 0 32 32" role="img"><path d="M18.5 16.4 13.25 8.8H8.8v14.4h4.7v-7.6l5.25 7.6h4.45V8.8h-4.7v7.6Z" fill="#fff" /></svg>
                  </span>
                </button>
                <button className={styles.socialBtn} type="button" data-provider="google" data-label="구글 로그인" aria-label="구글 OAuth2 회원가입">
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
              <div className={styles.loginLink}>이미 계정이 있으신가요? <Link to="/login">로그인</Link></div>
            </div>
          )}
        </div>
      </div>

      {birthModalOpen && (
        <div className={`${styles.birthModal} ${styles.open}`} onClick={(e) => { if (e.target === e.currentTarget) setBirthModalOpen(false) }}>
          <div className={styles.birthModalBox}>
            <div className={styles.birthModalHead}>
              <button className={styles.birthModalClose} type="button" onClick={() => setBirthModalOpen(false)} aria-label="닫기">×</button>
            </div>
            <div className={styles.birthWheel}>
              <div>
                <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <span className={styles.birthWheelLabel}>년</span>
              </div>
              <div>
                <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}>
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <span className={styles.birthWheelLabel}>월</span>
              </div>
              <div>
                <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)}>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <span className={styles.birthWheelLabel}>일</span>
              </div>
            </div>
            <button className={styles.btnPrimary} type="button" style={{ marginTop: 18 }} onClick={saveBirthModal}>저장하기</button>
          </div>
        </div>
      )}

      {birthNudgeOpen && (
        <div className={`${styles.birthModal} ${styles.open}`} onClick={(e) => { if (e.target === e.currentTarget) setBirthNudgeOpen(false) }}>
          <div className={`${styles.birthModalBox} ${styles.nudgeModalBox}`}>
            <div className={styles.nudgeTitle}>잠깐!</div>
            <div className={styles.nudgeDesc}>생년월일을 입력하지 않았어요.<br />선택사항이지만 Clov.와 친구들의 축하를 받을 수 없게 돼요.</div>
            <button className={styles.btnPrimary} type="button" onClick={() => { setBirthNudgeOpen(false); openBirthModal() }}>지금 설정하기</button>
            <button className={styles.btnSecondary} type="button" onClick={() => { setBirthNudgeOpen(false); goStep(4, { skipBirthNudge: true }) }}>다음에 할게요</button>
          </div>
        </div>
      )}
    </div>
  )
}
