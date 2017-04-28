var mongoose = require('mongoose');

//create price schema
var priceSchema = mongoose.Schema({
  ticker: {
      type: String
  },
  price: {
    type: Number
  },
  percentChange: {
    type: Number
  },
  create_date:{
    type: Date,
  }
});

var Price = module.exports = mongoose.model('Price', priceSchema); //make copy of schema and export to outside

//find quote history by ticker
module.exports.getQuotesByTicker = function(ticker, callback){

  var query = {
    ticker: ticker
  };

  Price.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      ticker:1,
      price:1,
      percentChange:1,
      create_date:1
    }},
    {$sort: {create_date: -1}}
  )
    .exec(callback);
};

//find quote by ticker and date
module.exports.getQuotesByTickerAndDate = function(ticker, date, callback){

  var today = new Date();

  var start = date;

  var query = {
    create_date: { $gte: start, $lt: today },
    ticker: ticker
  };

  Price.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      ticker:1,
      price:1,
      percentChange:1,
      create_date:1
    }},
    {$sort: {create_date: 1}}
  )
    .exec(callback);
};
