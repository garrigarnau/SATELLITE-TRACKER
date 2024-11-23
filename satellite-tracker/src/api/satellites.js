const API_KEY = process.env.REACT_APP_N2YO_API_KEY;

// Funció per obtenir satèl·lits "above"
export const getSatellites = async (latitude, longitude, altitude) => {
  const url = `/rest/v1/satellite/above/${latitude}/${longitude}/${altitude}/70/18/&apiKey=${API_KEY}`;
  console.log('URL generada (above):', url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
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
    const API_KEY = process.env.REACT_APP_N2YO_API_KEY;
    const days = 1; // Dies de predicció
    const minVisibility = 5; // Visibilitat mínima en segons
  
    //const url = `${BASE_URL}/visualpasses/${satelliteId}/${latitude}/${longitude}/${altitude}/${days}/${minVisibility}/&apiKey=${API_KEY}`;
    const url = `/rest/v1/satellite/visualpasses/${satelliteId}/${latitude}/${longitude}/${altitude}/${days}/${minVisibility}/&apiKey=${API_KEY}`;

    console.log('URL generada (visualpasses):', url); // Comprova la URL generada
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Resposta de l'API (visualpasses) per satèl·lit ${satelliteId}:`, data);
      return data.passes || []; // Retorna la llista de passes visuals
    } catch (error) {
      console.error(`Error durant la crida a la API (visualpasses) pel satèl·lit ${satelliteId}:`, error.message);
      return [];
    }
  };
  
