import Assignment from "../models/Assignment.js";
import User from "../models/User.js";
import { uploadToS3, getFileUrl } from "../services/awsService.js";
import sendEmail from "../services/emailService.js";

// Create Assignment (Admin only)
const createAssignment = async (req, res) => {
  const { title, course, subject, dueDate, dueTime, priority } = req.body;
  const pdf = req.file;

  try {
    if (!pdf) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const uploadResult = await uploadToS3(pdf, "assignments");
    const pdfUrl = getFileUrl(uploadResult.Key);

    const assignment = new Assignment({
      title,
      course,
      subject,
      dueDate,
      dueTime,
      priority,
      pdfUrl,
      createdBy: req.user._id,
    });

    await assignment.save();

    // Send email to students (optional)
    const students = await User.find({ course, role: "student" });
    const studentEmails = students.map((student) => student.email);
    if (studentEmails.length > 0) {
      try {
        await sendEmail(
          studentEmails,
          `New Assignment: ${title}`,
          `A new assignment "${title}" has been created for ${course} - ${subject}. Due: ${dueDate} at ${dueTime}. Download: ${pdfUrl}`
        );
      } catch (emailErr) {
        console.error("Failed to send email notification:", emailErr);
      }
    }

    res.status(201).json(assignment);
  } catch (err) {
    console.error("Create Assignment Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get All Assignments (Filtered for students/admins)
const getAssignments = async (req, res) => {
  const { status, course, subject } = req.query;

  try {
    let query = {};
    if (req.user.role === "student") {
      query = { course: req.user.course };
    }
    if (status) query.status = status;
    if (course) query.course = course;
    if (subject) query.subject = subject;

    const assignments = await Assignment.find(query).populate("createdBy", "name");
    res.json(assignments);
  } catch (err) {
    console.error("Get Assignments Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update Assignment (Admin only)
const updateAssignment = async (req, res) => {
  const { id } = req.params;
  const { title, course, subject, dueDate, dueTime, priority, status } = req.body;

  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    assignment.title = title || assignment.title;
    assignment.course = course || assignment.course;
    assignment.subject = subject || assignment.subject;
    assignment.dueDate = dueDate || assignment.dueDate;
    assignment.dueTime = dueTime || assignment.dueTime;
    assignment.priority = priority || assignment.priority;
    assignment.status = status || assignment.status;

    await assignment.save();
    res.json(assignment);
  } catch (err) {
    console.error("Update Assignment Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete Assignment (Admin only)
const deleteAssignment = async (req, res) => {
  const { id } = req.params;

  try {
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await assignment.remove();
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    console.error("Delete Assignment Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Submit Assignment (Student only)
const submitAssignment = async (req, res) => {
  const { id } = req.params;
  const submission = req.file;

  try {
    if (!submission) {
      return res.status(400).json({ message: "Submission file is required" });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const uploadResult = await uploadToS3(submission, "submissions");
    const submissionUrl = getFileUrl(uploadResult.Key);

    assignment.submissions.push({
      student: req.user._id,
      submissionUrl,
    });

    if (assignment.submissions.length === 1) {
      assignment.status = "completed";
    }

    await assignment.save();

    // Send confirmation email (optional)
    try {
      await sendEmail(
        req.user.email,
        `Assignment Submitted: ${assignment.title}`,
        `Your assignment "${assignment.title}" has been submitted successfully. View your submission: ${submissionUrl}`
      );
    } catch (emailErr) {
      console.error("Failed to send submission email:", emailErr);
    }

    res.json({ message: "Assignment submitted", assignment });
  } catch (err) {
    console.error("Submit Assignment Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export { createAssignment, getAssignments, updateAssignment, deleteAssignment, submitAssignment };