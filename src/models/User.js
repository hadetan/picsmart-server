const mongoose = require('mongoose');

//This schema will be customized soon, for now it is just as a demonstration and for connection.
const userSchema = mongoose.Schema({
    email: String,
    password: String
})

module.exports = mongoose.model('user', userSchema);