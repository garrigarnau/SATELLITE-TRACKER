import React from 'react';
import './styles/SatelliteList.css';

const SatelliteList = ({ satellites }) => {
  return (
    <div className="satellite-list">
      <h2>Tots els satèl·lits:</h2>
      <ul>
        {satellites.map((sat) => (
          <li key={sat.satid} className="satellite-item">
            <h3>{sat.satname}</h3>
            <p>Altitud: <strong>{sat.satalt.toFixed(2)} km</strong></p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SatelliteList;
