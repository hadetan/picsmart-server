require('dotenv').config();

const configs = {
	PORT: process.env.PORT || 4000,
	MONGO_URI: process.env.MONGO_URI,
	ACCESS_TOKEN_PRIVATE_KEY: process.env.ACCESS_TOKEN_PRIVATE_KEY,
	REFRESH_TOKEN_PRIVATE_KEY: process.env.REFRESH_TOKEN_PRIVATE_KEY,
};

module.exports = configs;
