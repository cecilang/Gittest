var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var Order = require('../models/order');
var Cart = require('../models/cart');

var csrfProtection = csrf();
router.use(csrfProtection);

//set up redirect to profile page after successful signup/in
router.get('/profile', isLoggedIn, function(req, res, next){
  Order.find({user: req.user}, function(err, orders){ //match order user id with loggedin user id via mongoose in mongodb
    if (err) {
      return res.write('No orders placed yet! Your cart is looking lonely.');
    }

    //create new cart for each order in DB
    var cart;
    orders.forEach(function(order){
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render('user/profile', {orders: orders});
  });
});

//set up redirect to logout page after successful signup/in
router.get('/logout', isLoggedIn, function(req, res, next){
  req.logout(); //passport function
  res.redirect('/');
});

//set up redirect to profile page if users are not loggedin
router.use('/', notLoggedIn, function (req, res, next){
  next();
});

//set up cross site request forgery (csrf) token on signup
router.get('/signup', function(req, res, next){
  var messages = req.flash('error');
  res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

//set up user signup post
router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: '/user/signup',
  failureFlash: true,
}), function (req, res, next){
  if (req.session.oldUrl){
    var oldUrl = req.session.oldUrl //extract oldUrl first
    req.session.oldUrl = null; //clear oldUrl
    res.redirect(oldUrl); //then call it again from var above
  } else {
    res.redirect('/user/profile');
  }
});

//set up cross site request forgery (csrf) token on signin
router.get('/signin', function(req, res, next){
  var messages = req.flash('error');
  res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

//set up user signin post
router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: '/user/signin',
  failureFlash: true,
}), function (req, res, next){
  if (req.session.oldUrl){
    var oldUrl = req.session.oldUrl //extract oldUrl first
    req.session.oldUrl = null; //clear oldUrl
    res.redirect(oldUrl); //then call it again from var above
  } else {
    res.redirect('/user/profile');
  }
});

module.exports = router;

//middleware to redirect authenticated user
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()){ //a passport function
    return next();
  }
  res.redirect('/');
}

//middleware to redirect unauthenticated user
function notLoggedIn (req, res, next) {
  if (!req.isAuthenticated()){ //a passport function
    return next();
  }
  res.redirect('/');
}
