const httpStatus = require("http-status");
const complainModel = require("../../models/complaintModel");
const APIError = require("../../utiles/api.error");
const { sendResponse } = require("../../utiles/send_response");
const {
  mongo: { ObjectId },
  mongo,
} = require("mongoose");
const { getSession } = require("../../utiles/use_session");

class ComplaintController {
  /**
   * Route: POST: /complains/
   * @async
   * @method createComplains
   * @description create complain
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof ComplaintController
   */

  create_complain = async (req, res, next) => {
    try {
      const { user_id, seller_id } = getSession();

      const complaintData = {
        ...req.body,
        userId: user_id,
        sellerId: seller_id,
      };

      const complaint = new complainModel(complaintData);
      await complaint.save();

      return res.status(httpStatus.CREATED).json(
        sendResponse({
          message: "Complaints created successfully",
          payload: {
            complaint,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /complains/
   * @async
   * @method createComplains
   * @description fetch all complains
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof ComplaintController
   */
  get_complain = async (req, res, next) => {
    try {
      const { role } = getSession();

      if (role !== "admin") {
        return res.status(httpStatus.FORBIDDEN).json(
          sendResponse({
            message: "Unauthorized access",
            payload: null,
          })
        );
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 4;

      const complaints = await complainModel
        .find()
        .populate({
          path: "sellerId",
          select: "full_name",
        })
        .sort({ dateSubmitted: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Complaints retrieved successfully",
          payload: {
            complaints,
            currentPage: page,
            totalComplaints: await complainModel.countDocuments(),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: PUT: /complains/
   * @async
   * @method createComplains
   * @description respond to complains
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof ComplaintController
   */
  admin_response = async (req, res, next) => {
    try {
      const { role } = getSession();
      const { id } = req.params;
      const { adminResponse } = req.body;

      if (role !== "admin") {
        return res.status(httpStatus.UNAUTHORIZED).json(
          sendResponse({
            message: "Unauthorized access",
            payload: null,
          })
        );
      }

      const complaint = await complainModel.findOneAndUpdate(
        { _id: id },
        { adminResponse, status: "resolved" },
        { new: true }
      );
      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Updated successfully",
          payload: {
            complaint,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ComplaintController();
