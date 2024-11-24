import React from 'react';
import './VisualPassesList.css';

const VisualPassesList = ({ visibleSatellites }) => {
  return (
    <div className="visual-passes-list">
      <h2>Satèl·lits amb passes visuals:</h2>
      <ul>
        {visibleSatellites.map((sat) => (
          <li key={sat.satid} className="satellite-item">
            <h3>{sat.satname} - Passes visibles:</h3>
            <ul>
              {sat.visualPasses.map((pass, index) => (
                <li key={index} className="pass-item">
                  Inici: <strong>{new Date(pass.startUTC * 1000).toLocaleString()}</strong> - 
                  Durada: <strong>{pass.duration}s</strong> - 
                  Altitud màxima: <strong>{pass.maxEl}°</strong>
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
