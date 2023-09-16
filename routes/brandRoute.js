const express = require("express");
const {
	createBrand,
	updateBrand,
	deleteBrand,
	getBrand,
	getAllBrands,
} = require("../controller/brandCtrl");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBrand);
router.put("/:id", authMiddleware, isAdmin, updateBrand);
router.delete("/:id", authMiddleware, isAdmin, deleteBrand);
router.get("/getAllBrands", getAllBrands);
router.get("/:id", getBrand);

module.exports = router;
