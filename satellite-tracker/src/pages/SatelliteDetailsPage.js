import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getVisualPasses } from '../api/satellites';
import compassRose from '../assets/compassrose.png';
import './styles/SatelliteDetailsPage.css';
import SatelliteMap from '../components/SatelliteMap';
import ReactModal from 'react-modal';

const SatelliteDetailsPage = () => {
  const [showMap, setShowMap] = useState(false);
  const [showInfo, setShowInfo] = useState(false); // To control the info popup
  const [infoType, setInfoType] = useState(''); // To control which info popup to show
  const { satelliteId } = useParams();
  const location = useLocation();
  const [satelliteDetails, setSatelliteDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const coordinates = location.state || {
    latitude: 0,
    longitude: 0,
    altitude: 0,
    satname: 'Unknown'
  };

  const { latitude, longitude, altitude, satname } = coordinates;

  useEffect(() => {
    const fetchSatelliteDetails = async () => {
      try {
        if (latitude && longitude && altitude) {
          const response = await getVisualPasses(satelliteId, latitude, longitude, altitude);
          setSatelliteDetails(response);
        }
      } catch (error) {
        console.error('Error fetching satellite details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSatelliteDetails();
  }, [satelliteId, latitude, longitude, altitude]);

  if (!latitude || !longitude || !altitude) {
    return <p>Error: Coordinates not found.</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!satelliteDetails || satelliteDetails.length === 0) {
    return <p>No details found for this satellite.</p>;
  }

  const handleInfoClick = (type) => {
    setInfoType(type);
    setShowInfo(true);
  };

  return (
    <div className="satellite-details">
      <h2>Satellite Details: {satname}</h2>
      
      <div className="info-container">
        <div className="satellite-info">

          <p><strong>ID:</strong> {satelliteId}</p>
          <p><strong>Number of passes:</strong> {satelliteDetails.length}</p>
          
          <p><strong>Latitude:</strong> {latitude}</p>
          <p><strong>Longitude:</strong> {longitude}</p>
          <p><strong>Altitude:</strong> {altitude}</p>
          
          <button
            className="map-button"
            onClick={() => setShowMap(true)}
          >
            View Map
          </button>
        </div>
        <div className="compass-container">
          <img 
            src={compassRose} 
            alt="Azimuth compass" 
            className="compass-image"
            title="Compass for azimuth orientation"
          />
        </div>
      </div>

      <h3>Visual Passes:</h3>
      <ul>
        {satelliteDetails.slice(0, 1).map((pass, index) => (
          <li key={index}>
            {/* First Pass Section */}
            <div className="pass-section">
              <div className="pass-header">Start</div>
              <div className="pass-content">
                <div className="info-pair">
                  <span className="info-label">Azimuth:</span>
                  <span className="info-value">{pass.startAzCompass} ({pass.startAz}°)</span>
                  <span 
                    className="info-icon" 
                    onClick={() => handleInfoClick('azimuth')}
                  >
                    &#9432; {/* Information icon */}
                  </span>
                </div>
                <div className="info-pair">
                  <span className="info-label">Elevation:</span>
                  <span className="info-value">{pass.startEl}°</span>
                  <span 
                    className="info-icon" 
                    onClick={() => handleInfoClick('elevation')}
                  >
                    &#9432; {/* Information icon */}
                  </span>
                </div>
                <div className="info-pair">
                  <span className="info-label">Time:</span>
                  <span className="info-value">{new Date(pass.startUTC * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Maximum Pass Section */}
            <div className="pass-section">
              <div className="pass-header">Maximum Point</div>
              <div className="pass-content">
                <div className="info-pair">
                  <span className="info-label">Azimuth:</span>
                  <span className="info-value">{pass.maxAzCompass} ({pass.maxAz}°)</span>
                </div>
                <div className="info-pair">
                  <span className="info-label">Elevation:</span>
                  <span className="info-value">{pass.maxEl}°</span>
                </div>
                <div className="info-pair">
                  <span className="info-label">Time:</span>
                  <span className="info-value">{new Date(pass.maxUTC * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* End Pass Section */}
            <div className="pass-section">
              <div className="pass-header">End</div>
              <div className="pass-content">
                <div className="info-pair">
                  <span className="info-label">Azimuth:</span>
                  <span className="info-value">{pass.endAzCompass} ({pass.endAz}°)</span>
                </div>
                <div className="info-pair">
                  <span className="info-label">Elevation:</span>
                  <span className="info-value">{pass.endEl}°</span>
                </div>
                <div className="info-pair">
                  <span className="info-label">Time:</span>
                  <span className="info-value">{new Date(pass.endUTC * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="pass-summary">
              <div className="info-pair">
                <span className="info-label">Duration:</span>
                <span className="info-value">{pass.duration}s</span>
              </div>
              <div className="info-pair">
                <span className="info-label">Magnitude:</span>
                <span className="info-value">{pass.mag}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Information Pop-up Modal */}
      <ReactModal 
        isOpen={showInfo} 
        onRequestClose={() => setShowInfo(false)}
        className="info-modal"
        overlayClassName="modal-overlay"
      >
        <button 
          className="close-button"
          onClick={() => setShowInfo(false)}
        >
          ×
        </button>
        <h2>{infoType === 'azimuth' ? 'Azimuth' : 'Elevation'} Information</h2>
        <p>
          {infoType === 'azimuth' ? 
            'Azimuth refers to the direction of the satellite relative to the observer. The value is expressed in degrees (°) from North.' :
            'Elevation is the angle between the satellite and the observer’s horizon. It indicates how high the satellite is above the horizon.'
          }
        </p>
      </ReactModal>

      <ReactModal 
        isOpen={showMap} 
        onRequestClose={() => setShowMap(false)}
        className="modal-map"
        overlayClassName="modal-overlay"
      >
        <button 
          className="close-button"
          onClick={() => setShowMap(false)}
        >
          ×
        </button>
        <SatelliteMap satelliteId={satelliteId} />
      </ReactModal>
      
    </div>
  );
};

export default SatelliteDetailsPage;
