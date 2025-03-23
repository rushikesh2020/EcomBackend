const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
	// userId: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: "User",
	// 	required: true,
	// },
	items: [
		{
			productId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
				required: true,
			},
			quantity: { type: Number, required: true, min: 1 },
			price: { type: Number, required: true }, // Store price to prevent changes affecting cart
		},
	],
	totalPrice: { type: Number, required: true, default: 0 },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cart", CartSchema);
