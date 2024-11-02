const Post = require('../models/Post');
const User = require('../models/User');
const { success, error } = require('../utils/responseWrapper');

const createPostController = async (req, res) => {
	const { caption } = req.body;

	if (!caption) {
		return res.send(error(400, 'Caption is required'));
	}

	const owner = req._id; //Being sent from our middleware.

	const user = await User.findById(owner);

	try {
		const post = await Post.create({
			owner, // In our Post.js schema we are expecting an owner id, so we will provide it like this.
			caption,
		});

		// In our User.js schema, we are expecting a post id, thats why we are pushing it to that array.
		user.posts.push(post._id);
		await user.save();

		return res.send(success(201, { post }));
	} catch (err) {
		return res.send(error(500, err.message));
	}
};

const updatePostController = async (req, res) => {
	const { postId, caption } = req.body;
	const curUserId = req._id;

	if (!postId) {
		return res.send(error(400, 'Post id is required'));
	}

	const post = await Post.findById(postId);

	if (!post) {
		return res.send(error(404, 'Post not found'));
	}

	if (post.owner.toString() !== curUserId) {
		return res.send(error(403, 'Only owners can update their posts'));
	}

	if (caption) {
		post.caption = caption;
	}

	await post.save();

	return res.send(success(200, { post }));
};

const deletePostController = async (req, res) => {
	try {
		const { postId } = req.body;
		const curUserId = req._id;

		const post = await Post.findById(postId);

		if (!post) {
			return res.send(error(404, 'Post not found'));
		}

		if (post.owner.toString() !== curUserId) {
			return res.send(error(403, 'Only owners can delete their posts'));
		}

		const user = await User.findById(curUserId);

		// Deleting the post from the users posts array
		const index = user.posts.indexOf(postId);
		user.posts.splice(index, 1);

		await user.save();
		// Deleting the post from the Post schema
		await post.deleteOne();

		return res.send(success(200, 'Post deleted successfully'));
	} catch (err) {
		return res.send(error(500, err.message));
	}
};

const likeAndUnlikeController = async (req, res) => {
	const { postId } = req.body;

	if (!postId) {
		return res.send(error(400, 'Post id is required'));
	}

	const curUserId = req._id; // Current user who is going to like this post

	const post = await Post.findById(postId);

	if (!post) {
		return res.send(error(404, 'Post not found'));
	}

	// If user has already liked then we will dislike it, or if its disliked then we will like it.
	if (post.likes.includes(curUserId)) {
		try {
			const index = post.likes.indexOf(curUserId);
			post.likes.splice(index, 1);

			await post.save();
			return res.send(success(200, 'Post disliked'));
		} catch (err) {
			return res.send(error(500, err.message));
		}
	} else {
		try {
			post.likes.push(curUserId);
			await post.save();

			return res.send(success(200, 'Post liked'));
		} catch (err) {
			return res.send(error(500, err.message));
		}
	}
};

module.exports = {
	createPostController,
	likeAndUnlikeController,
	updatePostController,
	deletePostController,
};
