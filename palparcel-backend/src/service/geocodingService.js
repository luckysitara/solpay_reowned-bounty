// Implementation geocoding service using node-geocoder

const NodeGeocoder = require('node-geocoder');

const geocoder = NodeGeocoder({
  provider: 'google',
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
  formatter: null,
});

async function geocodeAddress(address) {
  try {
    const results = await geocoder.geocode(address);
    if (results.length === 0) {
      throw new Error('Address not found');
    }
    const location = results[0];
    return { latitude: location.latitude, longitude: location.longitude };
  } catch (error) {
    throw new Error('Geocoding failed');
  }
}

module.exports = { geocodeAddress };

