const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			lowercase: true, //automatically lower cases the capital latters
		},
		password: {
			type: String,
			required: true,
			select: false,
		},
		avatar: {
			//This is for profile picture of the user. We will use cloudinary for images and it will make more sense when we will impliment file uploading feature on frontend.
			publicId: String,
			url: String,
		},
		followers: [
			// In mongoose, if you want to relate two schema's then we do it like this.
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'user',
			},
		],
		followings: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'user',
			},
		],
		posts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'post',
			},
		],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('user', userSchema);
