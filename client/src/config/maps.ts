// HERE Maps API configuration
const apiKey = import.meta.env.VITE_HERE_API_KEY;

if (!apiKey) {
  console.error('HERE Maps API key is missing. Please check your environment configuration.');
}

export const HERE_MAPS_CONFIG = {
  apiKey,
  defaultCenter: { lat: 20.5937, lng: 78.9629 }, // India's center coordinates
  defaultZoom: 12,
};

// Log configuration status
console.log('HERE Maps Configuration:', {
  hasApiKey: !!apiKey,
  apiKeyLength: apiKey?.length,
  defaultCenter: HERE_MAPS_CONFIG.defaultCenter,
  defaultZoom: HERE_MAPS_CONFIG.defaultZoom
});

export default HERE_MAPS_CONFIG; 