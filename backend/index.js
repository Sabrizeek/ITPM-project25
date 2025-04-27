import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get the current directory path for ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/public", express.static(path.join(__dirname, "public")));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/contacts", contactRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});