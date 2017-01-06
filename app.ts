import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as ejs from 'ejs';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as session from 'express-session';
const MongoStore = require('connect-mongo')(session);
import routes from './routes/index';
import {User} from './models/Users';

//create the app
let app = express();

//load your env vars
if (app.get('env') === 'development') {
  let dotenv = require('dotenv');
  dotenv.load();
}

//config for passport login
require("./config/passport");

//config req.session your session
app.set('trust proxy', 1); // trust first proxy
let sess = {
  maxAge: 172800000, // 2 days
  secure: false,
  httpOnly: true
}

//set to secure in production
if (app.get('env') === 'production') {
  sess.secure = true // serve secure cookies
}

//connect to DB
let dbc = mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on('connected', () => {

  //use session config
  app.use(session({
    cookie: sess,
    secret: process.env.SESSION_SECRET, // can support an array
    store: new MongoStore({
      url: process.env.MONGO_URI
    }),
    unset: 'destroy',
    resave: false,
    saveUninitialized: false //if nothing has changed.. do not restore cookie
  }));

  User.findOne({username: 'admin'}, (err, user) => {
    if(err) return;
    if(user) return;
    if(!user)
      var admin = new User();
      admin.email = process.env.ADMIN_EMAIL;
      admin.username = process.env.ADMIN_USERNAME;
      admin.setPassword(process.env.ADMIN_PASSWORD);
      admin.roles = ['user', 'admin'];
      admin.save();
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//initializer methods for express
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));

//pathing
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/ngApp', express.static(path.join(__dirname, 'ngApp')));

//mount api
app.use('/api', require('./api/users'));

//routes
app.use('/', routes);

// redirect 404 to home for the sake of AngularJS client-side routes
app.get('/*', function(req, res, next) {
  if (/.js|.html|.css|templates|js|scripts/.test(req.path) || req.xhr) {
    return next({ status: 404, message: 'Not Found' });
  } else {
    return res.render('index');
  }
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err['status'] = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, res) => {
    res.status(err['status'] || 500);
    res.render('error', {
      message: err['message'],
      error: err
    });
  });
}

// production error handler
app.use((err, res) => {
  res.status(err['status'] || 500);
  res.render('error', {
    message: err['message'],
    error: {}
  });
});

export = app;
