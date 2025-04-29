import express from "express";
import {
  allMessages,
  sendMessage,
  updateMessage,
  deleteMessages,
  deleteMessage,
  getEmotionSummary,
} from "../controllers/messageController.js"; // Changed to singular
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:chatId").get(authMiddleware, allMessages);
router.route("/").post(authMiddleware, sendMessage);
router.route("/:messageId").put(authMiddleware, updateMessage);
router.route("/delete/:chatId").delete(authMiddleware, deleteMessages);
router.route("/:messageId").delete(authMiddleware, deleteMessage);
router.route("/summary/:chatId").get(authMiddleware, getEmotionSummary);

export default router;