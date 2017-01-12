//MAINTAIN ALPHABETICALLY
angular.module('passportDemo')
  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })
  .constant('IP_INFO', '//ipinfo.io/json')
  .constant('PAGINATION_LIMIT', 10)
  .constant('TIMEOUTS', {
    user_resolve: 7500
  })
  .constant('USER_ROLES', {
    all: '*',
    admin: 'admin'
  });
