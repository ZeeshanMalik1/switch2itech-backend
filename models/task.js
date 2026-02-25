const mongoose = require("mongoose");

// Task is the atomic work unit — linked to a Module
// Think of it like a Jira "Issue"
const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },

        // Parent: Module
        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true,
        },

        // Store milestone + project refs for fast lookups
        milestone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Milestone",
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
        },

        status: {
            type: String,
            enum: ["todo", "in-progress", "in-review", "done", "blocked"],
            default: "todo",
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },

        // Who created it (reporter)
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        // Who is doing it
        assignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        dueDate: { type: Date },
        completedAt: { type: Date },

        // Labels e.g. ["bug", "feature", "backend"]
        labels: [String],

        // Estimated hours of work
        estimatedHours: { type: Number, default: 0 },
        loggedHours: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Auto-set completedAt when task is marked done (Mongoose 7+ — no next needed)
taskSchema.pre("save", function () {
    if (this.isModified("status") && this.status === "done" && !this.completedAt) {
        this.completedAt = new Date();
    }
});

module.exports = mongoose.model("Task", taskSchema);
