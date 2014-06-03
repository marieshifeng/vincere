exports.getUrl = function(req, res) {
	console.log("Getting url, which is: " + req.session.url);
	res.json(req.session.url);
}

exports.setUrl = function(req, res) {
	var newurl = req.query.newurl;
	if(!newurl) {
		res.send(400, "Unable to parse new url parameter of URL.");
	} else {
		console.log("Setting url, which is: " + newurl);
		req.session.url = newurl;
		res.send(200, "Url changed to " + req.session.url);
	}
}