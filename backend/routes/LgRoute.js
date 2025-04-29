import express from "express";
import { registerUser, loginUser, getAllUsers, updateUser, deleteUser } from "../controllers/LgController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/allusers", authMiddleware, getAllUsers);
router.put("/updateuser/:id", authMiddleware, updateUser);
router.delete("/deleteuser/:id", authMiddleware, deleteUser);

export default router;