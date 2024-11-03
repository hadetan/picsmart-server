const Post = require('../models/Post');
const User = require('../models/User');
const { success, error } = require('../utils/responseWrapper');

const followOrUnfollowController = async (req, res) => {
	const { userIdToFollow } = req.body;
	const curUserId = req._id;

	// Checking if the userIdToFollow and curUserId are both same? If they are then its not good because a user should not follow themselves
	if (userIdToFollow === curUserId) {
		return res.send(error(409, 'Cannot follow yourself'));
	}

	// Checking if the user has sent us the user id to follow
	if (!userIdToFollow) {
		return res.send(error(400, 'User id to follow is required'));
	}

	const userToFollow = await User.findById(userIdToFollow);

	// Finding if the user that they want to follow exists in our database.
	if (!userToFollow) {
		return res.send(error(404, 'User to follow not found'));
	}

	const curUser = await User.findById(curUserId);

	// Checking if the current user is actually a real user or a fake user.
	if (!curUser) {
		return res.send(error(404, 'Current user not found'));
	}

	if (curUser.followings.includes(userIdToFollow)) {
		// If the user is already present that they want to follow then make them unfollow.
		try {
			const followingIndex = curUser.followings.indexOf(userIdToFollow);
			curUser.followings.splice(followingIndex, 1);

			// When you unfollow a user, your followings decrement by one, and the user that you unfollowed gets their followers decremented by one as well. So we will have to handle that as well here.
			const followerIndex = userToFollow.followers.indexOf(curUserId);
			userToFollow.followers.splice(followerIndex, 1);

			// Save both users now
			await userToFollow.save();
			await curUser.save();

			return res.send(success(200, 'User unfollowed'));
		} catch (err) {
			return res.send(error(500, err.message));
		}
	} else {
		// If the user is not present that they want to follow then make them follow
		try {
			// When you follow a user, your followings increment by one, and the user that you followed gets their followers incremented by one as well. So we will have to handle that as well here.
			userToFollow.followers.push(curUserId);
			curUser.followings.push(userIdToFollow);

			// Save both users
			await userToFollow.save();
			await curUser.save();

			return res.send(success(200, 'User followed'));
		} catch (err) {
			return res.send(error(500, err.message));
		}
	}
};

const getPostsOfFollowingController = async (req, res) => {
	try {
		const curUserId = req._id;

		const curUser = await User.findById(curUserId);

		// What this method will do is that, it will search the whole post schema and return all of the posts that has the owner of the followings the current user has. The $in operator helps us to search something that has the value `in` inside of it.
		// The `.find()` functions returns an array.
		const posts = await Post.find({
			owner: {
				$in: curUser.followings,
			},
		});

		return res.send(success(200, { posts }));
	} catch (err) {
		return res.send(error(500, err.message));
	}
};

const getMyPostController = async (req, res) => {
	try {
		const curUserId = req._id;

		const allUserPosts = await Post.find({
			owner: {
				$in: curUserId,
			},
		}).populate('likes');

		return res.send(success(200, { allUserPosts }));
	} catch (err) {
		return res.send(error(500, err.message));
	}
};

const getUserPostController = async (req, res) => {
	try {
		const { userId } = req.body;

		if (!userId) {
			return res.send(error(400, 'User id is required'));
		}

		const allUserPost = await Post.find({
			owner: {
				$in: userId,
			},
		}).populate('likes');

		return res.send(success(200, { allUserPost }));
	} catch (err) {
		return res.send(error(500, err.message));
	}
};

const deleteMyProfileController = async (req, res) => {
	try {
		const curUserId = req._id;

		const curUser = await User.findById(curUserId);

		// Delete all posts
		await Post.deleteMany({
			owner: curUserId,
		});

		// Go to this users followers and delete the user from their followings list
		curUser.followers.forEach(async (followerId) => {
			const follower = await User.findById(followerId);
			const index = follower.followings.indexOf(curUserId);
			follower.followings.splice(index, 1);
			await follower.save();
		});

		// Go to this users followings and delete the user from their followers list
		curUser.followings.forEach(async (followingId) => {
			const following = await User.findById(followingId);
			const index = following.followers.indexOf(curUserId);
			following.followers.splice(index, 1);
			await following.save();
		});

		// Remove myself from all of the posts I have liked
		const allPosts = await Post.find();
		allPosts.forEach(async (post) => {
			const index = post.likes.indexOf(curUserId);
			post.likes.splice(index, 1);
			await post.save();
		});

		// Deleting my account now
		await curUser.deleteOne();

		res.clearCookie('jwt', {
			httpOnly: true,
			secure: true,
		});

		return res.send(success(200, 'User deleted successfully'));
	} catch (err) {
		return res.send(error(500, err.message));
	}
};

module.exports = {
	followOrUnfollowController,
	getPostsOfFollowingController,
	getMyPostController,
	getUserPostController,
	deleteMyProfileController,
};
