import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';


const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log('UserId param not sent with request');
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name email',
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// @desc    Fetch all chats for a user
// @route   GET /api/chat
// @access  Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'name email',
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Fetch all groups
// @route   GET /api/chat/groups
// @access  Protected
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

// @desc    Create new group chat
// @route   POST /api/chat/group
// @access  Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Data is insufficient' });
  }

  const users = JSON.parse(req.body.users);
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
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

// @desc    Exit from group
// @route   PUT /api/chat/group-exit
// @access  Protected
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

// @desc    Delete 1:1 chat
// @route   DELETE /api/chat/:chatId
// @access  Protected
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

// @desc    Delete group chat
// @route   DELETE /api/chat/group/:chatId
// @access  Protected
const deleteGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const group = await Chat.findOne({ _id: chatId, isGroupChat: true });
    if (!group) {
      res.status(404);
      throw new Error('Group not found');
    }

    // Check if the requester is the group admin
    if (group.groupAdmin.toString() !== req.user._id.toString()) {
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
};