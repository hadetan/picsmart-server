const {
	loginController,
	signupController,
	refreshAccessTokenController,
} = require('../../controllers/auth.controller');
const router = require('express').Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/refreshtoken', refreshAccessTokenController);

module.exports = router;
