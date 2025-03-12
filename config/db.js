const mongoose = require("mongoose");

async function ConnectMongo() {
	try {
		await mongoose.connect(process.env.MONGO_URI);

		console.log("connected to mongodb");
		checkConnectionStatus();
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
}

function checkConnectionStatus() {
	const status = mongoose.connection.readyState;
	const statusMessage =
		{
			0: "disconnected",
			1: "connected",
			2: "connecting",
			3: "disconnecting",
		}[status] || "unknown";
	console.log(`MongoDB connection status: ${statusMessage}`);
}

module.exports = ConnectMongo;
