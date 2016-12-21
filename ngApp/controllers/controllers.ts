  namespace passportDemo.Controllers {
  export class MainController {
    public currentUser;
    public self = this;

    constructor(
      private UserService: passportDemo.Services.UserService,
      private $state: ng.ui.IStateService,
      currentUser: ng.ui.IResolvedState
    ) {
      this.currentUser = currentUser;
    }

    logout() {
      this.UserService.logout().then(() => {
        this.$state.go('main.home', null, {reload: true, notify:true});
      }).catch(() => {
        throw new Error('Unsuccessful logout');
      });
    }
  }

  export class HomeController {
    public currentUser;
    constructor(
      private $state: ng.ui.IStateService,
      currentUser: ng.ui.IResolvedState
    ) {

      this.currentUser = currentUser;
    }
  }

  export class UserController {
    public user;
    public currentUser;
    public isLoggedIn;

    public login(user) {
      this.UserService.login(user).then((res) => {
        this.$state.go('main.profile', null, {reload: true, notify:true});
      }).catch((err) => {
        alert('Bunk login, please try again.');
      });
    }

    public register(user) {
      this.UserService.register(user).then((res) => {
        this.$state.go('main.login');
      }).catch((err) => {
        alert('Registration error: please try again.');
      });
    }

    constructor(
      private UserService:passportDemo.Services.UserService,
      private $state: ng.ui.IStateService
    ) {
    }
  }

  export class ProfileController {
    public avatar:string;
    public currentUser;
    constructor(
      currentUser: ng.ui.IResolvedState,
      $state: ng.ui.IStateService
    ) {

      this.currentUser = currentUser;
      //u must b auth br0 *redirected w/ angular*
      //should be done from stateProvider
      if(!currentUser['username']) {
        $state.go('main.login', null, { reload: true, notify: true });
      }

      if(currentUser['facebookId']){
        this.avatar = `//graph.facebook.com/v2.8/${currentUser['facebookId']}/picture`;
      } else {
        this.avatar = '//placehold.it/350x350';
      }
    }
  }
}
