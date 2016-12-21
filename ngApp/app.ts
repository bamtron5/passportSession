namespace passportDemo {
  angular.module('passportDemo', ['ui.router', 'ngResource'])
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
            currentUser: [
              'UserService', '$state', (UserService, $state) => {
                return UserService.getCurrentUser((user) => {
                  return user;
                }).catch((e) => {
                  return { username: false };
                });
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
        })
        .state('main.authsuccess', {
          url: '/authsuccess',
          templateUrl: '/ngApp/views/authsuccess.html',
          controller: passportDemo.Controllers.ProfileController,
          controllerAs: 'vm'
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
    }).factory('authInterceptor',
      ['$q','$location',
      function ($q, $location) {
      return {
        // Add authorization token to headers PER req
        request: function (config) {
          config.headers = config.headers || {};
          return config;
        },

        // Intercept 401s/500s and redirect you to login
        responseError: function(response) {
          if(response.status === 401) {
            // good place to explain to the user why or redirect
            console.info(`this account needs to authenticate to ${response.config.method} ${response.config.url}`);
          }
          if(response.status === 403) {
            alert('unauthorized permission for your account.');
            // good place to explain to the user why or redirect
            // remove any stale tokens
            return $q.reject(response);
          } else {
            return $q.reject(response);
          }
        }
      }
    }])
    .run([
      '$rootScope', '$location', 'UserService', '$state', '$q',
      function($rootScope, $location, UserService, $state, $q) {
      // Redirect to login if route requires auth and you're not logged in
      $rootScope.$on('$stateChangeStart', function (event, next) {
        // console.log(`GOING TO: ${next.url}`);
      });
  }]);
}
