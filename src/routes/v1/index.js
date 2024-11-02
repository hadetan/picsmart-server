const router = require('express').Router();
const authRouter = require('./auth.route');
const postRouter = require('./post.route');
const userRouter = require('./user.route');

router.use('/auth', authRouter);
router.use('/post', postRouter);
router.use('/user', userRouter);

module.exports = router;
