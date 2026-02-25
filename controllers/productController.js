const Product = require("../models/product");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("clients", "name email company profile");
        res.status(200).json({ status: "success", count: products.length, data: products });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("clients", "name email company profile");
        if (!product) {
            return res.status(404).json({ status: "error", message: "Product not found" });
        }
        res.status(200).json({ status: "success", data: product });
    } catch (err) {
        res.status(400).json({ status: "error", message: "Invalid ID format" });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };

        // Handle Cloudinary uploads
        if (req.files) {
            if (req.files.image) productData.image = req.files.image.map((f) => f.path);
            if (req.files.video) productData.video = req.files.video.map((f) => f.path);
            if (req.files.thumbnail) productData.thumbnail = req.files.thumbnail[0].path;
        }

        const product = await Product.create(productData);
        res.status(201).json({ status: "success", data: product });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        const productData = { ...req.body };

        if (req.files) {
            if (req.files.image) productData.image = req.files.image.map((f) => f.path);
            if (req.files.video) productData.video = req.files.video.map((f) => f.path);
            if (req.files.thumbnail) productData.thumbnail = req.files.thumbnail[0].path;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            productData,
            { new: true, runValidators: true }
        ).populate("clients", "name email company profile");

        if (!updatedProduct) {
            return res.status(404).json({ status: "error", message: "Product not found" });
        }

        res.status(200).json({ status: "success", data: updatedProduct });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ status: "error", message: "Product not found" });
        }
        res.status(200).json({ status: "success", message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// =============================================
// FAQ SUB-RESOURCE
// =============================================

// @desc    Add a FAQ to a product
// @route   POST /api/products/:id/faqs
// @access  Private/Admin
exports.addFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) {
            return res.status(400).json({ status: "error", message: "question and answer are required" });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $push: { faqs: { question, answer } } },
            { new: true, runValidators: true }
        );

        if (!product) return res.status(404).json({ status: "error", message: "Product not found" });

        res.status(200).json({ status: "success", data: product });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Update a FAQ on a product
// @route   PATCH /api/products/:id/faqs/:faqId
// @access  Private/Admin
exports.updateFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const updateFields = {};
        if (question) updateFields["faqs.$.question"] = question;
        if (answer) updateFields["faqs.$.answer"] = answer;

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, "faqs._id": req.params.faqId },
            { $set: updateFields },
            { new: true }
        );

        if (!product) return res.status(404).json({ status: "error", message: "Product or FAQ not found" });

        res.status(200).json({ status: "success", data: product });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};

// @desc    Delete a FAQ from a product
// @route   DELETE /api/products/:id/faqs/:faqId
// @access  Private/Admin
exports.deleteFaq = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $pull: { faqs: { _id: req.params.faqId } } },
            { new: true }
        );

        if (!product) return res.status(404).json({ status: "error", message: "Product not found" });

        res.status(200).json({ status: "success", data: product });
    } catch (err) {
        res.status(400).json({ status: "error", message: err.message });
    }
};
