const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	product_description: {
		type: [String], // Array of strings
		default: null, // Can be null
	},
	rating: {
		type: Number,
		default: 0, // Default value if not provided
	},
	reviews_count: {
		type: Number,
		default: null, // Can be null
	},
	images: {
		type: [String], // Array of image URLs
		required: true,
	},
	tags: {
		type: [String], // Array of tags
		default: null, // Can be null
	},
	product_details: {
		type: String, // Long description or details
		default: null, // Can be null
	},
	return_policy: {
		type: String, // Can be null
		default: null, // Default value is null
	},
	total_price: {
		type: String, // Storing price as a string (e.g., "$12.59")
		required: true,
	},
	product_specifications: [
		{
			specification_name: {
				type: String,
				required: false, // Optional field
			},
			specification_value: {
				type: String,
				required: false, // Optional field
			},
		},
	],
	category: {
		type: String,
		required: true,
	},
	subcategory: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Products", ProductSchema, "Products");
