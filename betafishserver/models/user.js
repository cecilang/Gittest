var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema

// set up a user model
var userSchema = Schema({
  name: {
        type: String,
        required: true
    },
  email: {
        type: String,
        unique: true,
        required: true
    },
  password: {
        type: String,
        required: true
    },
  alerts: {
    name: {
      type: String
    },
    ticker: {
      type: String
    },
    price: {
      type: Number
    },
    limit: {
      type: String
    },
  },
  create_date: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

userSchema.methods.comparePassword = function (pwd, cb) {
    bcrypt.compare(pwd, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

var User = module.exports = mongoose.model('User', userSchema);

//get user deets
module.exports.getProfile = function(id, callback){

  var query = {_id: id};
  User.find(query, '-_id', callback);
};

//update user email
module.exports.updateEmail = function(email, newEmail, options, callback){

  var query = {email: email};
  var update = {"email": newEmail};

  User.findOneAndUpdate(query, update, options, callback);
};

//update user price alerts
module.exports.updateAlerts = function(id, name, ticker, price, limit, options, callback){

  var query = {_id: id};

  var update = {
    "alerts.name": name,
    "alerts.ticker": ticker,
    "alerts.price": price,
    "alerts.limit": limit
  };

  User.findOneAndUpdate(query, update, options, callback);
};
