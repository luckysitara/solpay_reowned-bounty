// Importing required modules
const _ = require("lodash");
const httpStatus = require("http-status");
const { isCelebrateError } = require("celebrate");
const { JsonWebTokenError } = require("jsonwebtoken");
const APIError = require("../utiles/api.error");
const joiErrorFormatter = require("../utiles/joi_error_formmater");

/**
 * Class representing the error service.
 *
 * @class ErrorService
 * @classdesc App error service class
 */
class ErrorService {
  /**
   * App error handler.
   *
   * @param {Object} error - ExpressErrorInterface object.
   * @param {Object} _req - HTTP Request object.
   * @param {Object} res - HTTP Response object.
   * @param {Function} [_next] - HTTP NextFunction function.
   * @returns {void}
   */
  static handler(error, _req, res, _next) {
    const response = {
      payload: null,
      stack: error.stack,
      error: error.errors,
      status: error.status,
      errorData: error.errorData,
      message: error.message || String(httpStatus[error.status]),
    };

    if (process.env !== "development") {
      delete response.stack;
    }

    ErrorService.reportError(response);
    res.status(response.status).json(_.pick(response, ["payload", "message", "status"]));
  }

  /**
   * Convert all app errors.
   *
   * @param {Object} error - ExpressErrorInterface object.
   * @param {Object} req - HTTP Request object.
   * @param {Object} res - HTTP Response object.
   * @param {Function} _next - HTTP NextFunction function.
   * @returns {void}
   */
  static converter(error, req, res, _next) {
    let convertedError = error;

    if (isCelebrateError(error)) {
      convertedError = new APIError({
        status: httpStatus.BAD_REQUEST,
        message: JSON.stringify(joiErrorFormatter(error.details)),
      });
    }

    if (error instanceof JsonWebTokenError) {
      convertedError = new APIError({
        message: error.message,
        status: httpStatus.UNAUTHORIZED,
      });
    }

    if (!(convertedError instanceof APIError)) {
      convertedError = new APIError({
        message: error.message,
        status: error.status,
        stack: error.stack,
      });
    }

    return ErrorService.handler(convertedError, req, res);
  }

  /**
   * Catch app 404 errors.
   *
   * @param {Object} req - HTTP Request object.
   * @param {Object} res - HTTP Response object.
   * @returns {void}
   */
  static notFound(req, res) {
    const error = new APIError({
      message: "Not found",
      status: httpStatus.NOT_FOUND,
      stack: undefined,
    });

    return ErrorService.handler(error, req, res);
  }

  /**
   * Report API errors to our custom error service provider.
   *
   * @param {Object} error - ErrorResponseInterface.
   * @returns {Object} - ErrorResponseInterface.
   */
  static reportError(error) {
    // report to app communication centers example -> slack etc
    console.log(error);
    return error;
  }
}

module.exports = ErrorService;
