import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getVisualPasses } from '../api/satellites';
import compassRose from '../assets/compassrose.png';
import './styles/SatelliteDetailsPage.css';
import SatelliteMap from '../components/SatelliteMap';
import ReactModal from 'react-modal';

const SatelliteDetailsPage = () => {
  const [showMap, setShowMap] = useState(false);
  const { satelliteId } = useParams();
  const location = useLocation();
  const [satelliteDetails, setSatelliteDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const coordinates = location.state || {
    latitude: 0,
    longitude: 0,
    altitude: 0,
    satname: 'Desconegut'
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
        console.error('Error obtenint els detalls del satèl·lit:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSatelliteDetails();
  }, [satelliteId, latitude, longitude, altitude]);

  if (!latitude || !longitude || !altitude) {
    return <p>Error: No s'han trobat les coordenades necessàries.</p>;
  }

  if (loading) {
    return <p>Carregant...</p>;
  }

  if (!satelliteDetails || satelliteDetails.length === 0) {
    return <p>No s'han trobat detalls per aquest satèl·lit.</p>;
  }

  return (
    <div className="satellite-details">
      <h2>Detalls del Satèl·lit {satname}</h2>
      
      <div className="info-container">
        <div className="satellite-info">
          <p><strong>ID:</strong> {satelliteId}</p>
          <p><strong>Latitud:</strong> {latitude}</p>
          <p><strong>Longitud:</strong> {longitude}</p>
          <p><strong>Altitud:</strong> {altitude}</p>
          <p><strong>Nombre de passes:</strong> {satelliteDetails.length}</p>
          <button
            className="map-button"
            onClick={() => setShowMap(true)}
          >
            Veure Mapa
          </button>
        </div>
        <div className="compass-container">
          <img 
            src={compassRose} 
            alt="Brúixola d'azimuts" 
            className="compass-image"
            title="Rosa dels vents per orientació dels azimuts"
          />
        </div>
      </div>

      <h3>Passes Visuals:</h3>
      <ul>
  {satelliteDetails.slice(0, 1).map((pass, index) => (
    <li key={index}>
      {/* First Pass Section */}
      <div className="pass-section">
        <div className="pass-header">Inici</div>
        <div className="pass-content">
          <div className="info-pair">
            <span className="info-label">Azimut:</span>
            <span className="info-value">{pass.startAzCompass} ({pass.startAz}°)</span>
          </div>
          <div className="info-pair">
            <span className="info-label">Elevació:</span>
            <span className="info-value">{pass.startEl}°</span>
          </div>
          <div className="info-pair">
            <span className="info-label">Hora:</span>
            <span className="info-value">{new Date(pass.startUTC * 1000).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Maximum Pass Section */}
      <div className="pass-section">
        <div className="pass-header">Punt Màxim</div>
        <div className="pass-content">
          <div className="info-pair">
            <span className="info-label">Azimut:</span>
            <span className="info-value">{pass.maxAzCompass} ({pass.maxAz}°)</span>
          </div>
          <div className="info-pair">
            <span className="info-label">Elevació:</span>
            <span className="info-value">{pass.maxEl}°</span>
          </div>
          <div className="info-pair">
            <span className="info-label">Hora:</span>
            <span className="info-value">{new Date(pass.maxUTC * 1000).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* End Pass Section */}
      <div className="pass-section">
        <div className="pass-header">Final</div>
        <div className="pass-content">
          <div className="info-pair">
            <span className="info-label">Azimut:</span>
            <span className="info-value">{pass.endAzCompass} ({pass.endAz}°)</span>
          </div>
          <div className="info-pair">
            <span className="info-label">Elevació:</span>
            <span className="info-value">{pass.endEl}°</span>
          </div>
          <div className="info-pair">
            <span className="info-label">Hora:</span>
            <span className="info-value">{new Date(pass.endUTC * 1000).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="pass-summary">
        <div className="info-pair">
          <span className="info-label">Durada:</span>
          <span className="info-value">{pass.duration}s</span>
        </div>
        <div className="info-pair">
          <span className="info-label">Magnitud:</span>
          <span className="info-value">{pass.mag}</span>
        </div>
      </div>
    </li>
  ))}
</ul>

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