import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styles/Header.css';
import logo from '../assets/logo1.png';

const Header = () => {
  const location = useLocation(); // Get the current page's location

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.location.reload(); // Reload the home page if already on it
    }
  };

  return (
    <header
      style={{
        backgroundSize: 'cover',
      }}
    >
      <div className="header-left">
        {/* Logo with Link and click handler */}
        <Link to="/" onClick={handleLogoClick}>
          <img
            src={logo}
            alt="Satellite Tracker Logo"
            className="header-logo"
          />
        </Link>
        <h1 className="site-title">SATELLITE TRACKER</h1>
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
