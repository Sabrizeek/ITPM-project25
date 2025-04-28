const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

module.exports = mongoose.model("RegisterModel", registerSchema);
