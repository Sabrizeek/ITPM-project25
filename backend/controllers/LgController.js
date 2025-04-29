import LgUser from "../models/RegisterModel.js";
import jwt from "jsonwebtoken";
import { addUserToGeneralChat } from "./chatController.js";

// Register a new user
const registerUser = async (req, res) => {
  const { lgname, lggmail, lgnumber, lgage, lgaddress, password } = req.body;

  try {
    // Validate input
    if (!lgname || !lggmail || !lgnumber || !lgage || !lgaddress || !password) {
      return res.status(400).json({ status: "error", error: "All fields are required" });
    }

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
        error: "Password must be at least 9 characters long and contain numbers and special characters",
      });
    }

    const newUser = new LgUser({
      lgname,
      lggmail,
      lgnumber,
      lgage,
      lgaddress,
      password, // Password will be hashed by pre-save hook
    });

    await newUser.save();

    // Add user to General chat
    const generalChatId = await addUserToGeneralChat(newUser._id, newUser.lgname);

    // Update user's chats array
    newUser.chats.push(generalChatId);
    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: newUser._id, lggmail: newUser.lggmail, lgname: newUser.lgname, isAdmin: newUser.lggmail === "admin@gmail.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      status: "ok",
      message: "User registered successfully and added to General chat",
      token,
      user: { id: newUser._id, lgname: newUser.lgname, lggmail: newUser.lggmail },
    });
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

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: "error", error: "Incorrect password" });
    }

    // Add user to General chat if not already added
    const generalChatId = await addUserToGeneralChat(user._id, user.lgname);
    if (!user.chats.includes(generalChatId)) {
      user.chats.push(generalChatId);
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, lggmail: user.lggmail, lgname: user.lgname, isAdmin: user.lggmail === "admin@gmail.com" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: "ok",
      message: "Login successful",
      token,
      redirectTo: user.lggmail === "admin@gmail.com" ? "/home2" : "/mainhome",
      user: { id: user._id, lgname: user.lgname, lggmail: user.lggmail },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ status: "error", error: "Server error" });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await LgUser.find().select("-password");
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
          error: "Password must be at least 9 characters long and contain numbers and special characters",
        });
      }
      updateData.password = password; // Will be hashed by pre-save hook
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