var passportDemo;
(function (passportDemo) {
    var Factories;
    (function (Factories) {
        var UserFactory = (function () {
            function UserFactory() {
            }
            UserFactory.prototype.create = function (sessionId, userId, userRole) {
                this.id = sessionId;
                this.userId = userId;
                this.userRole = userRole;
            };
            ;
            UserFactory.prototype.destroy = function () {
                this.id = null;
                this.userId = null;
                this.userRole = null;
            };
            ;
            return UserFactory;
        }());
        Factories.UserFactory = UserFactory;
        angular.module('passportDemo').factory('UserFactory', UserFactory);
    })(Factories = passportDemo.Factories || (passportDemo.Factories = {}));
})(passportDemo || (passportDemo = {}));
