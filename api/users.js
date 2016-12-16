"use strict";
var express = require("express");
var passport = require("passport");
var User_1 = require("../models/User");
var router = express.Router();
router.get('/users/:id', function (req, res, next) {
    User_1.default.findOne(req.params._id).select('-passwordHash -salt').then(function (user) {
        return res.status(200).json(user);
    }).catch(function (err) {
        return res.status(404).json({ err: 'User not found.' });
    });
});
router.get('/currentuser', function (req, res, next) {
    passport.authenticate('bearer', function (err, user) {
        if (err)
            return next(err);
        if (!user)
            return res.status(200).json({});
        console.log(req.isAuthenticated());
        return res.status(200).json(user);
    })(req, res, next);
});
router.post('/Register', function (req, res, next) {
    var user = new User_1.default();
    user.username = req.body.username;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    user.save(function (err, user) {
        if (err)
            return next(err);
        res.status(200).json({ message: "Registration complete." });
    });
});
router.post('/Login/Local', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Please fill out every field" });
    }
    passport.authenticate('local', function (err, user, info) {
        if (err)
            return next(err);
        if (user) {
            var token_1 = user.generateJWT();
            return req.logIn(user, function (err) {
                if (err)
                    res.status(500).json({ message: 'login failed' });
                return req.session.save(function (err) {
                    if (err)
                        res.status(500).json({ message: 'session failed' });
                    return res.json({ token: token_1, isAuthenticated: req.isAuthenticated() });
                });
            });
        }
        return res.status(400).json(info);
    })(req, res, next);
});
router.get('/Logout/Local', function (req, res, next) {
    req.logout();
    req.session.destroy(function (err) {
        if (err)
            return res.status(500).json({ message: 'still authenticated, please try again.' });
        req.user = null;
        return res.json({ isAuthenticated: req.isAuthenticated() });
    });
});
module.exports = router;
