var mongoose = require('mongoose');

//create genre schema
var genreSchema = mongoose.Schema({
  name: {
    type: String,
    required: true //for validation
  },
  create_date:{
    type: Date,
    default: Date.now //specific date of API call
  }
});

var Genre = module.exports = mongoose.model('Genre', genreSchema); //make copy of schema and export to outside

//get genres
module.exports.getGenres = function(callback, limit){ //set up getGenres as a function for export
  Genre.find(callback).limit(limit); //call collection, then find with callback
};

//add genre
module.exports.addGenre = function(genre, callback){ //set up addGenre as a function for export, no limit cos only one object is parsed, use singular term for object
  Genre.create(genre, callback); //call collection, then create specific object with callback
};

//update genre
module.exports.updateGenre = function(id, genre, options, callback){ //set up updateGenre as a function for export, no limit cos only one object is parsed, use singular term for object
  var query = {_id: id};
  var update = {
    name: genre.name //defined for each document prop
  };
  Genre.findOneAndUpdate(query, update, options, callback); //function params as defined by vars above
};

//delete genre
module.exports.removeGenre = function(id, callback){ //set up addGenre as a function for export, no limit cos only one object is parsed, use singular term for object
  var query = {_id: id};
  Genre.remove(query, callback); //call collection, then create specific object with callback
};
