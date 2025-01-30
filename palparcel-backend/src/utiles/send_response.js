/**
 * @typedef {Object} ResponseInterface
 * @property {number} status - The status code.
 * @property {string} message - The response message.
 * @property {Object} [payload] - The optional payload data.
 */

/**
 * Sends a response object.
 *
 * @param {Object} options - The options object.
 * @param {number} options.status - The status code.
 * @param {string} options.message - The response message.
 * @param {Object} [options.payload=null] - The optional payload data.
 * @returns {ResponseInterface} The response object.
 */
module.exports.sendResponse = (options) => {
  const status = options.status;
  const message = options.message;
  const payload = options.payload === undefined ? null : options.payload;

  return { status: status, message: message, payload: payload };
};
