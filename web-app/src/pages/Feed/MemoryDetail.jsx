import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styles from './MemoryDetail.module.css'

// 원본: test-web-design/04-feed/memory_detail.html 전체 JSX 이식.
// 원본은 postId를 groupsData[groupId].posts 배열의 "인덱스"로 그대로 쓴다(id 기반이 아님) —
// 그 특이한 데이터 모델을 그대로 보존했다. 라우트의 :memoryId를 postId로 쓰고,
// groupId/participantId는 원본처럼 쿼리스트링으로 받는다(예: /feed/2?groupId=friend).
// editPost()가 이동하던 write_post.html은 원본 저장소에도 실제로 존재하지 않는 화면이라
// (04-feed 폴더에 feed.html/memory_detail.html 둘뿐) 원본 자체의 미완성 링크 — 포팅 대상이
// 아니므로 그대로 죽은 링크로 남겨뒀다(고치라는 요청이 오면 그때 대응).
// goBack()의 ../02-main/index.html?selectedGroup=...&theme=... 하드 리다이렉트 →
// navigate('/?selectedGroup=...')(SPA 이동, Dashboard는 아직 이 쿼리를 읽지 않지만
// URL 형태는 유지).
export default function MemoryDetail() {
  const navigate = useNavigate()
  const { memoryId } = useParams()
  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('groupId') || 'friend'
  const participantId = searchParams.get('participantId')
  const postId = parseInt(memoryId, 10)

  const isDarkRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [groupsData, setGroupsData] = useState(null)
  const [post, setPost] = useState(null)
  const [participant, setParticipant] = useState(null)
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
    if (!data || !data[groupId] || isNaN(postId)) {
      window.alert('데이터를 찾을 수 없습니다.')
      goBack()
      return
    }
    const currentGroup = data[groupId]
    const foundPost = currentGroup.posts[postId]
    if (!foundPost) {
      window.alert('해당 추억을 찾을 수 없습니다.')
      goBack()
      return
    }

    let participants = foundPost.participants || []
    if (participants.length === 0) {
      participants = [{ name: '나', icon: '나', text: foundPost.text || '', type: 'mine', id: 'p_mine' }]
    }
    const foundParticipant = participants.find((p) => p.id === participantId) || participants[0]

    setGroupsData(data)
    setPost(foundPost)
    setParticipant(foundParticipant)
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function editComment() {
    setEditText(participant.fullText || participant.text || post.text || '')
    setIsEditing(true)
  }
  function cancelEdit() {
    setIsEditing(false)
  }
  function saveComment() {
    const newText = editText.trim()
    if (newText !== '') {
      participant.text = newText
      participant.fullText = newText
      localStorage.setItem('clov_groupsData', JSON.stringify(groupsData))
      setParticipant({ ...participant })
    }
    setIsEditing(false)
  }
  function editPost() {
    navigate(`/feed/write_post?action=edit&groupId=${groupId}&postId=${postId}`)
  }
  function deleteComment() {
    if (!window.confirm('정말로 이 코멘트를 삭제하시겠습니까?')) return
    if (post.participants) {
      const index = post.participants.findIndex((p) => p.id === participant.id || p.name === participant.name)
      if (index !== -1) post.participants.splice(index, 1)
    }
    if (!post.participants || post.participants.length === 0) {
      groupsData[groupId].posts.splice(postId, 1)
    }
    localStorage.setItem('clov_groupsData', JSON.stringify(groupsData))
    window.alert('코멘트가 삭제되었습니다.')
    goBack()
  }

  if (!ready) return null

  const isMine = participant.type === 'mine' || participant.name === '나'
  const textContent = participant.fullText || participant.text || post.text || '아직 남겨진 기록이 없습니다.'
  const tags = post.tags && post.tags.length ? post.tags : ['내가 보는 장면']

  return (
    <div className={styles.memoryDetailPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>{isMine ? '내 기록' : `${participant.name}의 기록`}</h1>
          <button className={styles.backBtn} onClick={goBack}>✕ 닫기</button>
        </div>

        <div className={styles.detailMeta}>{[post.date, post.subtitle].filter(Boolean).join(' · ')}</div>
        <div className={styles.detailTitle}>{post.title || '추억 기록'}</div>

        {isEditing ? (
          <textarea
            className={styles.editTextarea}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
        ) : (
          <div className={styles.detailBody}>{textContent}</div>
        )}

        <div className={styles.tags}>
          {tags.map((tag, i) => <span key={i} className={styles.tag}>{tag}</span>)}
        </div>

        <div className={styles.actions}>
          {isEditing ? (
            <>
              <button className={`${styles.btnActionSm} ${styles.btnSave}`} onClick={saveComment}>💾 저장</button>
              <button className={`${styles.btnActionSm} ${styles.btnDelete}`} onClick={cancelEdit}>❌ 취소</button>
            </>
          ) : (
            isMine && (
              <>
                <button className={styles.btnActionSm} onClick={editComment}>코멘트 수정</button>
                <button className={`${styles.btnActionSm} ${styles.btnDelete}`} onClick={deleteComment}>코멘트 삭제</button>
                <button className={`${styles.btnActionSm} ${styles.btnEditPost}`} onClick={editPost}>추억 전체 수정</button>
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}
