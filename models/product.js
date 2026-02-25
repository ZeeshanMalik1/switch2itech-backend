const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    category: { type: String, required: true },

    // Relational: Users (with role 'client') who use this product
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    video: [{ type: String }], // Cloudinary Video URLs
    image: [{ type: String }], // Cloudinary Image URLs
    thumbnail: { type: String },   // Cloudinary Thumbnail URL

    techStack: [{ type: String }],

    // Embedded FAQs
    faqs: [faqSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Product", productSchema);

