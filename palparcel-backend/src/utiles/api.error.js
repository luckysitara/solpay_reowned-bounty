// Importing required modules
const httpStatus = require("http-status");

/**
 * HttpExceptionInterface
 * @typedef {Object} HttpExceptionInterface
 * @property {string} stack - Stack trace of the error.
 * @property {number} status - HTTP status code of the error.
 * @property {string} message - Error message.
 * @property {boolean} [isPublic] - Whether the message should be visible to user or not.
 * @property {Object} [errorData] - Additional error details.
 */

/**
 * @extends Error
 */
class HttpException extends Error {
  /**
   * @param {HttpExceptionInterface} options
   */
  constructor(options) {
    super(options.message);
    this.stack = options.stack;
    this.status = options.status;
    this.message = options.message;
    this.isPublic = options.isPublic;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    this.errorData = options.errorData;
    this.name = this.constructor.name;
  }
}

/**
 * Class representing an API error.
 * @extends HttpException
 */
class APIError extends HttpException {
  /**
   * Creates an API error.
   * @param {Object} options
   * @param {string} options.message - Error message.
   * @param {Object|null} [options.errorData] - Error details.
   * @param {string} [options.stack] - Call stack trace for error.
   * @param {number} [options.status] - HTTP status code of error.
   * @param {boolean} [options.isPublic] - Whether the message should be visible to user or not.
   */
  constructor(options) {
    options.status = options.status || httpStatus.INTERNAL_SERVER_ERROR;
    options.isPublic = options.isPublic || false;
    super(options);
  }
}

module.exports = APIError;
