import express from "express";
import {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
} from "../controllers/assignmentController.js";
import { auth, restrictTo } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// @route   POST /api/assignments
// @desc    Create a new assignment (Admin only)
// @access  Private/Admin
router.post(
  "/",
  auth,
  restrictTo("admin"),
  upload.single("pdf"),
  createAssignment
);

// @route   GET /api/assignments
// @desc    Get all assignments (filtered)
// @access  Private
router.get("/", auth, getAssignments);

// @route   PUT /api/assignments/:id
// @desc    Update an assignment (Admin only)
// @access  Private/Admin
router.put("/:id", auth, restrictTo("admin"), updateAssignment);

// @route   DELETE /api/assignments/:id
// @desc    Delete an assignment (Admin only)
// @access  Private/Admin
router.delete("/:id", auth, restrictTo("admin"), deleteAssignment);

// @route   POST /api/assignments/:id/submit
// @desc    Submit an assignment (Student only)
// @access  Private/Student
router.post(
  "/:id/submit",
  auth,
  restrictTo("student"),
  upload.single("submission"),
  submitAssignment
);

export default router;
