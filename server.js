const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// 1. Initialize Environment Variables
dotenv.config();

// 2. Database Connection
connectDB();

const app = express();
app.set("trust proxy", 1);

// ============================
// 3. CORS Configuration
// ============================

// ✅ CORS Middleware with proper configuration
// Temporarily allow all origins by reflecting the requesting origin

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
    "http://localhost:3000",
    "https://switch2itech.vercel.app",
    "https://admin-switch2itech.vercel.app",
    "http://localhost:5173",
  ];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser tools like Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // ✅ Essential for auth cookies

// ============================
// 4. API Routes
// ============================

// Import Route Handlers
// IMPORTANT: Verify these files exist and use module.exports = router;
const projectRoutes = require("./routes/projectRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRouter");
const testimonialRoutes = require("./routes/testimonialRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/products", productRoutes);
app.use("/api/testimonials", testimonialRoutes);

// ============================
// 5. Health Check & 404
// ============================

// Root Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Switch2itech Backend Working Successfully",
    timestamp: new Date().toISOString(),
  });
});

// Handling Undefined Routes (Fixed the 'matcher' crash by using app.use)
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// ============================
// 6. Global Error Handler
// ============================
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  console.error("ERROR 💥:", err);

  res.status(statusCode).json({
    status: status,
    message: err.message || "Internal Server Error",
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ============================
// 7. Server Configuration
// ============================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(` Server initialized on port ${PORT}`);
  console.log(` Mode: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
