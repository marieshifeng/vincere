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