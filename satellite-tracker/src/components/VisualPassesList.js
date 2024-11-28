import React from 'react';
import { Link } from 'react-router-dom';
import './styles/VisualPassesList.css';

const VisualPassesList = ({ visibleSatellites, latitude, longitude, altitude }) => {
  return (
    <div className="visual-passes-list">
      <h2>Satèl·lits amb passes visuals:</h2>
      <ul>
        {visibleSatellites.map((sat) => (
          <li key={sat.satid} className="satellite-item">
            <h3>
              <Link 
                to={`/satellite/${sat.satid}`}
                state={{
                  latitude: latitude,
                  longitude: longitude,
                  altitude: altitude,
                  satname: sat.satname,  // Afegim el nom del satèl·lit
                }}
                className="satellite-link"
              >
                <strong>{sat.satname}</strong>
              </Link>
            </h3>
            <ul>
              {sat.visualPasses.map((pass, index) => (
                <li key={index} className="pass-item">
                  <p><strong>Inici:</strong> {new Date(pass.startUTC * 1000).toLocaleString()}</p>
                  <p><strong>Durada:</strong> {pass.duration}s</p>
                  <p><strong>Altitud màxima:</strong> {pass.maxEl}°</p>
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
