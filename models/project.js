const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coverImage: { type: String },
    demoVideo: { type: String },

    status: {
      type: String,
      enum: ["planning", "active", "on-hold", "in-review", "completed", "cancelled"],
      default: "planning",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Clients who own / commissioned this project (array supports multi-client projects)
    clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Manager responsible for delivery
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Team members (developers)
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    startDate: { type: Date },
    endDate: { type: Date },

    budget: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },

    tags: [String],

    // Embedded FAQs
    faqs: [faqSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Project", projectSchema);

