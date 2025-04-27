import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Input, Modal, Skeleton, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import MessageSelf from "./MessageSelf";
import MessageOthers from "./MessageOthers";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { myContext } from "./MainContainer";

// Define emotion backgrounds (light theme only)
const emotionBackgrounds = {
  Happy: "#fffacd",
  Sad: "#87ceeb",
  Angry: "#ff6347",
  Love: "#ffb6c1",
  Neutral: "#f0f2f5", // Default background
};

function ChatArea() {
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef(null);
  const dyParams = useParams();
  const navigate = useNavigate();
  const [chat_id, chat_user] = dyParams._id.split("&");
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [allMessages, setAllMessages] = useState([]);
  const [chatUser, setChatUser] = useState(chat_user);
  const { refresh, setRefresh, setDominantEmotion } = useContext(myContext);
  const [loaded, setLoaded] = useState(false);
  const [emotionSummary, setEmotionSummary] = useState(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);

  useEffect(() => {
    if (allMessages.length > 0) {
      const newDominant = getDominantEmotion();
      setDominantEmotion(newDominant);
    }
  }, [allMessages]);

  const getDominantEmotion = (messages = allMessages) => {
    if (!messages.length) return "Neutral";
    const emotionCounts = messages.reduce((acc, msg) => {
      acc[msg.emotion] = (acc[msg.emotion] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );
  };

  const sendMessage = async () => {
    if (!messageContent.trim()) {
      message.warning("Message cannot be empty");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${userData.token}` },
      };
      
      await axios.post(
        "http://localhost:8080/message/",
        { content: messageContent, chatId: chat_id },
        config
      );

      // Force immediate refresh
      const { data } = await axios.get(`http://localhost:8080/message/${chat_id}`, config);
      setAllMessages(data);
      setMessageContent("");
      
      // Calculate emotion from updated messages
      const newDominant = getDominantEmotion();
      setDominantEmotion(newDominant);
      
      message.success("Message sent");
    } catch (error) {
      message.error("Error sending message");
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}` },
    };
    axios
      .get(`http://localhost:8080/message/${chat_id}`, config)
      .then(({ data }) => {
        setAllMessages(data);
        setLoaded(true);
      })
      .catch((error) => {
        message.error("Error fetching messages");
        console.error("Error fetching messages:", error);
      });
  }, [refresh, chat_id, userData.token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const deleteChat = () => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}` },
    };

    axios
      .delete(`http://localhost:8080/chat/${chat_id}`, config)
      .then(() => {
        message.success("Chat deleted");
        setRefresh(!refresh);
        navigate("/app/welcome");
      })
      .catch((error) => {
        message.error("Error deleting chat");
        console.error("Error deleting chat:", error);
      });
  };

  const showSummary = () => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}` },
    };
    axios
      .get(`http://localhost:8080/message/summary/${chat_id}`, config)
      .then(({ data }) => {
        setEmotionSummary(data);
        setShowSummaryDialog(true);
      })
      .catch((error) => {
        message.error("Error fetching emotion summary");
        console.error("Error fetching emotion summary:", error);
      });
  };

  if (!loaded) {
    return (
      <div style={{ padding: "10px", width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Skeleton active paragraph={{ rows: 0 }} />
        <Skeleton active paragraph={{ rows: 10 }} />
        <Skeleton active paragraph={{ rows: 0 }} />
      </div>
    );
  }

  const dominantEmotion = getDominantEmotion();
  const chatBackgroundColor = emotionBackgrounds[dominantEmotion];

  return (
    <div 
      className="chatArea-container"
      style={{ 
        backgroundColor: chatBackgroundColor,
        transition: "background-color 0.5s ease",
      }}
    >
      <div className="chatArea-header">
        <p className="con-icon">{chatUser ? chatUser[0] : "U"}</p>
        <div className="header-text">
          <p className="con-title">{chatUser || "Loading..."}</p>
        </div>
      </div>
      <div className="messages-container">
        {allMessages
          .slice(0)
          .reverse()
          .map((message, index) => {
            const sender = message.sender;
            const self_id = userData._id;
            if (sender._id === self_id) {
              return <MessageSelf props={message} key={index} />;
            } else {
              return <MessageOthers props={message} key={index} />;
            }
          })}
      </div>
      <div ref={messagesEndRef} className="BOTTOM" />
      <div className="text-input-area">
        <Input
          placeholder="Type a Message"
          className="search-box"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onPressEnter={sendMessage}
          suffix={
            <>
              <Button type="text" icon={<SendOutlined />} onClick={sendMessage} disabled={!messageContent.trim()} />
              <Button onClick={showSummary} type="text" disabled={allMessages.length === 0}>
                Summary
              </Button>
            </>
          }
        />
      </div>

      <Modal
        title="Emotion Summary"
        open={showSummaryDialog}
        onCancel={() => setShowSummaryDialog(false)}
        footer={[
          <Button key="close" onClick={() => setShowSummaryDialog(false)}>
            Close
          </Button>,
          <Button key="delete" type="primary" danger onClick={deleteChat}>
            Delete Chat
          </Button>,
        ]}
      >
        {emotionSummary && (
          <>
            <p>
              {emotionSummary.summary.map((emo) => (
                <span key={emo.emotion}>
                  {emo.percentage}% {emo.emotion}{" "}
                  {emo.emotion === "Happy" && "😊"}
                  {emo.emotion === "Sad" && "😢"}
                  {emo.emotion === "Angry" && "😡"}
                  {emo.emotion === "Love" && "❤️"}
                  {emo.emotion === "Neutral" && "😐"},{" "}
                </span>
              ))}
            </p>
            <p>{emotionSummary.insight}</p>
          </>
        )}
      </Modal>
    </div>
  );
}

export default ChatArea;