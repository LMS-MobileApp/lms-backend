import express from "express";
import multer from "multer";
import { auth, restrictTo } from "../middleware/authMiddleware.js"; // Corrected import
import {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmittedAssignments,
} from "../controllers/assignmentController.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDFs are allowed"), false);
    }
  },
});

// Create a new assignment (Admin only)
router.post("/", auth, restrictTo("admin"), upload.single("pdf"), createAssignment);

// Get all assignments (Authenticated users)
router.get("/", auth, getAssignments);

// Update an assignment (Admin only)
router.put("/:id", auth, restrictTo("admin"), updateAssignment);

// Delete an assignment (Admin only)
router.delete("/:id", auth, restrictTo("admin"), deleteAssignment);

// Submit an assignment (Student only)
router.post(
  "/:id/submit",
  auth,
  restrictTo("student"),
  upload.single("submission"),
  submitAssignment
);

// Get submitted assignments by batch and course (Admin only)
router.get("/submissions", auth, restrictTo("admin"), getSubmittedAssignments);

export default router;