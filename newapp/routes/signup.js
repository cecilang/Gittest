var express = require('express');
var router = express.Router();

/* GET signup */
router.get('/', function(req, res, next) {
  res.render('signup', {
    success: req.session.success,
    errors: req.session.errors,
  });
  req.session.errors = null;
});

router.post('/signup/submit', function(req, res, next){
  req.check('email', 'Invalid email address!').isEmail();
  req.check('password', 'Password is too short!').isLength({min:4}).equals(req.body.confirmPassword);

  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    req.session.success = false;
  }else {
    req.session.success = true;
  }
  res.redirect('/signup')
});

module.exports = router;
