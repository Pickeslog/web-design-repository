import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './ProfileEdit.module.css'

const EMOJIS = ['🌿', '🍀', '🌸', '🌙', '⭐', '🔥', '🎵', '📷', '🐾', '💫']

// 원본: test-web-design/08-profile/profile_edit.html 전체 JSX 이식.
// 계정 탈퇴의 window.location.href='../01-auth/login.html' 하드 리다이렉트 →
// navigate('/login')(SPA 이동). 그 외 미리보기/이모지 선택/아바타 업로드/비밀번호 토글·
// 일치확인/토스트/저장 유효성 검사는 원본과 동일하게 이식했다.
export default function ProfileEdit() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDarkRef = useRef(false)

  const [name, setName] = useState('김예린')
  const [status, setStatus] = useState('✨ 추억을 쌓는 중')
  const [email, setEmail] = useState('')
  const [birth, setBirth] = useState('')
  const [emoji, setEmoji] = useState('🌿')
  const [avatarBase64, setAvatarBase64] = useState('')

  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwVisible, setPwVisible] = useState({ current: false, new: false, confirm: false })

  const [toast, setToast] = useState({ show: false, msg: '', error: false })
  const toastTimer = useRef(null)

  function goBack() {
    navigate(`/?theme=${isDarkRef.current ? 'dark' : 'light'}`)
  }

  useEffect(() => {
    const themeParam = searchParams.get('theme')
    let dark
    if (themeParam === 'dark') dark = true
    else if (themeParam === 'light') dark = false
    else dark = localStorage.getItem('clov_darkMode') === 'true'
    isDarkRef.current = dark
    document.documentElement.classList.toggle('dark-mode', dark)
    document.body.classList.toggle('dark-mode', dark)

    let profileData = {}
    try {
      profileData = JSON.parse(localStorage.getItem('clov_profile')) || {}
    } catch {
      profileData = {}
    }
    setName(profileData.name || '김예린')
    setStatus(profileData.status || '✨ 추억을 쌓는 중')
    setEmail(profileData.email || '')
    setBirth(profileData.birth || '')
    setEmoji(profileData.emoji || '🌿')
    setAvatarBase64(profileData.avatarBase64 || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function showToast(msg, isError = false) {
    clearTimeout(toastTimer.current)
    setToast({ show: true, msg, error: isError })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2200)
  }

  function triggerAvatarUpload() {
    document.getElementById('avatar-file-input').click()
  }
  function handleAvatarUpload(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarBase64(ev.target.result)
    reader.readAsDataURL(file)
  }

  function togglePw(field) {
    setPwVisible((v) => ({ ...v, [field]: !v[field] }))
  }

  const pwMatchHint = !pwConfirm ? null : pwNew === pwConfirm
    ? { text: '비밀번호가 일치합니다', ok: true }
    : { text: '비밀번호가 일치하지 않습니다', ok: false }

  function saveProfile() {
    const trimmedName = name.trim()
    if (!trimmedName) { showToast('⚠️ 이름은 필수 항목입니다', true); return }

    if (pwNew || pwConfirm) {
      if (!pwCurrent) { showToast('⚠️ 현재 비밀번호를 입력해 주세요', true); return }
      if (pwNew.length < 8) { showToast('⚠️ 새 비밀번호는 8자 이상이어야 합니다', true); return }
      if (pwNew !== pwConfirm) { showToast('⚠️ 비밀번호가 일치하지 않습니다', true); return }
    }

    const profileData = { name: trimmedName, status: status.trim(), email: email.trim(), birth, emoji, avatarBase64 }
    localStorage.setItem('clov_profile', JSON.stringify(profileData))

    setPwCurrent('')
    setPwNew('')
    setPwConfirm('')

    showToast('✅ 개인정보가 저장되었습니다!')
    setTimeout(() => goBack(), 1200)
  }

  function confirmDeleteAccount() {
    if (window.confirm('⚠️ 정말로 계정을 탈퇴하시겠습니까?\n\n모든 추억 기록과 편지가 영구 삭제되며 되돌릴 수 없습니다.')) {
      localStorage.clear()
      showToast('계정이 삭제되었습니다. 잠시 후 이동합니다...')
      setTimeout(() => navigate('/login'), 1500)
    }
  }

  return (
    <div className={styles.profileEditPage}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <button className={styles.backBtn} onClick={goBack} title="뒤로가기">←</button>
          <span className={styles.emoji}>🌿</span>
          <h1>개인정보 수정</h1>
        </div>

        <div className={styles.card}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatarCircle} onClick={triggerAvatarUpload}>
                {avatarBase64 ? <img src={avatarBase64} alt="프로필 사진" /> : <span>김</span>}
              </div>
              <div className={styles.avatarEditBadge} onClick={triggerAvatarUpload}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
              </div>
            </div>
            <div className={styles.avatarName}>{name || '이름'}</div>
            <div className={styles.avatarStatus}>{status || '상태 메시지'}</div>
            <input type="file" id="avatar-file-input" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          </div>

          <div className={styles.divider} />

          <div className={`${styles.cardTitle} ${styles.sectionGap}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 4 }}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" /></svg>
            기본 정보
          </div>
          <div className={styles.formRow}>
            <label htmlFor="input-name">이름 / 닉네임</label>
            <input type="text" id="input-name" placeholder="예: 김예린" maxLength={16} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="input-status">상태 메시지</label>
            <input type="text" id="input-status" placeholder="예: ✨ 추억을 쌓는 중" maxLength={40} value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
          <div className={styles.formRow}>
            <label>프로필 아이콘 (이모지)</label>
            <div className={styles.emojiPickerRow}>
              {EMOJIS.map((e) => (
                <div key={e} className={`${styles.emojiChip} ${emoji === e ? styles.selected : ''}`} onClick={() => setEmoji(e)}>{e}</div>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          <div className={`${styles.cardTitle} ${styles.sectionGap}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 4 }}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            연락처
          </div>
          <div className={styles.formRow}>
            <label htmlFor="input-email">이메일</label>
            <input type="email" id="input-email" placeholder="예: clov@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="input-birth">생년월일</label>
            <input type="date" id="input-birth" value={birth} onChange={(e) => setBirth(e.target.value)} />
          </div>

          <div className={styles.divider} />

          <div className={`${styles.cardTitle} ${styles.sectionGap}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 4 }}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            비밀번호 변경
          </div>
          <div className={styles.formRow}>
            <label htmlFor="input-pw-current">현재 비밀번호</label>
            <div className={styles.inputIconWrap}>
              <input type={pwVisible.current ? 'text' : 'password'} id="input-pw-current" placeholder="현재 비밀번호 입력" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} />
              <button className={`${styles.togglePwBtn} ${pwVisible.current ? styles.isVisible : ''}`} type="button" onClick={() => togglePw('current')}>
                <svg className={styles.eye} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                <svg className={styles.eyeOff} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></svg>
              </button>
            </div>
          </div>
          <div className={styles.formRow}>
            <label htmlFor="input-pw-new">새 비밀번호</label>
            <div className={styles.inputIconWrap}>
              <input type={pwVisible.new ? 'text' : 'password'} id="input-pw-new" placeholder="8자 이상, 영문+숫자 조합" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
              <button className={`${styles.togglePwBtn} ${pwVisible.new ? styles.isVisible : ''}`} type="button" onClick={() => togglePw('new')}>
                <svg className={styles.eye} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                <svg className={styles.eyeOff} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></svg>
              </button>
            </div>
          </div>
          <div className={styles.formRow}>
            <label htmlFor="input-pw-confirm">새 비밀번호 확인</label>
            <div className={styles.inputIconWrap}>
              <input type={pwVisible.confirm ? 'text' : 'password'} id="input-pw-confirm" placeholder="동일하게 입력" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
              <button className={`${styles.togglePwBtn} ${pwVisible.confirm ? styles.isVisible : ''}`} type="button" onClick={() => togglePw('confirm')}>
                <svg className={styles.eye} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                <svg className={styles.eyeOff} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></svg>
              </button>
            </div>
            {pwMatchHint && (
              <span className={styles.hintText} style={{ color: pwMatchHint.ok ? 'var(--accent-green)' : 'var(--danger)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -1, marginRight: 3 }}>
                  {pwMatchHint.ok ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
                </svg>
                {pwMatchHint.text}
              </span>
            )}
          </div>

          <div className={styles.divider} />
          <button className={styles.btnSave} onClick={saveProfile}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 3 }}><path d="M20 6 9 17l-5-5" /></svg>
            변경사항 저장
          </button>
        </div>

        <div className={styles.card} style={{ marginTop: 16 }}>
          <div className={styles.cardTitle}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 4 }}><path d="M12 9v4M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 17h.01" /></svg>
            계정 관리
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>계정을 탈퇴하면 모든 추억 기록과 편지가 영구적으로 삭제됩니다.</p>
          <button className={styles.btnDanger} onClick={confirmDeleteAccount}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 3 }}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
            계정 탈퇴
          </button>
        </div>
      </div>

      <div className={`${styles.toast} ${toast.show ? styles.show : ''}`} style={{ background: toast.error ? 'var(--danger)' : 'var(--primary-green)' }}>
        {toast.msg}
      </div>
    </div>
  )
}
