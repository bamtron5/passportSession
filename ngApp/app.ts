namespace passportDemo {
  //TODO components
  angular.module('passportDemo', ['ui.router', 'ngResource', 'ngCookies'])
    .config((
      $resourceProvider: ng.resource.IResourceServiceProvider,
      $stateProvider: ng.ui.IStateProvider,
      $urlRouterProvider: ng.ui.IUrlRouterProvider,
      $locationProvider: ng.ILocationProvider,
      $httpProvider: ng.IHttpProvider
    ) => {
      // Define routes
      //
      $stateProvider
        .state('main', {
          url: '',
          abstract: true,
          templateUrl: '/ngApp/views/main.html',
          controller: passportDemo.Controllers.MainController,
          controllerAs: 'vm',
          //TODO
          // //get the state by name and change the value of custom data property
          // $state.get('contacts').data.customData1= 100;
          //  // then you can go to that state.
          // $state.go('contacts');
          data: {
            currentUser: new Promise(() => {}) //set by MainController to state.current.data.currentUser
          }
        })
        .state('main.home', {
          url: '/',
          parent: 'main',
          templateUrl: '/ngApp/views/home.html',
          controller: passportDemo.Controllers.HomeController,
          controllerAs: 'controller'
        })
        .state('main.register', {
          url: '/register',
          templateUrl: '/ngApp/views/register.html',
          controller: passportDemo.Controllers.UserController,
          controllerAs: 'controller'
        })
        .state('main.login', {
          url: '/login',
          templateUrl: '/ngApp/views/login.html',
          controller: passportDemo.Controllers.UserController,
          controllerAs: 'controller'
        })
        .state('notFound', {
          url: '/notFound',
          templateUrl: '/ngApp/views/notFound.html'
        });

      // Handle request for non-existent route
      $urlRouterProvider.otherwise('/notFound');

      // Enable HTML5 navigation
      $locationProvider.html5Mode(true);

      //for authInterceptor factory
      $httpProvider.interceptors.push('authInterceptor');
    }).factory('authInterceptor',
      ['$q', '$cookies', '$location',
      function ($q, $cookies, $location) {
      return {
        // Add authorization token to headers PER req
        request: function (config) {
          config.headers = config.headers || {};
          if ($cookies.get('token')) {
            config.headers.Authorization = 'Bearer ' + $cookies.get('token');
          }
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
      '$rootScope', '$location',
      function($rootScope, $location) {
      // Redirect to login if route requires auth and you're not logged in
      $rootScope.$on('$stateChangeStart', function (event, next) {
        // console.log(`GOING TO: ${next.url}`);
      });
  }]);
}
