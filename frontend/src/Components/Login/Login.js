import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/NavLogin";
import axios from "axios"; // Use direct axios import

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    lggmail: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", user);
      if (res.data.status === "ok") {
        // Store user data in localStorage
        localStorage.setItem(
          "userData",
          JSON.stringify({
            _id: res.data.user.id,
            lgname: res.data.user.lgname,
            lggmail: res.data.user.lggmail,
            token: res.data.token,
          })
        );
        alert("Login Successful");
        navigate("/mainhome"); // Navigate to chat interface
      } else {
        setError(res.data.error || "Invalid Credentials");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Login Failed. Please try again.");
    }
  };

  return (
    <>
      <Nav />
      <div className="login-container">
        {error && <div className="error-message">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Sign in to your account</h1>
          <input
            type="email"
            name="lggmail"
            value={user.lggmail}
            onChange={handleInputChange}
            placeholder="Email address"
            required
          />
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
          />
          <button type="submit">Sign in</button>
          <p>
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </form>
      </div>
    </>
  );
}

export default Login;