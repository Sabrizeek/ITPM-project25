import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  birthday: { type: Date },
  address: { type: String },
  notes: { type: String },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  category: { 
    type: String, 
    enum: [
      "Family",
      "Friends",
      "Work",
      "Business",
      "Colleagues",
      "Clients",
      "Freelancers",
      "Vendors",
      "Investors",
      "Partners",
      "Mentors",
      "Consultants",
      "Service Providers",
      "Healthcare",
      "Other"
    ] 
  },
  imageUrl: { type: String },
});

export default mongoose.model("Contact", contactSchema);