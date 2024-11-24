import React, { useState } from 'react';
import { getSatellites, getVisualPasses } from './api/satellites';

function App() {
  return (
    <div>
      <h1>Satellite Tracker</h1>
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

      <h2>Tots els satèl·lits:</h2>
      <ul>
        {satellites.map((sat) => (
          <li key={sat.satid}>
            {sat.satname} - Altitud: {sat.satalt.toFixed(2)} km
          </li>
        ))}
      </ul>

      <h2>Satèl·lits amb passes visuals:</h2>
      <ul>
        {visibleSatellites.map((sat) => (
          <li key={sat.satid}>
            {sat.satname} - Passes visibles:
            <ul>
              {sat.visualPasses.map((pass, index) => (
                <li key={index}>
                  Inici: {new Date(pass.startUTC * 1000).toLocaleString()} - 
                  Durada: {pass.duration}s - 
                  Altitud màxima: {pass.maxEl}°
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
