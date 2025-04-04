import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: Date, required: true },
  dueTime: { type: String, required: true }, 
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  pdfUrl: { type: String }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  submissions: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submittedAt: { type: Date, default: Date.now },
      submissionUrl: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Assignment", assignmentSchema);