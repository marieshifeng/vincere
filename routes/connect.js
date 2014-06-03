<<<<<<< HEAD
var fs = require('fs');
var sys = require('sys');
var Image = require('../models/image');
=======


>>>>>>> FETCH_HEAD
exports.view = function(req, res){
	console.log(req.body.storyData);
	var user_story = req.body.storyData;
	console.log("User story: " + user_story);
	res.render('connect', { title: "test", story: user_story});
};

exports.post = function(req, res){
    console.log("1");
	var img = req.body.img;
	var data = img.replace(/^data:image\/\w+;base64,/, "");
	var buf = new Buffer(data, 'base64');
	var randNum = Math.floor((Math.random() * 100) + 1);
	console.log(randNum);
	console.log("2");
	//var filename = __dirname + '/temp/image'+randNum+'.png';
	var filename = './public/images/temp/image'+randNum+'.png';
	console.log(filename);
	var newImage = new Image();
    newImage.URL = 'images/temp/image'+randNum+'.png';
    
    newImage.save();
            
	fs.writeFile(filename, buf, function (err,data) {
  		if (err) {
    		return console.log(err);
  		}
  			console.log(data);
  		});
	console.log("saved file");
	Image.find( function ( err, images ){
		res.render('index', { title: "", images: images });  		
	});
}
