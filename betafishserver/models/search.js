var mongoose = require('mongoose');

//create relationship schema
var searchSchema = mongoose.Schema({
  term: {
    type: String,
    required: true //for validation
  },
  user: {
      type: String, ref: 'User'
  },
  create_date:{
    type: Date,
    default: Date.now //specific date of API call
  }
});

var Search = module.exports = mongoose.model('Search', searchSchema); //make copy of schema and export to outside

//count searches last 30 days
module.exports.searchCount30Days = function(callback){

  var today = new Date();

  var start = new Date().setDate(today.getDate()-30);

  var startDate = new Date(start);
  startDate.setHours(0,0,0);

  var query = {
    create_date: { $gte: startDate, $lt: today }
  };

  Search.aggregate(
    {$match: query},
    {$group: {
      _id: "$term",
      counts: {$push: "$create_date"},
    }},
    {$project: {
      _id:0,
      term:"$_id",
      searchCount: {$size: "$counts"}
    }},
    {$sort: {searchCount: -1}}
  )
    .exec(callback);
};

//count searches last 90 days
module.exports.searchCount90Days = function(callback){

  var today = new Date();

  var start = new Date().setDate(today.getDate()-90);

  var startDate = new Date(start);
  startDate.setHours(0,0,0);

  var query = {
    create_date: { $gte: startDate, $lt: today }
  };

  Search.aggregate(
    {$match: query},
    {$group: {
      _id: "$term",
      counts: {$push: "$create_date"}
    }},
    {$project: {
      _id:0,
      term:"$_id",
      searchCount: {$size: "$counts"}
    }},
    {$sort: {searchCount: -1}}
  )
    .exec(callback);
};

//count concept searches last 90 days
module.exports.conceptCount90Days = function(callback){

  var today = new Date();

  var start = new Date().setDate(today.getDate()-90);

  var startDate = new Date(start);
  startDate.setHours(0,0,0);

  var query = {
    create_date: { $gte: startDate, $lt: today },
    term: { $regex: /^C/ }
  };

  Search.aggregate(
    {$match: query},
    {$group: {
      _id: "$term",
      counts: {$push: "$create_date"}
    }},
    {$project: {
      _id:0,
      term:"$_id",
      searchCount: {$size: "$counts"}
    }},
    {$sort: {searchCount: -1}}
  )
    .exec(callback);
};

//search terms by user
module.exports.getSearchByUser = function(userid, callback){

  var query = {
    user: userid
  };

  Search.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      user:1,
      term:1,
      create_date:1
    }}
  )
    .exec(callback);
};
