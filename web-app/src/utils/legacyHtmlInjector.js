// test-web-design 프로토타입(바닐라 HTML/CSS/JS)을 기능·마크업 변경 없이
// React 페이지 안에서 그대로 재현하기 위한 이식용 유틸리티(1단계, 임베딩).
// 화면 영역을 실제 JSX 컴포넌트로 재작성하는 2단계 리팩터링 전까지 임시로 쓴다.
//
// 핵심 트릭: 원본 파일들은 전부 "../assets/..." 같은, 원본 폴더 위치(02-main/)
// 기준 상대경로를 그대로 쓴다. React 라우트 URL(/)은 그 위치와 다르므로,
// <base href> 를 원본 폴더와 같은 깊이로 맞춰 스크립트/이미지 상대경로를
// 한 글자도 고치지 않고 그대로 resolve되게 한다.
//
// StrictMode 이중 마운트 대응:
// React StrictMode는 개발 모드에서 마운트 이펙트를 일부러 두 번(mount→cleanup→mount)
// 실행해 정리 누락 버그를 잡아낸다. injectLegacyHead는 <head>에 base+link 여러 개를
// "await 없이 동기적으로" 먼저 붙이고, 그 다음(스크립트 로드)부터 비동기로 넘어간다.
// 첫 번째 mount의 그 동기 구간이 끝나기도 전에 cleanup이 끼어들 수는 없지만(JS는
// 싱글스레드), cleanup 시점에 "이 함수가 어디까지 진행했는지"를 함수가 반환하는
// 배열로만 넘겨받으면 — 그 배열은 함수가 실제로 return할 때만 채워지므로, 아직
// await 중인 첫 번째 mount의 진행 상황을 cleanup이 알 방법이 없다. 그래서 각
// 노드에 이 호출 전용 소유자 id(data-legacy-owner)를 심어두고, cleanup은 JS 배열이
// 아니라 "그 id를 가진 라이브 DOM 노드를 지금 이 순간 전부 찾아서" 지운다 — 함수가
// 아직 실행 중이어도 이미 DOM에 붙은 노드는 즉시 청소된다(실제로 이 문제로
// <style>/<link>가 중복 삽입돼 레이아웃 캐스케이드가 꼬였던 적이 있다).
let ownerCounter = 0
export function createLegacyOwnerId() {
  ownerCounter += 1
  return 'legacy-' + ownerCounter
}

function loadExternalScript(src, target, ownerId) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    // 로드 완료 "후"가 아니라 append와 동시에(동기적으로) 태그해야 한다 — cleanup이
    // await 완료를 기다리지 않고 아무 때나 라이브 DOM을 청소하러 올 수 있어서다.
    script.setAttribute('data-legacy-owner', ownerId)
    script.onload = () => resolve(script)
    script.onerror = reject
    target.appendChild(script)
  })
}

// <head> 쪽 <link>/<style>/<script src> 를 원본 순서 그대로 주입한다.
// 컴포넌트/페이지 스크립트(clov-header.js 등)는 body 스크립트가 참조하므로
// body 주입보다 반드시 먼저 끝나야 한다 — 그래서 각 외부 스크립트 로드를 await한다.
export async function injectLegacyHead(headHtml, baseHref, ownerId, token = { cancelled: false }) {
  const base = document.createElement('base')
  base.href = baseHref
  base.setAttribute('data-legacy-owner', ownerId)
  document.head.appendChild(base)

  const template = document.createElement('template')
  template.innerHTML = headHtml

  for (const node of Array.from(template.content.childNodes)) {
    if (token.cancelled) return

    if (node.nodeName === 'SCRIPT') {
      const src = node.getAttribute('src')
      if (src) {
        const script = await loadExternalScript(src, document.head, ownerId)
        if (token.cancelled) { script.remove(); return }
      } else {
        const script = document.createElement('script')
        script.textContent = node.textContent
        script.setAttribute('data-legacy-owner', ownerId)
        document.head.appendChild(script)
      }
    } else {
      const clone = node.cloneNode(true)
      if (clone.nodeType === 1) clone.setAttribute('data-legacy-owner', ownerId)
      document.head.appendChild(clone)
    }
  }
}

// ownerId로 태그된 노드를 지금 이 순간 DOM에서 직접 찾아 지운다(위 설명 참고 —
// injectLegacyHead가 아직 실행 중이어도 정확하게 청소되는 이유).
export function cleanupLegacyHead(ownerId) {
  document.head.querySelectorAll('[data-legacy-owner="' + ownerId + '"]').forEach((node) => node.remove())
}

// 여러 legacy 스크립트(크로비 마스코트, V5 배너 테스트 패널, 사용자설정 모달 등)는
// 우리가 만든 컨테이너가 아니라 document.body에 직접 엘리먼트를 appendChild한다
// (컴포넌트 단위로 하나하나 추적하기엔 이런 지점이 너무 많고, 나중에 스크립트가
// 바뀌면 또 새로 생길 수 있다). 그래서 "이 화면이 시작되기 전 body 상태"를 주석
// 노드로 표시해두고, 언마운트 시 그 마커 뒤에 새로 생긴 모든 body 자식을 통째로
// 지운다 — 어떤 스크립트가 몇 개를 어디에 붙였는지 몰라도 항상 정확하게 청소된다.
// (이 마커 방식은 "지금 이 순간의 라이브 DOM"을 기준으로 청소하므로 head와 같은
// StrictMode 타이밍 문제에서 원래도 안전하다.)
export function markBodyBoundary() {
  const marker = document.createComment('clov-legacy-boundary')
  document.body.appendChild(marker)
  return marker
}

export function cleanupAfterBodyBoundary(marker) {
  if (!marker || !marker.parentNode) return
  let node = marker.nextSibling
  while (node) {
    const next = node.nextSibling
    node.remove()
    node = next
  }
  marker.remove()
}

// <body> 마크업 + 그 안 곳곳(중첩된 위치 포함)에 끼어있는 <script>를 원본과
// 같은 문서 순서로 주입한다. 원본 index.html은 예를 들어
//   <main> ... <div id="dt-tab-space"></div> <script>SpacePage.init()</script> ... </main>
// 처럼 "먼저 껍데기 div를 만들고 → 바로 다음 스크립트가 그 안을 채우는" 순서에
// 의존한다. 2단계로 처리한다:
//   1) 정적 마크업 전체를 통째로 붙여넣는다(이 시점의 <script>는 브라우저 스펙상
//      비활성 상태 — innerHTML/cloneNode로 들어간 script는 자동 실행되지 않는다).
//   2) DOM에 붙은 <script>들을 문서 순서(querySelectorAll 반환 순서)대로 순회하며
//      진짜 <script> 엘리먼트로 하나씩 교체해 그제서야 실행시킨다.
// (단순히 최상위 자식만 순회하면 <main> 안쪽처럼 깊이 중첩된 인라인 스크립트가
//  실행되지 않는 버그가 생긴다 — 실제로 SpacePage.init() 등이 이 문제로 누락됐었다.)
// container는 Dashboard.jsx의 <div ref={containerRef}/> 하나뿐이라(StrictMode
// 이중 마운트에도 같은 DOM 노드), cleanup 시 container.innerHTML=''만으로 이미
// 라이브 DOM 기준 청소라 head 쪽과 같은 타이밍 문제가 없다.
export async function injectLegacyBody(container, bodyHtml, token = { cancelled: false }) {
  const template = document.createElement('template')
  template.innerHTML = bodyHtml
  container.appendChild(template.content)

  const inertScripts = Array.from(container.querySelectorAll('script'))
  for (const oldScript of inertScripts) {
    if (token.cancelled) return

    const newScript = document.createElement('script')
    for (const attr of Array.from(oldScript.attributes)) {
      newScript.setAttribute(attr.name, attr.value)
    }
    if (oldScript.src) {
      oldScript.replaceWith(newScript)
      await new Promise((resolve, reject) => {
        newScript.onload = resolve
        newScript.onerror = reject
      })
    } else {
      newScript.textContent = oldScript.textContent
      oldScript.replaceWith(newScript)
    }
  }
}
