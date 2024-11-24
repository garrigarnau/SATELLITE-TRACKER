import React, { useState } from 'react';

const SearchForm = ({ latitude, setLatitude, longitude, setLongitude, altitude, setAltitude, fetchSatellites, onConfirm }) => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Obtenir la localització actual
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setAltitude(position.coords.altitude || '0');
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

  // Gestionar el canvi entre manual o automàtic
  const handleLocationChange = (e) => {
    const useCurrent = e.target.value === 'current';
    setUseCurrentLocation(useCurrent);

    if (useCurrent) {
      getCurrentLocation();
    }
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    onConfirm();
  };

  const handleRefresh = () => {
    setIsConfirmed(false);
    setLatitude('');
    setLongitude('');
    setAltitude('');
    setUseCurrentLocation(false);
  };

  return (
    <div className="search-form">
      <h3>Opcions de localització</h3>
      <label>
        <input
          type="radio"
          name="locationOption"
          value="manual"
          checked={!useCurrentLocation}
          onChange={handleLocationChange}
        />
        Introduir coordenades manualment
      </label>
      <label>
        <input
          type="radio"
          name="locationOption"
          value="current"
          checked={useCurrentLocation}
          onChange={handleLocationChange}
        />
        Utilitzar la meva ubicació actual
      </label>

      {!useCurrentLocation && (
        <div>
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

      <div className="confirmation-section">
        {!isConfirmed ? (
          <button type="button" onClick={handleConfirm}>
            Confirmar Localització
          </button>
        ) : (
          <>
            <div className="confirmed-info">
              <p>Localització confirmada: {latitude}°, {longitude}°, {altitude}m</p>
            </div>
            <button onClick={fetchSatellites}>Cerca Satèl·lits</button>
            <button onClick={handleRefresh} className="refresh-button">
              Canviar Localització
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
