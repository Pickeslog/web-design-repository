// 2단계 전환 1호: 참여 멤버 상태메시지 모달(§3.2-⑤, 원본 index.html #member-list-overlay).
// 마크업/문구/스타일은 원본과 동일 — class→className, style 문자열→객체, onclick→onClick만
// JSX 문법에 맞게 옮겼다.
//
// 중요: 이 모달은 아직 React state로 열림/닫힘을 관리하지 않는다. 원본처럼
// js/space.js의 openMemberListModal()/closeMemberListModal()이 지금도
// document.getElementById('member-list-overlay')로 이 엘리먼트를 직접 찾아
// style.display를 토글하는 방식 그대로다(트리거 버튼은 아직 legacy 마크업 쪽에
// onclick="openMemberListModal()"으로 남아있음). id/class를 하나라도 바꾸면
// space.js 쪽 셀렉터가 못 찾게 되므로 그대로 유지할 것 — 이 부분을 진짜 React
// state(useState)로 옮기는 건 space.js의 나머지 함수들(대표 사진, XP, 일정 배너 등)도
// 같이 이식된 뒤에 하는 게 안전하다.
//
// 알려진 기존 버그(내가 만든 게 아니라 원본에 이미 있던 것 — 명세서에 없어서 여기 남김):
// "가입 신청 테스트"/"멤버 퇴장 테스트" 버튼은 simulateJoinRequest()/simulateMemberLeave()를
// 호출하는데, 이 두 함수는 body-fragment 하단의 큰 인라인 <script>(글쓰기 모달 IIFE)
// 안에 정의돼 있다. 그 스크립트가 이 컴포넌트보다 먼저 로드되므로 지금은 정상 동작하지만,
// 나중에 그 인라인 스크립트를 JSX/모듈로 옮길 때 이 함수들도 같이 옮겨야 안 깨진다.
export default function MemberListModal() {
  return (
    <div
      id="member-list-overlay"
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
      onClick={(e) => {
        if (e.target === e.currentTarget) window.closeMemberListModal()
      }}
    >
      <div
        className="member-list-modal"
        style={{
          background: '#ffffff',
          width: 500,
          height: 800,
          maxHeight: '95vh',
          borderRadius: 20,
          padding: 28,
          boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h3
              id="member-list-modal-title"
              style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-color)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-3px', marginRight: 5 }}>
                <circle cx="8" cy="8" r="3" />
                <path d="M2 20c0-3 2.5-5 6-5s6 2 6 5" />
                <circle cx="17" cy="9" r="2.3" />
                <path d="M15.2 14.6c2.3.5 3.6 2 3.8 4.4" />
              </svg>
              참여 멤버 상태메시지 (4명)
            </h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-1px', marginRight: 3 }}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              내 상태메시지를 클릭하면 수정할 수 있습니다. (다른 멤버는 읽기 전용)
            </div>
          </div>
          <button
            onClick={() => window.closeMemberListModal()}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', padding: 4 }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {/* 내 프로필 (수정 가능 상태메시지) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'rgba(248, 251, 249, 0.95)',
              borderRadius: 16,
              border: '1.5px solid rgba(27, 67, 50, 0.2)',
              boxShadow: '0 4px 12px rgba(27, 67, 50, 0.05)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--primary-green)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                  boxShadow: '0 2px 8px rgba(27, 67, 50, 0.25)',
                }}
              >
                나
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-color)' }}>나</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(27, 67, 50, 0.1)',
                padding: '8px 14px',
                borderRadius: 20,
                border: '1px solid rgba(27, 67, 50, 0.25)',
                maxWidth: 270,
                transition: 'all 0.2s',
              }}
            >
              <span
                contentEditable="true"
                suppressContentEditableWarning
                id="my-status-msg"
                onBlur={(e) => window.saveMyStatusMsg(e.currentTarget.innerText)}
                onKeyDown={(e) => {
                  if (e.keyCode === 13) {
                    e.preventDefault()
                    e.currentTarget.blur()
                  }
                }}
                style={{ fontSize: 13, color: 'var(--primary-green)', fontWeight: 700, outline: 'none', cursor: 'text' }}
                title="클릭하여 내 상태메시지 수정"
              >
                ✨ 행복한 하루 보내자!
              </span>
              <span
                onClick={() => document.getElementById('my-status-msg')?.focus()}
                style={{ fontSize: 12, cursor: 'pointer', color: 'var(--primary-green)', opacity: 0.85 }}
                title="내 상태메시지 수정"
              >
                ✎
              </span>
            </div>
          </div>

          {/* 솔 (읽기 전용 상태메시지) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'rgba(248, 251, 249, 0.6)',
              borderRadius: 16,
              border: '1px solid rgba(0, 0, 0, 0.06)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#52b788',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                솔
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-color)' }}>솔</span>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.04)', padding: '8px 14px', borderRadius: 20, border: '1px solid rgba(0, 0, 0, 0.06)', maxWidth: 270 }}>
              <span style={{ fontSize: 13, color: '#444', fontWeight: 600 }}>다음 여행 사진 예쁘게 찍어줄게 📸</span>
            </div>
          </div>

          {/* 민 (읽기 전용 상태메시지) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'rgba(248, 251, 249, 0.6)',
              borderRadius: 16,
              border: '1px solid rgba(0, 0, 0, 0.06)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#74c69d',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                민
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-color)' }}>민</span>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.04)', padding: '8px 14px', borderRadius: 20, border: '1px solid rgba(0, 0, 0, 0.06)', maxWidth: 270 }}>
              <span style={{ fontSize: 13, color: '#444', fontWeight: 600 }}>오늘 밤 야식 멤버 구함 🎉</span>
            </div>
          </div>

          {/* 준 (읽기 전용 상태메시지) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'rgba(248, 251, 249, 0.6)',
              borderRadius: 16,
              border: '1px solid rgba(0, 0, 0, 0.06)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#95d5b2',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                준
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-color)' }}>준</span>
            </div>
            <div style={{ background: 'rgba(0, 0, 0, 0.04)', padding: '8px 14px', borderRadius: 20, border: '1px solid rgba(0, 0, 0, 0.06)', maxWidth: 270 }}>
              <span style={{ fontSize: 13, color: '#444', fontWeight: 600 }}>이번 주말 약속 시간 꼭 지키기 📅</span>
            </div>
          </div>

          {/* 동적 참여 멤버 추가 영역 — js/utils.js·body-fragment의 updateDynamicMembersDisplay()가
              가입 신청 수락 시 이 안에 innerHTML로 카드를 직접 추가한다. React는 이 컨테이너의
              children을 건드리지 않으므로(재렌더링 없음) legacy 코드가 그대로 관리 가능. */}
          <div id="dynamic-members-container" style={{ display: 'flex', flexDirection: 'column', gap: 12 }} />
        </div>

        {/* 우정공간 초대 코드 영역 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'rgba(27, 67, 50, 0.08)',
            borderRadius: 14,
            border: '1px dashed var(--primary-green)',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-1px', marginRight: 3 }}>
                <circle cx="6" cy="12" r="2.3" />
                <circle cx="18" cy="6" r="2.3" />
                <circle cx="18" cy="18" r="2.3" />
                <path d="M8.1 10.8 15.9 7M8.1 13.2l7.8 3.6" />
              </svg>
              우정공간 초대 코드
            </div>
            <div id="member-modal-room-code" style={{ fontSize: 15, fontWeight: 850, color: 'var(--primary-green)', letterSpacing: 1, marginTop: 2 }}>
              CLOV-2002
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => window.copyMemberModalRoomCode()}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                background: '#fff',
                color: 'var(--primary-green)',
                border: '1px solid rgba(27, 67, 50, 0.3)',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="8" y="4" width="12" height="16" rx="2" />
                <path d="M8 8H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" />
                <path d="M9 4h6" />
              </svg>{' '}
              복사
            </button>
            <button
              onClick={() => window.simulateJoinRequest()}
              title="클릭 시 신규 가입 신청 알림 테스트"
              style={{
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 700,
                background: 'var(--primary-green)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 6px rgba(27,67,50,0.2)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="8" r="3.2" />
                <path d="M2.5 20c0-3.2 2.8-5.5 6.5-5.5s6.5 2.3 6.5 5.5" />
                <path d="M18 9v5M20.5 11.5h-5" />
              </svg>{' '}
              가입 신청 테스트
            </button>
            <button
              onClick={() => window.simulateMemberLeave()}
              title="클릭 시 멤버 퇴장 알림 테스트"
              style={{
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 700,
                background: 'var(--bg-light)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>{' '}
              멤버 퇴장 테스트
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', flexShrink: 0 }}>
          <button
            className="btn-main"
            onClick={() => window.closeMemberListModal()}
            style={{
              padding: '10px 22px',
              fontSize: 14,
              borderRadius: 10,
              border: 'none',
              background: 'var(--primary-green)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
