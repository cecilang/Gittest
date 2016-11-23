var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.use(bodyParser.json()); //setup middleware for bodyParser

Genre = require('./models/genre'); //import genre from models
Book = require('./models/book'); //import book from models

//connect to mongoose
mongoose.connect('mongodb://localhost/bookstore');
var db = mongoose.connection;

app.get('/', function(req, res){
  res.send('Please use /api/books or /api/genres');
});

//create api to get all genres
app.get('/api/genres', function(req, res){
  Genre.getGenres(function(err, genres){
    if(err){
      throw err;
    }
    res.json(genres);
  });
});

//create a post api to create a new genre
app.post('/api/genres', function(req, res){ //can use same url as long as the req is different - can use put and delete methods as well
  var genre = req.body; //body-parser parses out the form and put into genre object
  Genre.addGenre(genre, function(err, genre){ //result object takes on singular term
    if(err){
      throw err;
    }
    res.json(genre);
  });
}); //use Rest Easy api client to post files to DB (Header: content-type: application/json)

//create a put api to update a genre
app.put('/api/genres/:_id', function(req, res){ //can use same url as long as the req is different - can use put and delete methods as well
  var id = req.params._id; //_id to match DB
  var genre = req.body; //body-parser parses out the form and put into  object
  Genre.updateGenre(id, genre, {}, function(err, genre){ //result object takes on singular term
    if(err){
      throw err;
    }
    res.json(genre);
  });
}); //use Rest Easy api client to post files to DB (Header: content-type: application/json)

//delete a genre
app.delete('/api/genres/:_id', function(req, res){ //can use same url as long as the req is different - can use put and delete methods as well
  var id = req.params._id; //_id to match DB
  Genre.removeGenre(id, function(err, genre){ //result object takes on singular term
    if(err){
      throw err;
    }
    res.json(genre);
  });
}); //use Rest Easy api client to post files to DB (Header: content-type: application/json)

//create api to get all books
app.get('/api/books', function(req, res){
  Book.getBooks(function(err, books){
    if(err){
      throw err;
    }
    res.json(books);
  });
});

//create api to get one book by id
app.get('/api/books/:_id', function(req, res){
  Book.getBookById(req.params._id, function(err, book){ //id to come from URI, singular term used for result object
    if(err){
      throw err;
    }
    res.json(book);
  });
});

//create api to post a new book
app.post('/api/books', function(req, res){ //can use same url as long as the req is different - can use put and delete methods as well
  var book = req.body; //body-parser parses out the form and put into book object
  Book.addBook(book, function(err, book){ //result object takes on singular term
    if(err){
      throw err;
    }
    res.json(book);
  });
}); //use Rest Easy api client to post files to DB (Header: content-type: application/json)

//create a put api to update a book
app.put('/api/books/:_id', function(req, res){ //can use same url as long as the req is different - can use put and delete methods as well
  var id = req.params._id; //_id to match DB
  var book = req.body; //body-parser parses out the form and put into  object
  Book.updateBook(id, book, {}, function(err, book){ //result object takes on singular term
    if(err){
      throw err;
    }
    res.json(book);
  });
}); //use Rest Easy api client to post files to DB (Header: content-type: application/json)

//delete a genre
app.delete('/api/books/:_id', function(req, res){ //can use same url as long as the req is different - can use put and delete methods as well
  var id = req.params._id; //_id to match DB
  Book.removeBook(id, function(err, genre){ //result object takes on singular term
    if(err){
      throw err;
    }
    res.json(book);
  });
}); //use Rest Easy api client to post files to DB (Header: content-type: application/json)

app.listen(process.env.PORT || 4000);
console.log('listening on port 4000...');
