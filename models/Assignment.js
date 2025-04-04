import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: Date, required: true },
  dueTime: { type: String, required: true }, // e.g., "14:30"
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  pdfUrl: { type: String }, // URL to S3-stored assignment PDF
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Admin who created it
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submittedAt: { type: Date, default: Date.now },
      submissionUrl: { type: String }, // URL to S3-stored submission (PDF/link)
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Assignment", assignmentSchema);