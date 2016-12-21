"use strict";
var express = require("express");
var passport = require("passport");
var methods_1 = require("../api/methods");
var router = express.Router();
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});
router.get('/login/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { session: true, failureRedirect: '/login' }), function (req, res, next) {
    var token = req.user.generateJWT();
    return methods_1.default.setSession(req, res, next, req.user);
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
