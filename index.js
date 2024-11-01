const express = require('express');
const { PORT } = require('./src/configs/index');
const mainRouter = require('./src/routes/index');
const dbConnect = require('./src/configs/dbConnect');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { success } = require('./src/utils/responseWrapper');
const cors = require('cors');

//Creating app
const app = express();

//Connecting to database
dbConnect();

//Middleware
app.use(express.json()); //Allowing json format
app.use(morgan('common'));
app.use(cookieParser());
app.use(
	cors({
		credentials: true,
		origin: 'http://localhost:3000',
	})
);

//Main router
app.use('/', mainRouter);

//Default route
app.get('/', (req, res) => {
	// res.status(200).json({
	// 	serverStatus: 'Working at full capacity',
	// });

	res.json(success(200, 'Wokring at full capacity!'));
});

//Starting the server
app.listen(PORT, () => {
	console.log(`Listening on PORT: ${PORT}`);
});
