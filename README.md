#Passport Local w/ Express-Session
Passport is great for middle and configuration.  Express-Session will supply a cid cookie `connectionId`, a token cookie from jwt, and a mongo table that will track user sessions in your DB.  This gives your app persistance in the client and tracking in the DB if need be.  

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
`npm i --save connect-mongo express-session passport passport-http-bearer passport-local jsonwebtoken crypto`

`npm i --save @types/connect-mongo @types/express-session @types/passport @types/passport-http-bearer @types/passport-local @types/jsonwebtoken @types/crypto`

##Configure Passport

**create:** `./config/passport.ts`

**edit:** `./config/passport.ts`
```javascript
import * as passport from 'passport';
import * as mongoose from 'mongoose';
let LocalStrategy = require('passport-local').Strategy;
let BearerStrategy = require('passport-http-bearer').Strategy;
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

passport.use(new BearerStrategy(
  function(token, done) {
    let user = jwt.verify(token, process.env.JWT_SECRET);
    User.findOne({ username: user.username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user);
    }).select('-passwordHash -salt');
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

*note:* Please note this line `.select('-passwordHash -salt');`.  This will prevent your `passport.authenticate('bearer')` (*token checks*) from returning a passwordHash and salt.  !!!

*note:* Passport is useful middle ware to check the token before routing.  During this time it will also set `req.user`.  The next call in the stack can be checked for the user by req.  

*note* Passport `BearerStrategy` has access to your server token.  This token will be set in our `/api/Local/Login` method.

##Configure your Session
Here is what the main server file should resemble.  Please read my comments and note the imports of 
* `import * as passport from 'passport';`
* `import * as session from 'express-session';`
* `const MongoStore = require('connect-mongo')(session);`
```
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

//Seed an admin user
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
app.use(bodyParser.urlencoded({ extended: false }));
...

```
*note* init passport with this line `app.use(passport.initialize());`
*note* `sess.secure` will set our secure flag on https servers for deployment.

## User Model
```javascript
import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

export interface IUser extends mongoose.Document {
  username: { type: String, lowercase: true, unique: true},
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  salt: String,
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
    _id: this._id,
    username: this.username,
    email: this.email
  }, process.env.JWT_SECRET, {expiresIn: '2 days'});
});

export default mongoose.model<IUser>("User", UserSchema);

```

This is not just a model.  Methods are associated with the User model to assist the process of validating passwords, setting passwords hashes, and signing tokens.

## Users API

**create:** `./api/users.ts`
```javascript
import express = require('express');
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import * as session from 'express-session';
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
  passport.authenticate('bearer', function(err, user) {
    if (err) return next(err);
    if (!user) return res.status(200).json({});
    return res.status(200).json(user);
  })(req, res, next);
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

router.post('/Login/Local', function(req, res, next) {
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: "Please fill out every field"});
  }

  passport.authenticate('local', function(err, user, info) {
    if(err) return next(err);
    if(user) {
      let token = user.generateJWT();
      return res.json({ token: token});
    }
      return res.status(400).json(info);
  })(req, res, next);
});

router.get('/Logout/Local', function(req, res, next) {
  req.logout();

  req.session.destroy((err) => {
    if (err) return res.status(500).json({message: 'still authenticated, please try again.'});
    req.user = null;
    return res.redirect('/');
  });
});

export = router;

```
*note* `/api/currentuser` will inspect the token and return the user.  It has a callback to override a `401` server status i.e. `UNAUTHORIZED REQUEST` because this method is merely for token inspection and the status of the user session.
