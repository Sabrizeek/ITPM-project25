import expressAsyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";
import natural from "natural";

// Simple emotion detection based on word matching
const emotionDictionary = {
  Happy: ["happy", "joy", "great", "awesome", "fun"],
  Sad: ["sad", "cry", "depressed", "sorry", "unhappy", "tough", "awful"],
  Angry: ["angry", "mad", "furious", "hate", "annoyed", "rude"],
  Love: ["love", "sweet", "dear", "adorable", "heart"],
  Neutral: [], // Default if no match
};

const detectEmotion = (content) => {
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(content.toLowerCase());

  let emotionScores = { Happy: 0, Sad: 0, Angry: 0, Love: 0, Neutral: 0 };

  words.forEach((word) => {
    for (const [emotion, keywords] of Object.entries(emotionDictionary)) {
      if (keywords.includes(word)) {
        emotionScores[emotion]++;
      }
    }
  });

  const dominantEmotion = Object.keys(emotionScores).reduce((a, b) =>
    emotionScores[a] > emotionScores[b] ? a : b
  );
  return emotionScores[dominantEmotion] > 0 ? dominantEmotion : "Neutral";
};

export const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .populate("reciever")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const emotion = detectEmotion(content);

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    emotion: emotion,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await message.populate("reciever");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const updateMessage = expressAsyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  const emotion = detectEmotion(content);

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404);
      throw new Error("Message not found");
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You can only update your own messages");
    }

    message.content = content;
    message.emotion = emotion;
    message.updatedAt = new Date();
    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate("sender", "name email")
      .populate("reciever")
      .populate("chat");

    res.json(updatedMessage);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const deleteMessages = expressAsyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    if (!chat.users.includes(req.user._id)) {
      res.status(403);
      throw new Error("You are not a participant in this chat");
    }

    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndUpdate(chatId, { $unset: { latestMessage: "" } });

    res.status(200).json({ message: "All messages deleted successfully" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const deleteMessage = expressAsyncHandler(async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404);
      throw new Error("Message not found");
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("You can only delete your own messages");
    }

    await Message.findByIdAndDelete(messageId);

    const chat = await Chat.findById(message.chat);
    if (chat.latestMessage && chat.latestMessage.toString() === messageId) {
      const nextLatestMessage = await Message.findOne({ chat: message.chat })
        .sort({ createdAt: -1 })
        .limit(1);

      await Chat.findByIdAndUpdate(message.chat, {
        latestMessage: nextLatestMessage ? nextLatestMessage._id : null,
      });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export const getEmotionSummary = expressAsyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chat: chatId });
    if (!messages.length) {
      return res.status(200).json({ summary: "No messages in this chat", insight: "" });
    }

    const emotionCounts = messages.reduce((acc, msg) => {
      acc[msg.emotion] = (acc[msg.emotion] || 0) + 1;
      return acc;
    }, {});

    const totalMessages = messages.length;
    const emotionSummary = Object.keys(emotionCounts).map((emotion) => ({
      emotion,
      percentage: ((emotionCounts[emotion] / totalMessages) * 100).toFixed(0),
    }));

    const dominantEmotion = emotionSummary.reduce((prev, curr) =>
      prev.percentage > curr.percentage ? prev : curr
    ).emotion;

    let insight = "";
    switch (dominantEmotion) {
      case "Happy":
        insight = "You had a joyful chat! Keep spreading positivity. 😊";
        break;
      case "Sad":
        insight = "This chat had some heavy moments. Maybe a kind word can lift the mood next time.";
        break;
      case "Angry":
        insight = "Your conversation had some frustration. Take a deep breath before responding next time!";
        break;
      case "Love":
        insight = "A heartwarming chat! Keep the love flowing. ❤️";
        break;
      default:
        insight = "A balanced chat—nothing too intense here!";
    }

    res.status(200).json({ summary: emotionSummary, insight });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});