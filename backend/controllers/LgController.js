const LgUser = require("../Model/RegisterModel");
const bcrypt = require("bcrypt");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await LgUser.find();
    res.json({ status: "ok", users });
  } catch (err) {
    res.json({ status: "error", error: err.message });
  }
};

// Update user by ID
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { lgname, lggmail, lgnumber, lgage, lgaddress, password } = req.body;
  
    try {
      let updateData = { lgname, lggmail, lgnumber, lgage, lgaddress };
  
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }
  
      await LgUser.findByIdAndUpdate(id, updateData);
      res.json({ status: "ok", message: "User updated successfully" });
    } catch (err) {
      res.json({ status: "error", error: err.message });
    }
  };
  
// Delete user by ID
const deleteUser = async (req, res) => {
    const { id } = req.params;
  
    try {
      await LgUser.findByIdAndDelete(id);
      res.json({ status: "ok", message: "User deleted successfully" });
    } catch (err) {
      res.json({ status: "error", error: err.message });
    }
  };
  

module.exports = {
    getAllUsers,
    updateUser,
    deleteUser,
  };
  