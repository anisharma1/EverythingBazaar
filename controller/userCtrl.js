const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");

const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDBId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendMail = require("./emailCtrl");
const crypto = require("crypto");
const uniqid = require("uniqid");

//create a user
const createUser = asyncHandler(async (req, res) => {
	const email = req.body.email;
	const findUser = await User.findOne({ email: email });
	if (!findUser) {
		//create a new user
		const newUser = User.create(req.body);
		res.json(newUser);
	} else {
		//user already exists
		throw new Error("User Already Exists");
	}
});

//login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	//check if user exists or not
	const findUser = await User.findOne({ email });
	if (findUser && (await findUser.isPasswordMatched(password))) {
		const refreshToken = await generateRefreshToken(findUser?._id);
		const updateUser = await User.findByIdAndUpdate(
			findUser.id,
			{ refreshToken: refreshToken },
			{ new: true }
		);
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			maxAge: 72 * 60 * 60 * 1000,
		});
		res.json({
			_id: findUser?._id,
			firstname: findUser?.firstname,
			lastname: findUser?.lastname,
			email: findUser?.email,
			mobile: findUser?.mobile,
			token: generateToken(findUser?._id),
		});
	} else {
		throw new Error("Invalid Credentials");
	}
});

//admin login
const loginAdminCtrl = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	//check if user exists or not
	const findAdmin = await User.findOne({ email });
	console.log(findAdmin, req.body);
	if (findAdmin.role !== "admin") {
		throw new Error("not authorized");
	}
	if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
		const refreshToken = await generateRefreshToken(findAdmin?._id);
		const updateUser = await User.findByIdAndUpdate(
			findAdmin.id,
			{ refreshToken: refreshToken },
			{ new: true }
		);
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			maxAge: 72 * 60 * 60 * 1000,
		});
		res.json({
			_id: findAdmin?._id,
			firstname: findAdmin?.firstname,
			lastname: findAdmin?.lastname,
			email: findAdmin?.email,
			mobile: findAdmin?.mobile,
			token: generateToken(findAdmin?._id),
		});
	} else {
		throw new Error("Invalid Credentials");
	}
});

//handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
	const cookie = req.cookies;
	if (!cookie?.refreshToken) throw new Error("no refresh token in cookies");
	const refreshToken = cookie.refreshToken;
	const user = await User.findOne({ refreshToken });
	if (!user) throw new Error("No refresh token present in DB or not matched");
	jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
		if (err || user.id !== decoded.id) {
			throw new Error("there is something wrong with refresh token");
		}
		const accessToken = generateToken(User?._id);
		res.json({ accessToken });
	});
});

//logout a user
const logout = asyncHandler(async (req, res) => {
	const cookie = req.cookies;
	if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
	const refreshToken = cookie.refreshToken;
	const filter = { refreshToken: refreshToken };
	try {
		const user = await User.findOne(filter);
		if (!user) {
			res.clearCookie("refreshToken", {
				httpOnly: true,
				secure: true,
			});
			return res.sendStatus(204); // No Content
		}
		await User.findOneAndUpdate(filter, { refreshToken: "" });
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: true,
		});
		res.sendStatus(204); // No Content
	} catch (error) {
		// Handle any errors that may occur during the process
		throw new Error("Error while logging out");
	}
});

//update a user
const updateUser = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongoDBId(_id);
	try {
		const userReq = await User.findByIdAndUpdate(
			_id,
			{
				firstname: req?.body?.firstname,
				lastname: req?.body?.lastname,
				email: req?.body?.email,
				mobile: req?.body?.mobile,
			},
			{
				new: true,
			}
		);
		res.json(userReq);
	} catch (err) {
		throw new Error(err);
	}
});

//save user's address
const saveAddress = asyncHandler(async (req, res, next) => {
	const { _id } = req.user;
	validateMongoDBId(_id);
	try {
		const userReq = await User.findByIdAndUpdate(
			_id,
			{
				address: req?.body?.address,
			},
			{
				new: true,
			}
		);
		res.json(userReq);
	} catch (err) {
		throw new Error(err);
	}
});

//get all users
const getAllUser = asyncHandler(async (req, res) => {
	try {
		const getUsers = await User.find();
		res.json(getUsers);
	} catch (error) {
		throw new Error(error);
	}
});

//get a single user
const get1User = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const getUser = await User.findById(id);
		res.json(getUser);
	} catch (err) {
		throw new Error(err);
	}
});

//delete a user
const deleteUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const deleteUser = await User.findByIdAndDelete(id);
		res.json(deleteUser);
	} catch (err) {
		throw new Error(err);
	}
});

//block a user
const blockUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const block = await User.findByIdAndUpdate(
			id,
			{
				isBlocked: true,
			},
			{
				new: true,
			}
		);
		res.json({
			message: "user blocked",
		});
	} catch (err) {
		throw new Error(err);
	}
});

//unblock a user
const unblockUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	validateMongoDBId(_id);
	try {
		const block = await User.findByIdAndUpdate(
			id,
			{
				isBlocked: false,
			},
			{
				new: true,
			}
		);
		res.json({
			message: "user unblocked",
		});
	} catch (err) {
		throw new Error(err);
	}
});

// Update a user's password
const updatePassword = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	const { password } = req.body;
	validateMongoDBId(_id);
	const user = await User.findById(_id);
	if (password !== undefined && password !== null && password !== "") {
		user.password = password;
		const updatedUser = await user.save();
		res.json(updatedUser);
	} else {
		throw new Error("Password is required and cannot be empty.");
	}
});

//function to generate forgotten password tokens
//      and send the reset password link
const forgotPasswordToken = asyncHandler(async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });
	if (!user) {
		throw new Error("user not found with email entered");
	}
	try {
		const token = await user.createPasswordResetToken();
		await user.save();
		const resetURL = `Hi! Please follow this link to reset your password. This link is valid for 10 mins from now. <a href='http://localhost:3000/api/user/reset-password/${token}'>Click Here</>`;
		const data = {
			to: email,
			text: "Hey User",
			subject: "Forgot Password Link",
			htm: resetURL,
		};
		sendMail(data);
		res.json({ message: `Token generated successfully: ${token}` });
	} catch (err) {
		throw new Error(err);
	}
});

//function to reset the password using email
const resetPassword = asyncHandler(async (req, res) => {
	const { password } = req.body;
	const token = req.params.token;
	const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	});
	if (!user) {
		throw new Error("Token expired. Please try again later.");
	}
	user.password = password;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();
	res.json(user);
});

//function to get the wishlist
const getWishList = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	try {
		const findUser = await User.findById(_id).populate("wishlist");
		res.json(findUser);
	} catch (err) {
		throw new Error(err);
	}
});

//update cart functionality
const userCart = asyncHandler(async (req, res) => {
	const { cart } = req.body;
	const { _id } = req.user;
	validateMongoDBId(_id);
	try {
		let products = [];
		const user = await User.findById(_id);
		// check if user already have product in cart
		const alreadyExistCart = await Cart.findOne({ orderby: user._id });
		if (alreadyExistCart) {
			await Cart.deleteOne({ _id: alreadyExistCart._id });
		}
		for (let i = 0; i < cart.length; i++) {
			let object = {};
			object.product = cart[i]._id;
			object.count = cart[i].count;
			object.color = cart[i].color;
			let getPrice = await Product.findById(cart[i]._id).select("price").exec();
			object.price = getPrice.price;
			products.push(object);
		}
		let cartTotal = 0;
		for (const prod of products) {
			cartTotal += prod.price * prod.count;
		}
		let newCart = await new Cart({
			products,
			cartTotal,
			orderby: user?._id,
		}).save();
		res.json(newCart);
	} catch (error) {
		throw new Error(error);
	}
});

//retrieving the user's cart from the database
const getUserCart = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongoDBId(_id);
	try {
		// Find the user's cart and populate the products
		const cart = await Cart.findOne({ orderby: _id }).populate(
			"products.product"
		);
		res.json(cart);
	} catch (error) {
		throw new Error(error);
	}
});

//empty the cart functionality
const emptyTheCart = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongoDBId(_id);
	try {
		const user = await User.findOne({ _id });
		const cart = await Cart.findOneAndRemove({ orderby: user._id });
		res.json(cart);
	} catch (error) {
		throw new Error(error);
	}
});

//function to apply the coupon
const applyCoupon = asyncHandler(async (req, res) => {
	const { coupon } = req.body;
	const { _id } = req.user;
	validateMongoDBId(_id);
	const validCoupon = await Coupon.findOne({ name: coupon });
	if (validCoupon === null) {
		throw new Error("Invalid Coupon");
	}
	const user = await User.findOne({ _id });
	let { cartTotal } = await Cart.findOne({
		orderby: user._id,
	}).populate("products.product");
	let totalAfterDiscount = (
		cartTotal -
		(cartTotal * validCoupon.discount) / 100
	).toFixed(2);
	await Cart.findOneAndUpdate(
		{ orderby: user._id },
		{ totalAfterDiscount },
		{ new: true }
	);
	res.json(totalAfterDiscount);
});

//function to create the order
const createOrder = asyncHandler(async (req, res) => {
	const { COD, couponApplied } = req.body;
	const { _id } = req.user;
	validateMongoDBId(_id);
	try {
		if (!COD) {
			throw new Error("Create cash order failed");
		}
		const user = await User.findById(_id);
		let userCart = await Cart.findOne({ orderby: user._id });
		let finalAmout = 0;
		if (couponApplied && userCart.totalAfterDiscount) {
			finalAmout = userCart.totalAfterDiscount;
		} else {
			finalAmout = userCart.cartTotal;
		}
		//create a new order
		let newOrder = await new Order({
			products: userCart.products,
			paymentIntent: {
				id: uniqid(),
				method: "COD",
				amount: finalAmout,
				status: "Cash on Delivery",
				created: Date.now(),
				currency: "usd",
			},
			orderBy: user._id,
			orderStatus: "Cash on Delivery",
		}).save();
		const updateOperations = userCart.products.map((item) => ({
			updateOne: {
				filter: { _id: item.product._id },
				update: { $inc: { quantity: -item.count, sold: +item.count } },
			},
		}));
		const updatedProducts = await Product.bulkWrite(updateOperations, {});
		if (newOrder && updatedProducts) {
			return res.json({ message: "Order created successfully" });
		} else {
			return res.json({ message: "Failed to create order" });
		}
	} catch (error) {
		throw new Error(error);
	}
});

//function to get the user's orders
const getOrders = asyncHandler(async (req, res) => {
	const { _id } = req.user;
	validateMongoDBId(_id);
	try {
		const userOrders = await Order.findOne({ orderBy: _id })
			.populate("products.product")
			.populate("orderBy")
			.exec();
		res.json(userOrders);
	} catch (error) {
		throw new Error(error);
	}
});

//function to update the order status
const updateOrderStatus = asyncHandler(async (req, res) => {
	const { status } = req.body;
	const { id } = req.params;
	validateMongoDBId(id);
	try {
		const updateOrderStatus = await Order.findByIdAndUpdate(
			id,
			{
				orderStatus: status,
				paymentIntent: {
					status: status,
				},
			},
			{ new: true }
		);
		res.json(updateOrderStatus);
	} catch (error) {
		throw new Error(error);
	}
});

module.exports = {
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
};
