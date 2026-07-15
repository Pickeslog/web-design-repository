// 원본 test-web-design/02-main/js/auth.js 포팅.
// "로그인 유지" 체크 시 accessToken을 localStorage(브라우저를 꺼도 유지)에,
// 체크 안 했을 때는 sessionStorage(탭/창을 닫으면 자동 삭제)에 저장한다.
// window.ClovAuth로도 동일하게 노출해 레거시 대시보드 코드(HeaderMain 등)와 키를 공유한다.
function generateToken() {
  return 'tok_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10)
}

export function getAccessToken() {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
}

export function setAccessToken(remember) {
  const token = generateToken()
  clearAccessToken()
  if (remember) {
    localStorage.setItem('accessToken', token)
  } else {
    sessionStorage.setItem('accessToken', token)
  }
  return token
}

export function clearAccessToken() {
  localStorage.removeItem('accessToken')
  sessionStorage.removeItem('accessToken')
}

if (typeof window !== 'undefined' && !window.ClovAuth) {
  window.ClovAuth = { getAccessToken, setAccessToken, clearAccessToken }
}
