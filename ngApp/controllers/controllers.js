var passportDemo;
(function (passportDemo) {
    var Controllers;
    (function (Controllers) {
        var MainController = (function () {
            function MainController(UserService, $state, $cookies, $q) {
                var _this = this;
                this.UserService = UserService;
                this.$state = $state;
                this.$cookies = $cookies;
                this.$q = $q;
                this.self = this;
                $state.current.data.currentUser = $q.defer();
                this.UserService.getCurrentUser().then(function (user) {
                    _this.currentUser = user;
                    $state.current.data.currentUser.resolve(user);
                }).catch(function (user) {
                    _this.currentUser = user;
                    $state.current.data.currentUser.reject({});
                });
            }
            MainController.prototype.logout = function () {
                var _this = this;
                this.UserService.logout().then(function () {
                    _this.$cookies.remove('token');
                    _this.$state.transitionTo('main.home', null, { reload: true, notify: true });
                }).catch(function () {
                    throw new Error('Unsuccessful logout');
                });
            };
            return MainController;
        }());
        Controllers.MainController = MainController;
        var HomeController = (function () {
            function HomeController($state) {
                var _this = this;
                this.$state = $state;
                $state.current.data.currentUser.promise.then(function (user) {
                    _this.currentUser = user;
                }).catch(function (user) {
                    _this.currentUser = user;
                });
            }
            return HomeController;
        }());
        Controllers.HomeController = HomeController;
        var UserController = (function () {
            function UserController(UserService, $state, $rootScope, $cookies, $scope) {
                this.UserService = UserService;
                this.$state = $state;
                this.$rootScope = $rootScope;
                this.$cookies = $cookies;
                this.$scope = $scope;
            }
            UserController.prototype.login = function (user) {
                var _this = this;
                this.UserService.login(user).then(function (res) {
                    _this.$cookies.put('token', res.token);
                    _this.$state.transitionTo('main.home', null, { reload: true, notify: true });
                }).catch(function (err) {
                    alert('Bunk login, please try again.');
                });
            };
            UserController.prototype.register = function (user) {
                var _this = this;
                this.UserService.register(user).then(function (res) {
                    _this.$state.go('main.login');
                }).catch(function (err) {
                    console.log(err);
                    alert('Registration error: please try again.');
                });
            };
            UserController.prototype.logout = function () {
                var _this = this;
                this.UserService.logout().then(function (res) {
                    _this.$cookies.remove('token');
                    _this.$state.transitionTo('main.home', null, { reload: true, notify: true });
                }).catch(function (err) {
                    console.log(err);
                });
            };
            return UserController;
        }());
        Controllers.UserController = UserController;
    })(Controllers = passportDemo.Controllers || (passportDemo.Controllers = {}));
})(passportDemo || (passportDemo = {}));
