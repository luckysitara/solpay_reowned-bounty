const mongoose = require("mongoose");
const httpStatus = require("http-status");

const { Status } = require("../../utiles/typings");
const APIError = require("../../utiles/api.error");
const reviewModel = require("../../models/reviewModel");
const authOrderModel = require("../../models/authOrder");
const productModel = require("../../models/productModel");
const { getSession } = require("../../utiles/use_session");
const categoryModel = require("../../models/categoryModel");
const { sendResponse } = require("../../utiles/send_response");
const calculateShippingDistance = require("../../utiles/calculate_shipping_distance");

class homeControllers {
  /**
   * Route: POST: /product/add-to-card
   * @async
   * @method getCategories
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof homeControllers
   */
  getCategories = async (_req, res, next) => {
    try {
      const categories = await categoryModel.find({});

      if (categories.length <= 0) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Empty categories",
        });
      }

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: categories, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };
  // end method

  /**
   * Route: POST: /product/search
   * @async
   * @method searchProducts
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof homeControllers
   */
  searchProducts = async (req, res, next) => {
    try {
      const { key_word } = req.body;

      const products = await productModel.paginate(
        {
          $text: {
            $search: key_word,
            $language: "english",
            $caseSensitive: false,
            $diacriticSensitive: false,
          },
        },
        {
          ...req.query,
          lean: true,
          sort: { created_at: "desc" },
        }
      );

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: products, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /product/search
   * @async
   * @method getTopSellingItems
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof homeControllers
   */
  getTopSellingItems = async (req, res, next) => {
    try {
      const topSellingItems = await productModel.paginate(
        {},
        {
          ...req.query,
          lean: true,
          sort: { number_of_times_sold: -1 },
        }
      );

      return res
        .status(httpStatus.OK)
        .json(
          sendResponse({ message: "success", payload: topSellingItems, status: httpStatus.OK })
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /products
   * @async
   * @method getProducts
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof homeControllers
   */
  getProducts = async (req, res, next) => {
    try {
      const products = await productModel.paginate(
        {},
        {
          ...req.query,
          lean: true,
          sort: { createdAt: -1 },
        }
      );

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: products, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /products
   * @async
   * @method getVendorProducts
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof homeControllers
   */
  getVendorProducts = async (req, res, next) => {
    try {
      const product_id = new mongoose.Types.ObjectId(String(req.params.product_id));

      const product = await productModel.findOne({ _id: product_id });

      const vendorProducts = await productModel.paginate(
        { sellerId: product.sellerId, _id: { $ne: product_id } },
        {
          ...req.query,
          lean: true,
          sort: { createdAt: -1 },
        }
      );

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: vendorProducts, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /products
   * @async
   * @method getSimilarProducts
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof homeControllers
   */
  getSimilarProducts = async (req, res, next) => {
    try {
      const product_id = new mongoose.Types.ObjectId(String(req.params.product_id));

      const product = await productModel.findOne({ _id: product_id });

      const similarProducts = await productModel.paginate(
        { category: product.category, _id: { $ne: product_id } },
        {
          ...req.query,
          lean: true,
          sort: { createdAt: -1 },
        }
      );

      return res
        .status(httpStatus.OK)
        .json(
          sendResponse({ message: "success", payload: similarProducts, status: httpStatus.OK })
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /products/:productId
   * @async
   * @method getProductDetail
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof homeControllers
   */
  getProductDetail = async (req, res, next) => {
    try {
      const product_id = new mongoose.Types.ObjectId(String(req.params.product_id));

      const filter = {
        // is_deleted: false,
        // status: Status.APPROVED,
        _id: product_id,
      };

      const seller = productModel.findOne(filter);

      const positiveThreshold = 3;

      const [totalFeedbacks, totalItemsSold, totalOrdersReceived, positiveFeedbacks] =
        await Promise.all([
          reviewModel.countDocuments({ product_id }),

          authOrderModel.countDocuments({
            sellerId: seller.sellerId,
            delivery_status: Status.DELIVERED,
          }),

          authOrderModel.countDocuments({ sellerId: seller.sellerId }),

          reviewModel.countDocuments({
            product_id,
            rating: { $gte: positiveThreshold },
          }),
        ]);

      // Calculate the positive feedback percentage
      const positiveFeedbackRate =
        totalFeedbacks > 0 ? ((positiveFeedbacks / totalFeedbacks) * 100).toFixed(1) : 0;

      const ordersFulfilledOnTime = totalItemsSold + totalFeedbacks;

      let fulfillmentPercentage = (ordersFulfilledOnTime / totalOrdersReceived) * 100;

      let orderFulfillmentRating = Math.max(
        1,
        Math.min(5, Math.ceil((fulfillmentPercentage / 100) * 5))
      );

      const [product] = await productModel
        .aggregate()
        .match(filter)
        .lookup({
          from: "sellers",
          as: "seller",
          foreignField: "_id",
          localField: "sellerId",
          pipeline: [
            {
              $project: {
                _id: 1,
                state: 1,
                country: 1,
                address: 1,
                full_name: 1,
                store_name: 1,
                description: 1,
              },
            },
          ],
        })
        .unwind("seller")
        .project({ __v: 0 });

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "success",
          status: httpStatus.OK,
          payload: {
            total_ratings: totalFeedbacks,
            total_items_sold: totalItemsSold,
            order_fulfillment: orderFulfillmentRating,
            positive_feedback_rate: positiveFeedbackRate,
            ...product,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /products/:productId
   * @async
   * @method getProductByPriceRange
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof homeControllers
   */

  getProductByPriceRange = async (req, res, next) => {
    try {
      const { minPrice, maxPrice } = req.body;

      const products = await productModel.paginate(
        { $and: [{ price: { $lte: maxPrice } }, { price: { $gte: minPrice } }] },
        {
          ...req.query,
          lean: true,
          sort: { created_at: "desc" },
        }
      );

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: products, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  // end method
}

module.exports = new homeControllers();
