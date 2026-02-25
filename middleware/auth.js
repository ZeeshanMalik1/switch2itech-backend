const jwt = require("jsonwebtoken");
const User = require("../models/user");

// @desc    Protect routes — verifies JWT from cookie (primary) or Bearer header (fallback)
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Try HttpOnly cookie first (browser clients)
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    // 2. Fallback to Authorization header (mobile / API clients)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Not authorized. Please log in.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (no password) to request
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "The user belonging to this token no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ status: "error", message: "Session expired. Please log in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid token. Please log in again." });
    }
    res.status(401).json({ status: "error", message: err.message });
  }
};

module.exports = { protect };

