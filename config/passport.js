"use strict";
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var Users_1 = require("../models/Users");
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    Users_1.User.findOne({ _id: obj._id }, { passwordHash: 0, salt: 0 }, function (err, user) {
        if (err)
            done(null, {});
        done(null, user);
    });
});
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.ROOT_URL + "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos'],
    display: 'popup'
}, function (accessToken, refreshToken, profile, done) {
    Users_1.User.findOne({ facebookId: profile.id }, function (err, user) {
        if (user) {
            return done(err, user);
        }
        else {
            var u_1 = new Users_1.User();
            u_1.username = profile.displayName;
            u_1.facebookId = profile.id;
            u_1.facebook.name = profile.displayName;
            u_1.facebook.token = accessToken;
            u_1.save(function (err) {
                if (err)
                    throw err;
                return done(null, u_1);
            });
        }
    });
}));
passport.use(new LocalStrategy(function (username, password, done) {
    Users_1.User.findOne({ username: username }, function (err, user) {
        if (err)
            return done(err);
        if (!user)
            return done(null, false, { message: 'Incorrect username.' });
        if (!user.validatePassword(password))
            return done(null, false, { message: 'Password does not match.' });
        return done(null, user);
    });
}));
