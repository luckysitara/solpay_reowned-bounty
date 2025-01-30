const _ = require("lodash");
const httpStatus = require("http-status");

// const APIError = require("../utiles/api.error");
const SellerModel = require("../models/sellerModel");
const { getSession } = require("../utiles/use_session");
const CustomerModel = require("../models/customerModel");
const { sendResponse } = require("../utiles/send_response");
const NotificationModel = require("../models/Notification.model");
const constructPageableDocs = require("../utiles/construct_pageable_docs");
const { NotificationType, NotificationMessageType } = require("../utiles/typings");

class NotificationController {
  /**
   * Route: POST: /notification/
   * @async
   * @method sendNotificationToCustomers
   * @description view a notification
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof NotificationController
   */

  sendNotificationToCustomers = async (req, res, next) => {
    try {
      const { user_id: admin_id } = getSession();
      const { message } = req.body;

      const customers = await CustomerModel.find({
        is_deleted: false,
        is_verified: true,
        is_account_suspended: false,
      });

      const notifications = customers.map((customer) => ({
        message,
        sender_id: admin_id,
        user_id: customer._id,
        full_name: customer.full_name,
        type: NotificationType.ADMIN_MESSAGE,
        title: NotificationMessageType.ADMIN_MESSAGE,
      }));

      await NotificationModel.createNotification(notifications);

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /notification/
   * @async
   * @method sendNotificationToSellers
   * @description view a notification
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof NotificationController
   */

  sendNotificationToSellers = async (req, res, next) => {
    try {
      const { user_id: admin_id } = getSession();
      const { message } = req.body;

      const sellers = await SellerModel.find({
        is_deleted: false,
        is_verified: true,
        is_account_suspended: false,
      });

      const notifications = sellers.map((seller) => ({
        message,
        sender_id: admin_id,
        seller_id: seller._id,
        full_name: seller.full_name,
        type: NotificationType.ADMIN_MESSAGE,
        title: NotificationMessageType.ADMIN_MESSAGE,
      }));

      await NotificationModel.createNotification(notifications);

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: PUT: /notification/mark-read
   * @async
   * @method markAllNotificationsAsRead
   * @description view a notification
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof NotificationController
   */

  markAllNotificationsAsRead = async (_req, res, next) => {
    try {
      const { user_id } = getSession();

      await NotificationModel.updateMany({ user_id }, { is_seen: true });

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: PUT: /notification/mark-read/:id
   * @async
   * @method markNotificationsAsRead
   * @description view a notification
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof NotificationController
   */

  markNotificationsAsRead = async (req, res, next) => {
    try {
      const { user_id } = getSession();

      await NotificationModel.findOneAndUpdate({ _id: req.params.id, user_id }, { is_seen: true });

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /notification/
   * @async
   * @method getNotifications
   * @description view a notification
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof NotificationController
   */

  getCustomerNotifications = async (req, res, next) => {
    try {
      const { user } = getSession();

      const totalDocs = await NotificationModel.countDocuments({ user_id: user._id });

      const aggregate = await NotificationModel.aggregate()
        .match({ user_id: user._id })
        .sort({ created_At: -1 })
        .skip((Number(req.query.page) - 1) * Number(req.query.limit))
        .limit(Number(req.query.limit))
        .lookup({
          as: "customer",
          from: "customers",
          foreignField: "_id",
          localField: "user_id",
          pipeline: [
            {
              $project: {
                image_url: 1,
                full_name: 1,
              },
            },
          ],
        })
        .unwind({ path: "$user_id", preserveNullAndEmptyArrays: true })
        .lookup({
          as: "admin",
          from: "admins",
          foreignField: "_id",
          localField: "sender_id",
          pipeline: [{ $project: { _id: 0, name: 1, image: 1 } }],
        })
        .unwind({ path: "$sender_id", preserveNullAndEmptyArrays: true })
        .lookup({
          as: "seller",
          from: "sellers",
          foreignField: "_id",
          localField: "seller_id",
          pipeline: [{ $project: { store_name: 1, store_image: 1 } }],
        })
        .unwind({ path: "$seller_id", preserveNullAndEmptyArrays: true })
        .lookup({
          as: "customer_order",
          from: "customerOrders",
          foreignField: "_id",
          localField: "order_id",
          pipeline: [{ $project: { delivery_status: 1, order_status: 1, payment_status: 1 } }],
        })
        .unwind({ path: "$order_id", preserveNullAndEmptyArrays: true });

      const notifications = constructPageableDocs(aggregate, { ...req.query, count: totalDocs });

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "success",
          status: httpStatus.OK,
          payload: {
            ...notifications,
            docs: notifications.docs,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /notification/
   * @async
   * @method getNotifications
   * @description view a notification
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof NotificationController
   */

  getSellerNotifications = async (req, res, next) => {
    try {
      const { user_id } = getSession();

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const totalDocs = await NotificationModel.countDocuments({ user_id });

      const aggregate = await NotificationModel.aggregate()
        .match({ user_id })
        .sort({ created_At: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lookup({
          as: "seller",
          from: "sellers",
          foreignField: "_id",
          localField: "user_id",
          pipeline: [{ $project: { store_name: 1, store_image: 1 } }],
        })
        .unwind({ path: "$seller", preserveNullAndEmptyArrays: true })
        .lookup({
          as: "admin",
          from: "admins",
          foreignField: "_id",
          localField: "sender_id",
          pipeline: [{ $project: { _id: 0, name: 1, image: 1 } }],
        })
        .unwind({ path: "$admin", preserveNullAndEmptyArrays: true })
        .lookup({
          as: "customer",
          from: "customers",
          foreignField: "_id",
          localField: "seller_id",
          pipeline: [
            {
              $project: {
                image_url: 1,
                full_name: 1,
              },
            },
          ],
        })
        .unwind({ path: "$customer", preserveNullAndEmptyArrays: true })
        .lookup({
          as: "customer_order",
          from: "customerOrders",
          foreignField: "_id",
          localField: "order_id",
          pipeline: [{ $project: { delivery_status: 1, order_status: 1, payment_status: 1 } }],
        })
        .unwind({ path: "$customer_order", preserveNullAndEmptyArrays: true });

      const notifications = constructPageableDocs(aggregate, { ...req.query, count: totalDocs });

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "success",
          status: httpStatus.OK,
          payload: {
            ...notifications,
            docs: notifications.docs,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: Delete: /notification/
   * @async
   * @method deleteNotifications
   * @description delete a notification
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof NotificationController
   */

  deleteNotifications = async (req, res, next) => {
    try {
      const { user_id } = getSession();

      await NotificationModel.deleteMany({ user_id });

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new NotificationController();
