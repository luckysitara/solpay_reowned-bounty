const { envVariables: config } = require("../config/index");

const generateOTP = (min = config.OTP_MIN_NUMBER, max = config.OTP_MAX_NUMBER) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return `${Math.floor(Math.random() * (max - min + 1)) + min}`;
};

const generateTrackingId = (min = config.TRACKING_MIN_NUMBER, max = config.TRACKING_MAX_NUMBER) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return `P${Math.floor(Math.random() * (max - min + 1)) + min}`;
};

module.exports = { generateOTP, generateTrackingId };
