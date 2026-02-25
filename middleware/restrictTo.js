// @desc    Restrict route access to specific roles
// @usage   restrictTo("admin", "manager") — pass one or more allowed roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user is set by the `protect` middleware that runs before this
        if (!req.user) {
            return res
                .status(401)
                .json({ status: "error", message: "Not authenticated" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "error",
                message: `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}`,
            });
        }

        next();
    };
};

module.exports = { restrictTo };
