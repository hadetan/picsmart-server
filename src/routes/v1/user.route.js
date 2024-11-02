const {
	followOrUnfollowController,
	getPostsOfFollowing,
} = require('../../controllers/user.controller');
const requireUser = require('../../middlewares/requireUser');

const router = require('express').Router();

router.post('/follow', requireUser, followOrUnfollowController);
router.get('/followingposts', requireUser, getPostsOfFollowing);

module.exports = router;
