import React, { useState } from 'react';
import SearchForm from '../components/SearchForm';
import SatelliteList from '../components/SatelliteList';
import VisualPassesList from '../components/VisualPassesList';
import { getSatellites, getVisualPasses } from '../api/satellites';
import './styles/HomePage.css'

const HomePage = () => {
  const [satellites, setSatellites] = useState([]);
  const [visibleSatellites, setVisibleSatellites] = useState([]);
  const [latitude, setLatitude] = useState(); // Barcelona
  const [longitude, setLongitude] = useState(); // Barcelona
  const [altitude, setAltitude] = useState(); // Altitud en metres
  const [confirmedLocation, setConfirmedLocation] = useState(false);

  const resetSatellites = () => {
    setSatellites([]);
    setVisibleSatellites([]);
    setConfirmedLocation(false);
  };

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
      <SearchForm
        latitude={latitude}
        setLatitude={setLatitude}
        longitude={longitude}
        setLongitude={setLongitude}
        altitude={altitude}
        setAltitude={setAltitude}
        fetchSatellites={fetchSatellites}
        onConfirm={handleConfirmLocation}
        resetSatellites={resetSatellites}
      />
      
      <SatelliteList satellites={satellites} />

      <VisualPassesList 
        visibleSatellites={visibleSatellites}
        latitude={latitude}
        longitude={longitude}
        altitude={altitude}
      />
    </div>
  );
};

export default HomePage;