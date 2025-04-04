// import express from "express";
// import {
//   createGroupChat,
//   joinGroupChat,
//   getGroupChatMessages,
//   leaveGroupChat,
// } from "../controllers/groupChatController.js";
// import { auth } from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.use(auth);

// router.post("/", createGroupChat);
// router.post("/:groupChatId/join", joinGroupChat);
// router.get("/:groupChatId/messages", getGroupChatMessages);
// router.post("/:groupChatId/leave", leaveGroupChat);

// export default router;

import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { createGroupChat, joinGroupChat, getGroupChatMessages, sendGroupChatMessage, leaveGroupChat } from "../controllers/groupChatController.js";

const router = express.Router();

router.post("/", auth, createGroupChat);                    // 1. Create a group chat
router.post("/:groupChatId/join", auth, joinGroupChat);     // 2. Join a group chat
router.get("/:groupChatId/messages", auth, getGroupChatMessages);  // 3. Get messages
router.post("/:groupChatId/messages", auth, sendGroupChatMessage); // 4. Send a message
router.post("/:groupChatId/leave", auth, leaveGroupChat);   // 5. Leave a group chat

export default router;