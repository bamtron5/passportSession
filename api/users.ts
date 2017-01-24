import * as express from 'express';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as session from 'express-session';
import {User, IUser} from '../models/Users';
let router = express.Router();

router.get('/users/:id', function(req, res, next) {
  User.findOne(req.params._id).select('-passwordHash -salt').then((user) => {
    return res.json(user);
  }).catch((err) => {
    return next({message: 'Error getting user.', error: err});
  });
});

//CONSTANTLY RETURNS 200 because we are always authorized to check.
router.get('/currentuser', (req, res, next) => {
  return res.json(req.user);
});

router.post('/Register', function(req, res, next) {
  let user = new User();
  user.username = req.body.username;
  user.email = req.body.email;
  user.setPassword(req.body.password);
  user.save(function(err, user) {
    if(err) return next(err);
    res.json({message: 'Registration complete.'});
  });
});

router.post('/login/local', function(req, res, next) {
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out every field'});
  }

  passport.authenticate('local', {session: true}, function(err, user, info) {
    if(err) res.status(500);
    if(user) {
      return req.logIn(user, (err) => {
        if (err) next({message: 'login failed', error: err});
        return req.session.save(function (err){
          if (err) next({message: 'session failed', error: err});
          return res.redirect('/profile');
        });
      });
    }
  })(req, res, next);
});

router.get('/logout/local', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({message: 'still authenticated, please try again.'});
    req.logout();
    req.user = null;
    return res.json({isAuthenticated: req.isAuthenticated()});
  });
});

export default router;
