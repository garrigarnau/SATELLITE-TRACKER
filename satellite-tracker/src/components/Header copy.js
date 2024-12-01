import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Header.css';
import logo from '../assets/logo.png';

const Header = () => {
  return (
    <header>
      <img src={logo} alt="Satellite Tracker Logo" className="header-logo" />
      <h1 className="site-title">Satellite Tracker</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
};

export default Header;
