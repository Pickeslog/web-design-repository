// 2단계 전환: 방 코드 공유 모달(#dt-invite-modal) + 방 변경 모달(#dt-group-modal).
// 원본에 인라인 style이 없다 — 기본 숨김/표시는 CSS의 .modal-overlay 클래스가 담당하고
// js/utils.js의 openInviteModal()/openGroupModal() 등이 style.display를 직접 토글한다.
// #dt-room-list는 방 변경 모달을 열 때 JS가 innerHTML로 채우는 빈 컨테이너라 그대로 비워둔다.
export function InviteModal() {
  return (
    <div className="modal-overlay" id="dt-invite-modal">
      <div className="modal-box room-share-modal">
        <h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-3px', marginRight: 5 }}>
            <circle cx="6" cy="12" r="2.3" />
            <circle cx="18" cy="6" r="2.3" />
            <circle cx="18" cy="18" r="2.3" />
            <path d="M8.1 10.8 15.9 7M8.1 13.2l7.8 3.6" />
          </svg>
          현재 방 코드 공유하기
        </h3>
        <p className="room-modal-copy">친구에게 코드나 링크를 보내면 이 방으로 바로 초대할 수 있어요.</p>
        <div className="room-share-current">
          <span id="dt-share-room-icon">🍀</span>
          <div>
            <strong id="dt-share-room-name">단짝친구</strong>
            <small id="dt-share-room-meta">현재 머무는 우정공간</small>
          </div>
        </div>
        <div className="room-share-field">
          <label htmlFor="dt-current-room-code">방 코드</label>
          <div className="room-copy-row">
            <input type="text" id="dt-current-room-code" readOnly />
            <button type="button" onClick={() => window.copyCurrentRoomCode()}>복사</button>
          </div>
        </div>
        <div className="room-share-field">
          <label htmlFor="dt-current-room-link">공유 링크</label>
          <div className="room-copy-row">
            <input type="text" id="dt-current-room-link" readOnly />
            <button type="button" onClick={() => window.copyCurrentRoomLink()}>복사</button>
          </div>
        </div>
        <div className="modal-buttons">
          <button className="btn-sub" onClick={() => window.closeModal('dt-invite-modal')}>닫기</button>
          <button className="btn-main" onClick={() => window.copyCurrentRoomLink()}>링크 복사</button>
        </div>
      </div>
    </div>
  )
}

export function GroupModal() {
  return (
    <div className="modal-overlay" id="dt-group-modal">
      <div className="modal-box room-switch-modal">
        <h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-3px', marginRight: 5 }}>
            <circle cx="8" cy="8" r="3" />
            <path d="M2 20c0-3 2.5-5 6-5s6 2 6 5" />
            <circle cx="17" cy="9" r="2.3" />
            <path d="M15.2 14.6c2.3.5 3.6 2 3.8 4.4" />
          </svg>
          방 변경하기
        </h3>
        <p className="room-modal-copy">내가 가지고 있는 우정공간 중 들어갈 방을 선택하세요.</p>
        <div className="room-list" id="dt-room-list" />
        <div className="modal-buttons" style={{ marginTop: 18 }}>
          <button className="btn-sub" style={{ width: '100%' }} onClick={() => window.closeModal('dt-group-modal')}>닫기</button>
        </div>
      </div>
    </div>
  )
}
