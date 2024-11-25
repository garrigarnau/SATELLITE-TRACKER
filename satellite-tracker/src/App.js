import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AboutPage from './pages/Aboutpage';
import SatelliteDetailsPage from './pages/SatelliteDetailsPage'; // Nova pàgina

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/satellite/:satelliteId" element={<SatelliteDetailsPage />} /> {/* Ruta amb paràmetres */}
      </Routes>
    </Router>
  );
}

export default App;
