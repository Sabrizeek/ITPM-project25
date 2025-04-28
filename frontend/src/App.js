import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ConfigProvider, Button, Table, Input, Space, Popconfirm, message, Image, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { DeleteFilled, EditFilled, EyeFilled } from "@ant-design/icons";
import "antd/dist/reset.css";
import "./App.css";

import Home from './Components/Home/Home';
import Register from './Components/Register/Register';
import Login from './Components/Login/Login';
import Admin from './Components/Admin/Admin';
import CalendarComponent from './Components/Follow-ups/Calendar';
import MainContainer from "./ChatApp/MainContainer";
import ChatArea from "./ChatApp/ChatArea";
import Users from "./ChatApp/Users"; // Removed Welcome.js import

import CreateEditContact from "./Components/Contact/CreateEditContact";
import ContactDetailsModal from "./Components/Contact/ContactDetailsModal";
import { createContact, getContacts, updateContact, deleteContact } from "./Components/services/contactApi";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

const { Search } = Input;
const { Option } = Select;

// Set backend URL
const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ContactManagement = () => {
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

  const uniqueCategories = [
    ...new Set(contacts.map((contact) => contact.category)),
  ];

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

function App() {
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const userData = JSON.parse(localStorage.getItem("userData"));

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }} className={"App" + (lightTheme ? "" : "-dark")}>
        <Routes>
          {/* Redirect unauthenticated users to /login */}
          <Route
            path="/"
            element={userData ? <Navigate to="/app/mainhome" /> : <Navigate to="/login" />}
          />
          <Route path="/mainhome" element={<Home />} />
          <Route path="/home2" element={<Admin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/calendar" element={<CalendarComponent />} />
          <Route path="/contacts" element={<ContactManagement />} />

          {/* Chat routes */}
          <Route path="/app" element={<MainContainer />}>
            <Route path="mainhome" element={<Users />} />
            <Route path="chat/:_id" element={<ChatArea />} />
          </Route>

          <Route path="*" element={<div>404: Page Not Found</div>} />
        </Routes>
      </div>
    </ConfigProvider>
  );
}

export default App;