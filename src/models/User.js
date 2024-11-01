const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			lowercase: true, //automatically lower cases the capital latters
		},
		password: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('user', userSchema);
