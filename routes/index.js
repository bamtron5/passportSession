"use strict";
var express = require("express");
var passport = require("passport");
var router = express.Router();
router.get('/', require('connect-ensure-login').ensureLoggedIn(), function (req, res, next) {
    res.render('index', { title: 'Express' });
});
router.get('/login/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function (req, res) {
    res.redirect('/');
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
