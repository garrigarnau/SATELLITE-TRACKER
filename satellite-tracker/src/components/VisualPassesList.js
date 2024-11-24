import React from 'react';

const VisualPassesList = ({ visibleSatellites }) => {
  return (
    <div>
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
};

export default VisualPassesList;
