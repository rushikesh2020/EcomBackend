const express = require("express");
const Order = require("../models/order");
const Cart = require("../models/cart");

const router = express.Router();

// Place Order
router.post("/", async (req, res) => {
	const { userId } = req.body;
	try {
		//find the cart of the user
		const cart = await Cart.findOne({ userId });
		//if cart doesn't exist then return empty
		if (!cart) return res.status(400).json({ message: "Cart is empty" });

		//create a new order if cart exist
		const order = new Order({
			userId,
			items: cart.items,
			totalPrice: cart.totalPrice,
		});
		//save order on DB
		await order.save();
		//delete cart from the DB
		await Cart.deleteOne({ userId });
		//return order
		res.status(201).json(order);
	} catch (err) {
		res.status(500).json({ message: "Server Error" });
	}
});

module.exports = router;
