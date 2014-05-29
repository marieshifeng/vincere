var dir = "./userImages/";


fs = require('fs')
, out = fs.createWriteStream(dir + '/text.png')
 , stream = canvas.pngStream();

exports.saveImage = function(req, res) {

	var imageURL = req.query.imageURL;
	if(!imageURL) {
		res.send(400, "Unable to parse image parameter of URL.");
	} else {
		console.log("Saving image " + imageURL);
		var img = new Image();
        img.src = imageURL;

		res.send(200, "Saved image " + imageURL + " to " + dir);
	}
	
}