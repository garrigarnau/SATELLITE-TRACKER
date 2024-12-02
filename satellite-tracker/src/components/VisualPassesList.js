import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactModal from 'react-modal';
import './styles/VisualPassesList.css';

const VisualPassesList = ({ visibleSatellites, latitude, longitude, altitude }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const openInfoModal = () => setIsInfoOpen(true);
  const closeInfoModal = () => setIsInfoOpen(false);

  return (
    <div className="visual-passes-list">
      {/* Info Button */}
      <button className="info-button" onClick={openInfoModal}>
        &#9432; {/* Information icon */}
      </button>

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
                <span className="actual-text">&nbsp;{sat.satname}&nbsp;</span>
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
                  <p>
                    <strong>Duration:</strong> {pass.duration}s
                  </p>
                  <p>
                    <strong>Maximum Altitude:</strong> {pass.maxEl}°
                  </p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Info Modal */}
      <ReactModal
        isOpen={isInfoOpen}
        onRequestClose={closeInfoModal}
        className="info-modal"
        overlayClassName="modal-overlay"
      >
        <button className="close-button" onClick={closeInfoModal}>
          ×
        </button>
        <h2>What does "Satellites with Visual Passes" mean?</h2>
        <p>
          "Satellites with Visual Passes" refers to satellites that are visible
          from your location during their orbit. A visual pass is when the
          satellite crosses the sky, and sunlight reflects off the satellite,
          making it visible to observers on Earth.
        </p>
      </ReactModal>
    </div>
  );
};

export default VisualPassesList;
