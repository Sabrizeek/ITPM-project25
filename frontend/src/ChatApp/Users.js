import React, { useContext, useEffect, useState } from "react";
import "./myStyles.css";
import logo from "../Images/live-chat_512px.png";
import { useDispatch } from "react-redux";
import { Avatar, Button, Input, List, message } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { refreshSidebarFun } from "../Features/refreshSidebar";
import { myContext } from "./MainContainer";

function Users() {
  const { refresh, setRefresh } = useContext(myContext);
  const [users, setUsers] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const nav = useNavigate();
  const dispatch = useDispatch();

  if (!userData) {
    console.log("User not Authenticated");
    nav(-1);
  }

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };
    axios.get("http://localhost:8080/user/fetchUsers", config).then((data) => {
      setUsers(data.data);
    });
  }, [refresh, userData.token]);

  const handleUserClick = async (userId, userName) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userData.token}` },
      };
      const { data } = await axios.post(
        "http://localhost:8080/chat/",
        { userId },
        config
      );
      dispatch(refreshSidebarFun());
      nav(`/app/chat/${data._id}&${userName}`);
    } catch (error) {
      message.error("Error creating chat");
      console.error("Error creating/accessing chat:", error);
    }
  };

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
          placeholder="Search"
          className="search-box"
          prefix={<SearchOutlined />}
        />
      </div>
      <div className="ug-list">
        <List
          dataSource={users}
          renderItem={(user) => (
            <List.Item
              onClick={() => handleUserClick(user._id, user.name)}
              style={{ cursor: "pointer", padding: "10px" }}
            >
              <List.Item.Meta
                avatar={<Avatar>{user.name[0]}</Avatar>}
                title={<span className="con-title">{user.name}</span>}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}

export default Users;