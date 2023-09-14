const User = require("../models/userModel");

const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDBId = require("../utils/validateMongodbid");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");

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
};
