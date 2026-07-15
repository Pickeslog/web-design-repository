import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './Notification.module.css'

// 원본: test-web-design/07-notification/notification.html 전체 JSX 이식.
// 관리진 공지/친구들 알림/가입 신청 3탭 구조를 그대로 옮겼다. 원본은 각 탭 내용을
// innerHTML 문자열로 그렸지만 여기서는 JSX로 직접 렌더링한다(인라인 style 값은 원본 그대로
// 유지). document.addEventListener('DOMContentLoaded', ...)로 초기 탭을 정하던 부분은
// SPA에서 그 이벤트가 다시 안 뜨므로 useEffect에서 동일 로직을 직접 실행한다.
export default function Notification() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isDarkRef = useRef(false)
  const groupId = searchParams.get('groupId') || localStorage.getItem('clov_activeGroup') || 'friend'

  const [activeTab, setActiveTab] = useState('admin')
  const [friendNotis, setFriendNotis] = useState([])
  const [joinRequests, setJoinRequests] = useState([])

  function goBack() {
    navigate(`/?selectedGroup=${groupId}&theme=${isDarkRef.current ? 'dark' : 'light'}`)
  }

  function readJoinRequests() {
    try {
      return JSON.parse(localStorage.getItem('clov_joinRequests')) || []
    } catch {
      return []
    }
  }

  function refreshFriendNotis(markRead) {
    let groupsData = {}
    try {
      groupsData = JSON.parse(localStorage.getItem('clov_groupsData')) || {}
    } catch {
      groupsData = {}
    }
    const notiList = (groupsData[groupId] && groupsData[groupId].notifications) || []
    if (markRead) {
      let changed = false
      notiList.forEach((n) => {
        if (!n.isRead) { n.isRead = true; changed = true }
      })
      if (changed) localStorage.setItem('clov_groupsData', JSON.stringify(groupsData))
    }
    setFriendNotis([...notiList])
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

    const list = readJoinRequests()
    setJoinRequests(list)
    const pending = list.filter((r) => r.status === 'pending').length
    const initialTab = searchParams.get('tab')
    if (initialTab === 'join' || pending > 0) {
      setActiveTab('join')
    } else {
      setActiveTab('admin')
      refreshFriendNotis(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function switchTab(tab) {
    setActiveTab(tab)
    if (tab === 'friends') refreshFriendNotis(true)
    if (tab === 'join') setJoinRequests(readJoinRequests())
  }

  function acceptRequest(id, name) {
    const list = readJoinRequests()
    list.forEach((r) => { if (r.id === id) r.status = 'accepted' })
    localStorage.setItem('clov_joinRequests', JSON.stringify(list))

    let members = []
    try { members = JSON.parse(localStorage.getItem('clov_acceptedMembers')) || [] } catch { members = [] }
    if (members.indexOf(name) === -1) {
      members.push(name)
      localStorage.setItem('clov_acceptedMembers', JSON.stringify(members))
    }

    setJoinRequests(list)
    if (typeof window.clovAlert === 'function') {
      window.clovAlert(`🎉 [${name}] 님의 가입 신청을 수락했습니다!\n이제 참여 멤버로 우정공간에 접속하여 함께 활동할 수 있습니다.\n(방장이 없으므로 참여 멤버 누구나 수락 권한을 가집니다)`, { icon: '🤝', type: 'success' })
    } else {
      window.alert(`[${name}] 님의 가입 신청을 수락했습니다.`)
    }
  }

  function rejectRequest(id, name) {
    const list = readJoinRequests()
    list.forEach((r) => { if (r.id === id) r.status = 'rejected' })
    localStorage.setItem('clov_joinRequests', JSON.stringify(list))
    setJoinRequests(list)
    if (typeof window.clovAlert === 'function') {
      window.clovAlert(`❌ [${name}] 님의 가입 신청을 거절했습니다.`, { icon: '🚫', type: 'warn' })
    } else {
      window.alert(`[${name}] 님의 가입 신청을 거절했습니다.`)
    }
  }

  const pendingCount = joinRequests.filter((r) => r.status === 'pending').length

  return (
    <div className={styles.notificationPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
            알림
          </h1>
          <button className={styles.backBtn} onClick={goBack}>✕ 닫기</button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button className={`${styles.tabBtn} ${activeTab === 'admin' ? styles.active : ''}`} onClick={() => switchTab('admin')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 3 }}><path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6l-4 4H4a1 1 0 0 0-1 1z" /><path d="M15 8a4 4 0 0 1 0 8M18 5a8 8 0 0 1 0 14" /></svg>
            관리진 공지
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'friends' ? styles.active : ''}`} onClick={() => switchTab('friends')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 3 }}><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
            친구들 알림
          </button>
          <button className={`${styles.tabBtn} ${activeTab === 'join' ? styles.active : ''}`} onClick={() => switchTab('join')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 3 }}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.2 2.8-5.5 6.5-5.5s6.5 2.3 6.5 5.5" /><path d="M18 9v5M20.5 11.5h-5" /></svg>
            가입 신청
            {pendingCount > 0 && (
              <span style={{ background: '#e55', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, marginLeft: 4 }}>{pendingCount}</span>
            )}
          </button>
        </div>

        {activeTab === 'admin' && (
          <div>
            <div style={{ background: 'rgba(82, 183, 136, 0.1)', borderLeft: '4px solid var(--primary-green)', padding: 16, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontWeight: 'bold', color: 'var(--primary-green)', marginBottom: 6 }}>[업데이트] ➕ 새로운 방 추가 기능이 적용되었습니다!</div>
              <div style={{ fontSize: 13, color: 'var(--text-color)', lineHeight: 1.5 }}>이제 번거로운 친구 초대코드 대신 <b>'새로운 방 추가'</b> 기능을 통해 코드를 적고 간편하게 방에 접속할 수 있습니다. 메인 화면의 프로필 메뉴를 확인해 보세요!</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>2026. 06. 30</div>
            </div>
            <div style={{ background: 'rgba(82, 183, 136, 0.1)', borderLeft: '4px solid var(--primary-green)', padding: 16, borderRadius: 8 }}>
              <div style={{ fontWeight: 'bold', color: 'var(--primary-green)', marginBottom: 6 }}>[공지] Clov v2.0 정식 오픈 안내 🎉</div>
              <div style={{ fontSize: 13, color: 'var(--text-color)', lineHeight: 1.5 }}>일대일 단짝 연동 기능과 다크 모드 동기화 기능이 대폭 개선되었습니다. 더욱 안정적인 환경에서 소중한 추억을 기록해 보세요.</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>2026. 06. 29</div>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            {(() => {
              const pendingReqs = joinRequests.filter((r) => r.status === 'pending')
              if (friendNotis.length === 0 && pendingReqs.length === 0) {
                return (
                  <div className={styles.emptyState}>
                    <div className="icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5 12 14l9-5.5" /><rect x="3" y="5" width="18" height="14" rx="2" /></svg></div>
                    <p>새로운 친구 알림이 없습니다.</p>
                  </div>
                )
              }
              return (
                <>
                  {pendingReqs.length > 0 && (
                    <div style={{ background: 'rgba(238, 85, 85, 0.1)', border: '1.5px solid #e55', padding: 16, borderRadius: 8, textAlign: 'left', marginBottom: 14, cursor: 'pointer' }} onClick={() => switchTab('join')}>
                      <div style={{ fontWeight: 'bold', color: '#e55', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 3 }}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.2 2.8-5.5 6.5-5.5s6.5 2.3 6.5 5.5" /><path d="M18 9v5M20.5 11.5h-5" /></svg>
                          대기 중인 가입 신청이 {pendingReqs.length}건 있습니다!
                        </span>
                        <span style={{ background: '#e55', color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>클릭하여 확인</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-color)' }}>참여 멤버 중 1명이 수락하면 새 멤버가 우정공간에 입장합니다.</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {friendNotis.map((n, i) => (
                      <div key={i} style={{ background: n.isRead ? 'transparent' : 'rgba(82, 183, 136, 0.1)', border: n.isRead ? '1px solid var(--border-color)' : '1px solid var(--primary-green)', padding: 16, borderRadius: 8, textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-color)', marginBottom: 6 }}>
                          {n.title}
                          {!n.isRead && <span style={{ color: 'red', fontSize: 10, verticalAlign: 'top', fontWeight: 'bold' }}> NEW</span>}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.date}</div>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {activeTab === 'join' && (
          <div>
            {joinRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <div className="icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5 12 14l9-5.5" /><rect x="3" y="5" width="18" height="14" rx="2" /></svg></div>
                <p>대기 중인 가입 신청이 없습니다.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {joinRequests.map((req) => {
                  if (req.status === 'accepted') {
                    return (
                      <div key={req.id} style={{ border: '1px solid var(--border-color)', background: 'var(--card-bg)', opacity: 0.85, padding: 16, borderRadius: 10, textAlign: 'left' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -1, marginRight: 3 }}><path d="M20 6 9 17l-5-5" /></svg>
                            가입 수락 완료
                          </span>
                          <span style={{ fontSize: 11 }}>{req.date}</span>
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-color)', marginTop: 8 }}><b>{req.name}</b> 님이 참여 멤버로 합류했습니다.</div>
                      </div>
                    )
                  }
                  if (req.status === 'rejected') {
                    return (
                      <div key={req.id} style={{ border: '1px solid var(--border-color)', background: 'var(--card-bg)', opacity: 0.6, padding: 16, borderRadius: 10, textAlign: 'left' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -1, marginRight: 3 }}><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6M9 9l6 6" /></svg>
                            가입 거절됨
                          </span>
                          <span style={{ fontSize: 11 }}>{req.date}</span>
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}><b>{req.name}</b> 님의 가입 신청이 거절되었습니다.</div>
                      </div>
                    )
                  }
                  return (
                    <div key={req.id} style={{ border: '1.5px solid var(--primary-green)', background: 'rgba(82,183,136,.08)', padding: 18, borderRadius: 12, textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-green)', display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 3 }}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.2 2.8-5.5 6.5-5.5s6.5 2.3 6.5 5.5" /><path d="M18 9v5M20.5 11.5h-5" /></svg>
                          우정공간 가입 신청 <span style={{ background: '#e55', color: '#fff', padding: '2px 6px', borderRadius: 10, fontSize: 10 }}>NEW</span>
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 'normal' }}>{req.date}</span>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-color)', margin: '10px 0 14px', lineHeight: 1.5 }}>
                        <strong style={{ fontSize: 16 }}>{req.name}</strong> 님이 우정공간(<strong>{req.code}</strong>) 입장을 신청했습니다.<br />
                        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(27,67,50,.06)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -1, marginRight: 2 }}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg> <strong>방장 권한 없음:</strong> 참여 멤버 중 1명만 수락해도 즉시 방에 입장할 수 있습니다.
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => acceptRequest(req.id, req.name)} style={{ flex: 1, padding: 12, background: 'var(--primary-green)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 750, cursor: 'pointer', fontSize: 14, boxShadow: '0 3px 10px rgba(27,67,50,.25)' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2, marginRight: 3 }}><path d="M20 6 9 17l-5-5" /></svg>
                          수락하고 입장시키기
                        </button>
                        <button onClick={() => rejectRequest(req.id, req.name)} style={{ padding: '12px 18px', background: 'var(--card-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>거절</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
