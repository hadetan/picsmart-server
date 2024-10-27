const { loginController } = require('../../controllers/auth.controller');
const router = require('express').Router();

router.post('/login', loginController);

module.exports = router;