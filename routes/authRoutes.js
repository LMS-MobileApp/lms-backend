import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", register);

// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post("/login", login);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", auth, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, updateProfile);

export default router;
