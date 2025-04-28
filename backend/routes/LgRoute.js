const express = require("express");
const router = express.Router();
const { getAllUsers, updateUser, deleteUser } = require("../Controller/LgController");



router.get("/allusers", getAllUsers);
router.put("/updateuser/:id", updateUser);

router.delete("/deleteuser/:id", deleteUser);


module.exports = router;
