const httpStatus = require("http-status");
const { Role } = require("../utiles/typings");
const { getSession } = require("../utiles/use_session");
const { sendResponse } = require("../utiles/send_response");

/**
 * Function representing the Authorization check for app admins
 * @function isAdmin
 * @description Authenticate admins middleware
 * @param {Object} _req - HTTP Request object
 * @param {Object} res - HTTP Response object
 * @param {Function} next - HTTP NextFunction function
 * @returns {void | Object} Response object containing an error due to invalid privileges or no valid super access credentials in the request
 */
const isAdmin = (_req, res, next) => {
  const { user } = getSession();

  if (user.role !== Role.ADMIN) {
    return res.status(httpStatus.UNAUTHORIZED).json(
      sendResponse({
        status: httpStatus.UNAUTHORIZED,
        message: "You are not Authorized to perform this operation!",
      })
    );
  }

  return next();
};

module.exports = { isAdmin };
