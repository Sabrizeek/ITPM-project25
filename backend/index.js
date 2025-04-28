// backend/index.js

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url"; // ✅ Needed for __dirname in ES modules
import { connectDB } from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Correct __dirname handling for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/contacts", contactRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
