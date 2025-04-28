import React from 'react';
import './nav.css';
import { useNavigate } from 'react-router-dom';

function NavAdmin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">ConnectVault Admin Panel</div>
      <div className="navbar-logout">
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </nav>
  );
}

export default NavAdmin;
