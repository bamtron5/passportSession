#Passport Local w/ Express-Session
##Prereq
I assume you have a User model and a mongoose connection.

##Installation and Types
`npm i --save connect-mongo express-session passport passport-http-bearer passport-local`

`npm i --save @types/connect-mongo @types/express-session @types/passport @types/passport-http-bearer @types/passport-local`

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

**require in:** `./app.ts`: 

```javascript
//config for passport login
require("./config/passport");`
```
