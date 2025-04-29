import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { refreshSidebarFun } from "../Features/refreshSidebar";
import { myContext } from "./MainContainer";
import { Avatar, Button, Input, List, message } from "antd";
import { LogoutOutlined, SearchOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";

const emotionBackgrounds = {
  Happy: "#fffacd",
  Sad: "#87ceeb",
  Angry: "#ff6347",
  Love: "#ffb6c1",
  Neutral: "inherit",
};

function Sidebar() {
  const { refresh, setRefresh, dominantEmotion } = useContext(myContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (!userData) {
    console.log("User not Authenticated");
    navigate("/login");
  }

  useEffect(() => {
    const config = {
      headers: { Authorization: `Bearer ${userData.token}` },
    };

    // Fetch conversations
    axios
      .get("http://localhost:5000/api/chat/c", config)
      .then((response) => {
        console.log("Conversations fetched:", response.data);
        const sortedConversations = response.data.sort((a, b) => {
          if (a.chatName === "General") return -1;
          if (b.chatName === "General") return 1;
          return 0;
        });
        setConversations(sortedConversations);
      })
      .catch((error) => {
        console.error("Error fetching conversations:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("userData");
          navigate("/login");
          message.error("Session expired. Please log in again.");
        } else {
          message.error("Error fetching conversations");
        }
      });

    // Fetch all users for search
    axios
      .get("http://localhost:5000/api/auth/allusers", config)
      .then((response) => {
        console.log("All users fetched for search:", response.data.users);
        setAllUsers(response.data.users);
      })
      .catch((error) => {
        console.error("Error fetching all users:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("userData");
          navigate("/login");
          message.error("Session expired. Please log in again.");
        } else {
          message.error("Error fetching users for search");
        }
      });
  }, [refresh, userData.token, navigate]);

  const handleDeleteConversation = async (chatId) => {
    const config = {
      headers: { Authorization: `Bearer ${userData.token}` },
    };
    try {
      await axios.delete(`http://localhost:5000/api/chat/${chatId}`, config);
      message.success("Conversation deleted");
      setRefresh(!refresh);
    } catch (error) {
      message.error("Error deleting conversation");
      console.error("Error deleting chat:", error);
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    if (conversation.users.length === 1) return false;
    if (conversation.isGroupChat) {
      return conversation.chatName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    const otherUser = conversation.users.find((user) => user._id !== userData._id);
    if (!otherUser) return false;
    return otherUser.lgname.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredUsers = allUsers.filter((user) => {
    return (
      user._id !== userData._id &&
      user.lgname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div
      className="sidebar-container"
      style={{
        backgroundColor: emotionBackgrounds[dominantEmotion],
        transition: "background-color 0.5s ease",
      }}
    >
      <div className="sb-header">
        <div className="other-icons">
          <Button
            type="text"
            icon={<UserOutlined className="icon" />}
            onClick={() => navigate("/app/mainhome")}
          />
          <Button
            type="text"
            icon={<LogoutOutlined className="icon" />}
            onClick={() => {
              localStorage.removeItem("userData");
              navigate("/login");
            }}
          />
        </div>
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
      <div className="sb-conversations">
        {searchTerm ? (
          <div className="search-results">
            <p className="section-title">Search Results</p>
            <List
              dataSource={filteredUsers}
              renderItem={(user) => (
                <List.Item
                  onClick={async () => {
                    const config = {
                      headers: { Authorization: `Bearer ${userData.token}` },
                    };
                    try {
                      const { data } = await axios.post(
                        "http://localhost:5000/api/chat/c",
                        { userId: user._id },
                        config
                      );
                      navigate(`/app/chat/${data._id}&${user.lgname}`);
                      setRefresh(!refresh);
                      setSearchTerm("");
                    } catch (error) {
                      message.error("Error creating chat");
                      console.error("Error creating chat:", error);
                    }
                  }}
                  style={{ cursor: "pointer", padding: "8px 16px" }}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{user.lgname[0]}</Avatar>}
                    title={<span className="con-title">{user.lgname}</span>}
                  />
                </List.Item>
              )}
            />
            {filteredUsers.length === 0 && (
              <p className="no-results">No users found</p>
            )}
          </div>
        ) : (
          <>
            <p className="section-title">Conversations</p>
            <List
              dataSource={filteredConversations}
              renderItem={(conversation) => {
                let displayName, avatarChar;
                if (conversation.isGroupChat) {
                  displayName = conversation.chatName;
                  avatarChar = conversation.chatName[0];
                } else {
                  const otherUser = conversation.users.find(
                    (user) => user._id !== userData._id
                  );
                  if (!otherUser) return null;
                  displayName = otherUser.lgname;
                  avatarChar = otherUser.lgname[0];
                }

                return (
                  <List.Item
                    style={{ padding: "8px 16px" }}
                    actions={[
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteConversation(conversation._id)}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar>{avatarChar}</Avatar>}
                      title={
                        <span
                          className="con-title"
                          onClick={() => {
                            navigate(`/app/chat/${conversation._id}&${displayName}`);
                            setRefresh(!refresh);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {displayName}
                        </span>
                      }
                      description={
                        <span className="con-lastMessage">
                          {conversation.latestMessage?.content || "No previous messages"}
                        </span>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Sidebar;