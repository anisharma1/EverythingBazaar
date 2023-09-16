const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validateMongoDBId = require("../utils/validateMongodbid.js");

//function to create a brand
const createBrand = asyncHandler(async (req, res) => {
	try {
		const newBrand = await Brand.create(req.body);
		res.json(newBrand);
	} catch (err) {
		throw new Error(err);
	}
});

//function to update the brand
const updateBrand = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		res.json(updatedBrand);
	} catch (err) {
		throw new Error(err);
	}
});

//function to delete the brand
const deleteBrand = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const deletedBrand = await Brand.findByIdAndDelete(id);
		res.json(deletedBrand);
	} catch (err) {
		throw new Error(err);
	}
});

//function to get a brand
const getBrand = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const getBrand = await Brand.findById(id);
		res.json(getBrand);
	} catch (err) {
		throw new Error(err);
	}
});

//function to get all category
const getAllBrands = asyncHandler(async (req, res) => {
	try {
		const brands = await Brand.find();
		res.json(brands);
	} catch (err) {
		throw new Error(err);
	}
});

module.exports = {
	createBrand,
	updateBrand,
	deleteBrand,
	getBrand,
	getAllBrands,
};
