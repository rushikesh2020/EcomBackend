const express = require("express");
const Cart = require("../models/cart");

const router = express.Router();
const { authenticateUser } = require("../middlewares/authmiddleware");

//get all the products of a user
router.get("/", authenticateUser, async (req, res) => {
	try {
		//if user id doesn't match
		// if (req.user.id !== req.params.userId) {
		// 	return res.status(403).json({ message: "Access Denied" });
		// }
		//populate the cart with product ids
		//req.user.id is the user id from the token authenticated by the middleware fuction authenticateUser
		const cart = await Cart.findOne({ userId: req.user.id }).populate(
			"items.productId"
		);
		//return the cart object as response
		res.json(cart);
	} catch (err) {
		res.status(500).json({ message: "Server Error" });
	}
});

//add the products into cart
router.post("/", authenticateUser, async (req, res) => {
	const { productId, quantity, price } = req.body;
	//req.user.id is the user id from the token authenticated by the middleware
	//function authenticateUser
	// if (req.user.id !== userId)
	// 	return res.status(403).json({ message: "Unauthorized" });

	try {
		//find the cart of user
		let cart = await Cart.findOne({ userId: req.user.id });

		//if cart doesn't exist then create new cart with cart model
		if (!cart) {
			cart = new Cart({
				userId: req.user.id, //user ID
				items: [{ productId, quantity, price }], //items
				totalPrice: price * quantity, //total price of one product
			});
		}
		//else add the products into existing cart
		else {
			cart.items.push({ productId, quantity, price });
			cart.totalPrice += price * quantity;
		}
		//save the cart into DB
		await cart.save();
		//return cart object as response
		res.status(201).json(cart);
	} catch (err) {
		res.status(500).json({ message: "Server Error" });
	}
});

module.exports = router;
