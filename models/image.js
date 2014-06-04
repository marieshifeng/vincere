var mongoose = require('mongoose');

// define the schema for our user model
var ImageSchema = mongoose.Schema({  
	url : String,
	date : Date, 
	written_date : String
});

ImageSchema.statics.save = function(url, date, written_date, done) {
     var Image = this;
     Image.create({
          url : url,
          date : date,
          written_date : written_date
     }, function(err){
          done(err);
     });
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Image', ImageSchema);