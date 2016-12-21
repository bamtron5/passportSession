import * as express from 'express';
import * as passport from 'passport';
import methods from '../api/methods';
let router = express.Router();

/* GET home page. */
router.get('/',
  function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

router.get('/login/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { session: true, failureRedirect: '/login' }),
  (req, res, next) => {
    let token = req.user.generateJWT();
    return methods.setSession(req, res, next, req.user);
  });

export default router;
