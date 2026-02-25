const Testimonial = require("../models/testimonial");

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
exports.getAll = async (req, res) => {
    try {
        const filter = {};
        if (req.query.approved === "true") filter.isApproved = true;
        if (req.query.featured === "true") filter.isFeatured = true;
        if (req.query.project) filter.project = req.query.project;
        if (req.query.product) filter.product = req.query.product;

        const testimonials = await Testimonial.find(filter)
            .populate("author", "name email profile company role")
            .populate("project", "title")
            .populate("product", "name category")
            .sort({ createdAt: -1 });

        res.status(200).json({ status: "success", count: testimonials.length, data: testimonials });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
exports.getOne = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id)
            .populate("author", "name email profile company role")
            .populate("project", "title coverImage")
            .populate("product", "name category thumbnail");

        if (!testimonial) {
            return res.status(404).json({ status: "error", message: "Testimonial not found" });
        }

        res.status(200).json({ status: "success", data: testimonial });
    } catch (err) {
        res.status(400).json({ status: "error", message: "Invalid ID format" });
    }
};

// @desc    Create a testimonial / review
// @route   POST /api/testimonials
// @access  Private — Authenticated user
exports.create = async (req, res) => {
    try {
        const { title, content, rating, project, product,
            authorNameOverride, authorRoleOverride,
            authorCompanyOverride, authorAvatarOverride } = req.body;

        const testimonial = await Testimonial.create({
            author: req.user._id,
            title,
            content,
            rating,
            project: project || null,
            product: product || null,
            authorNameOverride,
            authorRoleOverride,
            authorCompanyOverride,
            authorAvatarOverride,
        });

        res.status(201).json({ status: "success", data: testimonial });
    } catch (err) {
        // Duplicate key — one testimonial per user per project/product
        if (err.code === 11000) {
            return res.status(409).json({
                status: "error",
                message: "You have already submitted a testimonial for this project/product",
            });
        }
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Update a testimonial (owner or admin)
// @route   PATCH /api/testimonials/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ status: "error", message: "Testimonial not found" });
        }

        const isOwner = testimonial.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ status: "error", message: "Forbidden" });
        }

        const allowedUpdates = ["title", "content", "rating",
            "authorNameOverride", "authorRoleOverride",
            "authorCompanyOverride", "authorAvatarOverride"];

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) testimonial[field] = req.body[field];
        });

        // If owner edits content, reset approval
        if (isOwner && !isAdmin) testimonial.isApproved = false;

        await testimonial.save();

        res.status(200).json({ status: "success", data: testimonial });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Approve (or un-approve) a testimonial
// @route   PATCH /api/testimonials/:id/approve
// @access  Private — Admin only
exports.approve = async (req, res) => {
    try {
        const { isApproved = true, isFeatured } = req.body;

        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            { isApproved, ...(isFeatured !== undefined && { isFeatured }) },
            { new: true }
        ).populate("author", "name email");

        if (!testimonial) {
            return res.status(404).json({ status: "error", message: "Testimonial not found" });
        }

        res.status(200).json({ status: "success", data: testimonial });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private — Admin only
exports.remove = async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ status: "error", message: "Testimonial not found" });
        }
        res.status(200).json({ status: "success", message: "Testimonial deleted" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
