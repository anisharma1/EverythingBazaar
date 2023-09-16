const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDBId = require("../utils/validateMongodbid");

//create a product
const createProduct = asyncHandler(async (req, res) => {
	try {
		if (req.body.title) {
			req.body.slug = slugify(req.body.title);
		}
		const newProduct = await Product.create(req.body);
		res.json({
			newProduct,
		});
	} catch (err) {
		throw new Error(err);
	}
});

//update a product
const updateProduct = asyncHandler(async (req, res) => {
	const productId = req.params.id; // Corrected to use req.params.id
	try {
		if (req.body.title) {
			req.body.slug = slugify(req.body.title);
		}
		const updatedProduct = await Product.findOneAndUpdate(
			{ _id: productId },
			req.body,
			{
				new: true,
			}
		);
		res.json(updatedProduct);
	} catch (err) {
		throw new Error(err);
	}
});

//delete a product
const deleteProduct = asyncHandler(async (req, res) => {
	const productId = req.params.id; // Corrected to use req.params.id
	try {
		const deletedProduct = await Product.findOneAndDelete({ _id: productId });
		res.json(deletedProduct);
	} catch (err) {
		throw new Error(err);
	}
});

//get a product
const getProduct = asyncHandler(async (req, res) => {
	const { id } = req.params;
	try {
		const findProduct = await Product.findById(id);
		res.json(findProduct);
	} catch (err) {
		throw new Error(err);
	}
});

//get all products
const getAllProducts = asyncHandler(async (req, res) => {
	try {
		//filtering
		const { page, sort, limit, fields, ...filterQuery } = req.query;
		const allowedFilters = ["category", "brand", "color", "price"];
		const filteredQuery = Object.keys(filterQuery).reduce((acc, key) => {
			if (allowedFilters.includes(key)) {
				acc[key] = filterQuery[key];
			}
			return acc;
		}, {});
		// Convert filterQuery to MongoDB operators
		const mongoQuery = {};
		for (const key in filteredQuery) {
			mongoQuery[key] = JSON.parse(
				JSON.stringify(filteredQuery[key]).replace(
					/\b(gte|gt|lte|lt)\b/g,
					(match) => `$${match}`
				)
			);
		}
		let query = Product.find(mongoQuery);
		// Sorting
		if (sort) {
			const sortParameter = sort.split(",").join(" ");
			query = query.sort(sortParameter);
		} else {
			query = query.sort("-createdAt");
		}
		// Limiting the fields
		if (fields) {
			const fieldsToSelect = fields.split(",").join(" ");
			query = query.select(fieldsToSelect);
		} else {
			query = query.select("-__v -createdAt -updatedAt");
		}
		//pagination
		const skip = (page - 1) * limit;
		query = query.skip(skip).limit(limit);
		const productCount = await Product.countDocuments(mongoQuery);
		if (skip >= productCount) {
			throw new Error("This Page does not exist");
		}
		//retrieve products from database based on the query
		const allProducts = await query;
		res.json(allProducts);
	} catch (err) {
		throw new Error(err);
	}
});

//wishlist functionality - create, update, delete
const addToWishlist = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	const { prodId } = req.body;
	try {
		const user = await User.findById(_id);
		const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
		if (alreadyadded) {
			let user = await User.findByIdAndUpdate(
				_id,
				{
					$pull: { wishlist: prodId },
				},
				{
					new: true,
				}
			);
			res.json(user);
		} else {
			let user = await User.findByIdAndUpdate(
				_id,
				{
					$push: { wishlist: prodId },
				},
				{
					new: true,
				}
			);
			res.json(user);
		}
	} catch (error) {
		throw new Error(error);
	}
});

//rating functionality - create, update, delete
const rating = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	const { star, prodId, comment } = req.body;
	try {
		const product = await Product.findById(prodId);
		let alreadyRated = product.ratings.find(
			(userId) => userId.postedby.toString() === _id.toString()
		);
		if (alreadyRated) {
			const updateRating = await Product.updateOne(
				{
					ratings: { $elemMatch: alreadyRated },
				},
				{
					$set: { "ratings.$.star": star, "ratings.$.comment": comment },
				},
				{
					new: true,
				}
			);
		} else {
			const rateProduct = await Product.findByIdAndUpdate(
				prodId,
				{
					$push: {
						ratings: {
							star: star,
							comment: comment,
							postedby: _id,
						},
					},
				},
				{
					new: true,
				}
			);
		}
		const getAllRatings = await Product.findById(prodId);
		let totalRating = getAllRatings.ratings.length;
		let ratingsum = getAllRatings.ratings
			.map((item) => item.star)
			.reduce((prev, curr) => prev + curr, 0);
		let actualRating = (ratingsum / totalRating).toFixed(1);
		let productFinal = await Product.findByIdAndUpdate(
			prodId,
			{
				totalRating: actualRating,
			},
			{
				new: true,
			}
		);
		res.json(productFinal);
	} catch (err) {
		throw new Error(err);
	}
});

module.exports = {
	createProduct,
	getProduct,
	getAllProducts,
	updateProduct,
	deleteProduct,
	addToWishlist,
	rating,
};
