const express = require("express");
const { PORT } = require("./src/configs/index");
const mainRouter = require('./src/routes/index');
const dbConnect = require("./src/configs/dbConnect");

const app = express();

app.use(express.json());

dbConnect();

app.use("/", mainRouter);

app.get("/", (req, res) => {
	res.status(200).json({
		serverStatus: "Working at full capacity",
	});
});

app.listen(PORT, () => {
	console.log(`Listening on PORT: ${PORT}`);
});
