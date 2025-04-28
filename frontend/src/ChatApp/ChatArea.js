import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Input, Modal, Skeleton, message } from "antd";
import { SendOutlined, DownloadOutlined } from "@ant-design/icons";
import MessageSelf from "./MessageSelf";
import MessageOthers from "./MessageOthers";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { myContext } from "./MainContainer";
import jsPDF from "jspdf";

const emotionBackgrounds = {
  Happy: "#fffacd",
  Sad: "#87ceeb",
  Angry: "#ff6347",
  Love: "#ffb6c1",
  Neutral: "#f0f2f5",
};

function ChatArea() {
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef(null);
  const dyParams = useParams();
  const navigate = useNavigate();
  const [chat_id, chat_name] = dyParams._id.split("&");
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [allMessages, setAllMessages] = useState([]);
  const [chatName, setChatName] = useState(chat_name);
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
        "http://localhost:5000/api/message/",
        { content: messageContent, chatId: chat_id },
        config
      );

      const { data } = await axios.get(`http://localhost:5000/api/message/${chat_id}`, config);
      setAllMessages(data);
      setMessageContent("");

      const newDominant = getDominantEmotion();
      setDominantEmotion(newDominant);

      message.success("Message sent");
    } catch (error) {
      message.error("Error sending message");
      console.error("Error sending message:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("userData");
        navigate("/login");
        message.error("Session expired. Please log in again.");
      }
    }
  };

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };
    axios
      .get(`http://localhost:5000/api/message/${chat_id}`, config)
      .then(({ data }) => {
        console.log("Messages fetched:", data);
        setAllMessages(data);
        setLoaded(true);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
        message.error("Error fetching messages");
        if (error.response?.status === 401) {
          localStorage.removeItem("userData");
          navigate("/login");
          message.error("Session expired. Please log in again.");
        }
      });
  }, [refresh, chat_id, userData.token, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const deleteChat = () => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    axios
      .delete(`http://localhost:5000/api/chat/${chat_id}`, config)
      .then(() => {
        message.success("Chat deleted");
        setRefresh(!refresh);
        navigate("/app/mainhome");
      })
      .catch((error) => {
        message.error("Error deleting chat");
        console.error("Error deleting chat:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("userData");
          navigate("/login");
          message.error("Session expired. Please log in again.");
        }
      });
  };

  const showSummary = () => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };
    axios
      .get(`http://localhost:5000/api/message/summary/${chat_id}`, config)
      .then(({ data }) => {
        setEmotionSummary(data);
        setShowSummaryDialog(true);
      })
      .catch((error) => {
        message.error("Error fetching emotion summary");
        console.error("Error fetching emotion summary:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("userData");
          navigate("/login");
          message.error("Session expired. Please log in again.");
        }
      });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Add a header with a background
    doc.setFillColor(24, 144, 255); // Ant Design primary blue
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Chat History with ${chatName || "Unknown"}`, 10, 15);
    yPosition += 20;

    // Add metadata (e.g., date of export)
    doc.setTextColor(100); // Gray text for metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const exportDate = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    doc.text(`Exported on: ${exportDate}`, 10, yPosition);
    yPosition += 10;

    // Add a table-like header for messages
    doc.setFillColor(240, 242, 245); // Light gray background (matches Ant Design's background)
    doc.rect(10, yPosition, pageWidth - 20, 8, "F");
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Sender", 12, yPosition + 6);
    doc.text("Message", 40, yPosition + 6);
    doc.text("Timestamp", 120, yPosition + 6);
    doc.text("Emotion", 170, yPosition + 6);
    yPosition += 10;

    // Add messages
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    allMessages.slice(0).reverse().forEach((message, index) => {
      const sender = message.sender;
      const self_id = userData._id;
      const senderName = sender._id === self_id ? "You" : sender.lgname;
      const timestamp = new Date(message.updatedAt || message.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      const messageText = message.content;
      const emotion = message.emotion.toLowerCase();

      // Split message text if it exceeds the column width
      const splitMessage = doc.splitTextToSize(messageText, 70);
      const rowHeight = Math.max(splitMessage.length * 5, 10);

      // Check if we need a new page
      if (yPosition + rowHeight > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;

        // Add header on new page
        doc.setFillColor(24, 144, 255);
        doc.rect(0, 0, pageWidth, 30, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(`Chat History with ${chatName || "Unknown"}`, 10, 15);
        yPosition += 20;

        // Add table header again
        doc.setFillColor(240, 242, 245);
        doc.rect(10, yPosition, pageWidth - 20, 8, "F");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Sender", 12, yPosition + 6);
        doc.text("Message", 40, yPosition + 6);
        doc.text("Timestamp", 120, yPosition + 6);
        doc.text("Emotion", 170, yPosition + 6);
        yPosition += 10;
      }

      // Draw row background (alternating colors for better readability)
      doc.setFillColor(index % 2 === 0 ? 255 : 245, 245, 245); // White or light gray
      doc.rect(10, yPosition, pageWidth - 20, rowHeight, "F");

      // Add message data
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(senderName, 12, yPosition + 5);
      doc.text(splitMessage, 40, yPosition + 5);
      doc.text(timestamp, 120, yPosition + 5);
      doc.text(emotion, 170, yPosition + 5);

      // Draw borders for the row
      doc.setDrawColor(200);
      doc.line(10, yPosition, pageWidth - 10, yPosition); // Top border
      doc.line(10, yPosition + rowHeight, pageWidth - 10, yPosition + rowHeight); // Bottom border
      doc.line(10, yPosition, 10, yPosition + rowHeight); // Left border
      doc.line(pageWidth - 10, yPosition, pageWidth - 10, yPosition + rowHeight); // Right border
      doc.line(38, yPosition, 38, yPosition + rowHeight); // Vertical line after Sender
      doc.line(118, yPosition, 118, yPosition + rowHeight); // Vertical line after Message
      doc.line(168, yPosition, 168, yPosition + rowHeight); // Vertical line after Timestamp

      yPosition += rowHeight;
    });

    // Save the PDF
    doc.save(`chat-history-${chatName || "unknown"}-${new Date().toISOString().split("T")[0]}.pdf`);
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
        <p className="con-icon">{chatName ? chatName[0] : "U"}</p>
        <div className="header-text">
          <p className="con-title">{chatName || "Loading..."}</p>
        </div>
        <Button
          type="text"
          icon={<DownloadOutlined />}
          onClick={downloadPDF}
          className="download-pdf-button"
          disabled={allMessages.length === 0}
        >
          Chat History
        </Button>
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