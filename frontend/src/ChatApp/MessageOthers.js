import React from "react";
import "./myStyles.css";
import { Avatar } from "antd";

function MessageOthers({ props }) {
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
    <div className="other-message-container">
      <div className="conversation-container">
        <Avatar className="con-icon">
          {props.sender.name[0]}
        </Avatar>
        <div className="other-text-content">
          <p className="con-title">
            {props.sender.name}
          </p>
          <p className="con-lastMessage">
            {props.content}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}>
            <span className={`emotion-tag emotion-${props.emotion.toLowerCase()}`}>
              {props.emotion.toLowerCase()}
            </span>
            <span className="self-timeStamp">
              {formatTimestamp(props.updatedAt || props.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageOthers;