"use strict";
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var User_1 = require("../models/User");
var jwt = require("jsonwebtoken");
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});
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
