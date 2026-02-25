const mongoose = require("mongoose");

// Milestone belongs to a Project (e.g., Sprint 1, Phase 2)
const milestoneSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },

        // Parent: Project
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        // The manager or lead developer responsible for this milestone
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        status: {
            type: String,
            enum: ["pending", "in-progress", "completed", "on-hold"],
            default: "pending",
        },

        startDate: { type: Date },
        dueDate: { type: Date },

        // order for display (Sprint 1 = 1, Sprint 2 = 2, etc.)
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Milestone", milestoneSchema);
