// backend/index.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import contactRoutes from "./routes/contactRoutes.js";
import eventRoute from "./routes/eventRoute.js";
import lgRoute from "./routes/LgRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// Error Handling middlewares
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Load environment variables
dotenv.config();

// Correct __dirname handling for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // Specify frontend URL for security
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(bodyParser.json());
app.use(express.json());

// ✅ Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Routes
app.use("/api/contacts", contactRoutes);
app.use("/api/events", eventRoute);
app.use("/api/auth", lgRoute);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

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

// Start server
app.listen(PORT, () => {
  connectDatabase();
  console.log(`Server running at http://localhost:${PORT} 🚀`);
});
