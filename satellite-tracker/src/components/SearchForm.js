import React, { useState } from 'react';
import axios from 'axios';
import './styles/SearchForm.css';

const SearchForm = ({
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  altitude,
  setAltitude,
  fetchSatellites,
  onConfirm,
  resetSatellites,
}) => {
  const [city, setCity] = useState(''); // Track city name input
  const [cityFullName, setCityFullName] = useState(''); // Track full name of city
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentCoordinates, setCurrentCoordinates] = useState(null); // Store current location

  const API_KEY = process.env.REACT_APP_OPENCAGE_API_KEY; // Access API key from .env

  // Search city coordinates using OpenCage Geocoding API
  const searchCityCoordinates = async () => {
    if (!city.trim()) {
      setErrorMessage('Please enter a city name.');
      return;
    }

    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          city
        )}&key=${API_KEY}`
      );

      const data = response.data;
      if (data.results.length > 0) {
        const cityCoordinates = data.results[0].geometry;
        const fullName = data.results[0].formatted; // Extract full name of city
        setLatitude(cityCoordinates.lat);
        setLongitude(cityCoordinates.lng);
        setAltitude('0'); // Altitude not provided by API, set to 0
        setCityFullName(fullName); // Update city full name
        setErrorMessage('');
        setIsConfirmed(true);
        onConfirm(); // Confirm the location
      } else {
        setErrorMessage('City not found. Please try another name.');
      }
    } catch (error) {
      console.error('Error fetching city coordinates:', error);
      setErrorMessage('Error fetching city coordinates. Please try again.');
    }
  };

  // Get current location using browser's geolocation API
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setAltitude(position.coords.altitude || '0'); // Default altitude to 0 if not available
          setCurrentCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || '0',
          });
          setCityFullName('Your Current Location'); // Display a placeholder
          setErrorMessage('');
          setIsConfirmed(true);
          onConfirm(); // Confirm location
        },
        (error) => {
          console.error('Error fetching current location:', error);
          setErrorMessage('Could not retrieve your current location.');
        }
      );
    } else {
      setErrorMessage('Geolocation is not supported by your browser.');
    }
  };

  const handleRefresh = () => {
    setCity('');
    setCityFullName('');
    setLatitude('');
    setLongitude('');
    setAltitude('');
    setIsConfirmed(false);
    setCurrentCoordinates(null);
    resetSatellites(); // Clear satellite and visual passes lists
  };

  return (
    <div className="search-form">
      <h3>Location Options</h3>
  
      <div className="city-search">
        <label>City Name:</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name (e.g., Barcelona)"
        />
        <button type="button" className="search-city-btn" onClick={searchCityCoordinates}>
          Search City Coordinates
        </button>
      </div>
  
      <div className="current-location">
        <button type="button" className="current-location-btn" onClick={getCurrentLocation}>
          Use Your Current Location
        </button>
      </div>
  
      {isConfirmed && (
        <div className="coordinates-info">
          <p>
            <strong>City:</strong> {cityFullName}
          </p>
          <p>
            <strong>Coordinates:</strong> {latitude}°, {longitude}°, {altitude}m
          </p>
        </div>
      )}
  
      {errorMessage && <p className="error-message">{errorMessage}</p>}
  
      <div className="confirmation-section">
        {!isConfirmed ? (
          <button type="button" className="confirm-btn" onClick={onConfirm}>
            Confirm Location
          </button>
        ) : (
          <>
            <button onClick={fetchSatellites} className="search-btn">
              Search Satellites
            </button>
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
