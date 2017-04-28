var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var morgan   = require('morgan');
var cors = require('cors');
var config   = require('./config/database'); 

// connect to database
mongoose.connect(config.database);

//define api routes
var routes = require('./routes/index');
var user = require('./routes/user');
var api = require('./routes/api');

// Init App
var app = express();

app.set('port', (process.env.PORT || 5000));

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// log to console
app.use(morgan('dev'));

//CORS Middleware
app.use(cors());

// Passport init
app.use(passport.initialize());

//connect the routes
app.use('/', routes);
app.use('/user', user);
app.use('/api', api);

//Set Port
app.listen(app.get('port'), function() {
  console.log('listening on port ', app.get('port'));
});
