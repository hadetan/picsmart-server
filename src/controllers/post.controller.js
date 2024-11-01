const { success } = require("../utils/responseWrapper");

const getAllPostsController = async (req, res) => {
	// return res.send('here are all the posts');
	return res.send(success(200, 'Here are all the posts'))
};

module.exports = {
	getAllPostsController,
};
