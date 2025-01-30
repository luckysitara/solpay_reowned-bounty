const _ = require("lodash");
const httpStatus = require("http-status");

const APIError = require("../../utiles/api.error");
const EmailTemplate = require("../../template/index");
const EmailService = require("../../service/email.service");
const { sendResponse } = require("../../utiles/send_response");
const WaitingListModel = require("../../models/waitinglist.model");

class WaitListController {
  /**
   * Route: POST: /waiting_list/signup
   * @async
   * @method joinAwaitingList
   * @description signup customers account
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof WaitListController
   */
  joinAwaitingList = async (req, res, next) => {
    try {
      const { email_address, full_name } = req.body;

      let user = await WaitingListModel.findOne({ email_address });

      if (user) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "You have joined our waiting List Already",
        });
      }

      user = await WaitingListModel.create({ ...req.body });

      EmailService.sendMail({
        to: email_address,
        subject: "Welcome to the Palparcel Vendor Family!",
        html: EmailTemplate.joinedWaitingListMessage(full_name),
      });

      return res.status(httpStatus.CREATED).json(
        sendResponse({
          payload: user,
          status: httpStatus.CREATED,
          message: "Successfully joined our waiting list",
        })
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new WaitListController();
