<<<<<<< HEAD
var mongoose = require("mongoose");

var ImageSchema = new mongoose.Schema({
	url: String
});

ImageSchema.statics.save = function(url, done) {
	var Image = this;
	Image.create({
		url : url
	}, function(err){
		done(err);
	});
};

var Image = mongoose.model('Image', ImageSchema);
module.exports = Image;
=======
var mongoose = require('mongoose');

// define the schema for our user model
var imageSchema = mongoose.Schema({  
	URL : String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Image', imageSchema);
>>>>>>> FETCH_HEAD
