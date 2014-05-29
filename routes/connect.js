

exports.view = function(req, res){
	console.log(req.body.storyData);
	var user_story = req.body.storyData;
	console.log("User story: " + user_story);
	res.render('connect', { title: "test", story: user_story});
};