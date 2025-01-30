const axios = require("axios");

// Set config defaults when creating the instance
const network = axios.create({ baseURL: "/" });

// Add a request interceptor
network.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error?.response?.data)
);

// Add a response interceptor
network.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data)
);

module.exports = { network };
