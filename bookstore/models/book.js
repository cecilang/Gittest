var mongoose = require('mongoose');

//create genre schema
var bookSchema = mongoose.Schema({ //define schema props
  title: {
    type: String,
    required: true //for validation
  },
  genre: {
    type: String,
    required: true //for validation
  },
  description: {
    type: String,
  },
  author: {
    type: String,
    required: true //for validation
  },
  publisher: {
    type: String,
  },
  pages: {
    type: String,
  },
  image_url: {
    type: String,
  },
  buy_url: {
    type: String,
  },
  create_date: {
    type: Date,
    default: Date.now //specific date of API call
  }
});

var Book = module.exports = mongoose.model('Book', bookSchema); //make copy of schema and export to outside

//get books
module.exports.getBooks = function(callback, limit){ //set up getBooks as a function for export
  Book.find(callback).limit(limit);
};

//get book by id
module.exports.getBookById = function(id, callback){ //no limit cos there's only one, no limit cos only one object is parsed, use singular term for object
  Book.findById(id, callback);//call collection, then create specific object with callback
};

//add book
module.exports.addBook = function(book, callback){ //set up addBook as a function for export, no limit cos only one object is parsed, use singular term for object
  Book.create(book, callback); //call collection, then create specific object with callback
};

//update book
module.exports.updateBook = function(id, book, options, callback){ //set up updateBook as a function for export, no limit cos only one object is parsed, use singular term for object
  var query = {_id: id};
  var update = {
    title: book.title, //defined for each document prop
    genre: book.genre,
    description: book.description,
    author: book.author,
    pages: book.pages,
    publisher: book.publisher,
    image_url: book.image_url,
    buy_url: book.buy_url,
  };
  Book.findOneAndUpdate(query, update, options, callback); //function params as defined by vars above
};

//delete book
module.exports.removeBook = function(id, callback){ //set up removeBook as a function for export, no limit cos only one object is parsed, use singular term for object
  var query = {_id: id};
  Book.remove(query, callback); //call collection, then create specific object with callback
};
