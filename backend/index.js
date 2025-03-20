import dotenv from "dotenv";
dotenv.config(); // Load environment variables before using them

import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors"; 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

console.log("Mongo URI:", process.env.MONGO_URI); // Debugging line

// Start server and connect to the database
app.listen(PORT, () => {
    connectDB(); // Connect to the database
    console.log(`Server started at http://localhost:${PORT}🔥`);
});
