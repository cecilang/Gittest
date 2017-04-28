module.exports = {
  'secret': 'secret',
  'database': process.env.MONGOLAB_URI ||
  process.env.MONGODB_URI || 'mongodb://localhost/bftest'
};

/*connect to db
var uristring =
process.env.MONGOLAB_URI ||
process.env.MONGODB_URI ||
'mongodb://localhost/bftest';

mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Connected to: ' + uristring);
  }
});
*/
