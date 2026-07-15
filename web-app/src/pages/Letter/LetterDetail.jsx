import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styles from './LetterDetail.module.css'

// 원본: test-web-design/05-letter/letter_detail.html 전체 JSX 이식.
// 원본처럼 letterIndex(라우트의 :letterId)는 groupsData[groupId].letters 배열의 인덱스다.
// saveLetter()의 window.location.reload()는 원본이 "isEditing 리셋 + 최신 데이터 재조회"를
// 위해 페이지 전체를 새로고침한 것인데, SPA에서는 그럴 필요 없이 로컬 상태만 갱신해도
// 같은 결과(수정 모드 종료 + 최신 텍스트 표시)가 나와서 상태 갱신으로 대체했다.
// goBack()의 하드 리다이렉트는 다른 화면들과 동일하게 navigate('/...')로 전환.
export default function LetterDetail() {
  const navigate = useNavigate()
  const { letterId } = useParams()
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('groupId') || 'friend'
  const letterIndex = parseInt(letterId, 10)

  const isDarkRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [groupsData, setGroupsData] = useState(null)
  const [letter, setLetter] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')

  function goBack() {
    navigate(`/?selectedGroup=${groupId}&theme=${isDarkRef.current ? 'dark' : 'light'}`)
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

    let data
    try {
      data = JSON.parse(localStorage.getItem('clov_groupsData'))
    } catch {
      data = null
    }
    if (!data || !data[groupId] || isNaN(letterIndex)) {
      window.alert('데이터를 찾을 수 없습니다.')
      goBack()
      return
    }
    const foundLetter = data[groupId].letters[letterIndex]
    if (!foundLetter) {
      window.alert('해당 편지를 찾을 수 없습니다.')
      goBack()
      return
    }

    setGroupsData(data)
    setLetter(foundLetter)
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleFavorite() {
    letter.favorite = !letter.favorite
    localStorage.setItem('clov_groupsData', JSON.stringify(groupsData))
    setLetter({ ...letter })
  }
  function editLetter() {
    setEditText(letter.text)
    setIsEditing(true)
  }
  function cancelEdit() {
    setIsEditing(false)
  }
  function saveLetter() {
    const newText = editText.trim()
    if (newText === '') {
      window.alert('내용을 입력해주세요.')
      return
    }
    letter.text = newText
    localStorage.setItem('clov_groupsData', JSON.stringify(groupsData))
    setLetter({ ...letter })
    setIsEditing(false)
  }
  function deleteLetter() {
    if (!window.confirm('정말 이 행운 편지를 삭제하시겠습니까?')) return
    groupsData[groupId].letters.splice(letterIndex, 1)
    localStorage.setItem('clov_groupsData', JSON.stringify(groupsData))
    goBack()
  }

  if (!ready) return null

  return (
    <div className={styles.letterDetailPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -3, marginRight: 5 }}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            편지 읽기
          </h1>
          <button className={styles.backBtn} onClick={goBack}>✕ 닫기</button>
        </div>

        <div className={styles.letterContent}>
          <div className={styles.letterFrom}>From. {letter.from}</div>
          {isEditing ? (
            <textarea className={styles.editTextarea} value={editText} onChange={(e) => setEditText(e.target.value)} />
          ) : (
            <div className={styles.letterText}>{letter.text}</div>
          )}
        </div>

        <div className={styles.actions}>
          {isEditing ? (
            <>
              <button className={`${styles.btnActionSm} ${styles.btnSave}`} onClick={saveLetter}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -1, marginRight: 3 }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>
                저장
              </button>
              <button className={`${styles.btnActionSm} ${styles.btnDelete}`} onClick={cancelEdit}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -1, marginRight: 3 }}><path d="M18 6 6 18M6 6l12 12" /></svg>
                취소
              </button>
            </>
          ) : (
            <>
              <button className={`${styles.btnActionSm} ${styles.btnFavorite} ${letter.favorite ? styles.active : ''}`} onClick={toggleFavorite}>⭐ 즐겨찾기</button>
              {letter.isMine && (
                <>
                  <button className={styles.btnActionSm} onClick={editLetter}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -1, marginRight: 3 }}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
                    수정
                  </button>
                  <button className={`${styles.btnActionSm} ${styles.btnDelete}`} onClick={deleteLetter}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -1, marginRight: 3 }}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
                    삭제
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
