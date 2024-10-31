const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');
const { MONGO_URI } = require('./');

module.exports = async () => {
	try {
		const connect = await mongoose.connect(MONGO_URI, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			},
		});
		console.log(`MongoDB Connected ${connect.connection.host}`);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};
