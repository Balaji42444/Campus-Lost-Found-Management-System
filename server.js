// 🌐 backend/server.js — Campus Lost & Found Backend (Updated Version)

// ========== Imports ==========
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// ========== Configuration ==========
dotenv.config();
const app = express();

// ========== Middleware ==========
app.use(
  cors({
    origin: "*", // allow all origins (you can restrict later)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" })); // allow base64 images
app.use(express.urlencoded({ extended: true }));

// ========== MongoDB Connection ==========
const mongoURI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campus_lostfound";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:\n", err.message);
    process.exit(1); // exit process if DB fails
  });

// ========== Import Routes ==========
const lostRoutes = require("./routes/lostRoutes");
const foundRoutes = require("./routes/foundRoutes");
const allRoutes = require("./routes/allRoutes"); // optional, for "Show All" button

// ========== Register Routes ==========
app.use("/api/lost", lostRoutes);
app.use("/api/found", foundRoutes);
app.use("/api/all", allRoutes); // optional

// ========== Default Route ==========
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "🚀 Campus Lost & Found Server is Running Successfully!",
    version: "2.0.0",
    endpoints: {
      lost: "/api/lost",
      found: "/api/found",
      all: "/api/all",
    },
  });
});

// ========== Health Check ==========
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy and connected to MongoDB",
    dbStatus:
      mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌",
    uptime: process.uptime().toFixed(2) + " seconds",
    timestamp: new Date().toLocaleString(),
  });
});

// ========== 404 Handler ==========
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "🔍 Route not found. Please check the API endpoint URL.",
    availableRoutes: ["/api/lost", "/api/found", "/api/all", "/", "/health"],
  });
});

// ========== Global Error Handler ==========
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error. Please try again later.",
    error: err.message,
  });
});

// ========== Start Server ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("==============================================");
  console.log("🚀 Campus Lost & Found API Server Started");
  console.log(`🌐 Listening on:  http://localhost:${PORT}`);
  console.log(`💾 MongoDB URI:   ${mongoURI}`);
  console.log(`🕒 Started At:    ${new Date().toLocaleString()}`);
  console.log("==============================================");
});
