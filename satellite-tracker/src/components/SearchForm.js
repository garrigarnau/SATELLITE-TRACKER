import React, { useState } from 'react';
import './styles/SearchForm.css';

const SearchForm = ({ latitude, setLatitude, longitude, setLongitude, altitude, setAltitude, fetchSatellites, onConfirm, resetSatellites }) => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); // Add error message for coordinates

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
          console.error('Error getting location:', error.message);
          alert('We could not retrieve your current location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleLocationOptionClick = (option) => {
    const useCurrent = option === 'current';
    setUseCurrentLocation(useCurrent);

    if (useCurrent) {
      getCurrentLocation();
    }
  };

  // Validate coordinates
  const validateCoordinates = () => {
    // Check if the coordinates are not empty
    if (!latitude || !longitude || !altitude) {
      setErrorMessage('All fields (Latitude, Longitude, Altitude) are required.');
      return false;
    }

    // Check if latitude is within valid range
    if (latitude < -90 || latitude > 90) {
      setErrorMessage('Latitude must be between -90 and 90.');
      return false;
    }

    // Check if longitude is within valid range
    if (longitude < -180 || longitude > 180) {
      setErrorMessage('Longitude must be between -180 and 180.');
      return false;
    }

    // Check if altitude is a valid number (optionally within a reasonable range)
    if (altitude && (isNaN(altitude) || altitude < 0 || altitude > 40000)) {
      setErrorMessage('Altitude must be a valid number between 0 and 40,000 meters.');
      return false;
    }

    setErrorMessage(''); // If all validations pass, clear the error message
    return true;
  };

  const handleConfirm = () => {
    if (validateCoordinates()) {
      setIsConfirmed(true);
      onConfirm(); // Confirm location and call the function to pass the data
    }
  };

  const handleRefresh = () => {
    setIsConfirmed(false);
    setLatitude('');
    setLongitude('');
    setAltitude('');
    setUseCurrentLocation(false);
    setCurrentCoordinates(null);
    resetSatellites(); // Clear satellite and visual passes lists
  };

  return (
    <div className="search-form">
      <h3>Location Options</h3>
      <div className="location-options">
        <button
          className={`location-option-btn ${useCurrentLocation ? 'active' : ''}`}
          onClick={() => handleLocationOptionClick('current')}
        >
          Use my current location
        </button>
        <button
          className={`location-option-btn ${!useCurrentLocation ? 'active' : ''}`}
          onClick={() => handleLocationOptionClick('manual')}
        >
          Enter coordinates manually
        </button>
      </div>

      {/* Show current coordinates if obtained */}
      {currentCoordinates && useCurrentLocation && (
        <div className="current-coordinates">
          <p><strong>Current Coordinates:</strong></p>
          <p>Latitude: {currentCoordinates.latitude}°</p>
          <p>Longitude: {currentCoordinates.longitude}°</p>
          <p>Altitude: {currentCoordinates.altitude}m</p>
        </div>
      )}

      {/* Form for manually entering coordinates */}
      {!useCurrentLocation && (
        <div className="coordinates-input">
          <label>
            Latitude:
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </label>
          <label>
            Longitude:
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </label>
          <label>
            Altitude:
            <input
              type="number"
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
            />
          </label>
        </div>
      )}

      {/* Display error message if coordinates are invalid */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="confirmation-section">
        {!isConfirmed ? (
          <button type="button" className="confirm-btn" onClick={handleConfirm}>
            Confirm Location
          </button>
        ) : (
          <>
            <div className="confirmed-info">
              <p>Location confirmed: {latitude}°, {longitude}°, {altitude}m</p>
            </div>
            <button onClick={fetchSatellites} className="search-btn">Search Satellites</button>
            <button onClick={handleRefresh} className="refresh-btn">
              Change Location
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
