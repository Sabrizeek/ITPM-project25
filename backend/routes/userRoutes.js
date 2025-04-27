import express from "express";
import {
  loginController,
  registerController,
  fetchAllUsersController,
  deleteUserController,
} from "../controllers/userController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.get("/fetchUsers", protect, fetchAllUsersController);
router.delete("/deleteUser/:userId", protect, deleteUserController);

export default router;