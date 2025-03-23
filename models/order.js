const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	items: [
		{
			productId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
				required: true,
			},
			quantity: { type: Number, required: true },
			price: { type: Number, required: true }, // Store the price at time of order
		},
	],
	totalPrice: { type: Number, required: true },
	status: {
		type: String,
		enum: ["pending", "shipped", "delivered", "cancelled"],
		default: "pending",
	},
	paymentStatus: {
		type: String,
		enum: ["paid", "unpaid"],
		default: "unpaid",
	},
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
