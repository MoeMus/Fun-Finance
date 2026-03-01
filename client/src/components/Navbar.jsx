import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="dragon-navbar">
      <div className="nav-logo">Dragon Vault</div>
      <div className="nav-links">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>My Dragon</Link>
        <Link to="/calendar" className={`nav-item ${location.pathname === '/calendar' ? 'active' : ''}`}>Calendar</Link>
        <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>Settings</Link>
      </div>
    </nav>
  );
};

export default Navbar;
