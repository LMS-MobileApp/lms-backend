// import GroupChat from "../models/GroupChat.js";
// import Message from "../models/Message.js";
// import User from "../models/User.js";
// import Assignment from "../models/Assignment.js"; // Fixed: Added missing import

// const createGroupChat = async (req, res) => {
//   const { assignmentId, name } = req.body;

//   try {
//     const assignment = await Assignment.findById(assignmentId);
//     if (!assignment) {
//       return res.status(404).json({ message: "Assignment not found" });
//     }

//     const groupChat = new GroupChat({
//       assignment: assignmentId,
//       name,
//       members: [req.user._id],
//     });

//     await groupChat.save();
//     res.status(201).json(groupChat);
//   } catch (err) {
//     console.error("Create Group Chat Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// const joinGroupChat = async (req, res) => {
//   const { groupChatId } = req.params;

//   try {
//     const groupChat = await GroupChat.findById(groupChatId);
//     if (!groupChat) {
//       return res.status(404).json({ message: "Group chat not found" });
//     }

//     if (groupChat.members.includes(req.user._id)) {
//       return res.status(400).json({ message: "You are already a member" });
//     }

//     groupChat.members.push(req.user._id);
//     await groupChat.save();
//     res.json(groupChat);
//   } catch (err) {
//     console.error("Join Group Chat Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// const getGroupChatMessages = async (req, res) => {
//   const { groupChatId } = req.params;

//   try {
//     const groupChat = await GroupChat.findById(groupChatId);
//     if (!groupChat) {
//       return res.status(404).json({ message: "Group chat not found" });
//     }

//     if (!groupChat.members.includes(req.user._id)) {
//       return res.status(403).json({ message: "You are not a member of this group" });
//     }

//     const messages = await Message.find({ groupChat: groupChatId })
//       .populate("sender", "name email")
//       .sort("sentAt");
//     res.json(messages);
//   } catch (err) {
//     console.error("Get Messages Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// const leaveGroupChat = async (req, res) => {
//   const { groupChatId } = req.params;

//   try {
//     const groupChat = await GroupChat.findById(groupChatId);
//     if (!groupChat) {
//       return res.status(404).json({ message: "Group chat not found" });
//     }

//     const memberIndex = groupChat.members.indexOf(req.user._id);
//     if (memberIndex === -1) {
//       return res.status(400).json({ message: "You are not a member" });
//     }

//     groupChat.members.splice(memberIndex, 1);
//     await groupChat.save();
//     res.json({ message: "Left group chat successfully" });
//   } catch (err) {
//     console.error("Leave Group Chat Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// export { createGroupChat, joinGroupChat, getGroupChatMessages, leaveGroupChat };


import GroupChat from "../models/GroupChat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";

const createGroupChat = async (req, res) => {
  const { assignmentId, name } = req.body;

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const groupChat = new GroupChat({
      assignment: assignmentId,
      name,
      members: [req.user._id],
    });

    await groupChat.save();
    res.status(201).json(groupChat);
  } catch (err) {
    console.error("Create Group Chat Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const joinGroupChat = async (req, res) => {
  const { groupChatId } = req.params;

  try {
    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (groupChat.members.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already a member" });
    }

    groupChat.members.push(req.user._id);
    await groupChat.save();
    res.json(groupChat);
  } catch (err) {
    console.error("Join Group Chat Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getGroupChatMessages = async (req, res) => {
  const { groupChatId } = req.params;

  try {
    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    if (!groupChat.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const messages = await Message.find({ groupChat: groupChatId })
      .populate("sender", "name email")
      .sort("sentAt");
    res.json(messages);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const sendGroupChatMessage = async (req, res) => {
  const { groupChatId } = req.params;
  const { content } = req.body;

  try {
    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }
    if (!groupChat.members.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const message = new Message({
      groupChat: groupChatId,
      sender: req.user._id,
      content,
      sentAt: new Date(),
    });

    await message.save();

    // Emit to Socket.IO for real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(groupChatId).emit("message", {
        user: req.user._id,
        text: content,
        timestamp: message.sentAt,
      });
    }

    res.status(201).json(message);
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const leaveGroupChat = async (req, res) => {
  const { groupChatId } = req.params;

  try {
    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    const memberIndex = groupChat.members.indexOf(req.user._id);
    if (memberIndex === -1) {
      return res.status(400).json({ message: "You are not a member" });
    }

    groupChat.members.splice(memberIndex, 1);
    await groupChat.save();
    res.json({ message: "Left group chat successfully" });
  } catch (err) {
    console.error("Leave Group Chat Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export { createGroupChat, joinGroupChat, getGroupChatMessages, sendGroupChatMessage, leaveGroupChat };