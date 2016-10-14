var express = require('express');
var bodyParser = require('body-parser');

var app = express(); //initialize express

app.use(bodyParser.json());
app.use(express.static('public'));

var spouts = [
  'I just saw a shark!',
  'A fishing boat just came by... ugh',
  'Wowed some simpleton humans with my spouts.',
];

app.get('/spouts', function(req, res, next) {  //do this when someone hits the url
  res.send(spouts);
});

app.post('/spouts', function(req, res, next) {
  console.log(req.body); //require body parser for json data being posted
  res.send();
});

app.listen(3000, function(){
  console.log('listening...');
});
