import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import LgUser from "./models/RegisterModel.js";
import LgRoutes from "./routes/LgRoute.js";

dotenv.config(); // Load .env file
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins for now
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Routes
app.use("/lguser", LgRoutes);

// Environment variables
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected 😍: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Start server after connecting DB
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running at http://localhost:${PORT} 🚀`);
});

// Register route
const saltRounds = 10;

app.post("/register", async (req, res) => {
  const { lgname, lggmail, lgnumber, lgage, lgaddress, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await LgUser.create({
      lgname,
      lggmail,
      lgnumber,
      lgage,
      lgaddress,
      password: hashedPassword,
    });

    res.status(200).json({ status: "ok", message: "Registered successfully", redirectTo: "/login" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { lggmail, password } = req.body;

  try {
    const user = await LgUser.findOne({ lggmail });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Gmail not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ status: "error", message: "Incorrect password" });
    }

    if (user.lggmail === "admin@gmail.com") {
      return res.status(200).json({ status: "ok", message: "Admin login successful", redirectTo: "/home2" });
    } else {
      return res.status(200).json({ status: "ok", message: "User login successful", redirectTo: "/mainhome" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Something went wrong", error });
  }
});
