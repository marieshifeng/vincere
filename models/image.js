var mongoose = require('mongoose');

// define the schema for our user model
var ImageSchema = mongoose.Schema({  
	url : String
});

ImageSchema.statics.save = function(url, done) {
     var Image = this;
     Image.create({
          url : url
     }, function(err){
          done(err);
     });
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Image', ImageSchema);