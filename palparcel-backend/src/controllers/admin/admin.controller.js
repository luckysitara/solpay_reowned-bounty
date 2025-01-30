const httpStatus = require("http-status");
const APIError = require("../../utiles/api.error");
const { sendResponse } = require("../../utiles/send_response");
const myShopWallet = require("../../models/myShopWallet");
const productModel = require("../../models/productModel");
const customerOrder = require("../../models/customerOrder");
const sellerModel = require("../../models/sellerModel");
const authOrder = require("../../models/authOrder");
const customerModel = require("../../models/customerModel");
const {
  mongo: { ObjectId },
} = require("mongoose");
const { getSession } = require("../../utiles/use_session");

class AdminController {
  /**
   * Route: GET: /dashboard/admin
   * @async
   * @method get_admin_dashboard_data
   * @description get dashboard data
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof AdminController
   */
  get_admin_dashboard_data = async (req, res, next) => {
    try {
      const { user } = getSession(req);

      if (!user || user.role !== "admin") {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Access Denied",
        });
      }

      const adminId = user._id;

      const transactionValue = await myShopWallet.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      const totalRevenue = transactionValue.length > 0 ? transactionValue[0].totalAmount : 0;

      const totalPlatformFee = await myShopWallet.aggregate([
        { $group: { _id: null, total: { $sum: "$platformFee" } } },
      ]);

      const totalCharges = await myShopWallet.aggregate([
        { $group: { _id: null, total: { $sum: "$charges" } } },
      ]);

      const deliveredProducts = await authOrder.countDocuments({
        delivery_status: "DELIVERED",
      });

      const cancelledProducts = await authOrder.countDocuments({
        delivery_status: "CANCELLED",
      });

      const totalProduct = await productModel.countDocuments({});
      const totalUsers = await customerModel.countDocuments({});
      const totalOrder = await customerOrder.countDocuments({});
      const totalSeller = await sellerModel.countDocuments({});

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Dashboard data fetched successfully",
          payload: {
            adminId,
            totalProduct,
            totalOrder,
            totalSeller,
            totalUsers,
            deliveredProducts,
            cancelledProducts,
            totalRevenue,
            totalPlatformFee: totalPlatformFee.length > 0 ? totalPlatformFee[0].total : 0,
            totalCharges: totalCharges.length > 0 ? totalCharges[0].total : 0,
            transactionValue: totalRevenue,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /transaction-metrics/admin
   * @async
   * @method get_admin_transaction_metrics
   * @description get transaction metrics
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof AdminController
   */
  get_admin_transaction_metrics = async (req, res, next) => {
    try {
      const { user } = getSession(req);

      if (!user || user.role !== "admin") {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Access Denied",
        });
      }

      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({ error: "Month and year are required" });
      }

      const parsedMonth = parseInt(month, 10) - 1;
      const parsedYear = parseInt(year, 10);

      if (isNaN(parsedMonth) || isNaN(parsedYear) || parsedMonth < 0 || parsedMonth > 11) {
        return res.status(400).json({ error: "Invalid month or year" });
      }

      const startOfMonth = new Date(parsedYear, parsedMonth, 1);
      const startOfNextMonth = new Date(parsedYear, parsedMonth + 1, 1);

      const dateFilter = { $gte: startOfMonth, $lt: startOfNextMonth };

      const totalPlatformFee = await myShopWallet.aggregate([
        { $match: { createdAt: dateFilter } },
        { $group: { _id: null, total: { $sum: "$platformFee" } } },
      ]);

      const totalCharges = await myShopWallet.aggregate([
        { $match: { createdAt: dateFilter } },
        { $group: { _id: null, total: { $sum: "$charges" } } },
      ]);

      const totalOrder = await customerOrder.countDocuments({
        createdAt: dateFilter,
      });

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Dashboard data fetched successfully",
          payload: {
            adminId: user._id,
            totalOrder,
            totalPlatformFee: totalPlatformFee.length > 0 ? totalPlatformFee[0].total : 0,
            totalCharges: totalCharges.length > 0 ? totalCharges[0].total : 0,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /top-vendors/admin
   * @async
   * @method get_top_vendors
   * @description get top vendors
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof AdminController
   */
  get_top_vendors = async (req, res, next) => {
    try {
      const { category } = req.params;
      const limit = Number(req.query.limit) || 10;

      const topVendors = await productModel.aggregate([
        { $match: { category: category } },
        {
          $group: {
            _id: "$sellerId",
            totalSold: { $sum: "$number_of_times_sold" },
            sellerName: { $first: "$vendor_name" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
      ]);

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Data fetched successfully",
          payload: {
            topVendors,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /product-status/admin
   * @async
   * @method get_product_status
   * @description get product status
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof AdminController
   */
  get_product_status = async (req, res, next) => {
    try {
      const counts = await productModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const statusCounts = counts.reduce(
        (acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        },
        {
          APPROVED: 0,
          PENDING: 0,
          REJECTED: 0,
        }
      );

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: " Data fetched successfully",
          payload: {
            statusCounts,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  // VENDOR MANAGEMENT
  /**
   * Route: GET: /Vendors/admin
   * @async
   * @method get_all_vendors
   * @description get vendors
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof AdminController
   */

  get_vendors = async (req, res, next) => {
    try {
      const { role } = getSession();

      if (role !== "admin") {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Access Denied",
        });
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const allSellers = await sellerModel
        .find({ is_deleted: false })
        .select("full_name email country status is_verified is_account_suspended")
        .sort({ dateSubmitted: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const verifiedSellers = allSellers.filter((seller) => seller.is_verified);
      const unverifiedSellers = allSellers.filter((seller) => !seller.is_verified);
      const suspendedSellers = allSellers.filter((seller) => seller.is_account_suspended);

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Success",
          payload: {
            all_sellers: allSellers,
            verified_sellers: verifiedSellers,
            unverified_sellers: unverifiedSellers,
            suspended_sellers: suspendedSellers,
            currentPage: page,
            total: await sellerModel.countDocuments(),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  // PRODUCT APPROVAL
  /**
   * Route: GET: /Products/admin
   * @async
   * @method product_approval
   * @description get all product for approval
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof AdminController
   */
   get_and_approve_awaiting_products = async (req, res, next) => {
    try {
      const { role } = getSession(req);

      if (role !== "admin") {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Access Denied",
        });
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const products = await productModel
      .find({ isSentForApproval: true })
      .select("images[0] name price quantity status isSentForApproval")
      .sort({ dateSubmitted: -1 })
      .skip((page - 1) * limit)
      .limit(limit);;

      if (products.length === 0) {
        throw new APIError({
          status: httpStatus.NOT_FOUND,
          message: "No product found",
        });
      }


      const approvedProducts = products.filter(
        (product) => product.status === "APPROVED"
      );
      const pendingProducts = products.filter(
        (product) => product.status === "PENDING"
      );
      const rejectedProducts = products.filter(
        (product) => product.status === "REJECTED"
      );

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Products fetched and processed successfully",
          payload: {
            products,
            approvedProducts,
            pendingProducts,
            rejectedProducts,
            currentPage: page,
            totalProduct: await productModel.countDocuments(),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

/**
   * Route: POST: /Products/admin
   * @async
   * @method approve_products
   * @description approve product
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof AdminController
   */
 approve_products = async (req, res, next) => {
  try {
    const { role } = getSession(req);

    if (role !== "admin") {
      throw new APIError({
        status: httpStatus.FORBIDDEN,
        message: "Access Denied",
      });
    }

    const { id } = req.params;
    const { status } = req.body

    const product = await productModel.findOneAndUpdate(
      { _id: id, isSentForApproval: true },
      { status },
      { new: true }
    );

    if (!product) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Product not found or not sent for approval",
      });
    }

    return res.status(httpStatus.OK).json(
      sendResponse({
        message: "Product approved successfully",
        payload: {
          product,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

}

module.exports = new AdminController();
