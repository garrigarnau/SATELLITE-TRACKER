import BASE_URL from './config';

const API_KEY = process.env.REACT_APP_N2YO_API_KEY;

export const getSatelliteTLE = async (satelliteId) => {
  const tleUrl = `${BASE_URL}/rest/v1/satellite/tle/${satelliteId}&apiKey=${API_KEY}`;
  const positionsUrl = `${BASE_URL}/rest/v1/satellite/positions/${satelliteId}/41.3802/2.14/0/3000/&apiKey=${API_KEY}`;
  
  try {
    const [tleResponse, positionsResponse] = await Promise.all([
      fetch(tleUrl),
      fetch(positionsUrl)
    ]);
    
    // Afegeix verificació de resposta
    if (!tleResponse.ok || !positionsResponse.ok) {
      throw new Error('Network response was not ok');
    }
    
    const tleData = await tleResponse.json();
    const positionsData = await positionsResponse.json();
    
    return {
      ...tleData,
      positions: positionsData.positions || []
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getRadialVelocity = async (satelliteId, latitude, longitude, altitude) => {
  const url = `${BASE_URL}/rest/v1/satellite/radialvelocity/${satelliteId}/${latitude}/${longitude}/${altitude}/&apiKey=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting velocity:', error);
    throw error;
  }
};

export const getSatellites = async (latitude, longitude, altitude) => {
  const url = `${BASE_URL}/rest/v1/satellite/above/${latitude}/${longitude}/${altitude}/70/18/&apiKey=${API_KEY}`;
  console.log('URL generada (above):', url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Resposta de l\'API (above):', data);
    return data.above;
  } catch (error) {
    console.error('Error durant la crida a la API (above):', error.message);
    return [];
  }
};

export const getVisualPasses = async (satelliteId, latitude, longitude, altitude) => {
    const days = 1;
    const minVisibility = 5;
  
    const url = `${BASE_URL}/rest/v1/satellite/visualpasses/${satelliteId}/${latitude}/${longitude}/${altitude}/${days}/${minVisibility}/&apiKey=${API_KEY}`;

    console.log('URL generada (visualpasses):', url);
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Resposta de l'API (visualpasses) per satèl·lit ${satelliteId}:`, data);
      return data.passes || [];
    } catch (error) {
      console.error(`Error durant la crida a la API (visualpasses) pel satèl·lit ${satelliteId}:`, error.message);
      return [];
    }
};