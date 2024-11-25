import React, { useState } from 'react';
import './styles/HomePage.css';
import SearchForm from '../components/SearchForm';
import SatelliteList from '../components/SatelliteList';
import VisualPassesList from '../components/VisualPassesList';
import { getSatellites, getVisualPasses } from '../api/satellites';

const HomePage = () => {
  const [satellites, setSatellites] = useState([]);
  const [visibleSatellites, setVisibleSatellites] = useState([]);
  const [latitude, setLatitude] = useState(41.3851);
  const [longitude, setLongitude] = useState(2.1734);
  const [altitude, setAltitude] = useState(10);
  const [confirmedLocation, setConfirmedLocation] = useState(false);

  const fetchSatellites = async () => {
    const data = await getSatellites(latitude, longitude, altitude);
    setSatellites(data);

    const visualDataPromises = data.map(async (sat) => {
      const visualPasses = await getVisualPasses(sat.satid, latitude, longitude, altitude);
      return { ...sat, visualPasses };
    });

    const visualData = await Promise.all(visualDataPromises);
    setVisibleSatellites(visualData.filter((sat) => sat.visualPasses.length > 0));
  };

  const handleConfirmLocation = () => {
    setConfirmedLocation(true);
  };

  return (
    <div className="container">
      <h1>Localització</h1>
      <SearchForm
        latitude={latitude}
        setLatitude={setLatitude}
        longitude={longitude}
        setLongitude={setLongitude}
        altitude={altitude}
        setAltitude={setAltitude}
        fetchSatellites={fetchSatellites}
        onConfirm={handleConfirmLocation}
      />
      
      <SatelliteList satellites={satellites} />
      <VisualPassesList
        visibleSatellites={visibleSatellites}
        latitude={latitude} // Passem latitud com a prop
        longitude={longitude} // Passem longitud com a prop
        altitude={altitude} // Passem altitud com a prop
        
      />
    </div>
  );
};

export default HomePage;
