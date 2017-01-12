namespace passportDemo.Services {

    export class UserService {
      private LoginResource;
      private LogoutResource;
      private RegisterResource;
      public UserResource;
      private isLoggedIn;

      public login(user) {
        return this.LoginResource.save(user).$promise;
      }

      public logout() {
        return this.LogoutResource.get().$promise;
      }

      public register(user) {
        return this.RegisterResource.save(user).$promise;
      }

      public getUser(id) {
        return this.UserResource.get(id).$promise;
      }

      public getCurrentUser() {
        return this.$resource('/api/currentuser').get().$promise;
      }

      constructor(private $resource: ng.resource.IResourceService) {

        this.LogoutResource = $resource('/api/logout/local');
        this.LoginResource = $resource('/api/login/local');
        this.RegisterResource = $resource('/api/Register');
        this.UserResource = $resource('/api/users/:id');
      }
    }

    angular.module('passportDemo').service('UserService', UserService);

    export class Session {
      public user;

      constructor(
        private $sessionStorage: angular.storage.IStorageService
      ) {
        this.user = this.getUser();
      }

      create(user) {
        this.$sessionStorage['user'] = user;
      }

      isAuthenticated() {
        let user = this.getUser();
        return !!user['username'];
      }

      isAuthorized(roles) {
        let user = this.getUser();
        if (!user['roles']){
          return false;
        }

        if (!angular.isArray(roles)) {
          roles = [roles];
        }

        return roles.some((v, k) => {
          for(let i in user['roles']) {
            if (user['roles'][i] === v) {
              return true;
            }
          }
        });
      }

      getUser() {
        return this.$sessionStorage['user'] || {};
      }

      destroy() {
        this.$sessionStorage.$reset();
        this.$sessionStorage['user'] = {};
      }
    }

    angular.module('passportDemo').service('Session', Session);
}
