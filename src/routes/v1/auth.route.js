const {
	loginController,
	signupController,
	refreshAccessTokenController,
	logoutController,
} = require('../../controllers/auth.controller');
const router = require('express').Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/refreshtoken', refreshAccessTokenController);
router.delete('/logout', logoutController);

module.exports = router;
