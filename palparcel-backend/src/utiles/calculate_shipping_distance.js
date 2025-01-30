const { Client } = require("@googlemaps/google-maps-services-js");

const { envVariables: config } = require("../config/index");

const client = new Client();

const calculateShippingDistance = async (originAddress, destinationAddress) => {
  try {
    const originArgs = {
      params: {
        key: config.GOOGLE_MAPS_API_KEY,
        address: originAddress,
      },
    };

    const destinationArgs = {
      params: {
        key: config.GOOGLE_MAPS_API_KEY,
        address: destinationAddress,
      },
    };
    const originResponse = await client.geocode(originArgs);

    const origin = originResponse.data.results[0].geometry.location;

    const destinationResponse = await client.geocode(destinationArgs);

    const destination = destinationResponse.data.results[0].geometry.location;

    const request = {
      params: {
        key: config.GOOGLE_MAPS_API_KEY,
        origins: [origin],
        destinations: [destination],
        mode: "driving",
        units: "metric",
      },
    };

    const response = await client.distancematrix(request);

    const distanceText = response.data.rows[0].elements[0].distance.text;
    const distanceValue = response.data.rows[0].elements[0].distance.value;

    const distanceKm = distanceValue / 1000;
    const shippingCost = config.BASE_RATE + distanceKm * config.PER_KM_RATE;

    return { distanceText, distanceValue, shippingCost: shippingCost.toFixed(2) };
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = calculateShippingDistance;

// substitute origin and destination locations and make it dynamic

// const shippingDistance = await calculateShippingDistance(
//   "Yenagoa, Bayelsa, Nigeria",
//   "Port Harcourt, Rivers, Nigeria"
// );
