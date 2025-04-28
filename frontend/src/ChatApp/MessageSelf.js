import React, { useContext, useState } from "react";
import { Button, Dropdown, Menu, Modal, Input, message } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { myContext } from "./MainContainer";

function MessageSelf({ props }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [newContent, setNewContent] = useState(props.content);
  const [error, setError] = useState("");
  const [displayedTimestamp, setDisplayedTimestamp] = useState(props.updatedAt || props.createdAt);
  const { refresh, setRefresh } = useContext(myContext);
  const userData = JSON.parse(localStorage.getItem("userData"));

  const validateContent = (content) => {
    if (!content || content.trim() === "") {
      setError("Message content cannot be empty or just spaces.");
      return false;
    }
    setError("");
    return true;
  };

  const handleUpdateMessage = async () => {
    if (!validateContent(newContent)) {
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      };

      await axios.put(
        `http://localhost:8080/message/${props._id}`,
        { content: newContent },
        config
      );
      message.success("Message updated");
      setDisplayedTimestamp(new Date().toISOString());
      setRefresh(!refresh);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating message:", error);
      message.error("Failed to update message");
    }
  };

  const handleDeleteClick = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      };

      await axios.delete(`http://localhost:8080/message/${props._id}`, config);
      message.success("Message deleted");
      setRefresh(!refresh);
    } catch (error) {
      console.error("Error deleting message:", error);
      message.error("Failed to delete message");
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="update" onClick={() => setOpenDialog(true)}>Update</Menu.Item>
      <Menu.Item key="delete" onClick={handleDeleteClick}>Delete</Menu.Item>
    </Menu>
  );

  // Format the timestamp to show both date and time
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <div className="self-message-container">
      <div className="messageBox" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: "black", margin: 0 }}>{props.content}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}>
            <span className={`emotion-tag emotion-${props.emotion.toLowerCase()}`}>
              {props.emotion.toLowerCase()}
            </span>
            <p className="self-timeStamp">{formatTimestamp(displayedTimestamp)}</p>
          </div>
        </div>
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button icon={<MoreOutlined />} type="text" />
        </Dropdown>
      </div>

      <Modal
        title="Update Message"
        open={openDialog}
        onCancel={() => setOpenDialog(false)}
        onOk={handleUpdateMessage}
        okButtonProps={{ disabled: !!error }}
      >
        <Input
          value={newContent}
          onChange={(e) => {
            setNewContent(e.target.value);
            validateContent(e.target.value);
          }}
          placeholder="Message Content"
          status={error ? "error" : ""}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </Modal>
    </div>
  );
}

export default MessageSelf;