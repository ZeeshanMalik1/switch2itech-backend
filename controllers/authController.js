const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Shared cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
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

const { sendVerificationCodes, sendActivityNotification } = require("../services/notificationService");

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

        // Generate Verification Codes
        const emailCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
        const phoneCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

        const newUser = await User.create({
            name,
            email,
            password,
            profile: profile || "",
            role: role || "user",
            phoneNo,
            company,
            address,
            emailVerificationCode: emailCode,
            phoneVerificationCode: phoneCode,
            verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

        // Send notifications asynchronously
        sendVerificationCodes(newUser, emailCode, phoneCode).catch(err => console.error("Notification Error:", err));

        sendTokenResponse(newUser, 201, res);
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Verify user email
// @route   POST /api/auth/verify-email
// @access  Private
exports.verifyEmail = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ status: "error", message: "User not found" });
        if (user.isEmailVerified) return res.status(400).json({ status: "error", message: "Email already verified" });

        if (user.emailVerificationCode !== code || user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ status: "error", message: "Invalid or expired verification code" });
        }

        user.isEmailVerified = true;
        user.emailVerificationCode = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ status: "success", message: "Email verified successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Verify user phone
// @route   POST /api/auth/verify-phone
// @access  Private
exports.verifyPhone = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ status: "error", message: "User not found" });
        if (user.isPhoneVerified) return res.status(400).json({ status: "error", message: "Phone already verified" });

        if (user.phoneVerificationCode !== code || user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ status: "error", message: "Invalid or expired verification code" });
        }

        user.isPhoneVerified = true;
        user.phoneVerificationCode = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ status: "success", message: "Phone verified successfully" });
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

        // Optional: Notify user of new login for security
        // Use carefully to avoid spam; could check IP or device changes in future
        sendActivityNotification(
            user,
            "New Login Detected",
            "A new login was detected on your account. If this was not you, please contact support and change your password immediately."
        ).catch(err => console.error("Login Notification Error:", err));

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Login user via OTP (Step 1: Request OTP)
// @route   POST /api/auth/request-otp
// @access  Public
exports.requestOtp = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be email or phoneNo

        if (!identifier) {
            return res.status(400).json({ status: "error", message: "Email or Phone Number is required" });
        }

        // Find user by either email or phone
        const user = await User.findOne({
            $or: [{ email: identifier }, { phoneNo: identifier }]
        });

        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP and expiry (e.g., valid for 5 minutes)
        user.loginOtp = otp;
        user.loginOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await user.save({ validateBeforeSave: false });

        // Send OTP via notification service logic similar to verification codes
        const htmlEmail = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Login OTP</h2>
                <p>Hello ${user.name}, someone requested to log into your account.</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code is valid for 5 minutes. If you did not request this, please ignore this message.</p>
            </div>
        `;

        // We can reuse the exported internal functions from notificationService or just trigger sendActivityNotification directly for simplicity.
        // But let's require the raw sendEmail / sendWhatsApp for this specific usecase:
        const { sendEmail, sendWhatsApp } = require("../services/notificationService");

        // We run both promises concurrently
        const tasks = [];
        if (user.email && identifier === user.email) {
            tasks.push(sendEmail({
                to: user.email,
                subject: "Your Login OTP",
                text: `Your login OTP is: ${otp}. It is valid for 5 minutes.`,
                html: htmlEmail
            }));
        }

        if (user.phoneNo && identifier === user.phoneNo) {
            tasks.push(sendWhatsApp({
                to: user.phoneNo,
                message: `Your Switch2iTech login OTP is: *${otp}*. Valid for 5 minutes.`
            }));
        }

        // If they provided email we send to email, but we might want to send to both if they exist for security context.
        // For standard OTP experience, usually you just send to the requested channel.
        await Promise.allSettled(tasks);

        res.status(200).json({ status: "success", message: "OTP sent successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Login user via OTP (Step 2: Verify OTP)
// @route   POST /api/auth/verify-otp-login
// @access  Public
exports.verifyOtpLogin = async (req, res) => {
    try {
        const { identifier, otp } = req.body;

        if (!identifier || !otp) {
            return res.status(400).json({ status: "error", message: "Email/Phone and OTP are required" });
        }

        const user = await User.findOne({
            $or: [{ email: identifier }, { phoneNo: identifier }]
        });

        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        // Check if OTP matches and is not expired
        if (user.loginOtp !== otp || user.loginOtpExpires < Date.now()) {
            return res.status(400).json({ status: "error", message: "Invalid or expired OTP" });
        }

        // Clear OTP
        user.loginOtp = undefined;
        user.loginOtpExpires = undefined;
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
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
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
