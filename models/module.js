const mongoose = require("mongoose");

// Module belongs to a Milestone (e.g., Auth System, Payment Integration)
const moduleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "" },

        // Parent: Milestone (which itself belongs to a Project)
        milestone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Milestone",
            required: true,
        },

        // Store project ref for easier querying without extra populate chains
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "in-progress", "in-review", "completed"],
            default: "pending",
        },

        // The developer responsible for this module
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        dueDate: { type: Date },
        completedAt: { type: Date },

        // order within the milestone
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Auto-set completedAt when status changes to 'completed' (Mongoose 7+ — no next needed)
moduleSchema.pre("save", function () {
    if (this.isModified("status") && this.status === "completed" && !this.completedAt) {
        this.completedAt = new Date();
    }
});

module.exports = mongoose.model("Module", moduleSchema);
