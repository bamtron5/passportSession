"use strict";
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User_1 = require("../models/User");
var jwt = require("jsonwebtoken");
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.ROOT_URL + "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos']
}, function (accessToken, refreshToken, profile, done) {
    User_1.default.findOne({ facebookId: profile.id }, function (err, user) {
        if (user) {
            return done(err, user);
        }
        else {
            var u_1 = new User_1.default();
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
passport.use(new BearerStrategy(function (token, done) {
    var user = jwt.verify(token, process.env.JWT_SECRET);
    User_1.default.findOne({ username: user.username }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }).select('-passwordHash -salt');
}));
passport.use(new LocalStrategy(function (username, password, done) {
    User_1.default.findOne({ username: username }, function (err, user) {
        if (err)
            return done(err);
        if (!user)
            return done(null, false, { message: 'Incorrect username.' });
        if (!user.validatePassword(password))
            return done(null, false, { message: 'Password does not match.' });
        return done(null, user);
    });
}));
