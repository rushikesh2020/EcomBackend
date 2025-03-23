const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	// _id: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	required: true,
	// 	unique: true,
	// },
	fullName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, enum: ["user", "admin"], default: "user" }, // Role field
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
