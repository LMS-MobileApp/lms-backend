import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ["note", "todo"], default: "note" },
  completed: { type: Boolean, default: false }, // For to-do items
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Note", noteSchema);