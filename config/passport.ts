import * as passport from 'passport';
import * as mongoose from 'mongoose';
let LocalStrategy = require('passport-local').Strategy;
let BearerStrategy = require('passport-http-bearer').Strategy;
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
    profileFields: ['id', 'displayName', 'photos']
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
