var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');

var app = express(); //initialize express
var db = null;
var JWT_SECRET = 'fishspouts';

//connect to mongodb
MongoClient.connect("mongodb://localhost:27017/spoutsdb", function(err, dbconnect) {
  if(!err) {
    console.log("connected to mongodb");
    db = dbconnect
  }
});

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/spouts', function(req, res, next) {  //do this when someone hits the url
  db.collection('spouts', function(err, spoutsCollection) {
    spoutsCollection.find().toArray(function(err, spouts){ //look up array of spouts in db
      return res.json(spouts);
    });
  });
});

//create a new spout on server
app.post('/spouts', function(req, res, next) {

  var token = req.headers.authorization;
  var user = jwt.decode(token, JWT_SECRET);

  db.collection('spouts', function(err, spoutsCollection) {
    var newSpout = {
      text: req.body.newSpout,
      user: user._id,
      username: user.username,
    };

    spoutsCollection.insert(newSpout, {w:1}, function(err){ //insert new spouts with object, mongo's write option, and callback
      return res.send(); //just to say it works, without an object
    });
  });
});

//remove a spout on server
app.put('/spouts/remove', function(req, res, next) {

  var token = req.headers.authorization;
  var user = jwt.decode(token, JWT_SECRET);

  db.collection('spouts', function(err, spoutsCollection) {
    var spoutId = req.body.spout._id; //parse entire spout back and get by id

    spoutsCollection.remove({_id: ObjectID(spoutId), user: user._id}, {w:1}, function(err){ //insert new spouts with mongo ObjectID, mongo's write option, and callback
      return res.send(); //just to say it works, without an object
    });
  });
});

//create a new user on server
app.post('/users', function(req, res, next) {
  db.collection('users', function(err, usersCollection) {

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          //hash replaced password
          var newUser = {
            username: req.body.username,
            password: hash, //store hash instead of password
          };

          usersCollection.insert(newUser, {w:1}, function(err){ //insert new user var, mongo's write option, and callback
          });  // Store hash in your password DB.
        });
    });
  });
});

//sign in user on server
app.put('/users/signin', function(req, res, next) {
  db.collection('users', function(err, usersCollection) {

    usersCollection.findOne({username: req.body.username}, function(err, user){ //find just one user

      //compare password entered to DB
      bcrypt.compare(req.body.password, user.password, function(err, result){
        if (result){
          var token = jwt.encode(user, JWT_SECRET); //injecting token for cookie session
          return res.json({token: token}); //brackets for res.json
        } else{
          return res.status(400).send();
        }
      });
    });
  });
});

app.listen(3000, function(){
  console.log('listening...');
});
