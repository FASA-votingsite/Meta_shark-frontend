import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <img src="/logo192.png" alt="META_SHARK" />
          <span>META_SHARK</span>
        </Link>
        
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-item">Dashboard</Link>
          <Link to="/submit-content" className="navbar-item">Submit Content</Link>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;