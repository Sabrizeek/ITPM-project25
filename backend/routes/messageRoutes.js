import express from "express";
import {
  allMessages,
  sendMessage,
  updateMessage,
  deleteMessages,
  deleteMessage,
  getEmotionSummary,
} from "../controllers/messageController.js"; // Changed to singular
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/:messageId").put(protect, updateMessage);
router.route("/delete/:chatId").delete(protect, deleteMessages);
router.route("/:messageId").delete(protect, deleteMessage);
router.route("/summary/:chatId").get(protect, getEmotionSummary);

export default router;