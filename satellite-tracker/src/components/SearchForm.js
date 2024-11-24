import React from 'react';

const SearchForm = ({ latitude, setLatitude, longitude, setLongitude, altitude, setAltitude, fetchSatellites }) => {
  return (
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
      <button onClick={fetchSatellites}>Cerca Satèl·lits</button>
    </div>
  );
};

export default SearchForm;
