import React, { useState } from "react";
import "./Register.css";
import Nav from "../Nav/NavLogin";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import axios from "../../api/axios"; // Adjust path as needed

function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    lgname: "",
    lggmail: "",
    lgnumber: "",
    lgage: "",
    lgaddress: "",
    password: "",
    repassword: "",
  });
  const [popupMessage, setPopupMessage] = useState({ message: "", type: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "lgnumber") {
      if (!/^\d*$/.test(value)) {
        setPopupMessage({ message: "Phone number must contain only digits!", type: "error" });
        return;
      }
      if (value.length > 10) {
        setPopupMessage({ message: "Phone number must be exactly 10 digits!", type: "error" });
        return;
      }
    }

    if (name === "lgage" && (isNaN(value) || value < 0)) {
      setPopupMessage({ message: "Age must be a positive number!", type: "error" });
      return;
    }

    if (name === "lgname" && value !== "" && !/^[A-Za-z\s]+$/.test(value)) {
      setPopupMessage({ message: "Name should not contain special characters or numbers!", type: "error" });
      return;
    }

    setPopupMessage({ message: "", type: "" });
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user.password !== user.repassword) {
      setPopupMessage({ message: "Passwords do not match!", type: "error" });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        lgname: user.lgname,
        lggmail: user.lggmail,
        lgnumber: user.lgnumber,
        lgage: user.lgage,
        lgaddress: user.lgaddress,
        password: user.password,
      });

      if (res.data.status === "ok") {
        setPopupMessage({ message: "Registration successful!", type: "success" });
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setPopupMessage({ message: res.data.error || "Registration failed!", type: "error" });
      }
    } catch (err) {
      setPopupMessage({ message: err.response?.data?.error || "Registration failed!", type: "error" });
    }
  };

  return (
    <>
      <Nav />
      <div className="register-container">
        {popupMessage.message && (
          <div className={`popup-message ${popupMessage.type}`}>
            {popupMessage.message}
          </div>
        )}
        <form className="register-form" onSubmit={handleSubmit}>
          <h1>Create your account</h1>
          <input
            type="text"
            name="lgname"
            value={user.lgname}
            onChange={handleInputChange}
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            name="lggmail"
            value={user.lggmail}
            onChange={handleInputChange}
            placeholder="Email address"
            required
          />
          <input
            type="number"
            name="lgage"
            value={user.lgage}
            onChange={handleInputChange}
            placeholder="Age"
            required
          />
          <input
            type="tel"
            name="lgnumber"
            value={user.lgnumber}
            onChange={handleInputChange}
            placeholder="Phone Number"
            maxLength={10}
            required
          />
          <textarea
            name="lgaddress"
            value={user.lgaddress}
            onChange={handleInputChange}
            placeholder="Address"
            required
          ></textarea>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
          />
          <input
            type="password"
            name="repassword"
            value={user.repassword}
            onChange={handleInputChange}
            placeholder="Confirm Password"
            required
          />
          <button type="submit">Register</button>
          <p>
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </form>
      </div>
    </>
  );
}

export default Register;