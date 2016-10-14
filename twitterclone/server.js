var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

var app = express(); //initialize express
var db = null;

//connect to mongodb
MongoClient.connect("mongodb://localhost:27017/spouts", function(err, dbconnect) {
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

app.post('/spouts', function(req, res, next) {
  db.collection('spouts', function(err, spoutsCollection) {
    var newSpout = {
      text: req.body.newSpout
    };

    spoutsCollection.insert(newSpout, {w:1}, function(err){ //insert new spouts with object, mongo's write option, and callback
      return res.send(); //just to say it works, without an object
    });
  });
});

app.listen(3000, function(){
  console.log('listening...');
});
