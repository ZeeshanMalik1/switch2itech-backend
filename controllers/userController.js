const User = require("../models/user");

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const {role}=req.body;
        const {id}=req.params;
        const user=await User.findById(id).select("-password");;
        console.log(user);
        user.role=role;
        await user.save();
        res.json({status:"success",data:user,message:"Role updated successfully"})
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Get all users (with filters)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ status: "success", data: users });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        res.status(200).json({ status: "success", data: user });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
