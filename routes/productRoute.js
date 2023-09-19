const express = require("express");
const {
	createProduct,
	getProduct,
	getAllProducts,
	updateProduct,
	deleteProduct,
	addToWishlist,
	rating,
	uploadImages,
	deleteImages,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middleware/uploadImages");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);
router.put(
	"/upload/",
	authMiddleware,
	isAdmin,
	uploadPhoto.array("images", 10),
	productImgResize,
	uploadImages,
	deleteImages
);
router.get("/:id", getProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/", getAllProducts);

module.exports = router;
