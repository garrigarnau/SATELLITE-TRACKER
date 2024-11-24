import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  return (
    <header>
      <h1>Satellite Tracker</h1>
      <nav>
        <Link to="/">Inici</Link>
        <Link to="/about">Sobre</Link>
      </nav>
    </header>
  );
};

export default Header;
