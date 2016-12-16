namespace passportDemo.Controllers {
  export class MainController {
    public currentUser;
    public self = this;

    logout() {
      this.UserService.logout().then(() => {
        this.$cookies.remove('token');
        this.$state.transitionTo('main.home', null, {reload: true, notify:true});
      }).catch(() => {
        throw new Error('Unsuccessful logout');
      });
    }

    constructor(
      private UserService: passportDemo.Services.UserService,
      private $state: ng.ui.IStateService,
      private $cookies: ng.cookies.ICookiesService,
      private $q: ng.IQService
    ) {
      $state.current.data.currentUser = $q.defer();

      this.UserService.getCurrentUser().then((user) => {
        this.currentUser = user;
        $state.current.data.currentUser.resolve(user);
      }).catch((user) => {
        this.currentUser = user;
        $state.current.data.currentUser.reject({});
      });
    }
  }

  export class HomeController {
    public currentUser;
    constructor(
      private $state: ng.ui.IStateService
    ) {
      $state.current.data.currentUser.promise.then((user) => {
        this.currentUser = user;
      }).catch((user) => {
        this.currentUser = user;
      });
    }
  }

  export class UserController {
    public user;
    public currentUser;
    public isLoggedIn;

    public login(user) {
      this.UserService.login(user).then((res) => {
        this.$cookies.put('token', res.token);
        this.$state.transitionTo('main.home', null, {reload: true, notify:true});
      }).catch((err) => {
        alert('Bunk login, please try again.');
      });
    }

    public register(user) {
      this.UserService.register(user).then((res) => {
        this.$state.go('main.login');
      }).catch((err) => {
        console.log(err);
        alert('Registration error: please try again.');
      });
    }

    public logout() {
      this.UserService.logout().then((res) => {
        this.$cookies.remove('token');
        this.$state.transitionTo('main.home', null, {reload: true, notify:true});
      }).catch((err) => {
        //TODO error handler
        console.log(err);
      });

    }

    constructor(
      private UserService:passportDemo.Services.UserService,
      private $state: ng.ui.IStateService,
      private $rootScope: ng.IRootScopeService,
      private $cookies: ng.cookies.ICookiesService,
      private $scope: ng.IScope
    ) {
    }
  }
}
