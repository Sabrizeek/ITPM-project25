import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/contacts`;

// Create a new contact
export const createContact = async (contactData) => {
  try {
    const response = await axios.post(BASE_URL, contactData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating contact:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Fetch all contacts
export const getContacts = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching contacts:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Fetch a single contact by ID
export const getContactById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching contact by ID:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Update a contact by ID
export const updateContact = async (id, contactData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, contactData);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating contact:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Delete a contact by ID
export const deleteContact = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting contact:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};