import React from 'react';
import { Link } from 'react-router-dom';
import './styles/Header.css';
import logo from '../assets/logo.png';
import backgroundImage from '../assets/header2.jpg';


const Header = () => {
  return (
    <header
      style={{
        background: `url(${backgroundImage}) no-repeat center center`,
        backgroundSize: 'cover',
      }}
    >
      <div className="header-left">
        <img
          src={logo}
          alt="Satellite Tracker Logo"
          className="header-logo"
        />
        <h1 className="site-title">Satellite Tracker</h1>
      </div>
      <nav>
        <Link to="/" className="nav-link" data-text="Home">
          <span className="actual-text">&nbsp;Home&nbsp;</span>
          <span className="hover-text" aria-hidden="true">
            &nbsp;Home&nbsp;
          </span>
        </Link>
        <Link to="/about" className="nav-link" data-text="About">
          <span className="actual-text">&nbsp;About&nbsp;</span>
          <span className="hover-text" aria-hidden="true">
            &nbsp;About&nbsp;
          </span>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
