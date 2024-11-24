import React, { useState } from 'react';
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

  return (
    <div>
      <SearchForm
        latitude={latitude}
        setLatitude={setLatitude}
        longitude={longitude}
        setLongitude={setLongitude}
        altitude={altitude}
        setAltitude={setAltitude}
        fetchSatellites={fetchSatellites}
      />
      <SatelliteList satellites={satellites} />
      <VisualPassesList visibleSatellites={visibleSatellites} />
    </div>
  );
};

export default HomePage;
