const mongoose = require("mongoose");
const httpStatus = require("http-status");

const APIError = require("../../utiles/api.error");
const reviewModel = require("../../models/reviewModel");
const productModel = require("../../models/productModel");
const { getSession } = require("../../utiles/use_session");
const { sendResponse } = require("../../utiles/send_response");
const dayjs = require("dayjs");

class reviewControllers {
  /**
   * Route: POST: /review/:product_id
   * @async
   * @method submitProductReview
   * @description add product review
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof homeControllers
   */

  submitProductReview = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const { rating, ...rest } = req.body;
      const product_id = req.params.product_id;

      const hasReviewedProduct = await reviewModel.findOne({ user_id, product_id });

      if (hasReviewedProduct) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "You have submitted your Review for this product",
        });
      }

      const reviewedProduct = await reviewModel.create({
        ...rest,
        rating,
        user_id,
        product_id,
      });

      const reviews = await reviewModel.find({ product_id });

      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);

      const productRating = reviews.length ? (totalRating / reviews.length).toFixed(1) : rating;

      await productModel.findOneAndUpdate({ _id: product_id }, { rating: productRating });

      return res
        .status(httpStatus.CREATED)
        .json(
          sendResponse({ message: "success", payload: reviewedProduct, status: httpStatus.CREATED })
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /review/:product_id
   * @async
   * @method getProductReviews
   * @description fetch all submitted reviews for a product
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof homeControllers
   */

  getProductReviews = async (req, res, next) => {
    try {
      try {
        const product_id = new mongoose.Types.ObjectId(String(req.params.product_id));

        const getRating = await reviewModel.aggregate([
          {
            $match: { product_id },
          },
          {
            $group: {
              _id: "$rating",
              count: { $sum: 1 },
            },
          },
        ]);

        const ratingMap = getRating.reduce((acc, { _id, count }) => {
          acc[_id] = count;
          return acc;
        }, {});

        const rating_review = [5, 4, 3, 2, 1].map((rating) => ({
          rating,
          sum: ratingMap[rating] || 0,
        }));

        const totalReview = await reviewModel.countDocuments({ product_id });

        const reviews = await reviewModel.paginate(
          {},
          {
            ...req.query,
            lean: true,
            sort: { createdAt: -1 },
          }
        );

        return res.status(httpStatus.OK).json(
          sendResponse({
            message: "success",
            payload: {
              totalReview,
              rating_review,
              customer_reviews: reviews.docs,
              ...reviews,
            },
            status: httpStatus.OK,
          })
        );
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /review/
   * @async
   * @method replyReview
   * @description reply a review
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof ReviewController
   */
  reply_review = async (req, res, next) => {
    try {
      const { review_id } = req.params;
      const { response } = req.body;

      const review = await reviewModel.findOne(review_id);
      if (!review) {
        return res.status(httpStatus.NOT_FOUND).json(
          sendResponse({
            message: "Review not found",
          })
        );
      }

      review.response = response;
      review.replied_at = dayjs().toISOString();
      await review.save({ validateBeforeSave: false });

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Success",
          payload: { review },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  // end method
}

module.exports = new reviewControllers();
