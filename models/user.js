const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    profile: { type: String, default: "" }, // URL to profile picture

    // UPDATED ROLES: Added 'client' and 'developer'
    role: {
      type: String,
      enum: ["user", "admin", "client", "developer", "manager"],
      default: "user",
    },

    phoneNo: { type: String },
    company: { type: String },
    address: { type: String },

    // ERP SPECIFIC FIELDS
    // If the user is a client, we link their projects here
    assignedProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }],

    // For Developers/Team Members: track their specific stack
    skills: [String],

    // Status tracking (Useful for Admin dashboard)
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

// Helper methods to check roles (Clean for your controllers)
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};
userSchema.methods.isDeveloper = function () {
  return this.role === "developer";
};
userSchema.methods.isClient = function () {
  return this.role === "client";
};
userSchema.methods.isManager = function () {
  return this.role === "manager";
};

// Middleware: Auto-hash password before save (Mongoose 7+ async hook — no next needed)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);