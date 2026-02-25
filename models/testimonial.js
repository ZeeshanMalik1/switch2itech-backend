const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
    {
        // ── Who wrote it ─────────────────────────────────────────────
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Allow an optional name/role/company override (for non-registered authors)
        authorNameOverride: { type: String, trim: true },
        authorRoleOverride: { type: String, trim: true },
        authorCompanyOverride: { type: String, trim: true },
        authorAvatarOverride: { type: String }, // Cloudinary URL

        // ── Content ──────────────────────────────────────────────────
        title: { type: String, trim: true },    // optional headline / review title
        content: { type: String, required: true, trim: true },

        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5,
        },

        // ── Relations — at least one should be provided ───────────────
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null,
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null,
        },

        // ── Moderation ───────────────────────────────────────────────
        isApproved: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound unique index: one testimonial per (author, project) and one per (author, product)
// Uses sparse so null values don't collide with each other
testimonialSchema.index({ author: 1, project: 1 }, { unique: true, sparse: true });
testimonialSchema.index({ author: 1, product: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Testimonial", testimonialSchema);
