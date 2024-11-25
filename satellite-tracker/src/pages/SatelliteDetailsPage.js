import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getVisualPasses } from '../api/satellites';
import compassRose from '../assets/compassrose.png';
import './styles/SatelliteDetailsPage.css';

const SatelliteDetailsPage = () => {
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
          <li key={index} className="pass-item">
            <p><strong>Inici (Azimut):</strong> {pass.startAzCompass} ({pass.startAz}°)</p>
            <p><strong>Elevació inicial:</strong> {pass.startEl}°</p>
            <p><strong>Hora d'inici:</strong> {new Date(pass.startUTC * 1000).toLocaleString()}</p>
            <p><strong>Punt màxim (Azimut):</strong> {pass.maxAzCompass} ({pass.maxAz}°)</p>
            <p><strong>Altitud màxima:</strong> {pass.maxEl}°</p>
            <p><strong>Hora màxima:</strong> {new Date(pass.maxUTC * 1000).toLocaleString()}</p>
            <p><strong>Final (Azimut):</strong> {pass.endAzCompass} ({pass.endAz}°)</p>
            <p><strong>Elevació final:</strong> {pass.endEl}°</p>
            <p><strong>Hora de finalització:</strong> {new Date(pass.endUTC * 1000).toLocaleString()}</p>
            <p><strong>Durada:</strong> {pass.duration}s</p>
            <p><strong>Magnitud:</strong> {pass.mag}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SatelliteDetailsPage;