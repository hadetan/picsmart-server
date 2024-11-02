const {
	createPostController,
	likeAndUnlikeController,
	updatePostController,
	deletePostController,
} = require('../../controllers/post.controller');
const requireUser = require('../../middlewares/requireUser');
const router = require('express').Router();

router.post('/', requireUser, createPostController);
router.post('/like', requireUser, likeAndUnlikeController);
router.put('/update', requireUser, updatePostController);
router.delete('/', requireUser, deletePostController);

module.exports = router;
