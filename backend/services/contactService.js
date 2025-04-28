// ADD THIS at the top of contactService.js
import multer from "multer";
import path from "path";

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "backend/public/uploads"); // Upload folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter }); // ✅ Here is your upload

// Export it
export { upload };

// THEN your normal imports
import Contact from "../models/Contact.js";

// Create a contact
export const createContact = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      birthday,
      address,
      notes,
      gender,
      category,
    } = req.body;

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const contact = new Contact({
      firstName,
      lastName,
      email,
      phoneNumber,
      birthday,
      address,
      notes,
      gender,
      category,
      imageUrl,
    });

    const savedContact = await contact.save();
    return savedContact;
  } catch (error) {
    console.error("Error in createContact:", error);
    throw error;
  }
};

// Get all contacts
export const getContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    console.error("Error in getContacts:", error);
    throw error;
  }
};

// Get a contact by ID
export const getContactById = async (id) => {
  try {
    const contact = await Contact.findById(id);
    return contact;
  } catch (error) {
    console.error("Error in getContactById:", error);
    throw error;
  }
};

// Update a contact
export const updateContact = async (id, contactData) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(id, contactData, {
      new: true,
      runValidators: true,
    });
    return updatedContact;
  } catch (error) {
    console.error("Error in updateContact:", error);
    throw error;
  }
};

// Delete a contact
export const deleteContact = async (id) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(id);
    return deletedContact;
  } catch (error) {
    console.error("Error in deleteContact:", error);
    throw error;
  }
};
