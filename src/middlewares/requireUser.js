const jwt = require('jsonwebtoken');
const { error } = require('../utils/responseWrapper');
const { ACCESS_TOKEN_PRIVATE_KEY } = require('../configs');

module.exports = async (req, res, next) => {
	// console.log('this is a middleware');

	if (!req.headers) {
		// return res.status(401).send('Header is required');
		return res.send(error(401, 'Header is required'));
	}

	if (!req.headers.authorization) {
		// return res.status(401).send('Authorization header is required');
		return res.send(error(401, 'Authorization header is required'));
	}

	if (!req.headers.authorization.startsWith('Bearer')) {
		// return res
		// 	.status(401)
		// 	.send('Authorization header must start with Bearer');

		return res.send(
			error(401, 'Authorization header must start with Bearer')
		);
	}

	const accessToken = req.headers.authorization.split(' ')[1];

	try {
		const decoded = jwt.verify(accessToken, ACCESS_TOKEN_PRIVATE_KEY);
		//Let's send the users id through our request, this id will be useful later
		req._id = decoded._id;
		next();
	} catch (err) {
		console.log(err);
		// return res.status(401).send('Invalid access key');
		return res.send(error(401, 'Invalid access key'));
	}
};
