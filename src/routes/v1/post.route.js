const { getAllPostsController } = require('../../controllers/post.controller');
const requireUser = require('../../middlewares/requireUser');
const router = require('express').Router();

router.get('/all', requireUser, getAllPostsController);

module.exports = router;
