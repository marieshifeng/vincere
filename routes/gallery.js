var fs = require('fs');
var sys = require('sys');
var Image = require('../models/image');

exports.view = function(req, res){
  Image.find( function ( err, images ){
       res.render('gallery', { title: "", images: images });           
  });
};

exports.post = function(req, res){
  var img = req.body.img;
  var data = img.replace(/^data:image\/\w+;base64,/, "");
  var buf = new Buffer(data, 'base64');
  var randNum = Math.floor((Math.random() * 100) + 1);
  //var filename = './public/images/temp/image' + randNum + '.png';
  var filename = './public/images/image' + randNum + '.png';
  var newImage = new Image();
  //newImage.url = 'images/temp/image' + randNum + '.png';
  newImage.url = 'images/image' + randNum + '.png';
  newImage.save(); 
  fs.writeFile(filename, buf, function (err, data) {
    if (err) return console.log(err);
  });
  res.redirect('/gallery');
}
