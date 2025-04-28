import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Import routes
import eventRoute from "./routes/eventRoute.js";
import LgRoutes from "./routes/LgRoute.js";

// Import models
import LgUser from "./models/RegisterModel.js";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins for now (You can later specify frontend URL)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use("/api/events", eventRoute); // Use event routes
app.use("/lguser", LgRoutes);

// Debugging
console.log("Mongo URI:", process.env.MONGO_URI);

// Connect to MongoDB
const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host} 🔥`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

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

// Start server and connect to the database
app.listen(PORT, () => {
  connectDatabase(); // Connect to MongoDB
  console.log(`Server running at http://localhost:${PORT} 🚀`);
});
