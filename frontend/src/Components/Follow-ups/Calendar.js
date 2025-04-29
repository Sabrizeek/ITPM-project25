import React, { useState, useEffect } from "react";
import { Calendar, Button, Modal, Table, Tag, Input, Popconfirm, message } from "antd";
import moment from "moment-timezone";
import { deleteEvent, updateEvent } from "../api";
import AddEvent from "./AddEvent";
import UpdateEvent from "./UpdateEvent";
import Nav from "../Nav/NavHome";

const { Search } = Input;

const CalendarComponent = ({ events, loadEvents }) => {
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [agendaVisible, setAgendaVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      message.success("Event deleted successfully");
      loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      message.error("Failed to delete event");
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setUpdateModalVisible(true);
  };

  const handleUpdate = async (updatedEvent) => {
    try {
      await updateEvent(updatedEvent);
      message.success("Event updated successfully");
      loadEvents();
      setUpdateModalVisible(false);
    } catch (error) {
      console.error("Error updating event:", error);
      message.error("Failed to update event");
    }
  };

  const handleSearch = (value) => {
    const filtered = events.filter(
      (event) =>
        event.title.toLowerCase().includes(value.toLowerCase()) ||
        (event.describe && event.describe.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredEvents(filtered);
  };

  const generateReport = () => {
    const headers = ["Title", "Start", "End", "Reminder", "Description"];
    const csvContent = [
      headers.join(","),
      ...filteredEvents.map((event) => [
        `"${event.title}"`,
        `"${moment.tz(event.start, "Asia/Colombo").format("YYYY-MM-DD HH:mm")}"`,
        `"${moment.tz(event.end, "Asia/Colombo").format("YYYY-MM-DD HH:mm")}"`,
        `"${event.reminder ? `${event.reminder} minutes before` : "None"}"`,
        `"${event.describe || ""}"`,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `events_report_${moment.tz("Asia/Colombo").format("YYYY-MM-DD_HH-mm")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dateCellRender = (value) => {
    const formattedValue = value.format("YYYY-MM-DD");
    const dayEvents = events.filter(
      (event) =>
        moment.tz(event.start, "Asia/Colombo").format("YYYY-MM-DD") === formattedValue ||
        moment.tz(event.end, "Asia/Colombo").format("YYYY-MM-DD") === formattedValue ||
        (moment.tz(event.start, "Asia/Colombo").isBefore(value, "day") &&
          moment.tz(event.end, "Asia/Colombo").isAfter(value, "day"))
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        
        {dayEvents.map((event) => (
          <div
            key={event._id}
            style={{
              background: "linear-gradient(135deg, #6b48ff, #00ddeb)",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              minHeight: "40px",
              maxWidth: "100%",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
              e.currentTarget.querySelector(".event-actions").style.opacity = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
              e.currentTarget.querySelector(".event-actions").style.opacity = 0;
            }}
            onClick={() => setSelectedEvent(event)}
          >
            <span
              style={{
                flex: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={`${event.title}${event.reminder ? ` (Reminder: ${event.reminder} min before)` : ""}`}
            >
              {event.title} ({moment.tz(event.start, "Asia/Colombo").format("HH:mm")})
              {event.reminder && (
                <Tag
                  color="cyan"
                  style={{ marginLeft: 6, borderRadius: "12px", fontSize: "12px" }}
                >
                  {event.reminder}m
                </Tag>
              )}
            </span>
            <div
              className="event-actions"
              style={{
                opacity: 0,
                transition: "opacity 0.2s",
                display: "flex",
                gap: "8px",
                minWidth: "60px",
              }}
            >
              <Button
                type="text"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(event);
                }}
                style={{ color: "#fff", fontSize: "16px", padding: "0" }}
              >
                ✏️
              </Button>
              <Popconfirm
                title="Are you sure you want to delete this event?"
                onConfirm={() => handleDelete(event._id)}
                okText="Yes"
                cancelText="No"
                placement="topRight"
              >
                <Button
                  type="text"
                  danger
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: "#fff", fontSize: "16px", padding: "0" }}
                >
                  🗑️
                </Button>
              </Popconfirm>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        padding: "30px",
        background: "#f5f7fa",
        minHeight: "100vh",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Nav />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            color: "#1a1a1a",
            fontSize: "28px",
            fontWeight: "600",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          📅 Follow-up Calendar
        </h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            type="primary"
            onClick={() => setAddModalVisible(true)}
            style={{
              background: "linear-gradient(135deg, #ff6b6b, #ff8e53)",
              border: "none",
              borderRadius: "8px",
              padding: "6px 20px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(255, 107, 107, 0.3)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 107, 107, 0.5)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "0 2px 8px rgba(255, 107, 107, 0.3)")
            }
          >
            ➕ Add Follow-up
          </Button>
          <Button
            onClick={() => setAgendaVisible(true)}
            style={{
              background: "#fff",
              color: "#6b48ff",
              border: "1px solid #6b48ff",
              borderRadius: "8px",
              padding: "6px 20px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 8px rgba(107, 72, 255, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#6b48ff";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(107, 72, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#6b48ff";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(107, 72, 255, 0.2)";
            }}
          >
            📜 Show Follow-up
          </Button>
        </div>
      </div>

      <Calendar
        dateCellRender={dateCellRender}
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
        }}
      />

      <AddEvent
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={loadEvents}
      />

      <UpdateEvent
        event={selectedEvent}
        visible={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          setSelectedEvent(null);
        }}
        onUpdate={handleUpdate}
      />

      <Modal
        title={
          <span style={{ fontSize: "20px", fontWeight: "600", color: "#1a1a1a" }}>
            📜 Follow-up Agenda
          </span>
        }
        visible={agendaVisible}
        onCancel={() => setAgendaVisible(false)}
        footer={null}
        width={900}
        bodyStyle={{ padding: "24px", background: "#fff", borderRadius: "12px" }}
        style={{ top: 20 }}
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <Search
            placeholder="Search by title or description"
            onSearch={handleSearch}
            style={{
              width: 320,
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
            }}
          />
          <Button
            type="primary"
            onClick={generateReport}
            style={{
              background: "linear-gradient(135deg, #40c9ff, #e81cff)",
              border: "none",
              borderRadius: "8px",
              padding: "6px 20px",
              fontWeight: "500",
              boxShadow: "0 2px 8px rgba(64, 201, 255, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 4px 12px rgba(64, 201, 255, 0.5)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "0 2px 8px rgba(64, 201, 255, 0.3)")
            }
          >
            Generate Report
          </Button>
        </div>
        <Table
          dataSource={filteredEvents}
          rowKey="_id"
          rowClassName={(record, index) => (index % 2 === 0 ? "table-row-light" : "table-row-dark")}
          style={{ borderRadius: "8px", overflow: "hidden" }}
          pagination={{ pageSize: 5 }}
        >
          <Table.Column
            title={<span style={{ fontWeight: "600", color: "#1a1a1a" }}>Title</span>}
            dataIndex="title"
          />
          <Table.Column
            title={<span style={{ fontWeight: "600", color: "#1a1a1a" }}>Start</span>}
            dataIndex="start"
            render={(text) => moment.tz(text, "Asia/Colombo").format("YYYY-MM-DD HH:mm")}
          />
          <Table.Column
            title={<span style={{ fontWeight: "600", color: "#1a1a1a" }}>End</span>}
            dataIndex="end"
            render={(text) => moment.tz(text, "Asia/Colombo").format("YYYY-MM-DD HH:mm")}
          />
          <Table.Column
            title={<span style={{ fontWeight: "600", color: "#1a1a1a" }}>Reminder</span>}
            dataIndex="reminder"
            render={(reminder) => (reminder ? `${reminder} minutes before` : "None")}
          />
          <Table.Column
            title={<span style={{ fontWeight: "600", color: "#1a1a1a" }}>Description</span>}
            dataIndex="describe"
          />
          <Table.Column
            title={<span style={{ fontWeight: "600", color: "#1a1a1a" }}>Actions</span>}
            render={(_, record) => (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  type="text"
                  onClick={() => handleEdit(record)}
                  style={{ color: "#6b48ff", fontSize: "16px", padding: "0" }}
                >
                  ✏️
                </Button>
                <Popconfirm
                  title="Are you sure you want to delete this event?"
                  onConfirm={() => handleDelete(record._id)}
                  okText="Yes"
                  cancelText="No"
                  placement="topRight"
                >
                  <Button
                    type="text"
                    danger
                    style={{ color: "#ff4d4f", fontSize: "16px", padding: "0" }}
                  >
                    🗑️
                  </Button>
                </Popconfirm>
              </div>
            )}
          />
        </Table>
      </Modal>
    </div>
  );
};

export default CalendarComponent;