import mongoose from "mongoose";
const { Schema } = mongoose;

const registerSchema = new Schema({
  lgname: {
    type: String,
    required: true,
  },
  lggmail: {
    type: String,
    required: true,
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
});

export default mongoose.model("RegisterModel", registerSchema);