import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import headHtml from './legacy-source/head-fragment.html?raw'
import bodyHtml from './legacy-source/body-fragment.html?raw'
import {
  injectLegacyHead,
  injectLegacyBody,
  cleanupLegacyHead,
  markBodyBoundary,
  cleanupAfterBodyBoundary,
  createLegacyOwnerId,
} from '../../utils/legacyHtmlInjector'
import MemberListModal from './components/MemberListModal'
import PhotoUploadModal from './components/PhotoUploadModal'
import LegacyPostModal from './components/LegacyPostModal'
import { InviteModal, GroupModal } from './components/RoomModals'
import ScheduleModal from './components/ScheduleModal'
import { LetterInboxModal, LetterDetailModal } from './components/LetterModals'
import ProofResultModal from './components/ProofResultModal'
import {
  MemoryDetailOverlay,
  MemoryGalleryOverlay,
  ScheduleJourneyOverlay,
  SpacePhotoGalleryOverlay,
  MonthPickerPopover,
} from './components/OverlayShells'
import SpaceTabContent from './components/SpaceTabContent'
import FeedTabContent from './components/FeedTabContent'
import LetterTabContent from './components/LetterTabContent'
import ScheduleTabContent from './components/ScheduleTabContent'
import FourCutTheater from './components/FourCutTheater'
import HeaderMain from './components/HeaderMain'
import WriteModal from './components/WriteModal'

// test-web-design/02-main/index.html 이식 현황:
// 화면 마크업(헤더 + 4개 탭 전체 본문 + 인생4컷 극장 + 모든 정적 모달)은 JSX로 전환 완료.
// css/js/components/pages 원본 파일은 web-app/public/legacy/ 아래 그대로 복사돼 있고,
// 이 파일은 그 파일들을 원본 순서대로 불러와 실행한 뒤, 각 화면 조각이 원래 채우던
// 빈 껍데기 DOM 자리에 JSX를 portal로 꽂아넣는 방식이다. 남은 것: 사용자설정 모달
// (components/clov-profile-modal.js, addEventListener 기반 렌더-후-바인딩 패턴이라
// 위험도가 높아 보류), 크로비 마스코트·V5 배너(자기 DOM을 스스로 만들어 body에 붙이는
// 방식이라 우리 JSX와 안 얽힘 — 옮길 실익이 없어 그대로 둠).
//
// 주의(리팩터링 전 확인 필요, 명세서 §9 알려진 이슈 참고):
// - 헤더의 방목록(‹)·로그아웃 링크는 원본에서 ../03-rooms/makerooms.html, ../01-auth/login.html
//   상대경로를 그대로 쓴다. 해당 화면을 아직 React로 이식하지 않아 현재는 깨진 링크다.
// - 이 화면을 벗어났다가 다시 들어오면(React 라우트 재마운트) 원본 스크립트가 다시
//   실행되어 전역 함수/이벤트 리스너가 중복 등록될 수 있다 — 원본이 "새로고침 없는
//   반복 마운트"를 상정하고 만들어진 코드가 아니기 때문.
export default function Dashboard() {
  const containerRef = useRef(null)
  // 4개 탭(dt-tab-space/feed/letter/schedule)과 인생4컷 극장(dt-fourcut-mount)은
  // legacy 마크업(raw DOM) 안에 있는 빈 껍데기 div다. injectLegacyBody가 끝나야 실제로
  // DOM에 존재하므로, 존재가 확인된 뒤에만 각 컴포넌트를 그 안에 React portal로
  // 마운트한다(nav.js의 탭 전환은 각 div의 class="dt-page-view active"를 그대로
  // 토글하므로 div 자체는 legacy 쪽 소유로 남겨둔다).
  const [mounts, setMounts] = useState(null)
  // js/init.js는 초기화 로직(피드/편지 렌더링, D-day 애니메이션, 환경 테마 계산 등)을
  // window.onload = function(){...} 형태로 등록한다. SPA에서는 문서가 이미 오래 전에
  // 로드된 뒤 이 코드가 실행되므로 load 이벤트가 다시 발생하지 않아 이 대입만으로는
  // 아무 것도 실행되지 않는다 — 원본을 file://나 정적 서버로 열 때만 자연히 동작하던
  // 부분이라 놓치기 쉽다. 아래에서 SpaceTabContent portal이 실제 DOM에 커밋된 뒤
  // 수동으로 한 번 호출해 원본과 동일한 초기 렌더링을 재현한다.
  const onloadFiredRef = useRef(false)

  // 크로비 마스코트/V5 배너 테스트 패널/사용자설정 모달처럼 document.body에 직접
  // 붙는 legacy 엘리먼트를 화면을 나갈 때 확실히 치우기 위한 경계 마커.
  const bodyBoundaryRef = useRef(null)

  useEffect(() => {
    // token: injectLegacyHead/injectLegacyBody 내부 루프가 매 반복 확인하는 취소 신호.
    // ownerId: 이번 마운트가 <head>에 심는 노드마다 붙이는 꼬리표 — cleanup이 함수의
    // 반환값(JS 배열)이 아니라 "이 id를 가진 라이브 DOM 노드"를 직접 찾아 지우므로,
    // StrictMode가 이 effect를 두 번(mount→cleanup→mount) 돌릴 때 첫 번째 실행이
    // 아직 스크립트 로딩을 await하는 중이어도 정확히 청소된다(자세한 이유는
    // legacyHtmlInjector.js 상단 주석 참고 — 실제로 이 문제로 <style>/<link>가
    // 중복 삽입돼 레이아웃 캐스케이드가 꼬였던 적이 있다).
    const token = { cancelled: false }
    const ownerId = createLegacyOwnerId()
    bodyBoundaryRef.current = markBodyBoundary()

    async function boot() {
      await injectLegacyHead(headHtml, '/legacy/02-main/', ownerId, token)
      if (token.cancelled || !containerRef.current) return
      await injectLegacyBody(containerRef.current, bodyHtml, token)
      if (token.cancelled || !containerRef.current) return
      const c = containerRef.current
      // ClovHeader.init()은 부수효과(CSS 주입/다크모드 복원/바깥클릭 리스너)뿐 아니라
      // #app-header.innerHTML도 직접 채워놓는다. createPortal은 대상 노드의 기존 자식을
      // 지우지 않고 그 옆에 얹으므로, 그대로 두면 원본 문자열 헤더와 HeaderMain이
      // 동시에 남아 id가 중복된다 — 부수효과만 남기고 렌더링 결과물은 비운다.
      const headerEl = c.querySelector('#app-header')
      if (headerEl) headerEl.innerHTML = ''
      setMounts({
        header: headerEl,
        space: c.querySelector('#dt-tab-space'),
        feed: c.querySelector('#dt-tab-feed'),
        letter: c.querySelector('#dt-tab-letter'),
        schedule: c.querySelector('#dt-tab-schedule'),
        fourcut: c.querySelector('#dt-fourcut-mount'),
      })
    }

    boot()

    return () => {
      token.cancelled = true
      onloadFiredRef.current = false
      setMounts(null)
      cleanupLegacyHead(ownerId)
      if (containerRef.current) containerRef.current.innerHTML = ''
      cleanupAfterBodyBoundary(bodyBoundaryRef.current)
      bodyBoundaryRef.current = null
    }
  }, [])

  useEffect(() => {
    if (mounts && !onloadFiredRef.current) {
      onloadFiredRef.current = true
      if (typeof window.onload === 'function') window.onload()
    }
  }, [mounts])

  return (
    <>
      <div ref={containerRef} />
      {mounts?.header && createPortal(<HeaderMain />, mounts.header)}
      {mounts?.space && createPortal(<SpaceTabContent />, mounts.space)}
      {mounts?.feed && createPortal(<FeedTabContent />, mounts.feed)}
      {mounts?.letter && createPortal(<LetterTabContent />, mounts.letter)}
      {mounts?.schedule && createPortal(<ScheduleTabContent />, mounts.schedule)}
      {mounts?.fourcut && createPortal(<FourCutTheater />, mounts.fourcut)}
      <PhotoUploadModal />
      <MemberListModal />
      <WriteModal />
      <LegacyPostModal />
      <InviteModal />
      <GroupModal />
      <ScheduleModal />
      <LetterInboxModal />
      <LetterDetailModal />
      <ProofResultModal />
      <MemoryDetailOverlay />
      <MemoryGalleryOverlay />
      <ScheduleJourneyOverlay />
      <SpacePhotoGalleryOverlay />
      <MonthPickerPopover />
    </>
  )
}
