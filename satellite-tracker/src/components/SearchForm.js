import React, { useState } from 'react';
import './styles/SearchForm.css';

const SearchForm = ({ latitude, setLatitude, longitude, setLongitude, altitude, setAltitude, fetchSatellites, onConfirm, resetSatellites }) => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); // Afegir missatge d'error per coordenades

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setAltitude(position.coords.altitude || '0');
          setCurrentCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || '0',
          });
        },
        (error) => {
          console.error('Error obtenint la localització:', error.message);
          alert('No hem pogut obtenir la teva ubicació actual.');
        }
      );
    } else {
      alert('La geolocalització no està suportada pel navegador.');
    }
  };

  const handleLocationOptionClick = (option) => {
    const useCurrent = option === 'current';
    setUseCurrentLocation(useCurrent);

    if (useCurrent) {
      getCurrentLocation();
    }
  };

  // Validació de les coordenades
  const validateCoordinates = () => {
    // Comprovar si les coordenades no estan buides
    if (!latitude || !longitude || !altitude) {
      setErrorMessage('Tots els camps (Latitud, Longitud, Altitud) són obligatoris.');
      return false;
    }

    // Comprovar que la latitud estigui dins del rang vàlid
    if (latitude < -90 || latitude > 90) {
      setErrorMessage('La latitud ha de ser entre -90 i 90.');
      return false;
    }

    // Comprovar que la longitud estigui dins del rang vàlid
    if (longitude < -180 || longitude > 180) {
      setErrorMessage('La longitud ha de ser entre -180 i 180.');
      return false;
    }

    // Comprovar que l'altitud sigui un número vàlid (opcionalment, dins d'un rang raonable)
    if (altitude && (isNaN(altitude) || altitude < 0 || altitude > 40000)) {
      setErrorMessage('L\'altitud ha de ser un número vàlid entre 0 i 40,000 metres.');
      return false;
    }

    setErrorMessage(''); // Si totes les validacions passen, es neteja el missatge d'error
    return true;
  };

  const handleConfirm = () => {
    if (validateCoordinates()) {
      setIsConfirmed(true);
      onConfirm(); // Confirmem la localització i cridem la funció per passar les dades
    }
  };

  const handleRefresh = () => {
    setIsConfirmed(false);
    setLatitude('');
    setLongitude('');
    setAltitude('');
    setUseCurrentLocation(false);
    setCurrentCoordinates(null);
    resetSatellites(); // Esborrar les llistes de satèl·lits i passes visuals
  };

  return (
    <div className="search-form">
      <h3>Opcions de localització</h3>
      <div className="location-options">
        <button
          className={`location-option-btn ${useCurrentLocation ? 'active' : ''}`}
          onClick={() => handleLocationOptionClick('current')}
        >
          Utilitzar la meva ubicació actual
        </button>
        <button
          className={`location-option-btn ${!useCurrentLocation ? 'active' : ''}`}
          onClick={() => handleLocationOptionClick('manual')}
        >
          Introduir coordenades manualment
        </button>
      </div>

      {/* Mostrar coordenades actuals si s'han obtingut */}
      {currentCoordinates && useCurrentLocation && (
        <div className="current-coordinates">
          <p><strong>Coordenades actuals:</strong></p>
          <p>Latitud: {currentCoordinates.latitude}°</p>
          <p>Longitud: {currentCoordinates.longitude}°</p>
          <p>Altitud: {currentCoordinates.altitude}m</p>
        </div>
      )}

      {/* Formulari per introduir coordenades manualment */}
      {!useCurrentLocation && (
        <div className="coordinates-input">
          <label>
            Latitud:
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </label>
          <label>
            Longitud:
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </label>
          <label>
            Altitud:
            <input
              type="number"
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
            />
          </label>
        </div>
      )}

      {/* Missatge d'error si les coordenades no són vàlides */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="confirmation-section">
        {!isConfirmed ? (
          <button type="button" className="confirm-btn" onClick={handleConfirm}>
            Confirmar Localització
          </button>
        ) : (
          <>
            <div className="confirmed-info">
              <p>Localització confirmada: {latitude}°, {longitude}°, {altitude}m</p>
            </div>
            <button onClick={fetchSatellites} className="search-btn">Cerca Satèl·lits</button>
            <button onClick={handleRefresh} className="refresh-btn">
              Canviar Localització
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
