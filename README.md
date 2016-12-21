#Passport Local w/ Express-Session
Passport is great for middleware functions and configuration.  Express-Session will supply a cid cookie `connectionId`, a token cookie from jwt, and a mongo table that will track user sessions in your DB.  This gives your app persistance in the client and tracking in the DB if need be.  

##Prereq
* I assume you have a User model and a mongoose connection
* I assume are on node engine `~6.9.1` || `<7.0.0`
* I assume you are using dotenv for development env.  If not:

`npm install dotenv --save`

```javascript
if (app.get('env') === 'development') {
  let dotenv = require('dotenv');
  dotenv.load();
}
```

If you don't have NVM (Node Version Manager) please install it
[NVM Docs on .nvmrc](https://github.com/creationix/nvm#nvmrc)

**create** `.nvmrc` and add `lts/*`.  Which stands for latest.

**create** `.env`

```
MONGO_URI=mongodb://localhost:27017/passport-demo
JWT_SECRET=SecretKey
SESSION_SECRET=SecretKey
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
ADMIN_EMAIL=admin@admin.com
```

##Installation and Types
`npm i --save connect-mongo express-session passport passport-http-bearer passport-local jsonwebtoken crypto passport-facebook`

`npm i --save @types/connect-mongo @types/express-session @types/passport  @types/passport-local @types/jsonwebtoken @types/crypto @types/passport-facebook`

##Configure Passport

**create:** `./config/passport.ts`

```javascript
import * as passport from 'passport';
import * as mongoose from 'mongoose';
let LocalStrategy = require('passport-local').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
import User from '../models/User';
import * as jwt from 'jsonwebtoken';

passport.serializeUser(function(user, done) {
  // console.log('serializeUser', user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  // console.log('deserializeUser', obj);
  done(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.ROOT_URL + "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos'],
    display: 'popup'
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ facebookId: profile.id }, function (err, user) {
      if (user) {
        return done(err, user);
      } else {
        let u = new User();
        u.username = profile.displayName;
        u.facebookId = profile.id;
        u.facebook.name = profile.displayName;
        u.facebook.token = accessToken;
        u.save((err) => {
          if (err) throw err;
          return done(null, u);
        });
      }
    });
  }
));

passport.use(new LocalStrategy(function(username: String, password: string, done) {
  User.findOne({ username: username }, function(err, user) {
    if(err) return done(err);
    if(!user) return done(null, false, { message: 'Incorrect username.' });
    if(!user.validatePassword(password)) return done(null, false, { message: 'Password does not match.' });
    return done(null, user);
  });
}));

```

*note:* Please note this line `.select('-passwordHash -salt');`.  This will prevent your `passport.authenticate` (*token checks*) from returning a passwordHash and salt.  !!!

*note:* Passport is useful middle ware to check the token before routing.  During this time it will also set `req.user`.  The next call in the stack can be checked for the user by req.

##Configure your Session
Here is what the main server file should resemble.  Please read my comments and note the imports of
* `import * as passport from 'passport';`
* `import * as session from 'express-session';`
* `const MongoStore = require('connect-mongo')(session);`

**create:** `./app.ts`

```javascript
import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as ejs from 'ejs';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as session from 'express-session';
const MongoStore = require('connect-mongo')(session);
import routes from './routes/index';
import User from './models/User';

//create the app
let app = express();

//load your env vars
if (app.get('env') === 'development') {
  let dotenv = require('dotenv');
  dotenv.load();
}

//config for passport login
require("./config/passport");

//config req.session your session
app.set('trust proxy', 1); // trust first proxy
let sess = {
  maxAge: 172800000, // 2 days
  secure: false,
  httpOnly: true
}

//set to secure in production
if (app.get('env') === 'production') {
  sess.secure = true // serve secure cookies
}

//use session config
app.use(session({
  cookie: sess,
  secret: process.env.SESSION_SECRET, // can support an array
  store: new MongoStore({
    url: process.env.MONGO_URI
  }),
  unset: 'destroy',
  resave: false,
  saveUninitialized: false //if nothing has changed.. do not restore cookie
}));

//connect to DB
let dbc = mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on('connected', () => {
  User.findOne({username: 'admin'}, (err, user) => {
    if(err) return;
    if(user) return;
    if(!user)
      var admin = new User();
      admin.email = process.env.ADMIN_EMAIL;
      admin.username = process.env.ADMIN_USERNAME;
      admin.setPassword(process.env.ADMIN_PASSWORD);
      admin.roles = ['user', 'admin'];
      admin.save();
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//initializer methods for express
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));

//pathing
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/ngApp', express.static(path.join(__dirname, 'ngApp')));

//mount api
app.use('/api', require('./api/users'));

//routes
app.use('/', routes);
...

```
*note:* init passport with this line `app.use(passport.initialize());` then `app.use(passport.session())`

*note:* `sess.secure` will set our secure flag on https servers for deployment.

## User Model
```javascript
import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export interface IFacebook {
  token: string,
  name: string,
  email: string
}

export interface IUser extends mongoose.Document {
  username: { type: String, lowercase: true, unique: true},
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  salt: String,
  facebookId: String,
  facebook: IFacebook,
  setPassword(password: string): boolean,
  validatePassword(password: string): boolean,
  generateJWT(): JsonWebKey,
  roles: Array<String>
}

let UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, unique: true},
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  salt: String,
  facebookId: String,
  facebook: {
    token: String,
    name: String,
    email: String
  },
  roles: {type: Array, default: ['user']}
});

UserSchema.method('setPassword', function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
});

UserSchema.method('validatePassword', function(password) {
  let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return (hash === this.passwordHash);
});

UserSchema.method('generateJWT', function() {
  return jwt.sign({
    id: this._id.toString(),
    _id: this._id,
    username: this.username,
    email: this.email
  }, process.env.JWT_SECRET, {expiresIn: '2 days'});
});

export default mongoose.model<IUser>("User", UserSchema);
```

*note:* Methods are associated with the User model to assist the process of validating passwords, setting passwords hashes, and signing tokens.

## API Methods
*create `./api/methods.ts`*

```javascript
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import * as session from 'express-session';
import User from '../models/User';
let router = express.Router();

//Express has Express.Request but the interface isn't very good...  requires overrides
function setSession(req, res, next, user) {
  let token = user.generateJWT();

  return req.logIn(user, (err) => {
    if (err) res.status(500).json({message: 'login failed'});
    return req.session.save(function (err){
      if (err) res.sendStatus(500).json({message: 'session failed'});
      return res.redirect('/profile');
    });
  });
}

function destroySession(req, res, next) {
  req.logout();

  req.session.destroy((err) => {
    if (err) return res.status(500).json({message: 'still authenticated, please try again.'});
    req.user = null;
    return res.json({isAuthenticated: req.isAuthenticated()});
  });
}

const methods = {
  setSession: setSession,
  destroySession: destroySession
}

export default methods;
```

## Users API

**create:** `./api/users.ts`
```javascript
import express = require('express');
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import * as session from 'express-session';
import methods from './methods';
import User from '../models/User';
let router = express.Router();

router.get('/users/:id', function(req, res, next) {
  User.findOne(req.params._id).select('-passwordHash -salt').then((user) => {
    return res.status(200).json(user);
  }).catch((err) => {
    return res.status(404).json({err: 'User not found.'})
  });
});

//CONSTANTLY RETURNS 200 because we are always authorized to check.
router.get('/currentuser', (req, res, next) => {
  if (!req.user) return res.json({});
  return res.json(req.user);
});

router.post('/Register', function(req, res, next) {
  let user = new User();
  user.username = req.body.username;
  user.email = req.body.email;
  user.setPassword(req.body.password);
  user.save(function(err, user) {
    if(err) return next(err);
    res.status(200).json({message: "Registration complete."});
  });
});

router.post('/login/local', function(req, res, next) {
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: "Please fill out every field"});
  }

  passport.authenticate('local', function(err, user, info) {
    if(err) return next(err);
    if(user) return methods.setSession(req, res, next, user);
    return res.status(400).json(info);
  })(req, res, next);
});

router.get('/logout/local', methods.destroySession);

export = router;

```
*note:* Passport should login, then session should be saved in db.  Session is destroyed and passports logs out on logout.

## Angular App
```javascript
namespace passportDemo {
  angular.module('passportDemo', ['ui.router', 'ngResource'])
    .config((
      $resourceProvider: ng.resource.IResourceServiceProvider,
      $stateProvider: ng.ui.IStateProvider,
      $urlRouterProvider: ng.ui.IUrlRouterProvider,
      $locationProvider: ng.ILocationProvider,
      $httpProvider: ng.IHttpProvider
    ) => {
      // Define routes
      $stateProvider
        .state('main', {
          url: '',
          abstract: true,
          templateUrl: '/ngApp/views/main.html',
          controller: passportDemo.Controllers.MainController,
          controllerAs: 'vm',
          resolve: {
            currentUser: [
              'UserService', '$state', (UserService, $state) => {
                return UserService.getCurrentUser((user) => {
                  return user;
                }).catch((e) => {
                  return { username: false };
                });
              }]
          }
        })
        .state('main.home', {
          url: '/',
          parent: 'main',
          templateUrl: '/ngApp/views/home.html',
          controller: passportDemo.Controllers.HomeController,
          controllerAs: 'vm'
        })
        .state('main.register', {
          url: '/register',
          templateUrl: '/ngApp/views/register.html',
          controller: passportDemo.Controllers.UserController,
          controllerAs: 'vm'
        })
        .state('main.login', {
          url: '/login',
          templateUrl: '/ngApp/views/login.html',
          controller: passportDemo.Controllers.UserController,
          controllerAs: 'vm'
        })
        .state('main.profile', {
          url: '/profile',
          templateUrl: '/ngApp/views/profile.html',
          controller: passportDemo.Controllers.ProfileController,
          controllerAs: 'vm'
        })
        .state('notFound', {
          url: '/notFound',
          templateUrl: '/ngApp/views/notFound.html'
        })
        .state('main.authsuccess', {
          url: '/authsuccess',
          templateUrl: '/ngApp/views/authsuccess.html',
          controller: passportDemo.Controllers.ProfileController,
          controllerAs: 'vm'
        });

      // Handle request for non-existent route
      $urlRouterProvider.otherwise('/notFound');

      // Enable HTML5 navigation
      // allow express routing
      $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: false
      });

      //for authInterceptor factory
      $httpProvider.interceptors.push('authInterceptor');
    }).factory('authInterceptor',
      ['$q','$location',
      function ($q, $location) {
      return {
        // Add authorization token to headers PER req
        request: function (config) {
          config.headers = config.headers || {};
          return config;
        },

        // Intercept 401s/500s and redirect you to login
        responseError: function(response) {
          if(response.status === 401) {
            // good place to explain to the user why or redirect
            console.info(`this account needs to authenticate to ${response.config.method} ${response.config.url}`);
          }
          if(response.status === 403) {
            alert('unauthorized permission for your account.');
            // good place to explain to the user why or redirect
            // remove any stale tokens
            return $q.reject(response);
          } else {
            return $q.reject(response);
          }
        }
      }
    }])
    .run([
      '$rootScope', '$location', 'UserService', '$state', '$q',
      function($rootScope, $location, UserService, $state, $q) {
      // Redirect to login if route requires auth and you're not logged in
      $rootScope.$on('$stateChangeStart', function (event, next) {
        // console.log(`GOING TO: ${next.url}`);
      });
  }]);
}
```

*note:* we have created an `abstract` state called `main`.  ALL other states will inherit this.  It `$state.current.data.currentUser` is a promise that can be resolved in the `MainController` by our `/api/currentuser` method.

*note:* authInterceptor is a  great way for angular to redirect certain server statuses like `401 UNAUTHORIZED` or `403 FORBIDDEN`


## Controllers
```javascript
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
    currentUser: ng.ui.IResolvedState,
    private $cookies: ng.cookies.ICookiesService
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
```

## Add Angular view files
**create:** `home.html` `login.html` `register.html` `main.html` `profile.html`
Please inspect my commits for the files.  If you're having issues please contact me.

## Testing
*Login with username: `admin` and password `password`*

* Then check your db to see the session table
* Logout and make sure the session table has removed the record
* Test facebook auth.  try in different devices.

*Register a regular user*

* Login w/ this user
* Then check your db to see the session table
* Logout and make sure the session table has removed the record

![](https://media.giphy.com/media/xT9DPQvQ4wuYAbCRtC/giphy.gif "")
