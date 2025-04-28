import express from "express";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  groupExit,
  fetchGroups,
  deleteChat,
  deleteGroup,
} from "../controllers/chatController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/c").post(authMiddleware, accessChat);
router.route("/c").get(authMiddleware, fetchChats);
router.route("/createGroup").post(authMiddleware, createGroupChat);
router.route("/fetchGroups").get(authMiddleware, fetchGroups);
router.route("/groupExit").put(authMiddleware, groupExit);
router.route("/:chatId").delete(authMiddleware, deleteChat);
router.route("/deleteGroup/:chatId").delete(authMiddleware, deleteGroup);

export default router;