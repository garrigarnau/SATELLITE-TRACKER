import React from 'react';

const SatelliteList = ({ satellites }) => {
  return (
    <div>
      <h2>Tots els satèl·lits:</h2>
      <ul>
        {satellites.map((sat) => (
          <li key={sat.satid}>
            {sat.satname} - Altitud: {sat.satalt.toFixed(2)} km
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SatelliteList;
