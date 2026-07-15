import { useEffect, useRef, useState } from 'react'
import {
  injectLegacyHead,
  injectLegacyBody,
  cleanupLegacyHead,
  markBodyBoundary,
  cleanupAfterBodyBoundary,
  createLegacyOwnerId,
} from '../utils/legacyHtmlInjector'

// Dashboard.jsx에서 쓰던 "1단계 임베딩" 방식을 재사용 가능한 컴포넌트로 뽑아낸 것.
// 화면 전체가 하나의 컨테이너(탭 전환·portal 없음)이고, 드래그 정렬·페이지네이션·
// 다중 뷰 모달처럼 addEventListener/상태가 매우 촘촘히 얽힌 화면(예: 방 목록·방 만들기)은
// 손으로 한 줄씩 JSX로 옮기면 회귀 위험이 커서, 기능·마크업을 100% 그대로 보존하는
// 이 방식을 우선 적용한다.
// retriggerOnload: body 스크립트가 초기 렌더를 window.onload = function(){...}에 등록하는
// 화면(desktop.js 등)에서 true로 켠다 — SPA에서는 document가 이미 오래 전에 로드된 뒤라
// load 이벤트가 다시 발생하지 않으므로, 대신 body 주입이 끝난 뒤 한 번 수동으로 호출한다.
export default function LegacyEmbed({ headHtml, bodyHtml, baseHref, retriggerOnload = false }) {
  const containerRef = useRef(null)
  const [mounted, setMounted] = useState(false)
  const onloadFiredRef = useRef(false)

  useEffect(() => {
    const token = { cancelled: false }
    const ownerId = createLegacyOwnerId()
    const bodyBoundary = markBodyBoundary()

    async function boot() {
      await injectLegacyHead(headHtml, baseHref, ownerId, token)
      if (token.cancelled || !containerRef.current) return
      await injectLegacyBody(containerRef.current, bodyHtml, token)
      if (token.cancelled) return
      setMounted(true)
    }
    boot()

    return () => {
      token.cancelled = true
      onloadFiredRef.current = false
      setMounted(false)
      cleanupLegacyHead(ownerId)
      if (containerRef.current) containerRef.current.innerHTML = ''
      cleanupAfterBodyBoundary(bodyBoundary)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headHtml, bodyHtml, baseHref])

  useEffect(() => {
    if (retriggerOnload && mounted && !onloadFiredRef.current) {
      onloadFiredRef.current = true
      if (typeof window.onload === 'function') {
        try {
          window.onload()
        } catch (e) {
          console.error('[LegacyEmbed] onload error:', e)
        }
      }
    }
  }, [retriggerOnload, mounted])

  return <div ref={containerRef} />
}
