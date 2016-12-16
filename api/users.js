"use strict";
var express = require("express");
var passport = require("passport");
var User_1 = require("../models/User");
var router = express.Router();
router.get('/users/:id', function (req, res, next) {
    User_1.default.findOne(req.params._id).select('-passwordHash -salt').then(function (user) {
        return res.status(200).send({ "user": user });
    }).catch(function (err) {
        return res.status(404).send({ err: 'User not found.' });
    });
});
router.get('/currentuser', passport.authenticate('bearer'), function (req, res, next) {
    User_1.default.findOne({ _id: req.user._id }).select('-passwordHash -salt').then(function (user) {
        return res.send(user);
    }).catch(function (err) {
        return res.status(100).send({ "message": "Unauthorized", err: err });
    });
});
router.post('/Register', function (req, res, next) {
    var user = new User_1.default();
    user.username = req.body.username;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    user.save(function (err, user) {
        if (err)
            return next(err);
        console.log('-==new User==-');
        console.log(user.username);
        res.status(200).send({ message: "Registration complete." });
    });
});
router.post('/Login/Local', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        console.log(req.body);
        return res.status(400).send("Please fill out every field");
    }
    passport.authenticate('local', function (err, user, info) {
        console.log('--= Passport Auth =--');
        if (err)
            return next(err);
        if (user) {
            var token = user.generateJWT();
            req.session.regenerate(function (err) {
                console.log('testing for unexp server cookie');
            });
            req.session.save(function (err) {
                console.log('session saved');
                console.log('session err:', err);
            });
            console.log('token granted for: ', user.username);
            return res.json({ token: token });
        }
        return res.status(400).send(info);
    })(req, res, next);
});
router.get('/Logout/Local', function (req, res, next) {
    req.logout();
    req.session.destroy(function (err) {
        if (err)
            return res.status(500).send({ message: 'still authenticated, please try again.' });
        req.user = null;
        return res.redirect('/');
    });
});
module.exports = router;
