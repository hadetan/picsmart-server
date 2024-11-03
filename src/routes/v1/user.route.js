const {
	followOrUnfollowController,
	getPostsOfFollowingController,
	getMyPostController,
	getUserPostController,
	deleteMyProfileController,
} = require('../../controllers/user.controller');
const requireUser = require('../../middlewares/requireUser');

const router = require('express').Router();

router.post('/follow', requireUser, followOrUnfollowController);
router.get('/followingposts', requireUser, getPostsOfFollowingController);
router.get('/myposts', requireUser, getMyPostController);
router.get('/userposts', requireUser, getUserPostController);
router.delete('/', requireUser, deleteMyProfileController);

module.exports = router;
