namespace passportDemo {
  angular.module('passportDemo', ['ui.router', 'ngResource', 'ngStorage'])
    .config((
      $resourceProvider: ng.resource.IResourceServiceProvider,
      $stateProvider: ng.ui.IStateProvider,
      $urlRouterProvider: ng.ui.IUrlRouterProvider,
      $locationProvider: ng.ILocationProvider,
      $httpProvider: ng.IHttpProvider
    ) => {
      // Define routes
      $stateProvider
        .state('main', {
          url: '',
          abstract: true,
          templateUrl: '/ngApp/views/main.html',
          controller: passportDemo.Controllers.MainController,
          controllerAs: 'vm',
          resolve: {
            currentUser: ['Session', (Session) => {
              return Session.getUser();
            }],
            isAuthenticated: ['Session', (Session) => {
              return Session.isAuthenticated();
            }],
            currentNavItem: ['$state', ($state) => {
              return $state.current.name;
            }]
          }
        })
        .state('main.home', {
          url: '/',
          parent: 'main',
          templateUrl: '/ngApp/views/home.html',
          controller: passportDemo.Controllers.HomeController,
          controllerAs: 'vm'
        })
        .state('main.register', {
          url: '/register',
          templateUrl: '/ngApp/views/register.html',
          controller: passportDemo.Controllers.UserController,
          controllerAs: 'vm'
        })
        .state('main.login', {
          url: '/login',
          templateUrl: '/ngApp/views/login.html',
          controller: passportDemo.Controllers.UserController,
          controllerAs: 'vm'
        })
        .state('main.profile', {
          url: '/profile',
          templateUrl: '/ngApp/views/profile.html',
          controller: passportDemo.Controllers.ProfileController,
          controllerAs: 'vm'
        })
        .state('notFound', {
          url: '/notFound',
          templateUrl: '/ngApp/views/notFound.html'
        });

      // Handle request for non-existent route
      $urlRouterProvider.otherwise('/notFound');

      // Enable HTML5 navigation
      // allow express routing
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: false
      });

      //for authInterceptor factory
      $httpProvider.interceptors.push('authInterceptor');
    })
    .factory('_', ['$window',
      function($window) {
        // place lodash include before angular
        return $window._;
      }
    ])
    .factory('authInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
      return {
        responseError: function (response) {
          $rootScope.$broadcast({
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
          }[response.status], response);
          return $q.reject(response);
        }
      };
    })
    .run(
      [
        '$rootScope',
        'UserService',
        '$sessionStorage',
        'Session',
        '$state',
        '_',
        'AUTH_EVENTS',
        (
          $rootScope,
          UserService,
          $sessionStorage,
          Session,
          $state: ng.ui.IStateService,
          _,
          AUTH_EVENTS
        ) => {
          $rootScope.$on('$stateChangeStart', (event, next) => {
            UserService.getCurrentUser().then((user) => {
              $sessionStorage.user = user;
            }).catch((user) => {
              $sessionStorage.user = user;
            });
            let authorizedRoles = !_.isUndefined(next.data, 'authorizedRoles')
              ? next.data.authorizedRoles : false;
            if (authorizedRoles && !Session.isAuthorized(authorizedRoles)) {
              event.preventDefault();
              if(Session.isAuthenticated()){
                //TODO dialog
                // $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                $state.go('home');
              } else {
                // $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                $state.go('home');
              }
            }
          });
        }
      ]
    );
}
