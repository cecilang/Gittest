var express = require('express');
var request = require('request');
var schedule = require('node-schedule');
var fs = require('fs');
var router = express.Router();

var Doc = require('../models/doc');
var Term = require('../models/term');
var Search = require('../models/search');
var Product = require('../models/product');
var Price = require('../models/price');
var cron = require('cron');
var Basket = require('../models/basket');

//create api to get all docs
router.get('/docs', function(req, res){
  Doc.getDocs(function(err, docs){
    if(err){
      throw err;
    }
    res.json(docs);
  });
});

//create api to get one doc by object1
router.get('/docs/object1/:id', function(req, res){
  Doc.getDocsByObject1(req.params.id, function(err, doc1){ // singular term used for result object
    if(err){
      throw err;
    }
    res.json(doc1);
  });
});

//create api to get one doc by object2
router.get('/docs/object2/:id', function(req, res){
  Doc.getDocsByObject2(req.params.id, function(err, doc2){ // singular term used for result object
    if(err){
      throw err;
    }
    res.json(doc2);
  });
});

//create d3 links api by looking up object 1 and 2 apis and append jsons
router.get('/docs/:id', function(req, res){

  var source = req.params.id;

  Doc.getTargetsByObject1(source, function( err, target1 ) {
    Doc.getTargetsByObject2(source, function( err, target2 ) {
        if(err){
          throw err;
        }

        targets1 = target1.map(function(u) { return u.targets; });
        targets2 = target2.map(function(u) { return u.targets; });
        var targets = targets1.concat( targets2 );


      Doc.getDocsByObject1(source, function( err, source1 )  {
        Doc.getDocsByObject2(source, function( err, source2 )  {

          Doc.getDocsByObject1({$in: targets}, function( err, doc1 ) {
            Doc.getDocsByObject2({$in: targets}, function( err, doc2 ) {
              if(err){
                throw err;
              }

              var links = source1.concat( source2, doc1, doc2 );
              res.json( links );
            });
          });
        });
      });
    });
  });
});

//create api to get all terms
router.get('/terms', function(req, res){
  Term.getTerms(function(err, terms){
    if(err){
      throw err;
    }
    res.json(terms);
  });
});

//create api to get all terms as nodes
router.get('/terms/nodes', function(req, res){
  Term.getNodes(function(err, nodes){
    if(err){
      throw err;
    }
    res.json(nodes);
  });
});

//create api to get one term by name
router.get('/terms/:id', function(req, res){
  Term.getTermsByName(req.params.id, function(err, term){ // singular used for result object
    if(err){
      throw err;
    }
    res.json(term);
  });
});

//create d3 nodes api by looking up object 1 and 2 targets and get nodes
router.get('/terms/nodes/:id', function(req, res){

  var source = req.params.id;

  Doc.getTargetsByObject1(source, function( err, target11 ) {
    //Doc.getTargetsByObject2(source, function( err, target2 )  {
      if(err){
        throw err;
      }
    //  var targets = target1.concat( target2 );
      targets11 = target11.map(function(u) { return u.targets; });

    Doc.getTargetsByObject2(source, function( err, target12 ) {
      //Doc.getTargetsByObject2(source, function( err, target2 )  {
        if(err){
          throw err;
        }
      //  var targets = target1.concat( target2 );
        targets12 = target12.map(function(u) { return u.targets; });
        var targets1 = targets11.concat( targets12 );

      Doc.getTargetsByObject1({$in: targets1}, function( err, target21 ) {
        //Doc.getTargetsByObject2(source, function( err, target2 )  {
          if(err){
            throw err;
          }
        //  var targets = target1.concat( target2 );
          targets21 = target21.map(function(u) { return u.targets; });

        Doc.getTargetsByObject2({$in: targets1}, function( err, target22 ) {
          //Doc.getTargetsByObject2(source, function( err, target2 )  {
            if(err){
              throw err;
            }
          //  var targets = target1.concat( target2 );
            targets22 = target22.map(function(u) { return u.targets; });
            var targets2 = targets21.concat( targets22 );

          Term.getNodesByName({$in: targets2}, function( err, nodes ) {
              if(err){
                throw err;
              }
              res.json( nodes );
          });
        });
      });
    });
  });
});

router.post('/search-term/', function(req, res) {

  var newSearch = new Search({
    user: req.body.userid,
    term: req.body.term
  });

  newSearch.save(function(err) {
    if(err){
      throw err;
    }
    res.json({success: true, term: req.body.term, user: req.body.userid, msg: 'Term Saved!'});
  });
});

router.post('/product-upvote/', function(req, res) {

  var newProduct = new Product({
    user: req.body.userid,
    company: req.body.companyName,
    "product.name": req.body.productName,
    "product.category": req.body.productCategory
  });

  newProduct.save(function(err) {
    if(err){
      throw err;
    }
    res.json({success: true, company: req.body.companyName, productName: req.body.productName, productCategory: req.body.productCategory, user: req.body.userid, msg: 'Product Upvoted!'});
  });
});

//search count trailing one month
router.get('/search-count-1m', function(req, res){
  Search.searchCount30Days(function(err, result){
    if(err){
      throw err;
    }
    res.json(result);
  });
});

//search count trailing one quarter
router.get('/search-count-1q', function(req, res){
  Search.searchCount90Days(function(err, result){
    if(err){
      throw err;
    }
    res.json(result);
  });
});

//concept count trailing one quarter
router.get('/concept-count-1q', function(req, res){
  Search.conceptCount90Days(function(err, result){
    if(err){
      throw err;
    }
    res.json(result);
  });
});

//api to get one user's search history
router.put('/user-search', function(req, res){

  var userid = req.body.userid;

  Search.getSearchByUser(userid, function(err, searches){
    if(err){
      throw err;
    }
    res.json(searches);
  });
});

//search count trailing one month
router.get('/product-count-1m', function(req, res){
  Product.productCount30Days(function(err, result){
    if(err){
      throw err;
    }
    res.json(result);
  });
});

//search count trailing one quarter
router.get('/product-count-1q', function(req, res){
  Product.productCount90Days(function(err, result){
    if(err){
      throw err;
    }
    res.json(result);
  });
});

//api to get one user's product upvotes
router.put('/user-products', function(req, res){

  var userid = req.body.userid;

  Product.getProductsByUser(userid, function(err, products){
    if(err){
      throw err;
    }
    res.json(products);
  });
});

//api to get one company's product upvotes
router.put('/company-products', function(req, res){

  var company = req.body.companyName;

  Product.getProductsByCompany(company, function(err, products){
    if(err){
      throw err;
    }
    res.json(products);
  });
});

//get top gainers
router.get('/top-gainers', function(req, res){
  Term.topGainers(function(err, result){
    if(err){
      throw err;
    }
    res.json(result);
  });
});

//get top losers
router.get('/top-losers', function(req, res){
  Term.topLosers(function(err, result){
    if(err){
      throw err;
    }
    res.json(result);
  });
});

//upvote traffic.Competitor
router.put('/upvote-competitor/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.upvoteCompetitor(source, target, userid, comment, {}, function(err, doc){ //result object takes on singular term

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Competitor link upvoted by one'});
  });
});

//downvote traffic.Competitor
router.put('/downvote-competitor/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.downvoteCompetitor(source, target, userid, comment, {}, function(err, doc){

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Competitor link downvoted by one'});
  });
});

//upvote traffic.Supplier
router.put('/upvote-supplier/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.upvoteSupplier(source, target, userid, comment, {}, function(err, doc){

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Supplier link upvoted by one'});
  });
});

//downvote traffic.Supplier
router.put('/downvote-supplier/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.downvoteSupplier(source, target, userid, comment, {}, function(err, doc){

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Supplier link downvoted by one'});
  });
});

//upvote traffic.Client
router.put('/upvote-client/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.upvoteClient(source, target, userid, comment, {}, function(err, doc){

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Client link upvoted by one'});
  });
});

//downvote traffic.Client
router.put('/downvote-client/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.downvoteClient(source, target, userid, comment, {}, function(err, doc){

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Client link downvoted by one'});
  });
});

//upvote traffic.Sister
router.put('/upvote-sister/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.upvoteSister(source, target, userid, comment, {}, function(err, doc){

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Sister link upvoted by one'});
  });
});

//downvote traffic.Sister
router.put('/downvote-sister/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.downvoteSister(source, target, userid, comment, {}, function(err, doc){

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Sister link downvoted by one'});
  });
});

//upvote traffic.Subsidiary
router.put('/upvote-subsidiary/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.upvoteSubsidiary(source, target, userid, comment, {}, function(err, doc){

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Subsidiary link upvoted by one'});
  });
});

//downvote traffic.Subsidiary
router.put('/downvote-subsidiary/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.downvoteSubsidiary(source, target, userid, comment, {}, function(err, doc){

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Subsidiary link downvoted by one'});
  });
});

//upvote traffic.Parent
router.put('/upvote-parent/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.upvoteParent(source, target, userid, comment, {}, function(err, doc){

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Parent link upvoted by one'});
  });
});

//downvote traffic.Parent
router.put('/downvote-parent/', function(req, res){

  var source = req.body.source;
  var target = req.body.target;
  var userid = req.body.userid;
  var comment = req.body.comment;

  Doc.downvoteParent(source, target, userid, comment, {}, function(err, doc){

    if(err){
      throw err;
    }
    res.json({success: true, source: req.body.source, target: req.body.target, msg: 'Parent link downvoted by one'});
  });
});

//get vote traffic by source
router.get('/doc-traffic/:source/', function(req, res){

  var source = req.params.source;

  Doc.getDocTrafficByObject1(source, function(err, doc1){
    Doc.getDocTrafficByObject2(source, function(err, doc2){

      var doc = doc1.concat( doc2 );
      if(err){
        throw err;
      }
      res.json(doc);
    });
  });
});

//get vote traffic by source and target
router.get('/doc-traffic/:source/:target', function(req, res){

  var source = req.params.source;
  var target = req.params.target;

  Doc.getDocTrafficBySourceAndTarget(source, target, function(err, doc1){
    Doc.getDocTrafficByTargetAndSource(source, target, function(err, doc2){

      var doc = doc1.concat( doc2 );
      if(err){
        throw err;
      }
      res.json(doc);
    });
  });
});

//get historical EOD stock prices by search term
router.get('/prices/:id', function(req, res){

  var name = req.params.id;

  Term.getTermsByName(name, function(err, term){

    if(err){
      throw err;
    }

    else{
      var tempTicker = term.map(function(u) { return u.ticker; });
      var ticker = tempTicker[0];

      var url = "http://marketdata.websol.barchart.com/getHistory.json";
      var queryObjects = {
        key: "240f3c4e0f155ab37027ff4639dc7c4d",
        symbol: ticker,
        type: "daily",
        startDate: "20000101000000"
      };

      var options = {
        method: 'GET',
        url: url,
        qs: queryObjects,
        timeout: 10000,
        followRedirect: true,
        json: true
      }

      request(options, function (err, response, data) {
        if (err){
          throw err;
        }

        if(response.statusCode !== 200){
          res.json({success: true, status: response.statusCode, name: name, ticker: "not available", field: "price", dates: "not available", "end of day prices": "not available"});
        }

        else{

          var prices = data.results;

          var tradingDay = prices.map(function(u) { return u.tradingDay; });

          var close = prices.map(function(u) { return u.close; });

          Term.updatePrice(name, prices, {}, function(err, result){
            if(err){
              throw err;
            }
            res.json({success: true, name: name, ticker: ticker, field: "price", dates: tradingDay, "end of day prices": close});
          });
        };
      });
    };
  });
});

//get quote by search term
router.get('/quote/:id', function(req, res){

  var company = req.params.id;

  Term.getTickerByCompany(company, function(err, result){

    if(err){
      throw err;
    }

    var ticker = result[0].ticker;

    if(result[0].ticker === ""){
      res.json({success: true, name: company, ticker: "Not Applicable", field: "not available", "last price": "not available", "trade time": "not available", "percent change": "not available"});
    }

    else{

      Price.getQuotesByTicker(ticker, function(err, quote){

        if(err){
          throw err;
        }

        var price = quote[0].price;

        var d = new Date(quote[0].create_date);
        var tradeDay = d.getDate();
        var tradeMonth = d.getMonth() + 1; //Months are zero based
        var tradeYear = d.getFullYear();
        var tradeTime = tradeMonth + "-" + tradeDay + "-" + tradeYear;

        var percentChange = quote[0].percentChange;

        res.json({success: true, name: company, ticker: ticker, field: "quote", "last price": "$"+price, "trade time": tradeTime, "percent change": percentChange + "%"});
      });
    }
  });
});

//get revenue by search term
router.get('/revenue/:id', function(req, res){

  var name = req.params.id;

  Term.getTermsByName(name, function(err, term){

    if(err){
      throw err;
    }

    var tempTicker = term.map(function(u) { return u.ticker; });
    var ticker = tempTicker[0];

    var url = "https://www.quandl.com/api/v3/datasets/SF0/"+ticker+"_REVENUEUSD_MRY.json";
    var queryObjects = {
      api_key: "McbKCuasxHLKsR2R1Fox"
    };

    var options = {
      method: 'GET',
      url: url,
      qs: queryObjects,
      timeout: 10000,
      followRedirect: true,
      json: true
    }

    request(options, function (err, response, body) {
      if (err){
        throw err;
      }

      if(response.statusCode !== 200){
        res.json({success: true, name: name, ticker: ticker, field: "not available", "Revenue (USD)": "not available", "Year-over-year growth (%)": "not available", "Date": "not available"});
      }

      else{
        var a = body.dataset.data;

        var dates = [];
        for(var i = 0; i < a.length; i++){
          dates[dates.length] = a[i][0];
        }

        var revenues = [];
        for(var i = 0; i < a.length; i++){
          revenues[revenues.length] = (a[i][1]/1000000).toFixed(0);
        }

        var rlast = revenues.slice(1);

        var rcurrent = revenues.slice(0,-1);

        var yoy = [];
        for(var i = 0; i < rlast.length; i++){
          yoy[yoy.length] = ((rcurrent[i]/rlast[i]-1)*100).toFixed(2);
        }

        Term.updateRevenue(name, dates, revenues, {}, function(err, result){
          if(err){
            throw err;
          }
          res.json({success: true, name: name, ticker: ticker, field: "revenue", "Revenue (USD)": revenues, "Year-over-year growth (%)": yoy, "Date": dates});
        });
      };
    });
  });
});

//get gross profit by search term
router.get('/gross-profit/:id', function(req, res){

  var name = req.params.id;

  Term.getTermsByName(name, function(err, term){

    if(err){
      throw err;
    }

    var tempTicker = term.map(function(u) { return u.ticker; });
    var ticker = tempTicker[0];

    var url = "https://www.quandl.com/api/v3/datasets/SF0/"+ticker+"_GP_MRY.json";
    var queryObjects = {
      api_key: "McbKCuasxHLKsR2R1Fox"
    };

    var options = {
      method: 'GET',
      url: url,
      qs: queryObjects,
      timeout: 10000,
      followRedirect: true,
      json: true
    }

    request(options, function (err, response, body) {
      if (err){
        throw err;
      }

      else{
        var a = body.dataset.data;

        var dates = [];
        for(var i = 0; i < a.length; i++){
          dates[dates.length] = a[i][0];
        }

        var gps = [];
        for(var i = 0; i < a.length; i++){
          gps[gps.length] = (a[i][1]/1000000).toFixed(0);
        }

        var gplast = gps.slice(1);
        var gpcurrent = gps.slice(0,-1);

        var yoy = [];
        for(var i = 0; i < gplast.length; i++){
          yoy[yoy.length] = ((gpcurrent[i]/gplast[i]-1)*100).toFixed(2);
        }

        Term.updateGP(name, dates, gps, {}, function(err, result){
          Term.getRevenue(name, function(err, revenue){
            if(err){
              throw err;
            }
            var tempRev = revenue.map(function(u) { return u.revenue; })
            var rev = tempRev[0];

            var gpm = [];
            for(var i = 0; i < gps.length; i++){
              gpm[gpm.length] = ((gps[i]/rev[i])*100).toFixed(2) ;
            }

            res.json({success: true, name: name, ticker: ticker, field: "gp", "Gross Profit (USD)": gps, "Year-over-year growth (%)": yoy, "Gross Profit Margin (%)": gpm, "Date": dates});
          });
        });
      };
    });
  });
});

//get operating profit by search term
router.get('/operating-profit/:id', function(req, res){

  var name = req.params.id;

  Term.getTermsByName(name, function(err, term){

    if(err){
      throw err;
    }

    var tempTicker = term.map(function(u) { return u.ticker; });
    var ticker = tempTicker[0];

    var url = "https://www.quandl.com/api/v3/datasets/SF0/"+ticker+"_EBITUSD_MRY.json";
    var queryObjects = {
      api_key: "McbKCuasxHLKsR2R1Fox"
    };

    var options = {
      method: 'GET',
      url: url,
      qs: queryObjects,
      timeout: 10000,
      followRedirect: true,
      json: true
    }

    request(options, function (err, response, body) {
      if (err){
        throw err;
      }

      else{
        var a = body.dataset.data;

        var dates = [];
        for(var i = 0; i < a.length; i++){
          dates[dates.length] = a[i][0];
        }

        var ops = [];
        for(var i = 0; i < a.length; i++){
          ops[ops.length] = (a[i][1]/1000000).toFixed(0);
        }

        var oplast = ops.slice(1);
        var opcurrent = ops.slice(0,-1);

        var yoy = [];
        for(var i = 0; i < oplast.length; i++){
          yoy[yoy.length] = ((opcurrent[i]/oplast[i]-1)*100).toFixed(2);
        }

        Term.updateOP(name, dates, ops, {}, function(err, result){
          Term.getRevenue(name, function(err, revenue){
            if(err){
              throw err;
            }
            var tempRev = revenue.map(function(u) { return u.revenue; })
            var rev = tempRev[0];

            var opm = [];
            for(var i = 0; i < ops.length; i++){
              opm[opm.length] = ((ops[i]/rev[i])*100).toFixed(2) ;
            }

            res.json({success: true, name: name, ticker: ticker, field: "op", "Operating Profit (USD)": ops, "Year-over-year growth (%)": yoy, "Operating Profit Margin (%)": opm, "Date": dates});
          });
        });
      };
    });
  });
});

//get net income by search term
router.get('/net-income/:id', function(req, res){

  var name = req.params.id;

  Term.getTermsByName(name, function(err, term){

    if(err){
      throw err;
    }

    var tempTicker = term.map(function(u) { return u.ticker; });
    var ticker = tempTicker[0];

    var url = "https://www.quandl.com/api/v3/datasets/SF0/"+ticker+"_NETINCCMNUSD_MRY.json";
    var queryObjects = {
      api_key: "McbKCuasxHLKsR2R1Fox"
    };

    var options = {
      method: 'GET',
      url: url,
      qs: queryObjects,
      timeout: 10000,
      followRedirect: true,
      json: true
    }

    request(options, function (err, response, body) {
      if (err){
        throw err;
      }

      else{
        var a = body.dataset.data;

        var dates = [];
        for(var i = 0; i < a.length; i++){
          dates[dates.length] = a[i][0];
        }

        var nis = [];
        for(var i = 0; i < a.length; i++){
          nis[nis.length] = (a[i][1]/1000000).toFixed(0);
        }

        var nilast = nis.slice(1);

        var nicurrent = nis.slice(0,-1);

        var yoy = [];
        for(var i = 0; i < nilast.length; i++){
          yoy[yoy.length] = ((nicurrent[i]/nilast[i]-1)*100).toFixed(2);
        }

        Term.updateNI(name, dates, nis, {}, function(err, result){
          Term.getRevenue(name, function(err, revenue){
            if(err){
              throw err;
            }
            var tempRev = revenue.map(function(u) { return u.revenue; })
            var rev = tempRev[0];

            var nim = [];
            for(var i = 0; i < nis.length; i++){
              nim[nim.length] = ((nis[i]/rev[i])*100).toFixed(2) ;
            }

            res.json({success: true, name: name, ticker: ticker, field: "ni", "Net Income (USD)": nis, "Year-over-year growth (%)": yoy, "Net Income Margin (%)": nim, "Date": dates});
          });
        });
      };
    });
  });
});

//get eps by search term
router.get('/eps-diluted/:id', function(req, res){

  var name = req.params.id;

  Term.getTermsByName(name, function(err, term){

    if(err){
      throw err;
    }

    else{

      var tempTicker = term.map(function(u) { return u.ticker; });
      var ticker = tempTicker[0];

      var url = "https://www.quandl.com/api/v3/datasets/SF0/"+ticker+"_EPSDIL_MRY.json";
      var queryObjects = {
        api_key: "McbKCuasxHLKsR2R1Fox"
      };

      var options = {
        method: 'GET',
        url: url,
        qs: queryObjects,
        timeout: 10000,
        followRedirect: true,
        json: true
      }

      request(options, function (err, response, body) {
        if (err){
          throw err;
        }

        if(response.statusCode !== 200){
          res.json({success: false, status: response.statusCode, name: name, ticker: ticker, field: "eps", "Earnings per diluted share (USD)": "not available", "Year-over-year growth (%)": "not available", "Date": "not available"});
        }

        else{
          var a = body.dataset.data;

          var dates = [];
          for(var i = 0; i < a.length; i++){
            dates[dates.length] = a[i][0];
          }

          var eps = [];
          for(var i = 0; i < a.length; i++){
            eps[eps.length] = a[i][1];
          }

          var epslast = eps.slice(1);

          var epscurrent = eps.slice(0,-1);

          var yoy = [];
          for(var i = 0; i < epslast.length; i++){
            yoy[yoy.length] = ((epscurrent[i]/epslast[i]-1)*100).toFixed(2);
          }

          Term.updateEPS(name, dates, eps, {}, function(err, result){
            if(err){
              throw err;
            }

            res.json({success: true, name: name, ticker: ticker, field: "eps", "Earnings per diluted share (USD)": eps, "Year-over-year growth (%)": yoy, "Date": dates});
          });
        };
      });
    };
  });
});

//get book value by search term
router.get('/book-value-per-share/:id', function(req, res){

  var name = req.params.id;

  Term.getTermsByName(name, function(err, term){

    if(err){
      throw err;
    }

    var tempTicker = term.map(function(u) { return u.ticker; });
    var ticker = tempTicker[0];

    var url = "https://www.quandl.com/api/v3/datasets/SF0/"+ticker+"_BVPS_MRY.json";
    var queryObjects = {
      api_key: "McbKCuasxHLKsR2R1Fox"
    };

    var options = {
      method: 'GET',
      url: url,
      qs: queryObjects,
      timeout: 10000,
      followRedirect: true,
      json: true
    }

    request(options, function (err, response, body) {
      if (err){
        throw err;
      }

      if(response.statusCode !== 200){
        console.log('Something is wrong. Error Code ', response.statusCode);
      }

      else{
        var a = body.dataset.data;

        var dates = [];
        for(var i = 0; i < a.length; i++){
          dates[dates.length] = a[i][0];
        }

        var bps = [];
        for(var i = 0; i < a.length; i++){
          bps[bps.length] = (a[i][1]).toFixed(2);
        }

        var bpslast = bps.slice(1);

        var bpscurrent = bps.slice(0,-1);

        var yoy = [];
        for(var i = 0; i < bpslast.length; i++){
          yoy[yoy.length] = ((bpscurrent[i]/bpslast[i]-1)*100).toFixed(2);
        }

        Term.updateBPS(name, dates, bps, {}, function(err, result){
          if(err){
            throw err;
          }

          res.json({success: true, name: name, ticker: ticker, field: "bps", "Book value per share (USD)": bps, "Year-over-year growth (%)": yoy, "Date": dates});
        });
      };
    });
  });
});

//get dividend by search term
router.get('/dividend-per-share/:id', function(req, res){

  var name = req.params.id;

  Term.getTermsByName(name, function(err, term){

    if(err){
      throw err;
    }

    var tempTicker = term.map(function(u) { return u.ticker; });
    var ticker = tempTicker[0];

    var url = "https://www.quandl.com/api/v3/datasets/SF0/"+ticker+"_DPS_MRY.json";
    var queryObjects = {
      api_key: "McbKCuasxHLKsR2R1Fox"
    };

    var options = {
      method: 'GET',
      url: url,
      qs: queryObjects,
      timeout: 10000,
      followRedirect: true,
      json: true
    }

    request(options, function (err, response, body) {
      if (err){
        throw err;
      }

      if(response.statusCode !== 200){
        console.log('Something is wrong. Error Code ', response.statusCode);
      }

      else{
        var a = body.dataset.data;

        var dates = [];
        for(var i = 0; i < a.length; i++){
          dates[dates.length] = a[i][0];
        }

        var dps = [];
        for(var i = 0; i < a.length; i++){
          dps[dps.length] = a[i][1];
        }

        var dpslast = dps.slice(1);

        var dpscurrent = dps.slice(0,-1);

        var yoy = [];
        for(var i = 0; i < dpslast.length; i++){
          yoy[yoy.length] = ((dpscurrent[i]/dpslast[i]-1)*100).toFixed(2);
        }

        Term.updateDPS(name, dates, dps, {}, function(err, result){
          if(err){
            throw err;
          }

          res.json({success: true, name: name, ticker: ticker, field: "dps", "Dividend per share (USD)": dps, "Year-over-year growth (%)": yoy, "Date": dates});
        });
      };
    });
  });
});

//get relationship news by relevance
router.get('/news/relevance/:source/:target', function(req, res){

  var source = req.params.source;
  var target = req.params.target;

  var url = "http://iris.lore.ai/api/v0.1/NEWS/?";
  var queryObjects = {
    api_key: "WgtOR9ZcdH9Ctfn7L15hHsqu7D4",
    q: source+"+"+target,
    start_date: "20170101",
    sort: "relevance",
    format:"json"
  };

  var options = {
    method: 'GET',
    url: url,
    qs: queryObjects,
    timeout: 10000,
    followRedirect: true,
    json: true
  }

request(options, function (err, response, body) {
    if (err){
      throw err;
    }

    if(response.statusCode !== 200){
      console.log('Something is wrong. Error Code ', response.statusCode);
    }

    else{
      var docs = body.results;

      var headlines = [];
      for(var i = 0; i < docs.length; i++){
        headlines[headlines.length] = docs[i].metadata.TITLE;
      }

      var dates = [];
      for(var i = 0; i < docs.length; i++){
        dates[dates.length] = docs[i].metadata.DATE;
      }

      var abstracts = [];
      for(var i = 0; i < docs.length; i++){
        abstracts[abstracts.length] = docs[i].text;
      }

      Doc.updateNews(source, target, headlines, dates, abstracts, {}, function(err, result){
        if(err){
          throw err;
        }

        res.json({success: true, source: source, target: target, headlines: headlines, dates: dates, abstracts: abstracts});
      });
    };
  });
});

//get relationship news by date
router.get('/news/date/:source/:target', function(req, res){

  var source = req.params.source;
  var target = req.params.target;

  var url = "http://iris.lore.ai/api/v0.1/NEWS/?";
  var queryObjects = {
    api_key: "WgtOR9ZcdH9Ctfn7L15hHsqu7D4",
    q: source+"+"+target,
    start_date: "20170101",
    sort: "date",
    format:"json"
  };

  var options = {
    method: 'GET',
    url: url,
    qs: queryObjects,
    timeout: 10000,
    followRedirect: true,
    json: true
  }

request(options, function (err, response, body) {
    if (err){
      throw err;
    }

    if(response.statusCode !== 200){
      console.log('Something is wrong. Error Code ', response.statusCode);
    }

    else{
      var docs = body.results;

      var headlines = [];
      for(var i = 0; i < docs.length; i++){
        headlines[headlines.length] = docs[i].metadata.TITLE;
      }

      var dates = [];
      for(var i = 0; i < docs.length; i++){
        dates[dates.length] = docs[i].metadata.DATE;
      }

      var abstracts = [];
      for(var i = 0; i < docs.length; i++){
        abstracts[abstracts.length] = docs[i].text;
      }

      Doc.updateNews(source, target, headlines, dates, abstracts, {}, function(err, result){
        if(err){
          throw err;
        }

        res.json({success: true, source: source, target: target, headlines: headlines, dates: dates, abstracts: abstracts});
      });
    };
  });
});

//create api to get all products
router.get('/products', function(req, res){
  Term.getProducts(function(err, products){
    if(err){
      throw err;
    }
    res.json(products);
  });
});

//create api to get featured products
router.get('/featured-products', function(req, res){
  Term.getRandomProducts(function(err, products){
    if(err){
      throw err;
    }
    res.json(products);
  });
});

//create api to get one company's products
router.get('/products/:name', function(req, res){

  var name = req.params.name;

  Term.getProductsByCompany(name, function(err, products){
    if(err){
      throw err;
    }
    res.json(products);
  });
});

//create a job scheduler to save stock price every EOD
router.get('/save-prices', function(req, res){

  var savePrice = new cron.CronJob({
    cronTime: '00 46 23 * * 1-5',
    onTick: function() {

      Term.getTickers(function(err, result){
        if (err){
          throw err;
        }

        var tickers = result[0].tickerArray;

        for(var i = 0; i < tickers.length; i++){

          var url = "http://marketdata.websol.barchart.com/getQuote.json";
          var queryObjects = {
            key: "240f3c4e0f155ab37027ff4639dc7c4d",
            symbols: tickers[i]
          };

          var options = {
            method: 'GET',
            url: url,
            qs: queryObjects,
            followRedirect: true,
            json: true
          }

          request(options, function (err, response, data) {
            if (err){
              throw err;
            }

            else{
              var quote = data.results;

              var tempLastPrice = quote.map(function(u) { return u.lastPrice; });
              var tempTradeTime = quote.map(function(u) { return u.tradeTimestamp; });
              var tempPercentChange = quote.map(function(u) { return u.percentChange; });
              var ticker = quote.map(function(u) { return u.symbol; });

              var lastPrice = tempLastPrice[0];
              var percentChange = tempPercentChange[0];
              var today = tempTradeTime[0];

              var newPrice = new Price({
                ticker: ticker,
                price: lastPrice,
                percentChange: percentChange,
                create_date: today
              });

              newPrice.save(function(err) {
                if(err){
                  throw err;
                }
                console.log("daily price saved, ticker: " + ticker + ", date: " + today + ".");
              });
            };
          });
        }
        res.json({success: true, date: new Date(), tickerCount: tickers.length, msg: 'Prices Saved!'});
      });

    },
    start: false,
    timeZone: 'America/Los_Angeles'
  });

  savePrice.start();
});

//calculate returns by user watchlists
router.get('/test-array', function(req, res) {
  var array = [];
  for (i = 1; i <= 3; i++) {
      var x = 0;
      x += (i *3);
      array.push(x);
  }
  res.json(array);
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.json('Error: Please log in.')
}
