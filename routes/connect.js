exports.view = function(req, res){
	var user_story = req.body.user_story;
	console.log("User story: " + user_story);
	res.render('connect', { title: "test", story: user_story});
};