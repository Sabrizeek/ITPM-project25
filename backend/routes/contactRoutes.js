import express from "express";
import { createContact, getContacts, getContactById, updateContact, deleteContact } from "../services/contactService.js";

const router = express.Router();

// Create a new contact
router.post("/", (req, res) => {
  createContact(req, res)
    .then((contact) => res.status(201).json(contact))
    .catch((error) => res.status(400).json({ message: error.message }));
});

// Get all contacts
router.get("/", (req, res) => {
  getContacts()
    .then((contacts) => res.status(200).json(contacts))
    .catch((error) => res.status(500).json({ message: error.message }));
});

// Get a contact by ID
router.get("/:id", (req, res) => {
  getContactById(req.params.id)
    .then((contact) => res.status(200).json(contact))
    .catch((error) => res.status(404).json({ message: error.message }));
});

// Update a contact by ID
router.put("/:id", (req, res) => {
  updateContact(req, res)
    .then((contact) => res.status(200).json(contact))
    .catch((error) => res.status(400).json({ message: error.message }));
});

// Delete a contact by ID
router.delete("/:id", (req, res) => {
  deleteContact(req.params.id)
    .then((contact) => res.status(200).json(contact))
    .catch((error) => res.status(404).json({ message: error.message }));
});

export default router;