/* Clov. 임시 로그인 상태 관리 — React 연동 전 목업
   "로그인 유지" 체크 시 accessToken을 localStorage(브라우저를 꺼도 유지)에,
   체크 안 했을 때는 sessionStorage(탭/창을 닫으면 자동 삭제)에 저장한다. */
(function () {
  function generateToken() {
    return 'tok_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  }

  function getAccessToken() {
    return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  }

  function setAccessToken(remember) {
    var token = generateToken();
    clearAccessToken();
    if (remember) {
      localStorage.setItem('accessToken', token);
    } else {
      sessionStorage.setItem('accessToken', token);
    }
    return token;
  }

  function clearAccessToken() {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
  }

  window.ClovAuth = {
    getAccessToken: getAccessToken,
    setAccessToken: setAccessToken,
    clearAccessToken: clearAccessToken
  };
})();
