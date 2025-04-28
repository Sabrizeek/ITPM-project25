import React, { useState, useEffect } from "react";
import "antd/dist/reset.css";
import {
  Button,
  Table,
  Input,
  Space,
  Popconfirm,
  message,
  Image,
  Select,
} from "antd";
import {
  createContact,
  getContacts,
  updateContact,
  deleteContact,
} from "./services/contactApi";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import CreateEditContact from "./components/CreateEditContact";
import ContactDetailsModal from "./components/ContactDetailsModal"; 
import { DeleteFilled, EditFilled, EyeFilled } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

// ✅ Set backend URL
const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch contacts");
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      if (editingContact) {
        await updateContact(editingContact._id, values);
        message.success("Contact updated successfully");
      } else {
        await createContact(values);
        message.success("Contact created successfully");
      }
      setIsModalVisible(false);
      setEditingContact(null);
      fetchContacts();
    } catch (error) {
      console.error(error);
      message.error("Failed to save contact");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContact(id);
      message.success("Contact deleted successfully");
      fetchContacts();
    } catch (error) {
      console.error(error);
      message.error("Failed to delete contact");
    }
  };

  const showModal = (contact = null) => {
    setEditingContact(contact);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingContact(null);
  };

  const showDetailsModal = (contact) => {
    setSelectedContact(contact);
    setIsDetailsModalVisible(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalVisible(false);
    setSelectedContact(null);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        [
          "First Name",
          "Last Name",
          "Email",
          "Phone Number",
          "Gender",
          "Category",
        ],
      ],
      body: contacts.map((contact) => [
        contact.firstName,
        contact.lastName,
        contact.email,
        contact.phoneNumber,
        contact.gender,
        contact.category,
      ]),
    });
    doc.save("contacts.pdf");
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      `${contact.firstName} ${contact.lastName}`
        .toLowerCase()
        .includes(searchText.toLowerCase()) &&
      (selectedCategory === "all" || contact.category === selectedCategory)
  );
  console.log("Contacts:", contacts);

  const uniqueCategories = [
    ...new Set(contacts.map((contact) => contact.category)),
  ];

  // ✅ Corrected columns
  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl) => (
        imageUrl ? (
          <Image
            width={75}
            height={75}
            style={{ borderRadius: "50%", objectFit: "cover" }}
            src={`${BACKEND_URL}${imageUrl}`}
            alt="Contact"
            fallback="https://via.placeholder.com/75?text=No+Image"
          />
        ) : (
          <span>No Image</span>
        )
      ),
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showModal(record)}>
            <EditFilled />
          </Button>
          <Button type="link" onClick={() => showDetailsModal(record)}>
            <EyeFilled />
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this contact?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              <DeleteFilled />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Contact Management</h1>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button type="primary" onClick={() => showModal()}>
          Create Contact
        </Button>
        <Search
          placeholder="Search by name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          placeholder="Filter by category"
          style={{ width: 200 }}
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value)}
        >
          <Option value="all">All</Option>
          {uniqueCategories.map((category) => (
            <Option key={category} value={category}>
              {category}
            </Option>
          ))}
        </Select>
        <Button onClick={generatePDF}>Export to PDF</Button>
      </Space>
      <Table dataSource={filteredContacts} columns={columns} rowKey="_id" />

      {/* Create/Edit Modal */}
      <CreateEditContact
        open={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialValues={editingContact}
      />

      {/* Contact Details Modal */}
      <ContactDetailsModal
        open={isDetailsModalVisible}
        onClose={handleCloseDetailsModal}
        contact={selectedContact}
      />
    </div>
  );
};

export default App;
