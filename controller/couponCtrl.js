const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validateMongoDBId = require("../utils/validateMongodbid.js");

//function to create a coupon
const createCoupon = asyncHandler(async (req, res) => {
	try {
		const newCoupon = await Coupon.create(req.body);
		res.json(newCoupon);
	} catch (err) {
		throw new Error(err);
	}
});

//function to get all coupon
const getAllCoupon = asyncHandler(async (req, res) => {
	try {
		const coupons = await Coupon.find();
		res.json(coupons);
	} catch (err) {
		throw new Error(err);
	}
});

//function to update a coupon
const updateCoupon = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		res.json(updatedCoupon);
	} catch (err) {
		throw new Error(err);
	}
});

//function to delete a coupon
const deleteCoupon = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const deletedCoupon = await Coupon.findByIdAndDelete(id);
		res.json(deletedCoupon);
	} catch (err) {
		throw new Error(err);
	}
});

module.exports = {
	createCoupon,
	getAllCoupon,
	updateCoupon,
	deleteCoupon,
};
