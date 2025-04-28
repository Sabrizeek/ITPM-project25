import React from "react";
import { Alert } from "antd";

export default function Toaster({ message }) {
  return (
    <Alert
      message={message}
      type="warning"
      showIcon
      closable
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 1000,
        width: "30vw",
      }}
    />
  );
}