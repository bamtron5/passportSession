"use strict";
var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var session = require("express-session");
var MongoStore = require('connect-mongo')(session);
var index_1 = require("./routes/index");
var app = express();
if (app.get('env') === 'development') {
    var dotenv = require('dotenv');
    dotenv.load();
}
require("./config/passport");
app.set('trust proxy', 1);
var sess = {
    maxAge: 172800000,
    secure: false,
    httpOnly: true
};
if (app.get('env') === 'production') {
    sess.secure = true;
}
app.use(session({
    cookie: sess,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.MONGO_URI
    }),
    unset: 'destroy',
    resave: false,
    saveUninitialized: false
}));
var dbc = mongoose.connect(process.env.MONGO_URI);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/ngApp', express.static(path.join(__dirname, 'ngApp')));
app.use('/api', express.static(path.join(__dirname, 'api')));
app.use('/', index_1.default);
app.use('/api', require('./api/users'));
app.get('/*', function (req, res, next) {
    if (/.js|.html|.css|templates|js|scripts/.test(req.path) || req.xhr) {
        return next({ status: 404, message: 'Not Found' });
    }
    else {
        return res.render('index');
    }
});
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use(function (err, req, res, next) {
    res.status(err['status'] || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
module.exports = app;
