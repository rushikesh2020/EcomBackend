const jwt = require("jsonwebtoken");

// Middleware to check admin role
const isAdmin = (req, res, next) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ message: "Access Denied. Admins only." });
	}
	next();
};

// Generate Access Token (Short-Lived)
const generateAccessToken = user => {
	return jwt.sign(
		{ id: user._id, role: user.role },
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
	);
};

// Generate Refresh Token (Long-Lived)
const generateRefreshToken = user => {
	return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
	});
};
//store refresh token in database
// const generateRefreshToken = async (user) => {
//     const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });

//     // Save refresh token in database
//     await RefreshToken.create({
//         userId: user._id,
//         token: refreshToken,
//         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
//     });

//     return refreshToken;
// };

// Middleware to verify access token
const authenticateUser = (req, res, next) => {
	const token = req.header("Authorization");
	if (!token)
		return res
			.status(401)
			.json({ message: "Access Denied. No Token Provided." });

	try {
		const decoded = jwt.verify(
			token.replace("Bearer ", ""),
			process.env.ACCESS_TOKEN_SECRET
		);
		req.user = decoded;
		console.log(req.user);
		next();
	} catch (err) {
		res.status(403).json({ message: "Invalid or Expired Token" });
	}
};

module.exports = {
	authenticateUser,
	generateAccessToken,
	generateRefreshToken,
};
