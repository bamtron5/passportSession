"use strict";
var express = require("express");
var passport = require("passport");
var methods_1 = require("./methods");
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
    if (!req.user)
        return res.json({});
    return res.json(req.user);
});
router.post('/Register', function (req, res, next) {
    console.log(req.body);
    var user = new User_1.default();
    user.username = req.body.username;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    user.save(function (err, user) {
        console.log(err);
        if (err)
            return next(err);
        res.status(200).json({ message: "Registration complete." });
    });
});
router.post('/login/local', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Please fill out every field" });
    }
    passport.authenticate('local', function (err, user, info) {
        if (err)
            return next(err);
        if (user)
            return methods_1.default.setSession(req, res, next, user);
        return res.status(400).json(info);
    })(req, res, next);
});
router.get('/logout/local', methods_1.default.destroySession);
module.exports = router;
