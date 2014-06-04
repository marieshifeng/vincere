var fs = require('fs');
var sys = require('sys');
var Image = require('../models/image');

exports.view = function(req, res){
  Image.find({}, null, {sort: {date: -1}}, function(err, images) {
       res.render('gallery', { title: "", images: images });  
})};

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
  newImage.date = new Date();
  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";
  var month = month[newImage.date.getMonth()];
  var date = newImage.date.getDate();
  var written = month + " " + date;
  newImage.written_date = written;
  console.log("Written: "+month + " " + date);
  console.log("Date: "+newImage.date);
  newImage.save(); 
  fs.writeFile(filename, buf, function (err, data) {
    if (err) return console.log(err);
  });
  res.redirect('gallery');
}