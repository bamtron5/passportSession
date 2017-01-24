"use strict";
var express = require("express");
var passport = require("passport");
var router = express.Router();
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});
router.get('/login/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { session: true, failureRedirect: '/', successRedirect: '/' }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = router;
