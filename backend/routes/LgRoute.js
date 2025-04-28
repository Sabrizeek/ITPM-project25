import express from "express";
import { getAllUsers, updateUser, deleteUser } from "../controllers/LgController.js";

const router = express.Router();

router.get("/allusers", getAllUsers);
router.put("/updateuser/:id", updateUser);
router.delete("/deleteuser/:id", deleteUser);

export default router;