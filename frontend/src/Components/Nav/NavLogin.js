import React from 'react';
import './nav.css';
import { Link, useNavigate } from 'react-router-dom';

function NavHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">ConnectVault</div>
      <ul className="navbar-links">
       
              <li><Link to="/mainhome" className="nav-link">Home</Link></li>
                <li><Link to="/register" className="nav-link">Register</Link></li>
                <li><Link to="/login" className="nav-link">Login</Link></li>
             
        <li>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </li>
      </ul>
    </nav>
  );
}

export default NavHome;
