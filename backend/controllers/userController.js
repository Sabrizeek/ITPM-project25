import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import generateToken from "../config/generateToken.js";

export const loginController = expressAsyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findOne({ name });

  if (user && (await user.matchPassword(password))) {
    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    };
    res.json(response);
  } else {
    res.status(401);
    throw new Error("Invalid UserName or Password");
  }
});

export const registerController = expressAsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All necessary input fields have not been filled");
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    throw new Error("User already Exists");
  }

  const userNameExist = await User.findOne({ name });
  if (userNameExist) {
    throw new Error("UserName already taken");
  }

  const user = await User.create({ name, email, password });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Registration Error");
  }
});

export const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

export const deleteUserController = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Remove user from all chats
    await Chat.updateMany(
      { users: userId },
      { $pull: { users: userId } }
    );

    // Delete one-on-one chats where this user is a participant
    const oneOnOneChats = await Chat.find({
      isGroupChat: false,
      users: userId,
    });
    const chatIds = oneOnOneChats.map((chat) => chat._id);
    await Chat.deleteMany({ _id: { $in: chatIds } });

    // Delete messages where this user is the sender or receiver
    await Message.deleteMany({
      $or: [{ sender: userId }, { reciever: userId }],
    });

    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User and related data deleted successfully" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});