import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const registerSchema = new Schema(
  {
    lgname: {
      type: String,
      required: true,
    },
    lggmail: {
      type: String,
      required: true,
      unique: true,
    },
    lgnumber: {
      type: Number,
      required: true,
    },
    lgage: {
      type: Number,
      required: true,
    },
    lgaddress: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
registerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
registerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index for faster queries
registerSchema.index({ lggmail: 1 }, { unique: true });

export default mongoose.model("RegisterModel", registerSchema);