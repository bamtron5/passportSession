var passportDemo;
(function (passportDemo) {
    var Controllers;
    (function (Controllers) {
        var MainController = (function () {
            function MainController(UserService, $state, currentUser, Session) {
                this.UserService = UserService;
                this.$state = $state;
                this.Session = Session;
                this.self = this;
                this.currentUser = currentUser;
            }
            MainController.prototype.logout = function () {
                var _this = this;
                this.UserService.logout().then(function () {
                    _this.Session.destroy();
                    _this.$state.go('main.home', null, { reload: true, notify: true });
                }).catch(function () {
                    throw new Error('Unsuccessful logout');
                });
            };
            return MainController;
        }());
        Controllers.MainController = MainController;
        var HomeController = (function () {
            function HomeController($state, Session) {
                this.$state = $state;
                this.currentUser = Session.getUser();
            }
            return HomeController;
        }());
        Controllers.HomeController = HomeController;
        var UserController = (function () {
            function UserController(UserService, $state, Session) {
                this.UserService = UserService;
                this.$state = $state;
                this.Session = Session;
            }
            UserController.prototype.login = function (user) {
                var _this = this;
                this.UserService.login(user).then(function (res) {
                    _this.Session.create(res);
                    _this.$state.go('main.profile');
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
                this.currentUser = currentUser;
                if (!currentUser['username']) {
                    $state.go('main.login', null, { reload: true, notify: true });
                }
                if (currentUser['facebookId']) {
                    this.avatar = "//graph.facebook.com/v2.8/" + currentUser['facebookId'] + "/picture";
                }
                else {
                    this.avatar = '//placehold.it/350x350';
                }
            }
            return ProfileController;
        }());
        Controllers.ProfileController = ProfileController;
    })(Controllers = passportDemo.Controllers || (passportDemo.Controllers = {}));
})(passportDemo || (passportDemo = {}));
