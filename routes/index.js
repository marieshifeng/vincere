
/*
 * GET home page.
 */
var Image = require('../models/image');

exports.index = function(req, res){
	Image.find( function ( err, images ){
		res.render('index', { title: "", images: images });  		
	});
};