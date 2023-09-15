const prodCategory = require("../models/prodCategoryModel.js");
const asyncHandler = require("express-async-handler");
const validateMongoDBId = require("../utils/validateMongodbid.js");

//function to create a category
const createProdCategory = asyncHandler(async (req, res) => {
	try {
		const newCategory = await prodCategory.create(req.body);
		res.json(newCategory);
	} catch (err) {
		throw new Error(err);
	}
});

//function to update the category
const updateProdCategory = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const updatedCategory = await prodCategory.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		res.json(updatedCategory);
	} catch (err) {
		throw new Error(err);
	}
});

//function to delete the category
const deleteProdCategory = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const deletedCategory = await prodCategory.findByIdAndDelete(id);
		res.json(deletedCategory);
	} catch (err) {
		throw new Error(err);
	}
});

//function to get a category
const getProdCategory = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const getProdCategory = await prodCategory.findById(id);
		res.json(getProdCategory);
	} catch (err) {
		throw new Error(err);
	}
});

//function to get all category
const getAllProdCategory = asyncHandler(async (req, res) => {
	try {
		const prodCategories = await prodCategory.find();
		res.json(prodCategories);
	} catch (err) {
		throw new Error(err);
	}
});

module.exports = {
	createProdCategory,
	updateProdCategory,
	deleteProdCategory,
	getProdCategory,
	getAllProdCategory,
};
