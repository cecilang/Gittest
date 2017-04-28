var mongoose = require('mongoose');

//create term schema
var termSchema = mongoose.Schema({ //define schema props
  name: {
    type: String,
    required: true //for validation
  },
  group: {
    type: String,
    required: true //for validation
  },
  ticker: {
    type: String,
    required: true //for validation
  },
  altTicker: {
    type: String,
    required: true //for validation
  },
  quote: {
    lastPrice: {type: Number},
    tradeTime: {type: Date},
    percentChange: {type: Number}
  },
  info: {
    type: String,
    required: true //for validation
  },
  product: {
    name: {type: Array},
    category: {type: String},
    pictureURL: {type: Array}
  },
  price: {
    tradingDay: {type: Array},
    close: {type: Array}
  },
  valuations: {
    pricetoearnings: {
      revenue: {type: Array},
      date: {type: Array}
    },
    pricetobook: {
      gp: {type: Array},
      date: {type: Array}
    },
    dividendyield: {
      op: {type: Array},
      date: {type: Array}
    }
  },
  financials: {
    sales: {
      revenue: {type: Array},
      date: {type: Array}
    },
    grossprofit: {
      gp: {type: Array},
      date: {type: Array}
    },
    operatingprofit: {
      op: {type: Array},
      date: {type: Array}
    },
    netincome: {
      ni: {type: Array},
      date: {type: Array}
    },
    earningspershare: {
      eps: {type: Array},
      date: {type: Array}
    },
    bookvaluepershare: {
      bps: {type: Array},
      date: {type: Array}
    },
    dividendpershare: {
      dps: {type: Array},
      date: {type: Array}
    },
  },
  sharesShort: {
    settlementDate: {type: Array},
    shortInterest: {type: Array},
    sharesOutstanding: [{
      tradingDay: {type: Date},
      sharesCount: {type: Number}
    }],
    percentfloat: {type: Number}
  },
  create_date: {
    type: Date,
    default: Date.now //specific date of API call
  }
});

var Term = module.exports = mongoose.model('Term', termSchema); //make copy of schema and export to outside

//get terms
module.exports.getTerms = function(callback, limit){ //set up a function for export
  Term.find({}, '-_id', callback).limit(limit);
};

//get term tickers
module.exports.getTermNames = function(callback, limit){ //set up a function for export
  Term.find({}, {_id:0, name:1}, callback).limit(limit);
};

//get nodes
module.exports.getNodes = function(callback, limit){ //set up a function for export
  Term.aggregate(
    {$match: {} },
    {$project: {
      _id:0,
      group:"$group",
      id:"$name"
    }
  })
    .exec(callback);
};

//get term by name
module.exports.getTermsByName = function(id, callback){ //no limit cos there's only one object parsed, and use singular for object
  var name = {name: id};
  Term.find(name, '-_id', callback);//call collection, then create specific object with callback
};

//get d3 nodes by name
module.exports.getNodesByName = function(id, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var name = { name: id };
  Term.aggregate(
    {$match: name},
    {$project: {
      _id:0,
      group:"$group",
      id:"$name"
    }
  })
    .exec(callback);
};

//update doc with EOD prices
module.exports.updatePrice = function(name, prices, options, callback){

  var query = {name: name};
  var tradingDay = prices.map(function(u) { return u.tradingDay; });
  var close = prices.map(function(u) { return u.close; });

  var update = {
    "price.tradingDay": tradingDay,
    "price.close": close
  };

  Term.findOneAndUpdate(query, update, options, callback);
};

//update doc with live quotes
module.exports.updateQuote = function(name, quote, options, callback){

  var query = {name: name};

  var tempLastPrice = quote.map(function(u) { return u.lastPrice; });
  var tempTradeTime = quote.map(function(u) { return u.tradeTimestamp; });
  var tempPercentChange = quote.map(function(u) { return u.percentChange; });

  var lastPrice = tempLastPrice[0];
  var tradeTime = tempTradeTime[0];
  var percentChange = tempPercentChange[0];

  var update = {
    "quote.lastPrice": lastPrice,
    "quote.tradeTime": tradeTime,
    "quote.percentChange": percentChange
  };

  Term.findOneAndUpdate(query, update, options, callback);
};

//update doc with Quandl SFO annual revenues
module.exports.updateRevenue = function(name, dates, revenues, options, callback){

  var query = {name: name};

  var update = {
    "financials.sales.revenue": revenues,
    "financials.sales.date": dates
  };

  Term.findOneAndUpdate(query, update, options, callback);
};

//update doc with Quandl SFO annual EBIT
module.exports.updateGP = function(name, dates, gps, options, callback){

  var query = {name: name};

  var update = {
    "financials.grossprofit.gp": gps,
    "financials.grossprofit.date": dates
  };

  Term.findOneAndUpdate(query, update, options, callback);
};

//update doc with Quandl SFO annual EBIT
module.exports.updateOP = function(name, dates, ops, options, callback){

  var query = {name: name};

  var update = {
    "financials.operatingprofit.op": ops,
    "financials.operatingprofit.date": dates
  };

  Term.findOneAndUpdate(query, update, options, callback);
};

//update doc with Quandl SFO annual Net Income
module.exports.updateNI = function(name, dates, nis, options, callback){

  var query = {name: name};

  var update = {
    "financials.netincome.ni": nis,
    "financials.netincome.date": dates
  };

  Term.findOneAndUpdate(query, update, options, callback);
};

//update doc with Quandl SFO annual Earnings per diluted share
module.exports.updateEPS = function(name, dates, eps, options, callback){

  var query = {name: name};

  var update = {
    "financials.earningspershare.eps": eps,
    "financials.earningspershare.date": dates
  };

  Term.findOneAndUpdate(query, update, options, callback);
};

//update doc with Quandl SFO annual book value per share
module.exports.updateBPS = function(name, dates, bps, options, callback){

  var query = {name: name};

  var update = {
    "financials.bookvaluepershare.bps": bps,
    "financials.bookvaluepershare.date": dates
  };

  Term.findOneAndUpdate(query, update, options, callback);
};

//update doc with Quandl SFO annual dividend per share
module.exports.updateDPS = function(name, dates, dps, options, callback){

  var query = {name: name};

  var update = {
    "financials.dividendpershare.dps": dps,
    "financials.dividendpershare.date": dates
  };

  Term.findOneAndUpdate(query, update, options, callback);
};

//get revenues
module.exports.getRevenue = function(name, callback, limit){

  var name = { name: name };
  Term.aggregate(
    {$match: name},
    {$project: {
      _id:0,
      revenue: "$financials.sales.revenue"
    }
  })
    .exec(callback);
};

//get eps
module.exports.getEarningsPerShare = function(name, callback, limit){

  var name = { name: name };
  Term.aggregate(
    {$match: name},
    {$project: {
      _id:0,
      eps: "$financials.earningspershare.eps"
    }
  })
    .exec(callback);
};

//collect latest top gainers
module.exports.topGainers = function(callback){

  Term.aggregate(
    {$project: {
      _id: 0,
      term: "$name",
      percentChange: "$quote.percentChange"
    }},
    {$sort: {percentChange: -1}}
  )
    .exec(callback);
};

//collect latest top losers
module.exports.topLosers = function(callback){

  var query = {
    $and: [
      {name: { $not: /^C/ }},
      {name: { $not: /^P/ }}
    ]
  };

  Term.aggregate(
    {$match: query},
    {$project: {
      _id: 0,
      term: "$name",
      percentChange: "$quote.percentChange"
    }},
    {$sort: {percentChange: 1}}
  )
    .exec(callback);
};

//get all products
module.exports.getProducts = function(callback, limit){ //set up a function for export

  var query = {
    $and: [
      {name: { $not: /^C/ }}
    ]
  };

  Term.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      name:1,
      "product.name":1,
      "product.category":1
    }}
  )
    .exec(callback);
};

//get randomized products
module.exports.getRandomProducts = function(callback, limit){ //set up a function for export

  var query = {
    $and: [
      {name: { $not: /^C/ }}
    ]
  };

  Term.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      name:1,
      "product.name":1,
      "product.category":1
    }},
    { $sample : { size: 5 } }
  )
    .exec(callback);
};

//get products of one company
module.exports.getProductsByCompany = function(name, callback, limit){ //set up a function for export

  var query = {
    name: name,
    $and: [
      {name: { $not: /^C/ }}
    ]
  };

  Term.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      name:1,
      "product.name":1,
      "product.category":1
    }}
  )
    .exec(callback);
};

//get all tickers
module.exports.getTickers = function(callback, limit){

  var query = {
    $and: [
      {name: { $not: /^C/ }},
      {name: { $not: /^P/ }}
    ]
  };

  Term.aggregate(
    {$match: query},
    {$group: {
      _id: "whatever",
      tickerArray: {$push: "$ticker"},
      companyArray: {$push: "$name"}
    }},
    {$project: {
      _id:0,
      tickerArray:1,
      companyArray:1,
      tickerCount: {$size: "$tickerArray"}
    }}
  )
    .exec(callback);
};

//get one ticker
module.exports.getTickerByCompany = function(company, callback){

  var query = {
    name: company
  };

  Term.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      name:1,
      ticker:1
    }}
  )
    .exec(callback);
};
