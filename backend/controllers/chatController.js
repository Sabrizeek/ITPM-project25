import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';
import Message from '../models/messageModel.js';
import LgUser from '../models/RegisterModel.js';

// Helper function to add a user to the "General" group chat
const addUserToGeneralChat = asyncHandler(async (userId, lgname) => {
  let generalChat = await Chat.findOne({ chatName: "General", isGroupChat: true });
  if (!generalChat) {
    const adminUser = await LgUser.findById(userId);
    generalChat = await Chat.create({
      chatName: "General",
      isGroupChat: true,
      users: [userId],
      groupAdmin: userId,
    });
    await Message.create({
      sender: userId,
      content: `Welcome to the General chat!`,
      chat: generalChat._id,
      emotion: "Happy",
    });
  } else if (!generalChat.users.includes(userId)) {
    generalChat.users.push(userId);
    await generalChat.save();
    await Message.create({
      sender: userId,
      content: `${lgname} has joined the General chat!`,
      chat: generalChat._id,
      emotion: "Happy",
    });
  }
  return generalChat._id;
});

// Access or create a 1:1 chat
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log('UserId param not sent with request');
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user.userId } } }, // Updated to userId
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  isChat = await LgUser.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'lgname lggmail',
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user.userId, userId], // Updated to userId
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).json(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// Fetch all chats for a user
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user.userId } } }) // Updated to userId
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await LgUser.populate(results, {
          path: 'latestMessage.sender',
          select: 'lgname lggmail',
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Fetch all groups
const fetchGroups = asyncHandler(async (req, res) => {
  try {
    const allGroups = await Chat.where('isGroupChat')
      .equals(true)
      .populate('users', '-password')
      .populate('groupAdmin', '-password');
    res.status(200).send(allGroups);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Create new group chat
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Data is insufficient' });
  }

  const users = JSON.parse(req.body.users);
  users.push(req.user.userId); // Updated to userId

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user.userId, // Updated to userId
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Exit from group
const groupExit = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!removed) {
    res.status(404);
    throw new Error('Chat Not Found');
  } else {
    res.json(removed);
  }
});

// Delete 1:1 chat
const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404);
      throw new Error('Chat not found');
    }

    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Delete group chat
const deleteGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const group = await Chat.findOne({ _id: chatId, isGroupChat: true });
    if (!group) {
      res.status(404);
      throw new Error('Group not found');
    }

    if (group.groupAdmin.toString() !== req.user.userId.toString()) { // Updated to userId
      res.status(403);
      throw new Error('Only the group admin can delete this group');
    }

    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export {
  accessChat,
  fetchChats,
  fetchGroups,
  createGroupChat,
  groupExit,
  deleteChat,
  deleteGroup,
  addUserToGeneralChat,
};