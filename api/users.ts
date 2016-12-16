import express = require('express');
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import * as session from 'express-session';
import User from '../models/User';
let router = express.Router();

router.get('/users/:id', function(req, res, next) {
  User.findOne(req.params._id).select('-passwordHash -salt').then((user) => {
    return res.status(200).send({"user": user});
  }).catch((err) => {
    return res.status(404).send({err: 'User not found.'})
  });
});

router.get('/currentuser',
  passport.authenticate('bearer'),
  function(req, res, next) {
    User.findOne({_id: req.user._id}).select('-passwordHash -salt').then((user) => {
      return res.send(user);
    }).catch((err) =>{
      return res.status(100).send({"message": `Unauthorized`, err: err})
    });
});
// router.get('/currentuser',
//   passport.authenticate('local'),
//   function(req, res, next) {
//     console.log(req.user);
//     if(req.user) res.json(req.user);
//     res.json({"message": "unauthenitcated"})
//   });

router.post('/Register', function(req, res, next) {
  let user = new User();
  user.username = req.body.username;
  user.email = req.body.email;
  user.setPassword(req.body.password);
  user.save(function(err, user) {
    if(err) return next(err);
    console.log('-==new User==-');
    console.log(user.username);
    res.status(200).send({message: "Registration complete."});
  });
});

router.post('/Login/Local', function(req, res, next) {
  if(!req.body.username || !req.body.password){
    console.log(req.body);
    return res.status(400).send("Please fill out every field");
  }
  passport.authenticate('local', function(err, user, info) {
    console.log('--= Passport Auth =--');
    if(err) return next(err);
    if(user) {
      let token = user.generateJWT();

      //set cookie for token
      req.session.regenerate(function(err) {
        console.log('testing for unexp server cookie');
      });

      req.session.save(function(err) {
        console.log('session saved');
        console.log('session err:', err);
      });

      console.log('token granted for: ', user.username);
      return res.json({ token: token});
    }
      return res.status(400).send(info);
  })(req, res, next);
});

router.get('/Logout/Local', function(req, res, next) {
  req.logout();

  req.session.destroy((err) => {
    if (err) return res.status(500).send({message: 'still authenticated, please try again.'});
    req.user = null;
    return res.redirect('/');
  });
});

export = router;
