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
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/createGroup").post(protect, createGroupChat);
router.route("/fetchGroups").get(protect, fetchGroups);
router.route("/groupExit").put(protect, groupExit);
router.route("/:chatId").delete(protect, deleteChat);
router.route("/deleteGroup/:chatId").delete(protect, deleteGroup);

export default router;