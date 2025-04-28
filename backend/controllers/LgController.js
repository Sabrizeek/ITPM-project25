import LgUser from "../models/RegisterModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register a new user
const registerUser = async (req, res) => {
  const { lgname, lggmail, lgnumber, lgage, lgaddress, password } = req.body;

  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lggmail)) {
      return res.status(400).json({ status: "error", error: "Invalid email format" });
    }

    // Check for duplicate email
    const existingUser = await LgUser.findOne({ lggmail });
    if (existingUser) {
      return res.status(400).json({ status: "error", error: "Email already registered" });
    }

    // Validate password
    if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{9,}$/.test(password)) {
      return res.status(400).json({
        status: "error",
        error: "Password must be at least 9 characters with numbers and special characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new LgUser({
      lgname,
      lggmail,
      lgnumber,
      lgage,
      lgaddress,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ status: "ok", message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

// Login a user
const loginUser = async (req, res) => {
  const { lggmail, password } = req.body;

  try {
    // Validate input
    if (!lggmail || !password) {
      return res.status(400).json({ status: "error", error: "Email and password are required" });
    }

    const user = await LgUser.findOne({ lggmail });
    if (!user) {
      return res.status(404).json({ status: "error", error: "Email not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: "error", error: "Incorrect password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, lggmail: user.lggmail, isAdmin: user.lggmail === "admin@gmail.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: "ok",
      message: "Login successful",
      token,
      redirectTo: user.lggmail === "admin@gmail.com" ? "/home2" : "/mainhome",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await LgUser.find().select("-password"); // Exclude password
    res.json({ status: "ok", users });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

// Update user by ID
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { lgname, lggmail, lgnumber, lgage, lgaddress, password } = req.body;

  try {
    let updateData = { lgname, lggmail, lgnumber, lgage, lgaddress };

    if (password) {
      if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{9,}$/.test(password)) {
        return res.status(400).json({
          status: "error",
          error: "Password must be at least 9 characters with numbers and special characters",
        });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await LgUser.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    res.json({ status: "ok", message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

// Delete user by ID
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await LgUser.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    res.json({ status: "ok", message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

export { registerUser, loginUser, getAllUsers, updateUser, deleteUser };