const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Import Route Handlers
const projectRoutes = require("./routes/projectRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRouter");
const testimonialRoutes = require("./routes/testimonialRoutes");

// Initialize Environment Variables
dotenv.config();

const app = express();

// Database Connection
connectDB();

// Middleware
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser()); // ✅ Parse HttpOnly cookies


// ============================
// API Routes
// ============================
app.use("/api/auth", authRoutes);          // Sign-up / Login
app.use("/api/users", userRoutes);           // Protected User CRUD
app.use("/api/projects", projectRoutes);        // Project routes
app.use("/api/products", productRoutes);        // Product routes
app.use("/api/testimonials", testimonialRoutes);    // Testimonials / Reviews

// ============================
// Root Health Check
// ============================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Switch2itech Backend Working Successfully",
    version: "1.0.0",
  });
});

// ============================
// 404 Handler for undefined routes
// ============================
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// ============================
// Global Error Handler (optional)
// ============================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: "error", message: "Something went wrong" });
});

// ============================
// Server Configuration
// ============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server initialized on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
