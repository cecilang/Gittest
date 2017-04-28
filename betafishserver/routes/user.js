var passport = require('passport');
var express = require('express');
var jwt = require('jwt-simple');
var async = require('async');

// bundle our routes
var router = express.Router();

// get mongoose models
var User = require('../models/user');
var Basket = require('../models/basket');
var Term = require('../models/term');
var Price = require('../models/price');

// get db config file
var config = require('../config/database');
// pass passport for configuration
require('../config/passport')(passport);

// create a new user account
router.post('/signup', function(req, res) {
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.json({success: false, msg: 'Please enter your name, email and password.'});
  } else {
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'User already exists.'});
      }
      res.json({success: true, msg: 'Signup success!'});
    });
  }
});

// route to authenticate a user
router.post('/authenticate', function(req, res) {
  User.findOne({
    email: req.body.email
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    }

    else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
					res.json({success: true, token: 'JWT ' + token, UserId: user._id, msg: 'Welcome back, ' + user.name + '!'});
        }

        else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

// get user profile
router.post('/profile/', function(req, res) {
  var userid = req.body.userid;
  User.getProfile(userid, function(err, profile){
    if(err){
      throw err;
    }

    var d = new Date (profile[0].create_date);
    var date = d.toISOString().substring(0, 10);

    res.json({success: true, name: profile[0].name, email: profile[0].email, "date joined": date});
  });
});

// route to change email
router.post('/update-email', function(req, res) {

  var email = req.body.email;
  var newEmail = req.body.newEmail;
  var password = req.body.password;

  User.findOne({
    email: email
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.send({success: false, msg: 'Incorrect email. User not found.'});
    }

    else {
      // check if password matches
      user.comparePassword(password, function (err, isMatch) {
        if (isMatch && !err) {
          User.updateEmail(email, newEmail, {}, function(err, update){

            if(err) {
              return res.json({success: false, msg: 'Email already taken.'});
            }
            res.json({success: true, msg: "Your email is now updated to " + newEmail});

          });
        }

        else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

// route to change password
router.post('/update-password', function(req, res) {

  var email = req.body.email;
  var oldPassword = req.body.oldPassword;
  var newPassword = req.body.newPassword;
  var newPassword2 = req.body.newPassword2;

  User.findOne({
    email: email
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.send({success: false, msg: 'Incorrect email. User not found.'});
    }

    else {
      // check if password matches
      user.comparePassword(oldPassword, function (err, isMatch) {
        if (isMatch && !err) {

          if(newPassword !== newPassword2){
            res.json({success: false, msg: "New password and confirm password do not match."});
          }

          else{
            user.password = newPassword2;

            user.save(function(err){
                if (err) { next(err) }
                else {
                  res.json({success: true, msg: "Your password is now updated."});
                }
            })
          }
        }

        else {
          res.send({success: false, msg: 'Authentication failed. Wrong old password entered.'});
        }
      });
    }
  });
});

// get all baskets by user Id
router.post('/get-baskets/', function(req, res) {
  var userid = req.body.userid;
  Basket.getBasketsByUser(userid, function(err, baskets){
    if(err){
      throw err;
    }
    res.json(baskets);
  });
});

// get one basket by basket Id
router.post('/get-basket/', function(req, res) {

  var basketid = req.body.basketid;
  Basket.getBasketById(basketid, function(err, basket){ // singular term used for result object
    if(err){
      throw err;
    }
    res.json(basket);
  });
});

// update item array by basket Id
router.put('/update-basket/', function(req, res) {
  var userid = req.body.userid;
  var basketid = req.body.basketid;
  var basketname = req.body.basketname;

  Basket.matchBasketnameOnUpdate(userid, basketid, basketname, function(err, result){

    var resultArray = result.map(function(u) { return JSON.stringify(u.nameMatchResult); });

    var namematch = resultArray.join(",");

    if(err){
      throw err;
    }

    if(namematch === "true"){
      res.json({success: false, msg: 'Watchlist name already exists'});

    }else{
      var basket = {
        basketname: req.body.basketname,
        item: req.body.item
      };
      Basket.updateBasket(basketid, basket, {}, function(err, basket){ // singular term used for result object
        if(err){
          throw err;
        }
        res.json({success: true, name: req.body.basketname, items: req.body.item, msg: 'Watchlist successfully updated'});
      });
    }
  });
});

//delete one basket by Id
router.post('/delete-basket/', function(req, res){
  var basketid = req.body.basketid;
  Basket.deactivateBasket(basketid, {}, {}, function(err, basket){ //result object takes on singular term
    if(err){
      throw err;
    }
    res.json({success: true, msg: 'Watchlist successfully deleted'});
  });
});


//restate one basket by Id
router.post('/restate-basket/', function(req, res){
  var basketid = req.body.basketid;
  Basket.activateBasket(basketid, {}, {}, function(err, basket){ //result object takes on singular term
    if(err){
      throw err;
    }
    res.json({success: true, msg: 'Watchlist successfully restated'});
  });
});

router.post('/save-basket/', function(req, res) {

  var userid = req.body.userid;
  var basketname = req.body.basketname;
  var item = req.body.item;

  Basket.matchBasketnameOnSave(userid, basketname, function(err, result){

    var resultArray = result.map(function(u) {
      return JSON.stringify(u.nameMatchResult);
    });

    var namematch = resultArray.join(",");

    if(err){
      throw err;
    }

    if(namematch === "true"){
      res.json({success: false, msg: 'Watchlist already exists'});

    }else{
      var newBasket = new Basket({
        creator: userid,
        basketname: basketname,
        item: item
      });

      newBasket.save(function(err) {
        if (err) {
          return res.json({success: false, msg: 'Watchlist already exists or session timed out. Please try again.'});
        }
        res.json({success: true, watchlist: basketname, item: item, msg:'Watchlist Created!'});
      });
    }
  });
});

//calculate stock and weighted returns by user watchlists
router.get('/watchlist-returns/:id', function(req, res) {

  var watchlistid = req.params.id;
  var results = {};
  var items;
  var tickerArray =[];
  var latestArray = [];
  var startArray = [];
  var equalWeight;
  var stockReturns = [];
  var watchlistReturns = [];
  var createDate;

  async.series([
    //get watchlist items by watchlist
      function(callback){
        Basket.getBasketById(watchlistid, function(err, basket){
          if (err) return callback (err);
          if (basket.length == 0 ){
            return callback (new Error ("Watchlist not found"));
          }
          createDate = basket[0].create_date;
          items = basket[0].item.split(/[ .:;?!~,`"&|()<>{}\[\]\n\r/]+/);
          equalWeight = 1/(items.length-1);
          results = {
            watchlistItems: items
          };
          callback();
        });
      },
      //get tickers by watchlist company names
      function(callback){
        async.forEach(items, function(item, callback) {
          Term.getTickerByCompany(item, function(err, tickers) {
            if (err) callback (err);
            if (tickers.length == 0 ){
              callback (new Error ("Watchlist is empty"));
            }
            tickerArray.push(tickers[0].ticker);
            results.watchlistTickers = tickerArray;
            callback();
          });
        }, callback);
      },
      //get latest and start prices with tickers
      function(callback){
        async.parallel([
          //get latest prices
          function(callback){
            async.forEach(tickerArray, function(ticker, callback) {
              Price.getQuotesByTicker(ticker, function(err, latest) {
                if (err) callback (err);
                latestArray.push(latest[0].price);
                results.latestPrices = latestArray;
                callback();
              });
            }, callback);
          },
          //get start prices
          function(callback){
            async.forEach(tickerArray, function(ticker, callback) {
              Price.getQuotesByTickerAndDate(ticker, createDate, function(err, start) {
                if (err) callback (err);
                startArray.push(start[0].price);
                results.startPrices = startArray;
                callback();
              });
            }, callback);
          }
        ], callback);
      },
      //calculate stockReturns and watchlistReturns
      function(callback){
        for (i=0; i<items.length; i++){
          stockReturns.push(((latestArray[i]/startArray[i]-1)*100).toFixed(2));
          watchlistReturns.push(equalWeight*stockReturns[i]);
        }
        results.stockReturns = stockReturns;
        results.watchlistReturns = watchlistReturns;
        callback();
      }

  ], function(err){
    if (err) return (err);
    res.json(results);
  }); //end async

});//close API


// update alerts by user Id
router.put('/update-alerts/', function(req, res) {
  var userid = req.body.userid;
  var name = req.body.name;
  var ticker = req.body.ticker;
  var price = req.body.price;
  var limit = req.body.limit;

  User.updateAlerts(userid, name, ticker, price, limit, {}, function(err, alert){

    if(err){
      throw err;
    }

    res.json({success: true, name: req.body.name, "price set at ": req.body.price, limit: req.body.limit, msg: 'Alert successfully set'});
  });
});

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;
