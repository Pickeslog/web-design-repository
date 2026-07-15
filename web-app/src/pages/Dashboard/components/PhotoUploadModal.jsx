// 2단계 전환 2호: 대표 사진 변경 모달(§3.2-②, 원본 #photo-upload-overlay).
// 이 모달은 인라인 onclick이 아니라 js/space.js의 initPhotoUploadModal()이
// document.getElementById(...)로 각 엘리먼트를 찾아 addEventListener로 직접
// 이벤트를 붙이는 방식이다(드래그앤드롭 포함). 그래서 이 컴포넌트에는 React
// 이벤트 핸들러가 하나도 없다 — id/class만 원본과 똑같이 유지하면 legacy 코드가
// 알아서 찾아서 붙는다. id를 바꾸면 initPhotoUploadModal() 내부의 모든 셀렉터가
// 조용히 null이 되어(에러 없이) 업로드 기능 전체가 먹통이 되므로 절대 바꾸지 말 것.
export default function PhotoUploadModal() {
  return (
    <div
      id="photo-upload-overlay"
      className="modal-overlay"
      style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 10000,
      }}
    >
      <div
        className="photo-upload-modal"
        style={{
          background: '#ffffff',
          width: 440,
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-color)' }}>대표 사진 변경</h3>

        <div
          id="photo-drop-zone"
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 8,
            padding: '32px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center',
            background: 'var(--bg-level2)',
          }}
        >
          <div style={{ color: 'var(--primary-green)', display: 'flex', justifyContent: 'center' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-color)' }}>
            새 이미지를 이 곳으로 드래그 하거나
            <br />
            <span style={{ color: 'var(--primary-green)', fontWeight: 'bold' }}>클릭하여 파일 선택</span>
          </div>
          <input type="file" id="photo-file-input" accept="image/*" style={{ display: 'none' }} />
        </div>

        <div id="photo-preview-container" style={{ display: 'none', position: 'relative', borderRadius: 8, overflow: 'hidden', maxHeight: 200 }}>
          <img
            id="photo-preview-image"
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            alt=""
          />
          <button
            id="photo-remove-btn"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: 24,
              height: 24,
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button className="btn-sub" id="photo-cancel-btn" style={{ padding: '8px 16px', fontSize: 13 }}>
            취소
          </button>
          <button className="btn-main" id="photo-save-btn" style={{ padding: '8px 16px', fontSize: 13 }}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
