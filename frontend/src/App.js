import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ConfigProvider, Button, Table, Input, Space, Popconfirm, message, Image, Select, notification } from "antd";
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
import Users from "./ChatApp/Users";

import CreateEditContact from "./Components/Contact/CreateEditContact";
import ContactDetailsModal from "./Components/Contact/ContactDetailsModal";
import { createContact, getContacts, updateContact, deleteContact } from "./Components/services/contactApi";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import { fetchEvents } from "./Components/api";

// Helper to parse various date formats
const parseDate = (dateStr) => {
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  // Try common formats
  const formats = [
    'YYYY-MM-DDTHH:mm:ss.SSSZ',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD HH:mm',
    'YYYY-MM-DD',
  ];
  for (const format of formats) {
    const parsed = new Date(dateStr.replace(/(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2})/, '$1T$2:00.000Z'));
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

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

      <CreateEditContact
        open={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialValues={editingContact}
      />

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
  const [events, setEvents] = useState([]);
  let reminderTimeouts = {};

  // Test notifications on app load
  useEffect(() => {
    console.log("App mounted, testing notifications...");

    // Ant Design notification
    notification.success({
      message: "Test Notification",
      description: "If you see this, Ant Design notifications are working!",
      placement: "topRight",
      duration: 3,
    });

    // Web Notification
    if (Notification.permission === "granted") {
      new Notification("Web Notification Test", {
        body: "If you see this, Web Notifications are working!",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Web Notification Test", {
            body: "If you see this, Web Notifications are working!",
          });
        }
      });
    }
  }, []);

  const scheduleReminder = (event) => {
    if (!event._id || !event.title || !event.start || !event.reminder) {
      console.log(`Skipping reminder for invalid event: ${JSON.stringify(event)}`);
      return;
    }

    const startTime = parseDate(event.start);
    if (!startTime) {
      console.log(`Invalid start time for event: ${event.title}, start: ${event.start}`);
      return;
    }

    const reminderTime = new Date(startTime.getTime() - event.reminder * 60 * 1000);
    const now = new Date();
    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    console.log(`Scheduling reminder for event: ${event.title}`);
    console.log(`Event details: ${JSON.stringify(event)}`);
    console.log(`Current Time: ${now.toISOString()}`);
    console.log(`Start Time: ${startTime.toISOString()}`);
    console.log(`Reminder Time: ${reminderTime.toISOString()}`);
    console.log(`Time Until Reminder: ${timeUntilReminder}ms (${Math.round(timeUntilReminder / 1000 / 60)} minutes)`);

    // Allow reminders for events up to 5 minutes in the past
    if (timeUntilReminder < -5 * 60 * 1000) {
      console.log(`Reminder for ${event.title} skipped: Past due by ${-timeUntilReminder}ms`);
      return;
    }

    if (reminderTimeouts[event._id]) {
      console.log(`Clearing existing timeout for ${event.title}`);
      clearTimeout(reminderTimeouts[event._id]);
    }

    reminderTimeouts[event._id] = setTimeout(() => {
      console.log(`Triggering reminder for ${event.title} at ${new Date().toISOString()}`);

      // Primary: Web Notification
      if (Notification.permission === "granted") {
        new Notification(`Event Reminder: ${event.title}`, {
          body: `Starts in ${event.reminder} minutes at ${startTime.toLocaleString("en-US", { timeZone: "Asia/Colombo" })} (Sri Lanka Time)`,
        });
      } else {
        console.log("Web Notification permission not granted, falling back to Ant Design");
        // Fallback: Ant Design notification
        notification.success({
          message: "Event Reminder",
          description: `${event.title} starts in ${event.reminder} minutes at ${startTime.toLocaleString("en-US", { timeZone: "Asia/Colombo" })} (Sri Lanka Time)`,
          placement: "topRight",
          duration: 5,
          style: {
            backgroundColor: "#e6ffe6",
            border: "1px solid #99e699",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          },
        });
      }

      delete reminderTimeouts[event._id];
      console.log(`Active timeouts: ${Object.keys(reminderTimeouts).length}`);
    }, timeUntilReminder);

    console.log(`Timeout set for ${event.title}, ID: ${event._id}`);
    console.log(`Active timeouts: ${Object.keys(reminderTimeouts).length}`);
  };

  const loadEvents = async () => {
    try {
      const data = await fetchEvents();
      console.log('Raw backend response:', JSON.stringify(data, null, 2));
      if (!Array.isArray(data)) {
        console.error('Expected array of events, got:', data);
        if (Notification.permission === "granted") {
          new Notification("Error", {
            body: "Invalid event data from server.",
          });
        } else {
          notification.error({
            message: "Error",
            description: "Invalid event data from server.",
            placement: "topRight",
          });
        }
        return;
      }

      const validEvents = data.filter(event => {
        if (!event.start || !event.end) {
          console.log(`Filtering out invalid event: ${JSON.stringify(event)}`);
          return false;
        }
        const startTime = parseDate(event.start);
        const endTime = parseDate(event.end);
        return startTime && endTime;
      });

      console.log('Valid events:', JSON.stringify(validEvents, null, 2));
      setEvents(validEvents);
      validEvents.forEach(event => scheduleReminder(event));
    } catch (error) {
      console.error('Error loading events:', error);
      if (Notification.permission === "granted") {
        new Notification("Error", {
          body: "Failed to load events. Please try again later.",
        });
      } else {
        notification.error({
          message: "Error",
          description: "Failed to load events. Please try again later.",
          placement: "topRight",
        });
      }
    }
  };

  useEffect(() => {
    console.log('Loading events on mount...');
    loadEvents();
    const interval = setInterval(() => {
      console.log('Periodic event refresh...');
      loadEvents();
    }, 5 * 60 * 1000); // Every 5 minutes
    return () => {
      console.log('Cleaning up timers and interval...');
      clearInterval(interval);
      Object.values(reminderTimeouts).forEach(clearTimeout);
    };
  }, []);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#00b96b' } }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }} className={"App" + (lightTheme ? "" : "-dark")}>
        <Space style={{ margin: '10px' }}>
          <Button
            onClick={() => {
              console.log('Manual event refresh triggered');
              loadEvents();
            }}
          >
            Refresh Events
          </Button>
        </Space>
        <Routes>
          <Route
            path="/"
            element={userData ? <Navigate to="/mainhome" /> : <Navigate to="/login" />}
          />
          <Route path="/mainhome" element={<Home />} />
          <Route path="/home2" element={<Admin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/calendar" element={<CalendarComponent events={events} loadEvents={loadEvents} />} />
          <Route path="/contacts" element={<ContactManagement />} />
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