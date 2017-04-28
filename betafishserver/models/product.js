var mongoose = require('mongoose');

//create relationship schema
var productSchema = mongoose.Schema({
  product: {
    name: {type: String},
    category: {type: String}
  },
  company: {
    type: String,
  },
  user: {
      type: String, ref: 'User'
  },
  create_date:{
    type: Date,
    default: Date.now //specific date of API call
  }
});

var Product = module.exports = mongoose.model('Product', productSchema); //make copy of schema and export to outside

//count product upvotes last 30 days
module.exports.productCount30Days = function(callback){

  var today = new Date();

  var start = new Date().setDate(today.getDate()-30);

  var startDate = new Date(start);
  startDate.setHours(0,0,0);

  var query = {
    create_date: { $gte: startDate, $lte: today }
  };

  Product.aggregate(
    {$match: query},
    {$group: {
      _id: {
        company: "$company",
        name: "$product.name",
      },
      counts: {$push: "$create_date"}
    }},
    {$project: {
      _id:0,
      product:"$_id",
      productCount: {$size: "$counts"}
    }},
    {$sort: {productCount: -1}}
  )
    .exec(callback);
};

//count product upvotes last 90 days
module.exports.productCount90Days = function(callback){

  var today = new Date();

  var start = new Date().setDate(today.getDate()-90);

  var startDate = new Date(start);
  startDate.setHours(0,0,0);

  var query = {
    create_date: { $gte: startDate, $lte: today }
  };

  Product.aggregate(
    {$match: query},
    {$group: {
      _id: {
        company: "$company",
        name: "$product.name",
      },
      counts: {$push: "$create_date"}
    }},
    {$project: {
      _id:0,
      product:"$_id",
      productCount: {$size: "$counts"}
    }},
    {$sort: {productCount: -1}}
  )
    .exec(callback);
};

//product upvotes by user
module.exports.getProductsByUser = function(userid, callback){

  var query = {
    user: userid
  };

  Product.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      user:1,
      company:1,
      "product.name":1,
      "product.category":1
    }}
  )
    .exec(callback);
};

//product upvotes by company
module.exports.getProductsByCompany = function(company, callback){

  var query = {
    company: company
  };

  Product.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      company:1,
      user:1,
      "product.name":1,
      "product.category":1
    }}
  )
    .exec(callback);
};
