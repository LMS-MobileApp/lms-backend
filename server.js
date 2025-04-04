import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import User from "./models/User.js";
import authRoutes from "./routes/authRoutes.js"; // Import auth routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// MongoDB Connection & Admin Seeding
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (!adminExists) {
      const admin = new User({
        name: "Default Admin",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      });
      await admin.save();
      console.log("Default admin created");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  }
};

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    seedAdmin();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Swagger Setup
const swaggerDoc = yaml.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Routes
app.use("/api/auth", authRoutes); // Add auth routes

// Test Route
app.get("/", (req, res) => {
  res.send("LMS Backend is running!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});