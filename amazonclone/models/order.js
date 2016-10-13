var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'}, //taking user id from user model
  cart: {type: Object, required: true}, //mongo stores in json so changing type is not a problem
  address: {type: String, required: true},
  name: {type: String, required: true},
  paymentId: {type: String, required: true},
});

module.exports = mongoose.model('Order', schema);
