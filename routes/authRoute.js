const express = require("express");
const {
	createUser,
	loginUserCtrl,
	getAllUser,
	get1User,
	deleteUser,
	updateUser,
	blockUser,
	unblockUser,
	handleRefreshToken,
	logout,
	updatePassword,
	forgotPasswordToken,
	resetPassword,
	loginAdminCtrl,
	getWishList,
	saveAddress,
	userCart,
	getUserCart,
	emptyTheCart,
	applyCoupon,
	createOrder,
	getOrders,
	updateOrderStatus,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put(
	"/update-order-status/:id",
	authMiddleware,
	isAdmin,
	updateOrderStatus
);

router.put("/password", authMiddleware, updatePassword);
router.post("/login", loginUserCtrl);
router.post("/admin-login", loginAdminCtrl);
router.post("/cart", authMiddleware, userCart);
router.get("/all-users", getAllUser);
router.get("/get-orders", authMiddleware, getOrders);

router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/wishlist", authMiddleware, getWishList);
router.get("/cart", authMiddleware, getUserCart);
router.post("/cart/apply-coupon", authMiddleware, applyCoupon);
router.post("/cart/cash-order", authMiddleware, createOrder);

router.get("/:id", authMiddleware, isAdmin, get1User);
router.delete("/empty-cart", authMiddleware, emptyTheCart);
router.delete("/:id", deleteUser);
router.put("/edit-user", authMiddleware, updateUser);
router.put("/save-address", authMiddleware, saveAddress);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;
