import express from "express";
import { createContactHandler, getContactsHandler, getContactByIdHandler, updateContactHandler, deleteContactHandler } from "../controllers/contactController.js";

const router = express.Router();

// Create a new contact
router.post("/", createContactHandler);

// Get all contacts
router.get("/", getContactsHandler);

// Get a contact by ID
router.get("/:id", getContactByIdHandler);

// Update a contact by ID
router.put("/:id", updateContactHandler);

// Delete a contact by ID
router.delete("/:id", deleteContactHandler);

export default router;