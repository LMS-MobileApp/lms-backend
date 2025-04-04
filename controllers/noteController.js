import Note from "../models/Note.js";
import Assignment from "../models/Assignment.js";

const createNote = async (req, res) => {
  const { assignment, content, type } = req.body;

  try {
    const assignmentExists = await Assignment.findById(assignment);
    if (!assignmentExists) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const note = new Note({
      assignment,
      user: req.user._id,
      content,
      type: type || "note", // Default to "note" if not provided
    });

    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error("Create Note Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUserNotes = async (req, res) => {
  const { assignmentId } = req.query; // Optional filter by assignment

  try {
    const query = { user: req.user._id };
    if (assignmentId) query.assignment = assignmentId;

    const notes = await Note.find(query)
      .populate("assignment", "title")
      .sort("-createdAt");
    res.json(notes);
  } catch (err) {
    console.error("Get Notes Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getNote = async (req, res) => {
  const { noteId } = req.params;

  try {
    const note = await Note.findById(noteId).populate("assignment", "title");
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(note);
  } catch (err) {
    console.error("Get Note Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateNote = async (req, res) => {
  const { noteId } = req.params;
  const { content, type, completed } = req.body;

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    note.content = content || note.content;
    note.type = type || note.type;
    note.completed = completed !== undefined ? completed : note.completed;

    await note.save();
    res.json(note);
  } catch (err) {
    console.error("Update Note Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteNote = async (req, res) => {
  const { noteId } = req.params;

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await note.remove();
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Delete Note Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export { createNote, getUserNotes, getNote, updateNote, deleteNote };