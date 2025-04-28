import { createContact, getContacts, getContactById, updateContact, deleteContact, upload } from "../services/contactService.js";

// Then your handlers (no changes needed here)

const createContactHandler = async (req, res) => {
  return new Promise((resolve, reject) => {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ message: err.message });
      }

      try {
        const contact = await createContact(req, res);
        res.status(201).json(contact);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
  });
};


const getContactsHandler = async (req, res) => {
  try {
    const contacts = await getContacts();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContactByIdHandler = async (req, res) => {
  try {
    const contact = await getContactById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateContactHandler = async (req, res) => {
  return new Promise((resolve, reject) => {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ message: err.message });
      }

      try {
        const contactData = req.body;

        if (req.file) {
          contactData.imageUrl = `/uploads/${req.file.filename}`;
          console.log("File uploaded successfully in updateContactHandler:", contactData.imageUrl);
        }

        const contact = await updateContact(req.params.id, contactData);
        if (!contact) {
          return res.status(404).json({ message: "Contact not found" });
        }
        res.status(200).json(contact);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
  });
};


const deleteContactHandler = async (req, res) => {
  try {
    const contact = await deleteContact(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createContactHandler,
  getContactsHandler,
  getContactByIdHandler,
  updateContactHandler,
  deleteContactHandler
};
