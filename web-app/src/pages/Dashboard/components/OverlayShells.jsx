// 2단계 전환: 내용이 거의 전부 JS가 innerHTML로 채우는 "빈 껍데기" 오버레이들
// (추억 여권 상세/갤러리, 약속 여정, 우정공간 사진 모아보기, 월 선택 팝오버).
// 이 컴포넌트들은 원본 body 최상위에 있던 정적 placeholder를 그대로 옮긴 것 —
// feed.js/schedule.js가 각 id로 찾아 내부를 채운다.
export function MemoryDetailOverlay() {
  return (
    <>
      <div className="memory-detail-backdrop" id="memory-detail-backdrop" onClick={() => window.closeMemoryDetail()} />
      <section className="memory-detail-sheet" id="memory-detail-sheet" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="memory-detail-author" />
    </>
  )
}

export function MemoryGalleryOverlay() {
  return <div className="mp-gallery" id="memory-gallery-overlay" role="dialog" aria-modal="true" aria-label="사진 전체보기" />
}

export function ScheduleJourneyOverlay() {
  return <div className="sj-backdrop" id="schedule-journey-overlay" role="dialog" aria-modal="true" aria-label="약속 여정" />
}

export function SpacePhotoGalleryOverlay() {
  return <div className="sg-overlay" id="space-photo-gallery-overlay" role="dialog" aria-modal="true" aria-label="우정공간 사진 모아보기" />
}

export function MonthPickerPopover() {
  return (
    <div className="month-picker-popover" id="month-picker-popover" role="dialog" aria-label="월 선택">
      <div className="month-picker-header">
        <button className="month-picker-nav" type="button" onClick={() => window.moveMonthPickerYear(-1)} aria-label="이전 년도">❮</button>
        <div className="month-picker-year" id="month-picker-year">2026년</div>
        <button className="month-picker-nav" type="button" onClick={() => window.moveMonthPickerYear(1)} aria-label="다음 년도">❯</button>
      </div>
      <button className="month-picker-all-btn" id="month-picker-all-btn" type="button" onClick={() => window.setFeedMonth('all')}>전체보기</button>
      <div className="month-picker-grid" id="month-picker-grid" />
    </div>
  )
}
