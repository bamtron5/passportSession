var passportDemo;
(function (passportDemo) {
    angular.module('passportDemo', ['ui.router', 'ngResource', 'ngStorage'])
        .config(function ($resourceProvider, $stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
        $stateProvider
            .state('main', {
            url: '',
            abstract: true,
            templateUrl: '/ngApp/views/main.html',
            controller: passportDemo.Controllers.MainController,
            controllerAs: 'vm',
            resolve: {
                currentUser: ['Session', function (Session) {
                        return Session.getUser();
                    }],
                isAuthenticated: ['Session', function (Session) {
                        return Session.isAuthenticated();
                    }],
                currentNavItem: ['$state', function ($state) {
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
        $urlRouterProvider.otherwise('/notFound');
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false,
            rewriteLinks: false
        });
        $httpProvider.interceptors.push('authInterceptor');
    })
        .factory('_', ['$window',
        function ($window) {
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
        .run(function ($rootScope, UserService, $sessionStorage, Session, $state, _) {
        $rootScope.$on('$stateChangeStart', function (event, next) {
            UserService.getCurrentUser().then(function (user) {
                $sessionStorage.user = user;
            }).catch(function (user) {
                $sessionStorage.user = user;
            });
            var authorizedRoles = !_.isUndefined(next.data, 'authorizedRoles')
                ? next.data.authorizedRoles : false;
            if (authorizedRoles && !Session.isAuthorized(authorizedRoles)) {
                event.preventDefault();
                if (Session.isAuthenticated()) {
                    $state.go('home');
                }
                else {
                    $state.go('home');
                }
            }
        });
    });
})(passportDemo || (passportDemo = {}));
