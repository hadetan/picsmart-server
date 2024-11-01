const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
	ACCESS_TOKEN_PRIVATE_KEY,
	REFRESH_TOKEN_PRIVATE_KEY,
} = require('../configs');
const { error, success } = require('../utils/responseWrapper');

const signupController = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name && !email && !password) {
			// return res.status(400).send('Email & Password are required');
			return res.send(error(400, 'Name, Email & Password are required'));
		}

		if (!name) {
			// return res.status(400).send('name is required');
			return res.send(error(400, 'Name is requred'));
		}

		if (!email) {
			// return res.status(400).send('Email is required');
			return res.send(error(400, 'Email is requred'));
		}

		if (!password) {
			// return res.status(400).send('Password is required');
			return res.send(error(400, 'Password is required'));
		}

		//Checking if user already exists in our database.
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			// return res.status(409).send('User is already registered');
			return res.send(error(409, 'User is already registered'));
		}

		//Now we can save this user in our db, but we do not save a user as I have shown before. We will encrypt the password befoere saving.
		//The hashing process is an async process thats why we will await it.
		const hashedPassword = await bcrypt.hash(password, 10);
		//After giving value `password`, I have given a salt value, it means how many rounds does it have to go through while encrypting the password.

		//Now we can create the user -
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
		});

		const accessToken = generateAccessToken({
			_id: user._id,
		});

		const refreshToken = generateRefreshToken({
			_id: user._id,
		});

		res.cookie('jwt', refreshToken, {
			httpOnly: true,
			secure: true,
		});

		// return res.status(201).json({
		// 	user,
		// });

		return res.json(success(201, {accessToken: accessToken}));
	} catch (err) {
		console.log(err);
	}
};

const loginController = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email && !password) {
			// return res.status(400).send('Email & Password are required');
			return res.send(error(400, 'Email & Password are required'));
		}

		if (!email) {
			// return res.status(400).send('Email is required');
			return res.send(error(400, 'Email is required'));
		}

		if (!password) {
			// return res.status(400).send('Password is required');
			return res.send(error(400, 'Password is required'));
		}

		//Checking if user already exists in our database.
		const user = await User.findOne({ email });

		if (!user) {
			// return res.status(404).send('User is not registered');
			return res.send(error(404, 'User is not registered'));
		}

		//Checking if the password in our database and the password given by user is matched or not while using the `compare` function provided by bcrypt.
		const matchedPassword = await bcrypt.compare(password, user.password);

		if (!matchedPassword) {
			// return res.status(403).send('Incorrect password');
			return res.send(error(403, 'Incorrect password'));
		}

		const accessToken = generateAccessToken({
			_id: user._id,
		});

		const refreshToken = generateRefreshToken({
			_id: user._id,
		});

		res.cookie('jwt', refreshToken, {
			httpOnly: true,
			secure: true,
		});

		// return res.json({
		// 	accessToken: accessToken,
		// });

		return res.json(success(200, {accessToken: accessToken}));
	} catch (err) {
		console.log(err);
	}
};

//This API will check the refreshToken validity and generate new accessToken till the time refreshToken is valid.
const refreshAccessTokenController = async (req, res) => {
	// const { refreshToken } = req.body;
	//Now the refreshToken will not be available in req.body
	const cookies = req.cookies;

	if (!cookies.jwt) {
		// return res.status(401).send('Refresh token in cookie is required');
		return res.send(401, 'Refresh token in cookie is required');
	}

	const refreshToken = cookies.jwt;

	try {
		const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_PRIVATE_KEY);

		const _id = decoded._id;
		const newAccessToken = generateAccessToken({ _id });

		// return res.status(201).json({
		// 	newAccessToken,
		// });

		return res.json(success(201, { accessToken: newAccessToken }));
	} catch (err) {
		console.log(err);
		// return res.status(401).send('Invalid refresh token');
		return res.send(401, 'Invalid refresh token');
	}
};

//Internal functions which we will not be exporting
const generateAccessToken = (data) => {
	try {
		//This jwt.sign function asks us two arguments, one the data we want to encrypt and other the secret key which only you will know/any random string.
		const accessToken = jwt.sign(data, ACCESS_TOKEN_PRIVATE_KEY, {
			expiresIn: '15m',
		});
		//Let's see what this token is returning actually.
		console.log(accessToken);
		return accessToken;
	} catch (err) {
		console.log(err);
	}
};

const generateRefreshToken = (data) => {
	try {
		const refreshToken = jwt.sign(data, REFRESH_TOKEN_PRIVATE_KEY, {
			expiresIn: '1y',
		});
		return refreshToken;
	} catch (err) {
		console.log(err);
	}
};

module.exports = {
	loginController,
	signupController,
	refreshAccessTokenController,
};
