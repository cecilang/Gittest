var Product = require('../models/product');
var mongoose = require('mongoose');

mongoose.connect('localhost:27017/amazing')

//products to be entered into DB
var products = [

  new Product({
    image: '/images/betafish.png',
    title: 'Big Happy Anchor Poster',
    description: 'Awesome Poster!',
    price: 10,
  }),

  new Product({
    image: '/images/betafishlogo-long.png',
    title: 'Extra Big and Long: Happy Anchor Poster',
    description: 'Best of both worlds!',
    price: 20,
  }),

  new Product({
    image: '/images/betafishlong.png',
    title: 'Long Happy Anchor Poster',
    description: 'Awesome Long Poster!',
    price: 15,
  }),
];

//helper to insert each product into DB before disconnect
var done = 0;
for (var i = 0; i < products.length; i++){
  products[i].save(function(err, result) {
    done++;
    if(done === products.length) {
      exit();
    }
  });
}

function exit(){
  mongoose.disconnect();
}

//run by navigating into seed folder and enter $ node (seeder file name) in terminal.
