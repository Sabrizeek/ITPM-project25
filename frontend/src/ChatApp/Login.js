import React, { useState } from "react";
import logo from "../Images/live-chat_512px.png";
import { Button, Form, Input, Modal, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [showlogin, setShowLogin] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginHandler = async (values) => {
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const response = await axios.post(
        "http://localhost:8080/user/login/",
        values,
        config
      );
      message.success("Login successful");
      setLoading(false);
      localStorage.setItem("userData", JSON.stringify(response.data));
      navigate("/app/welcome");
    } catch (error) {
      message.error("Invalid username or password");
      setLoading(false);
    }
  };

  const signUpHandler = async (values) => {
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const response = await axios.post(
        "http://localhost:8080/user/register/",
        values,
        config
      );
      message.success("Registration successful");
      navigate("/app/welcome");
      localStorage.setItem("userData", JSON.stringify(response.data));
      setLoading(false);
    } catch (error) {
      console.log(error);
      if (error.response.status === 405) {
        message.error("User with this email ID already exists");
      } else if (error.response.status === 406) {
        message.error("Username already taken, please choose another one");
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="image-container">
      
      </div>
      <Modal
        title={showlogin ? "Login to your Account" : "Create your Account"}
        open={true}
        footer={null}
        closable={false}
      >
        <Form
          form={form}
          onFinish={showlogin ? loginHandler : signUpHandler}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          {!showlogin && (
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>
          )}

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {showlogin ? "Login" : "Sign Up"}
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            {showlogin ? (
              <p>
                Don't have an Account?{" "}
                <Button type="link" onClick={() => setShowLogin(false)}>
                  Sign Up
                </Button>
              </p>
            ) : (
              <p>
                Already have an Account?{" "}
                <Button type="link" onClick={() => setShowLogin(true)}>
                  Log in
                </Button>
              </p>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default Login;