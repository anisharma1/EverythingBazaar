const express = require("express");
const {
	createCoupon,
	getAllCoupon,
	updateCoupon,
	deleteCoupon,
} = require("../controller/couponCtrl");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createCoupon);
router.put("/:id", authMiddleware, isAdmin, updateCoupon);
router.delete("/:id", authMiddleware, isAdmin, deleteCoupon);
router.get("/getAllCoupons", authMiddleware, isAdmin, getAllCoupon);

module.exports = router;
