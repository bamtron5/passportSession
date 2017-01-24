"use strict";
var express = require("express");
var passport = require("passport");
var Users_1 = require("../models/Users");
var router = express.Router();
router.get('/users/:id', function (req, res, next) {
    Users_1.User.findOne(req.params._id).select('-passwordHash -salt').then(function (user) {
        return res.json(user);
    }).catch(function (err) {
        return next({ message: 'Error getting user.', error: err });
    });
});
router.get('/currentuser', function (req, res, next) {
    return res.json(req.user);
});
router.post('/Register', function (req, res, next) {
    var user = new Users_1.User();
    user.username = req.body.username;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    user.save(function (err, user) {
        if (err)
            return next(err);
        res.json({ message: 'Registration complete.' });
    });
});
router.post('/login/local', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'Please fill out every field' });
    }
    passport.authenticate('local', { session: true }, function (err, user, info) {
        if (err)
            res.status(500);
        if (user) {
            return req.logIn(user, function (err) {
                if (err)
                    next({ message: 'login failed', error: err });
                return req.session.save(function (err) {
                    if (err)
                        next({ message: 'session failed', error: err });
                    return res.redirect('/profile');
                });
            });
        }
    })(req, res, next);
});
router.get('/logout/local', function (req, res, next) {
    req.session.destroy(function (err) {
        if (err)
            return res.status(500).json({ message: 'still authenticated, please try again.' });
        req.logout();
        req.user = null;
        return res.json({ isAuthenticated: req.isAuthenticated() });
    });
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
