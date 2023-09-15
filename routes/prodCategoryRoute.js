const express = require("express");
const {
	createProdCategory,
	updateProdCategory,
	deleteProdCategory,
	getProdCategory,
	getAllProdCategory,
} = require("../controller/prodCategoryCtrl");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProdCategory);
router.put("/:id", authMiddleware, isAdmin, updateProdCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteProdCategory);
router.get("/getAllProdCategory", getAllProdCategory);
router.get("/:id", getProdCategory);

module.exports = router;
