#Passport Local w/ Express-Session
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
`npm i --save connect-mongo express-session passport passport-http-bearer passport-local jsonwebtoken`

`npm i --save @types/connect-mongo @types/express-session @types/passport @types/passport-http-bearer @types/passport-local @types/jsonwebtoken`

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

**require in:** `./app.ts`: 

```javascript
//config for passport login
require("./config/passport");`
```

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
    id: this._id.toString(),
    _id: this._id,
    username: this.username,
    email: this.email
  }, process.env.JWT_SECRET, {expiresIn: '2 days'});
});

export default mongoose.model<IUser>("User", UserSchema);

```
