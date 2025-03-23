const express = require("express");
const router = express.Router();
const Product = require("../models/product.js");

// Middleware to validate JSON
const validateJSON = (err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
		return res.status(400).json({
			error: "Invalid JSON format. Please ensure all property names are in double quotes.",
		});
	}
	next();
};

router.use(validateJSON);

// Route to get all products by category and subcategory (query parameter)
router.get("/filter", async (req, res) => {
	try {
		const { category, subcategory } = req.query;
		let filter = {};

		if (category) filter.category = category;
		if (subcategory) filter.subcategory = subcategory;
		// console.log("Filter:", filter); // Log the filter object

		// Ensure database connection before querying
		// if (!Product) {
		// 	throw new Error("Product model is not available.");
		// }
		const products = await Product.find(filter); // if (products.length === 0) {
		// 	return res.status(404).json({ message: "No products found" });
		// }

		// if (products.length === 0) {
		// 	return res.status(404).json({ message: "No products found" });
		// }
		res.json(products);
	} catch (err) {
		console.error("Error fetching products:", err); // Log the error
		res.status(500).json({ error: err.message });
	}
});

// Route to get a single product by ID (route parameter)
router.get("/:id", async (req, res) => {
	try {
		// console.log("we have arrived");
		const product = await Product.findById(req.params.id);
		if (!product)
			return res.status(404).json({ message: "Product not found" });
		res.status(200).json(product);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Route to get all products (this should be last to avoid conflicts)
router.get("/", async (req, res) => {
	try {
		const products = await Product.find({});
		console.log(products);
		res.status(200).json(products);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// // Route to create a new product
// router.post("/", async (req, res) => {
//	try {
// 		const newProduct = new Product(req.body);
// 		const savedProduct = await newProduct.save();
// 		res.status(201).json(savedProduct);
// 	} catch (err) {
//		res.status(400).json({ error: err.message });
// 	}
// });

// // Route to update a product by ID (route parameter)
// router.put("/:id", async (req, res) => {
// 	try {
// 		const updatedProduct = await Product.findByIdAndUpdate(
// 			req.params.id,
// 			req.body,
// 			{ new: true }
// 		);
// 		if (!updatedProduct)
// 			return res.status(404).json({ message: "Product not found" });
// 		res.status(200).json(updatedProduct);
// 	} catch (err) {
// 		res.status(400).json({ error: err.message });
// 	}
// });

// // Route to delete a product by ID (route parameter)
// router.delete("/:id", async (req, res) => {
// 	try {
// 		const deletedProduct = await Product.findByIdAndDelete(req.params.id);
// 		if (!deletedProduct)
// 			return res.status(404).json({ message: "Product not found" });
// 		res.status(200).json({ message: "Product deleted successfully" });
// 	} catch (err) {
// 		res.status(500).json({ error: err.message });
// 	}
// });

module.exports = router;
