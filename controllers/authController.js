const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Shared cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Helper to sign JWT and send response with cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("jwt", token, cookieOptions);

    const { password, ...userData } = user.toObject();

    res.status(statusCode).json({
        status: "success",
        data: { ...userData, token }, // token also in body for mobile/API clients
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, profile, role, phoneNo, company, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Name, email, and password are required",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: "error", message: "Email already exists" });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            profile: profile || "",
            role: role || "user",
            phoneNo,
            company,
            address,
        });

        sendTokenResponse(newUser, 201, res);
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: "error", message: "Email and password are required" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ status: "error", message: "Invalid credentials" });
        }

        // Track last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Logout — clears the JWT cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
    res.cookie("jwt", "loggedout", {
        httpOnly: true,
        expires: new Date(Date.now() + 10 * 1000),
    });
    res.status(200).json({ status: "success", message: "Logged out successfully" });
};

// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json({ status: "success", data: user });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
