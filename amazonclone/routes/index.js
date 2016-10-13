var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');

var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function (req, res, next) {
    var successMsg = req.flash('success')[0]; //passthrough success message from stripe
    Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', {title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg}); //make sure vars match those in views
    });
});

//create new cart with each new item added
router.get('/add-cart/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart: {}); //parse existing cart or produce an empty object otherwise

  Product.findById(productId, function (err, product){
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});

//create new cart with each item reduced
router.get('/reduce/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart
  res.redirect('/cart');
});

//create new cart with each remove all
router.get('/remove/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart
  res.redirect('/cart');
});

router.get('/cart', function(req, res, next){
  if (!req.session.cart) {
    return res.render('shop/cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', isLoggedIn, function (req, res, next){
  if (!req.session.cart) {
    return res.redirect('shop/cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  return res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', isLoggedIn, function(req, res, next){
  if (!req.session.cart) {
    return res.redirect('shop/cart');
  }
  var cart = new Cart(req.session.cart);

  var stripe = require("stripe")(
  "sk_test_S0Q26EqvJyuQ9XAWW8daaPPO"
  );

  stripe.charges.create({
    amount: cart.totalPrice * 100, //in cents, always in small denomination
    currency: "usd",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: "test charge"
  }, function(err, charge) {
    if  (err){
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    var order = new Order({
      user: req.user, //from passport
      cart: cart, //as declared above
      address: req.body.address, //from checkout.hbs
      name: req.body.name, //from checkout.hbs
      paymentId: charge.id  //from stripe charge object
    });

    //save to mongo
    order.save(function(err, result){  //check for error in real app with if (err) {}
      req.flash('success', 'Thanks for your purchase!');
      req.session.cart = null;
      res.redirect('/');
    });
  });
});

module.exports = router;

//middleware to redirect authenticated user
function isLoggedIn (req, res, next) {
  if (req.isAuthenticated()){ //if loggedin, check authentication
    return next();
  }
  req.session.oldUrl = req.url; //else, store checkout url for redirect later
  res.redirect('/user/signin');
}
