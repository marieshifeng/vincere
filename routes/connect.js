exports.view = function(req, res){
	var newurl = parseInt(Math.random()*1e4,10).toString(16);
	res.render('connect', { title: "", usingNewSite: true , newurl: newurl});
};