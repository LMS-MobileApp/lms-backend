import { io } from "socket.io-client";

// Connect to the Socket.IO server
const socket = io("http://localhost:5001");

// Replace these with your actual values
const groupChatId = "67f02fa4d9ccbcd395e73ef6"; // From POST /api/group-chats response
const userId = "67ef9afa16917bcbf03f6dc0";     // From your JWT payload


// Handle connection           
socket.on("connect", () => {
  console.log("Connected to server:", socket.id);

  // 1. Join the group chat
  socket.emit("joinGroupChat", { groupChatId, userId });

  // Wait for join confirmation before sending a message
  socket.on("message", (msg) => {
    if (msg.text.includes("has joined the chat")) {
      console.log("Joined successfully:", msg);

      // 2. Send a message after joining
      socket.emit("sendMessage", {
        groupChatId,
        userId,
        content: "Hello, HDSE Group! This is a test message.",
      });
    } else {
      console.log("Received message:", msg);
    }
  });
});

// Listen for incoming messages
socket.on("message", (msg) => {
  console.log("Received message:", msg);
});

// Handle errors
socket.on("error", (err) => {
  console.error("Error:", err);
});

// Handle disconnection
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});