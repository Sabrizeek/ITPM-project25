import React from "react";
import { Modal, Descriptions, Image, Button } from "antd";

// Base URL for the backend
const BACKEND_URL = "http://localhost:5000";

const ContactDetailsModal = ({ open, onClose, contact }) => {
  if (!contact) return null;

  // Construct full image URL
  const imageUrl = contact.imageUrl ? `${BACKEND_URL}/public${contact.imageUrl}` : null;
  console.log("ContactDetailsModal Image URL:", imageUrl); // Debugging

  return (
    <Modal
      title="Contact Details"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="First Name">
          {contact.firstName}
        </Descriptions.Item>
        <Descriptions.Item label="Last Name">
          {contact.lastName}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {contact.email}
        </Descriptions.Item>
        <Descriptions.Item label="Phone Number">
          {contact.phoneNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Birthday">
          {contact.birthday}
        </Descriptions.Item>
        <Descriptions.Item label="Address">
          {contact.address}
        </Descriptions.Item>
        <Descriptions.Item label="Notes">
          {contact.notes}
        </Descriptions.Item>
        <Descriptions.Item label="Gender">
          {contact.gender}
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          {contact.category}
        </Descriptions.Item>
        <Descriptions.Item label="Image">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Contact Image"
              width={200}
              placeholder={<div>Loading...</div>}
              onError={() => console.error("Failed to load image:", imageUrl)}
            />
          ) : (
            <Image
              src="https://via.placeholder.com/200?text=No+Image"
              alt="No Image Available"
              width={200}
            />
          )}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ContactDetailsModal;