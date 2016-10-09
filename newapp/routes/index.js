var express = require('express');
var router = express.Router();
var sd = require('../selfdriving.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: "Betafish",
    selfdriving: sd,
  });
});

/* get and post requests
router.get('/test/:searchbar', function(req, res, next){
  res.render('test', {
    output: req.params.searchbar,
  });
});

router.post('/test/search', function(res, rep, next){
  var searchbar = req.body.searchbar;
  res.redirect('/test' + searchbar);
});*/

module.exports = router;
