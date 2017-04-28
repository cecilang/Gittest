var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

// set up a basket model
var basketSchema = mongoose.Schema({
  creator: {
        type: String, ref: 'User',
        required: true
    },
  basketname: {
        type: String,
        required: true
    },
  item: {
        type: String
    },
  active: {
        type: Boolean,
        default: true
    },
  default: {
        type: Boolean,
        default: false
    },
  create_date: {
        type: Date,
        default: Date.now //specific date of API call
    },
  lastModified: {
        type: Date
    }
});

var Basket = module.exports = mongoose.model('Basket', basketSchema); //make copy of schema and export to outside

//get baskets by user
module.exports.getBasketsByUser = function(id, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var query = {creator: id};
  Basket.aggregate(
    {$match: query},
    {$project: {
      _id:1,
      creator:1,
      basketname:1,
      item:1,
      active:1
    }
  })
    .exec(callback);
};

//get one basket
module.exports.getBasketById = function(id, callback){

  var query = {_id: id};
  Basket.find(query, '-_id', callback);
};

//update basket
module.exports.updateBasket = function(id, basket, options, callback){ //set up updateRelationship as a function for export, no limit cos only one object is parsed, use singular term for object
  var query = {_id: id};
  var update = {
    basketname: basket.basketname,
    item: basket.item, //defined for each document prop
    $currentDate: {
      lastModified: true
  }};
  Basket.findOneAndUpdate(query, update, options, callback); //function params as defined by vars above
};

//delete basket
module.exports.deactivateBasket = function(id, update, options, callback){ //set up updateRelationship as a function for export, no limit cos only one object is parsed, use singular term for object
  var query = {_id: id};
  var update = {active: false};
  Basket.findOneAndUpdate(query, update, options, callback); //function params as defined by vars above
};

//restate basket
module.exports.activateBasket = function(id, update, options, callback){ //set up updateRelationship as a function for export, no limit cos only one object is parsed, use singular term for object
  var query = {_id: id};
  var update = {active: true};
  Basket.findOneAndUpdate(query, update, options, callback); //function params as defined by vars above
};

//match basketname on update
module.exports.matchBasketnameOnUpdate = function(userid, basketid, name, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var query = {
    creator: userid,
    _id: {$ne: ObjectId(basketid)},
    active: true
  };
  Basket.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      creator: 1,
      namematch: {
        $cond: [ {$ne: ["$basketname", name]}, false, true ]
      }
    }},
    {$group: {
      _id: "$creator",
      namematches: {$push: "$namematch"},
    }},
    {$project: {
      _id:0,
      nameMatchResult: {$anyElementTrue: ["$namematches"]}
    }}
  )
    .exec(callback);
};

//match basketname on save
module.exports.matchBasketnameOnSave = function(userid, name, callback){ //no limit cos there's only one object parsed, and use singular term for object
  var query = {
    creator: userid,
    active: true
  };
  Basket.aggregate(
    {$match: query},
    {$project: {
      _id:0,
      creator: 1,
      namematch: {
        $cond: [ {$ne: ["$basketname", name]}, false, true ]
      }
    }},
    {$group: {
      _id: "$creator",
      namematches: {$push: "$namematch"},
    }},
    {$project: {
      _id:0,
      nameMatchResult: {$anyElementTrue: ["$namematches"]}
    }}
  )
    .exec(callback);
};
