var passportDemo;
(function (passportDemo) {
    var Services;
    (function (Services) {
        var UserService = (function () {
            function UserService($resource) {
                this.$resource = $resource;
                this.LogoutResource = $resource('/api/Logout/Local');
                this.LoginResource = $resource('/api/Login/Local');
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
    })(Services = passportDemo.Services || (passportDemo.Services = {}));
})(passportDemo || (passportDemo = {}));
