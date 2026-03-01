import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { removeAuthToken } from '../auth_token_store/auth_token_slice';
import { removeDragon } from '../auth_token_store/dragon_slice';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(removeAuthToken());
    dispatch(removeDragon());
    navigate('/login', { replace: true });
  };

  return (
    <nav className="dragon-navbar">
      <div className="nav-logo">Dragon Vault</div>
      <div className="nav-links">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>My Dragon</Link>
        <Link to="/calendar" className={`nav-item ${location.pathname === '/calendar' ? 'active' : ''}`}>Calendar</Link>
        <button onClick={handleLogout} className="nav-item logout-btn">Log Out</button>
      </div>
    </nav>
  );
};

export default Navbar;
