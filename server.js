require("dotenv").config(); // For environment variables
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(
	cors(
		{
			origin: function (origin, callback) {
				// If no origin is provided (like in server-to-server requests), you might want to allow it
				if (!origin) return callback(null, true);
				// Reflect the origin back
				return callback(null, origin);
			},
			credentials: true,
		} // Allow cookies and authentication headers
	)
);

// Middleware to parse JSON requests
app.use(express.json());

// Import and use the routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// Connect to MongoDB
connectDB();

// Start the server on the specified port
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
