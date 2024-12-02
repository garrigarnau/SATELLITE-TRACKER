import React, { useState, useRef } from 'react';
import SearchForm from '../components/SearchForm';
import SatelliteList from '../components/SatelliteList';
import VisualPassesList from '../components/VisualPassesList';
import { getSatellites, getVisualPasses } from '../api/satellites';
import './styles/HomePage.css';

const HomePage = () => {
  const [satellites, setSatellites] = useState([]);
  const [visibleSatellites, setVisibleSatellites] = useState([]);
  const [latitude, setLatitude] = useState(); // Barcelona
  const [longitude, setLongitude] = useState(); // Barcelona
  const [altitude, setAltitude] = useState(); // Altitude in meters
  const [confirmedLocation, setConfirmedLocation] = useState(false);

  const satelliteListRef = useRef(null); // Ref for the satellite list

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

    // Scroll to the satellite list
    if (satelliteListRef.current) {
      satelliteListRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
        fetchSatellites={fetchSatellites} // Triggers the satellite fetching and scrolling
        onConfirm={handleConfirmLocation}
        resetSatellites={resetSatellites}
      />

      {/* Add ref to the SatelliteList container */}
      <div ref={satelliteListRef}>
        <SatelliteList satellites={satellites} />
      </div>

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
