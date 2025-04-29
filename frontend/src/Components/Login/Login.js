import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import Nav from "../Nav/NavLogin";
import axios from "../../api/axios"; // Adjust path as needed

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
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending data to backend:", user);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", user);
      console.log("Backend response:", res.data);

      if (res.data.status === "ok") {
        // Store JWT token
        localStorage.setItem("token", res.data.token);
        alert("Login Successful");

        // Redirect based on backend response
        navigate(res.data.redirectTo);
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