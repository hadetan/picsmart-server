require('dotenv').config();

const configs = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI
};

module.exports = configs;