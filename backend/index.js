import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// Import routes
import eventRoute from "./routes/eventRoute.js";
import lgRoute from "./routes/LgRoute.js"; // Renamed for clarity
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// Error Handling middlewares
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // Specify frontend URL for security
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.use("/api/events", eventRoute);
app.use("/api/auth", lgRoute); // Standardized to /api/auth
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