const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const router = express.Router();
const {
	authenticateUser,
	generateAccessToken,
	generateRefreshToken,
	isAdmin,
} = require("../middlewares/authmiddleware");

// Array to store refresh tokens
let refreshTokens = [];
console.log("refreshTokens", refreshTokens);

//Admin-only Route to Get All Users
// router.get("/all", authenticateUser, isAdmin, async (req, res) => {
// 	try {
// 		const users = await User.find();
// 		res.json(users);
// 	} catch (err) {
// 		res.status(500).json({ message: "Server Error" });
// 	}
// });

// Register User
router.post("/register", async (req, res) => {
	const { fullName, email, password, role } = req.body;
	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		//creating a new user using the User model
		const newUser = new User({
			fullName,
			email,
			password: hashedPassword,
			role: role || "user", // default to 'user' if role not specified
		});

		const savedUser = await newUser.save();

		// Generate tokens (same as login)
		const accessToken = generateAccessToken(savedUser);
		const refreshToken = generateRefreshToken(savedUser);
		console.log("refreshToken afte login", refreshToken);
		// Store refresh token
		refreshTokens.push(refreshToken);

		// Set refresh token in cookie
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Strict",
		});

		// Return access token and user data
		res.status(201).json({
			message: "User registered successfully",
			accessToken,
			user: {
				id: savedUser._id,
				fullName: savedUser.fullName,
				email: savedUser.email,
				role: savedUser.role,
			},
		});
	} catch (err) {
		res.status(500).json({ message: "Server Error", error: err.message });
	}
});

// Login User without Refresh Token
// router.post("/login", async (req, res) => {
// 	const { email, password } = req.body;
// 	try {
// 		const user = await User.findOne({ email });
// 		if (!user)
// 			return res.status(400).json({ message: "Invalid credentials" });

// 		const isMatch = await bcrypt.compare(password, user.password);
// 		if (!isMatch)
// 			return res.status(400).json({ message: "Invalid credentials" });

// 		//sign function creates a new token
// 		const token = jwt.sign(
// 			{ id: user._id, role: user.role }, //payload
// 			process.env.JWT_SECRET, //secret key
// 			{ expiresIn: "1d" } //expires in 1 day
// 		);
// 		//returning the token and user object
// 		res.header("Authorization", `Bearer ${token}`).json({ token, user });
// 	} catch (err) {
// 		res.status(500).json({ message: "Server Error" });
// 	}
// });

// Access Tokens (Short-lived, 15 min) → Used for API requests.
// Refresh Tokens (Long-lived, 7 days, Stored in MongoDB) → Used to get new access tokens.
// Logout Deletes Refresh Token from database and clears cookie.

// User logs in → Receives Access Token + Refresh Token.
// Access Token is used for API requests.
// When Access Token expires:
// The client sends the Refresh Token to get a new Access Token.
// If the Refresh Token is also expired → User must log in again.

// ✅ Store Access Tokens in memory/localstorage (short-lived).
// ✅ Store Refresh Tokens in httpOnly & secure cookies (prevents XSS).
// ✅ Revoke Refresh Tokens on logout.
// ✅ Use different secrets for Access and Refresh Tokens (JWT_SECRET & JWT_REFRESH_SECRET).

// User Login
router.post("/login", async (req, res) => {
	//get email and password from request body
	const { email, password } = req.body;
	try {
		//find user object by email
		const user = await User.findOne({ email });
		//if user does not exist or password doesnt match, return an error message
		if (!user || !(await bcrypt.compare(password, user.password)))
			return res.status(401).json({ message: "Invalid credentials" });

		//generate an access token and a refresh token
		const accessToken = generateAccessToken(user);
		//generate a refresh token
		const refreshToken = generateRefreshToken(user);
		//storing refresh tokens in memory (refreshTokens array)
		refreshTokens.push(refreshToken); // Store refresh token

		// Store refresh token in DB
		//RefreshToken model is used to store the refresh token in the database
		//The token is stored in the database along with the user ID and an expiration date.
		//This allows the server to verify the token and generate a new access token when needed.
		await new RefreshToken({
			token: refreshToken,
			userId: user._id,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		}).save();

		//Creates a browser cookie named "refreshToken" with the value stored in the refreshToken variable
		//sets up a cookie named "refreshToken" in the HTTP response.
		//Stores the cookie in the user's browser. When the server sends this response,
		// the browser will save this cookie and send it back with subsequent requests to the same domain.
		//The key difference from regular cookies is that this one can't be accessed by JavaScript in the browser
		// due to the httpOnly flag, making it more secure for storing sensitive authentication tokens.
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true, // cookie is not accessible via client-side JavaScript
			secure: true, // cookie will only be sent over HTTPS
			sameSite: "Strict", // cookie will only be sent for requests to the same site
		});
		res.json({
			accessToken,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		}); // Send access token and user data
	} catch (err) {
		res.status(500).json({ message: "Server Error" });
	}
});

// API endpoint to generate a new access token using the refresh-token
router.post("/refresh", (req, res) => {
	//get the refresh token from the cookie
	const refreshToken = req.cookies.refreshToken;
	//if the refresh token does not exist, return an error message
	if (!refreshToken) {
		return res
			.status(403)
			.json({ message: "Refresh Token is invalid or expired" });
	}
	//verify the refresh token
	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) return res.status(403).json({ message: "Invalid Token" });

		//generate a new access token
		const newAccessToken = generateAccessToken({
			_id: user.id,
			role: user.role,
		});
		res.json({ accessToken: newAccessToken });
	});
});

// Logout (Clear Refresh Token)
router.post("/logout", async (req, res) => {
	//clear the refresh token cookie
	res.clearCookie("refreshToken");
	//When a user logs out or a token needs to be invalidated, the application removes that specific token from the valid tokens list, preventing it from being used for future authentication.
	//filtering out the token that matches the user's current refresh token from their cookies.
	refreshTokens = refreshTokens.filter(token => {
		console.log(token);
		return token !== req.cookies.refreshToken;
	});
	// Remove the token from the database
	try {
		await Token.deleteOne({ token: req.refreshToken });
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error logging out" });
	}
	// res.json({ message: "Logged out successfully" });
});
// For production applications, consider storing refresh tokens in a persistent database (MongoDB, Redis, etc.) instead of an in-memory array, especially if you need:

// Token persistence across server restarts
// Scalability across multiple server instances
// Additional token metadata (expiration, user info, etc.)

module.exports = router;

// 1️⃣ User logs in → Backend generates access token & refresh token
// 2️⃣ Access token is sent to the frontend → Stored in memory/sessionStorage
// 3️⃣ Refresh token is stored in an HTTP-only cookie (not accessible by JavaScript)
// 4️⃣ User makes API requests using the access token
// 5️⃣ Access token expires → Frontend sends refresh token to backend (from the cookie)
// 6️⃣ Backend verifies refresh token → Generates a new access token
// 7️⃣ If refresh token is expired or invalid → User is logged out
