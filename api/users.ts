import express = require('express');
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import * as session from 'express-session';
import User from '../models/User';
let router = express.Router();

router.get('/users/:id', function(req, res, next) {
  User.findOne(req.params._id).select('-passwordHash -salt').then((user) => {
    return res.status(200).json(user);
  }).catch((err) => {
    return res.status(404).json({err: 'User not found.'})
  });
});

//CONSTANTLY RETURNS 200 because we are always authorized to check.
router.get('/currentuser', (req, res, next) => {
  passport.authenticate('bearer', function(err, user) {
    if (err) return next(err);
    if (!user) return res.status(200).json({});
    return res.status(200).json(user);
  })(req, res, next);
});

router.post('/Register', function(req, res, next) {
  let user = new User();
  user.username = req.body.username;
  user.email = req.body.email;
  user.setPassword(req.body.password);
  user.save(function(err, user) {
    if(err) return next(err);
    res.status(200).json({message: "Registration complete."});
  });
});

router.post('/Login/Local', function(req, res, next) {
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: "Please fill out every field"});
  }

  passport.authenticate('local', function(err, user, info) {
    if(err) return next(err);
    if(user) {
      let token = user.generateJWT();
      return res.json({ token: token});
    }
      return res.status(400).json(info);
  })(req, res, next);
});

router.get('/Logout/Local', function(req, res, next) {
  req.logout();

  req.session.destroy((err) => {
    if (err) return res.status(500).json({message: 'still authenticated, please try again.'});
    req.user = null;
    return res.redirect('/');
  });
});

export = router;
