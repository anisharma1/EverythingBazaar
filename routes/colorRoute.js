const express = require("express");
const {
	createColor,
	updateColor,
	deleteColor,
	getColor,
	getAllColors,
} = require("../controller/colorCtrl");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createColor);
router.put("/:id", authMiddleware, isAdmin, updateColor);
router.delete("/:id", authMiddleware, isAdmin, deleteColor);
router.get("/getAllColors", getAllColors);
router.get("/:id", getColor);

module.exports = router;
