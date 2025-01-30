const httpStatus = require("http-status");

const { getAllBanks } = require("../utiles/get_all_banks");
const { sendResponse } = require("../utiles/send_response");

/**
 * Function for getting all banks
 * @function getBanks
 * @param {Request} _req - HTTP Request object
 * @param {Response} res - HTTP Response object
 * @param {NextFunction} _next - HTTP NextFunction function
 */

const getBanks = async (_req, res, _next) => {
  const payload = await getAllBanks();

  return res
    .status(httpStatus.OK)
    .json(sendResponse({ message: "success", payload, status: httpStatus.OK }));
};

module.exports = { getBanks };
