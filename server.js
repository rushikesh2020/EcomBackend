require("dotenv").config(); // For environment variables
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Import and use the product routes
const productRoutes = require("./routes/productRoutes");
app.use("/products", productRoutes);

// Connect to MongoDB
connectDB()
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch(err => {
		console.error(err);
		process.exit(1);
	});

app.use("/products", productRoutes);

// Start the server on the specified port
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
