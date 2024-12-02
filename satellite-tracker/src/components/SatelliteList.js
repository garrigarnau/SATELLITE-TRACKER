import React, { useState } from 'react';
import ReactModal from 'react-modal';
import './styles/SatelliteList.css';

const SatelliteList = ({ satellites }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const openInfoModal = () => {
    setIsInfoOpen(true);
  };

  const closeInfoModal = () => {
    setIsInfoOpen(false);
  };

  return (
    <div className="satellite-list-container">
      {/* Header Section */}
      <div className="satellite-list-header">
        <h2>Satellites Above:</h2>
        <button className="info-button" onClick={openInfoModal} aria-label="More Info">
          &#9432; {/* Information icon */}
        </button>
      </div>

      {/* Satellite List */}
      <ul className="satellite-list">
        {satellites.length > 0 ? (
          satellites.slice(0, 5).map((sat) => (
            <li key={sat.satid} className="satellite-item">
              <h3>{sat.satname}</h3>
              <p>
                Altitude: <strong>{sat.satalt.toFixed(2)} km</strong>
              </p>
            </li>
          ))
        ) : (
          <p className="no-satellites">No satellites available. Please search again.</p>
        )}
      </ul>

      {/* React Modal for Info */}
      <ReactModal
        isOpen={isInfoOpen}
        onRequestClose={closeInfoModal}
        className="info-modal"
        overlayClassName="modal-overlay"
        ariaHideApp={false} // Disable ARIA warning (ensure correct use in production)
      >
        <button className="close-button" onClick={closeInfoModal} aria-label="Close Info Modal">
          ×
        </button>
        <h2>What does "Satellites Above" mean?</h2>
        <p>
          Using the N2YO API, "Satellites Above" refers to satellites visible in the sky above a
          specific location. These satellites are within the observer's line of sight, based on their altitude, azimuth, and orbital parameters.
        </p>
      </ReactModal>
    </div>
  );
};

export default SatelliteList;
