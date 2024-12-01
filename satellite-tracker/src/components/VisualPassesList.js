import React from 'react';
import { Link } from 'react-router-dom';
import './styles/VisualPassesList.css';

const VisualPassesList = ({ visibleSatellites, latitude, longitude, altitude }) => {
  return (
    <div className="visual-passes-list">
      <h2>Satellites with Visual Passes:</h2>
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
                  satname: sat.satname, // Add satellite name
                }}
                className="satellite-link button" // Add button class
                data-text={sat.satname} // Set data-text for animation
              >
                <span className="actual-text">
                  &nbsp;{sat.satname}&nbsp;
                </span>
                <span aria-hidden="true" className="hover-text">
                  &nbsp;{sat.satname}&nbsp;
                </span>
              </Link>
            </h3>
            <ul>
              {sat.visualPasses.map((pass, index) => (
                <li key={index} className="pass-item">
                  <p>
                    <strong>Start:</strong>{' '}
                    {new Date(pass.startUTC * 1000).toLocaleString()}
                  </p>
                  <p><strong>Duration:</strong> {pass.duration}s</p>
                  <p><strong>Maximum Altitude:</strong> {pass.maxEl}°</p>
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
