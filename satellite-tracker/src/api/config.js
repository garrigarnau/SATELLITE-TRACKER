// config.js
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.n2yo.com'  // URL de producció
  : '';  // En desenvolupament, deixa-ho buit per usar el proxy

export default BASE_URL;