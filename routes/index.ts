import * as express from 'express';
import * as passport from 'passport';
let router = express.Router();

/* GET home page. */
router.get('/', require('connect-ensure-login').ensureLoggedIn(),
  function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

router.get('/login/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

router.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

export default router;
