var passportDemo;
(function (passportDemo) {
    var Services;
    (function (Services) {
        var UserService = (function () {
            function UserService($resource) {
                this.$resource = $resource;
                this.LogoutResource = $resource('/api/logout/local');
                this.LoginResource = $resource('/api/login/local');
                this.RegisterResource = $resource('/api/Register');
                this.UserResource = $resource('/api/users/:id');
            }
            UserService.prototype.login = function (user) {
                return this.LoginResource.save(user).$promise;
            };
            UserService.prototype.logout = function () {
                return this.LogoutResource.get().$promise;
            };
            UserService.prototype.register = function (user) {
                return this.RegisterResource.save(user).$promise;
            };
            UserService.prototype.getUser = function (id) {
                return this.UserResource.get(id).$promise;
            };
            UserService.prototype.getCurrentUser = function () {
                return this.$resource('/api/currentuser').get().$promise;
            };
            return UserService;
        }());
        Services.UserService = UserService;
        angular.module('passportDemo').service('UserService', UserService);
        var Session = (function () {
            function Session($sessionStorage) {
                this.$sessionStorage = $sessionStorage;
                this.user = this.getUser();
            }
            Session.prototype.create = function (user) {
                this.$sessionStorage['user'] = user;
            };
            Session.prototype.isAuthenticated = function () {
                var user = this.getUser();
                return !!user['username'];
            };
            Session.prototype.isAuthorized = function (roles) {
                var user = this.getUser();
                if (!user['roles']) {
                    return false;
                }
                if (!angular.isArray(roles)) {
                    roles = [roles];
                }
                return roles.some(function (v, k) {
                    for (var i in user['roles']) {
                        if (user['roles'][i] === v) {
                            return true;
                        }
                    }
                });
            };
            Session.prototype.getUser = function () {
                return this.$sessionStorage['user'] || {};
            };
            Session.prototype.destroy = function () {
                this.$sessionStorage.$reset();
                this.$sessionStorage['user'] = {};
            };
            return Session;
        }());
        Services.Session = Session;
        angular.module('passportDemo').service('Session', Session);
    })(Services = passportDemo.Services || (passportDemo.Services = {}));
})(passportDemo || (passportDemo = {}));
