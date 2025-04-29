import React, { useContext, useEffect, useState } from "react";
import "./myStyles.css";
import { useDispatch } from "react-redux";
import { Avatar, Button, Input, List, message, Spin } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { refreshSidebarFun } from "../Features/refreshSidebar";
import { myContext } from "./MainContainer";

function Users() {
  const { refresh, setRefresh } = useContext(myContext);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const userData = JSON.parse(localStorage.getItem("userData"));
  const nav = useNavigate();
  const dispatch = useDispatch();

  // Redirect to login if user is not authenticated
  if (!userData) {
    console.log("User not Authenticated");
    nav("/login");
  }

  // Fetch all users when the component mounts or refresh changes
  useEffect(() => {
    const config = {
      headers: { Authorization: `Bearer ${userData.token}` },
    };
    axios
      .get("http://localhost:5000/api/auth/allusers", config)
      .then((data) => {
        console.log("Users fetched:", data.data.users);
        setUsers(data.data.users);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("userData");
          nav("/login");
          message.error("Session expired. Please log in again.");
        } else {
          message.error("Error fetching users");
        }
      });
  }, [refresh, userData.token, nav]);

  // Handle user click to create/access chat and navigate
  const handleUserClick = async (userId, userName) => {
    setLoading(true); // Show loading state
    try {
      const config = { headers: { Authorization: `Bearer ${userData.token}` } };
      const { data } = await axios.post(
        "http://localhost:5000/api/chat/c",
        { userId },
        config
      );
      if (!data._id) {
        throw new Error("Chat ID is missing in the API response");
      }
      dispatch(refreshSidebarFun());
      setRefresh(!refresh); // Trigger sidebar refresh
      setSearchTerm(""); // Clear search term
      nav(`/app/chat/${data._id}&${userName}`);
      message.success(`Opened chat with ${userName}`);
    } catch (error) {
      console.error("Error in handleUserClick:", error);
      message.error("Error creating chat: " + (error.message || "Unknown error"));
      if (error.response?.status === 401) {
        localStorage.removeItem("userData");
        nav("/login");
        message.error("Session expired. Please log in again.");
      }
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const filteredUsers = users.filter((user) =>
    user.lgname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="list-container">
      <div className="ug-header">
        <p className="ug-title">Available Users</p>
        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={() => setRefresh(!refresh)}
        />
      </div>
      <div className="sb-search">
        <Input
          placeholder="Search users..."
          className="search-box"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="ug-list">
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin tip="Loading chat..." />
          </div>
        ) : filteredUsers.length > 0 ? (
          <List
            dataSource={filteredUsers}
            renderItem={(user) => (
              <List.Item
                onClick={() => handleUserClick(user._id, user.lgname)}
                style={{ cursor: "pointer", padding: "10px" }}
              >
                <List.Item.Meta
                  avatar={<Avatar>{user.lgname[0]}</Avatar>}
                  title={<span className="con-title">{user.lgname}</span>}
                />
              </List.Item>
            )}
          />
        ) : (
          <p className="no-results">No users found</p>
        )}
      </div>
    </div>
  );
}

export default Users;