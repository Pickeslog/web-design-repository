// 2단계 전환: 일정계획 탭 본문 뼈대(§6, 원본 pages/schedule-page.js의 TAB_HTML).
// #dt-schedule-list-zone은 js/schedule.js(renderScheduleList 등)가 계속 채운다.
// 인생4컷 극장(FOURCUT_HTML)은 원본에서도 이 탭 안이 아니라 <main> 형제였으므로
// 별도 컴포넌트(FourCutTheater.jsx)로 분리해 #dt-fourcut-mount에 portal로 마운트한다.
export default function ScheduleTabContent() {
  return (
    <>
      <div className="section-title journey-section-title">
        <div className="journey-heading">
          <span className="journey-page-kicker">PROMISE JOURNEY</span>
          <span className="journey-page-title">약속 여정</span>
        </div>
        <button className="btn-action-sm btn-schedule-new" onClick={() => window.openScheduleModal('dt')}>＋ 새 D-day 만들기</button>
      </div>
      <div id="dt-schedule-list-zone" />
    </>
  )
}
