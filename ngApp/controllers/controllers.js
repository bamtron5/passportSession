var passportDemo;
(function (passportDemo) {
    var Controllers;
    (function (Controllers) {
        var MainController = (function () {
            function MainController(UserService, $state, $cookies, $q, currentUser) {
                this.UserService = UserService;
                this.$state = $state;
                this.$cookies = $cookies;
                this.$q = $q;
                this.self = this;
                this.currentUser = currentUser;
            }
            MainController.prototype.logout = function () {
                var _this = this;
                this.UserService.logout().then(function () {
                    _this.$cookies.remove('token');
                    _this.$state.go('main.home', null, { reload: true, notify: true });
                }).catch(function () {
                    throw new Error('Unsuccessful logout');
                });
            };
            return MainController;
        }());
        Controllers.MainController = MainController;
        var HomeController = (function () {
            function HomeController($state, currentUser) {
                this.$state = $state;
                this.currentUser = currentUser;
            }
            return HomeController;
        }());
        Controllers.HomeController = HomeController;
        var UserController = (function () {
            function UserController(UserService, $state, $cookies) {
                this.UserService = UserService;
                this.$state = $state;
                this.$cookies = $cookies;
            }
            UserController.prototype.login = function (user) {
                var _this = this;
                this.UserService.login(user).then(function (res) {
                    _this.$cookies.put('token', res.token);
                    _this.$state.go('main.home', null, { reload: true, notify: true });
                }).catch(function (err) {
                    alert('Bunk login, please try again.');
                });
            };
            UserController.prototype.register = function (user) {
                var _this = this;
                this.UserService.register(user).then(function (res) {
                    _this.$state.go('main.login');
                }).catch(function (err) {
                    alert('Registration error: please try again.');
                });
            };
            return UserController;
        }());
        Controllers.UserController = UserController;
        var ProfileController = (function () {
            function ProfileController(currentUser, $state) {
                if (!currentUser['username']) {
                    $state.go('main.login', null, { reload: true, notify: true });
                }
            }
            return ProfileController;
        }());
        Controllers.ProfileController = ProfileController;
    })(Controllers = passportDemo.Controllers || (passportDemo.Controllers = {}));
})(passportDemo || (passportDemo = {}));
