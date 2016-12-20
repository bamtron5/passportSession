namespace passportDemo.Factories {

  export class UserFactory {
    public id;
    public userId;
    public userRole;

    create(sessionId, userId, userRole) {
      this.id = sessionId;
      this.userId = userId;
      this.userRole = userRole;
    };

    destroy(){
      this.id = null;
      this.userId = null;
      this.userRole = null;
    };
  }

  angular.module('passportDemo').factory('UserFactory', UserFactory);
}
