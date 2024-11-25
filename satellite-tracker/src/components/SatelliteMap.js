import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getSatelliteTLE, getRadialVelocity } from '../api/satellites';

const SatelliteMap = ({ satelliteId }) => {
  const [positions, setPositions] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [velocityData, setVelocityData] = useState(null);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tleData = await getSatelliteTLE(satelliteId);
        console.log(tleData)
        if (tleData && tleData.positions) {
          setPositions(tleData.positions);
          setCurrentPosition(tleData.positions[0]);
        }

        const velocityInfo = await getRadialVelocity(satelliteId, 41.3802, 2.14, 0);
        setVelocityData(velocityInfo);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [satelliteId]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error obteniendo la ubicación del usuario:', error);
      }
    );
  }, []);

  const markerIcon = L.divIcon({
    className: 'satellite-icon',
    html: '🛰️',
    iconSize: [25, 25]
  });

  const userMarkerIcon = L.divIcon({
    className: 'user-icon',
    html: '🔴',
    iconSize: [25, 25]
  });

  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: '500px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {currentPosition && (
        <>
          <Marker 
            position={[currentPosition.satlatitude, currentPosition.satlongitude]} 
            icon={markerIcon}
          >
            <Popup>
              Posició Actual<br />
              Lat: {currentPosition.satlatitude.toFixed(4)}°<br />
              Lon: {currentPosition.satlongitude.toFixed(4)}°<br />
              Alt: {currentPosition.sataltitude.toFixed(2)} km
              {velocityData && (
                <>
                  <br />
                  Velocitat: {velocityData.velocityKmS} km/s
                </>
              )}
            </Popup>
          </Marker>

          <Circle
            center={[currentPosition.satlatitude, currentPosition.satlongitude]}
            radius={2200000}
            color="white"
            fillColor="#fff"
            fillOpacity={0.2}
            weight={1}
          />
        </>
      )}
      {positions.length > 0 && (
        <Polyline 
          positions={positions.map(p => [p.satlatitude, p.satlongitude])}
          color="yellow"
          weight={2}
          opacity={0.8}
        />
      )}
      {userPosition && (
        <Marker 
          position={[userPosition.latitude, userPosition.longitude]} 
          icon={userMarkerIcon}
        >
          <Popup>
            Ubicació de l'Usuari<br />
            Lat: {userPosition.latitude.toFixed(4)}°<br />
            Lon: {userPosition.longitude.toFixed(4)}°
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default SatelliteMap;