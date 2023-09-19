const Color = require("../models/colorModel");
const asyncHandler = require("express-async-handler");
const validateMongoDBId = require("../utils/validateMongodbid.js");

//function to create a color
const createColor = asyncHandler(async (req, res) => {
	try {
		const newColor = await Color.create(req.body);
		res.json(newColor);
	} catch (err) {
		throw new Error(err);
	}
});

//function to update the color
const updateColor = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		res.json(updatedColor);
	} catch (err) {
		throw new Error(err);
	}
});

//function to delete the color
const deleteColor = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const deletedColor = await Color.findByIdAndDelete(id);
		res.json(deletedColor);
	} catch (err) {
		throw new Error(err);
	}
});

//function to get a color
const getColor = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const getColor = await Color.findById(id);
		res.json(getColor);
	} catch (err) {
		throw new Error(err);
	}
});

//function to get all category
const getAllColors = asyncHandler(async (req, res) => {
	try {
		const colors = await Color.find();
		res.json(colors);
	} catch (err) {
		throw new Error(err);
	}
});

module.exports = {
	createColor,
	updateColor,
	deleteColor,
	getColor,
	getAllColors,
};
