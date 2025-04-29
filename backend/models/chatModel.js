import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    chatName: { 
      type: String, 
      trim: true, 
      required: function() { return this.isGroupChat; } // Required for group chats
    },
    isGroupChat: { 
      type: Boolean, 
      default: false 
    },
    users: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RegisterModel' // Reference RegisterModel instead of User
    }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RegisterModel'
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;