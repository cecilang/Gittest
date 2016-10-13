var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

//Tell passport how to store user in session
passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});

//creating user
passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
}, function(req, email, password, done){

  //validating signup details in callback
  req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 4});
  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function (error) {
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }

  //checking for repeated signup email in DB
  User.findOne({'email': email}, function(err, user){
    if(err) {
      return done(err);
    }
    if (user) {
      return done(null, false, {message: 'Email is already in use.'});
    }
    var newUser = new User();
      newUser.email = email;
      newUser.password = newUser.encryptPassword(password);
      newUser.save(function(err, result){
        if (err) {
          return done(err);
        }
        return done(null, newUser);
      });
  });
}));

//creating signin strategy
passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
}, function(req, email, password, done){

  //validating signin details in callback
  req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function (error) {
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }

  //checking for signin email in DB
  User.findOne({'email': email}, function(err, user){
    if(err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, {message: 'Your email appears to be unregistered - sign up for an account today, it is free!'});
    }
    if (!user.validPassword(password)) {
      return done(null, false, {message: 'Invalid password - please try again.'});
    }
      return done(null, user);
  });
}));
