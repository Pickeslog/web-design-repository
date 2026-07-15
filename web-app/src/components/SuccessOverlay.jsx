import { useEffect, useRef, useState } from 'react'
import './SuccessOverlay.css'

// 원본 test-web-design/02-main/js/success-overlay.js 포팅.
// 원본은 window.location.href로 하드 리다이렉트했지만, SPA에서는 워프 애니메이션이
// 끝난 시점에 onDone()을 불러 호출부가 react-router navigate로 이동하게 한다.
const WELCOME_LINES = [
  (name) => `돌아온걸 환영해요. ${name}님!`,
  (name) => `${name}님, Clov.와 함께 기록할 준비는 되셨나요?`,
  () => 'Clov. 가 당신만을 기다리고 있었어요!',
  () => 'Clov. 에서 기록의 재미를 느껴봐요!',
]
const EASTER_EGGS = [
  '롭의 머리를 잡고 위로 들어올려보세요',
  '롭을 빠르게 세 번 클릭해보세요',
  '롭을 너무 오래 들고 있으면 화를 낼지도 몰라요',
]
const LEAVES = [
  { left: '6%', size: 8, duration: 4.6, delay: 0 },
  { left: '16%', size: 6, duration: 5.4, delay: 1.4 },
  { left: '27%', size: 9, duration: 4.0, delay: 0.6 },
  { left: '39%', size: 7, duration: 5.8, delay: 2.1 },
  { left: '52%', size: 8, duration: 4.3, delay: 0.9 },
  { left: '64%', size: 6, duration: 5.1, delay: 1.7 },
  { left: '76%', size: 9, duration: 4.8, delay: 0.3 },
  { left: '88%', size: 7, duration: 5.6, delay: 2.4 },
]

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
function getNickname() {
  return localStorage.getItem('clov_profile_nickname') || '사용자'
}

export default function SuccessOverlay({ show, durationMs = 3000, onDone }) {
  const [phase, setPhase] = useState('idle') // idle -> active -> zoomout -> warp
  const [text, setText] = useState('')
  const [eggText, setEggText] = useState('')
  const timers = useRef([])

  useEffect(() => {
    if (!show) return
    setText(pickRandom(WELCOME_LINES)(getNickname()))
    setEggText(pickRandom(EASTER_EGGS))
    setPhase('idle')
    const raf = requestAnimationFrame(() => setPhase('active'))

    const t1 = setTimeout(() => {
      setPhase('zoomout')
      const t2 = setTimeout(() => {
        setPhase('warp')
        const t3 = setTimeout(() => {
          if (typeof onDone === 'function') onDone()
        }, 340)
        timers.current.push(t3)
      }, 320)
      timers.current.push(t2)
    }, durationMs)
    timers.current.push(t1)

    return () => {
      cancelAnimationFrame(raf)
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  if (!show) return null

  const activeClass = phase === 'active' || phase === 'zoomout' || phase === 'warp' ? 'is-active' : ''
  const stateClass = phase === 'zoomout' ? 'is-zoomout' : phase === 'warp' ? 'is-warp' : ''

  return (
    <div className={`clov-success-overlay ${activeClass} ${stateClass}`.trim()}>
      <div className="clov-success-leaves">
        {LEAVES.map((l, i) => (
          <span
            key={i}
            className="clov-success-leaf"
            style={{ left: l.left, width: l.size, height: l.size, animationDuration: `${l.duration}s`, animationDelay: `${l.delay}s` }}
          />
        ))}
      </div>
      <svg className="clov-success-wave" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
        <path className="clov-success-wave-back" d="M0 30 Q75 0 150 30 T300 30 V60 H0 Z" />
        <path className="clov-success-wave-front" d="M0 40 Q75 15 150 40 T300 40 V60 H0 Z" />
      </svg>
      <div className="clov-success-stage">
        <div className="clov-success-check">
          <svg viewBox="0 0 120 120">
            <defs>
              <linearGradient id="clovSuccessGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#50d990" />
                <stop offset="100%" stopColor="#16874b" />
              </linearGradient>
            </defs>
            <circle className="clov-success-circle" cx="60" cy="60" r="52" transform="rotate(-90 60 60)" />
            <path className="clov-success-tick" d="M40 62 L54 76 L84 46" />
          </svg>
        </div>
        <div className="clov-success-text">{text}</div>
        <div className="clov-success-egg-hint">
          <span className="clov-success-egg-label">이스터에그</span>
          <span className="clov-success-egg-text">{eggText}</span>
        </div>
      </div>
    </div>
  )
}
