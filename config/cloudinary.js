const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "switch2itech",
        allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4", "webm"],
        resource_type: "auto", // Allows both images and videos
    },
});

const upload = multer({ storage: storage });

// Helper for dynamic transformations (Resizing, auto-format, etc.)
const getOptimizedUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        fetch_format: "auto",
        quality: "auto",
        ...options,
    });
};

module.exports = { cloudinary, upload, getOptimizedUrl };
