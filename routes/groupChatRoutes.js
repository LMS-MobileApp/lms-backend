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