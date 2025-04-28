import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from '../Nav/NavLogin';

function Login() {
  const history = useNavigate();
  const [user, setUser] = useState({
    lggmail: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending data to backend:", user); // Debugging

    try {
      const res = await axios.post("/login", user);
      console.log("Backend response:", res.data); // Debugging
      if (res.data.status === 'ok') {
        alert('Login Successful');
  
        // Redirect based on the backend response
        if (res.data.redirectTo === "/home2") {
          history('/home2'); // Redirect to /home2 for the specific user
        } else {
          history('/mainhome'); // Redirect to /mainhome for all other users
        }
      } else {
        alert('Invalid Credentials');
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message); // Debugging
      alert('Login Failed. Please check your credentials and try again.');
    }
  };

  return (
    <>
      <Nav />
      <div className="login-container">
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