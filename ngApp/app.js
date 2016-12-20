var passportDemo;
(function (passportDemo) {
    angular.module('passportDemo', ['ui.router', 'ngResource', 'ngCookies'])
        .config(function ($resourceProvider, $stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        $stateProvider
            .state('main', {
            url: '',
            abstract: true,
            templateUrl: '/ngApp/views/main.html',
            controller: passportDemo.Controllers.MainController,
            controllerAs: 'vm',
            resolve: {
                currentUser: [
                    'UserService', '$state', function (UserService, $state) {
                        return UserService.getCurrentUser(function (user) {
                            return user;
                        }).catch(function (e) {
                            return { username: false };
                        });
                    }
                ]
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
        $urlRouterProvider.otherwise('/notFound');
        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
    }).factory('authInterceptor', ['$q', '$cookies', '$location',
        function ($q, $cookies, $location) {
            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    if ($cookies.get('token')) {
                        config.headers.Authorization = 'Bearer ' + $cookies.get('token');
                    }
                    return config;
                },
                responseError: function (response) {
                    if (response.status === 401) {
                        console.info("this account needs to authenticate to " + response.config.method + " " + response.config.url);
                    }
                    if (response.status === 403) {
                        alert('unauthorized permission for your account.');
                        return $q.reject(response);
                    }
                    else {
                        return $q.reject(response);
                    }
                }
            };
        }])
        .run([
        '$rootScope', '$location', 'UserService', '$state', '$q',
        function ($rootScope, $location, UserService, $state, $q) {
            $rootScope.$on('$stateChangeStart', function (event, next) {
            });
        }
    ]);
})(passportDemo || (passportDemo = {}));
