const { sendResponse } = require("../../../utiles/send_response");
const commentModel = require("../../../models/comment.model");
const {
  mongo: { ObjectId },
} = require("mongoose");
const { getSession } = require("../../../utiles/use_session");
const dayjs = require("dayjs");
const httpStatus = require("http-status");

class commentController {
  /**
   * Route: POST: /comment/
   * @async
   * @method createComment
   * @description create a comment
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CommentController
   */

  createComment = async (req, res, next) => {
    try {
      const { vendor_id } = getSession();
      const { content } = req.body;
      const product_id = req.params.product_id;

      const comment = new commentModel({
        product_id,
        vendor_id,
        content,
        created_at: dayjs().toISOString(),
      });
      await comment.save();

      return res
        .status(httpStatus.CREATED)
        .json(sendResponse({
          message: "Comment created successfully",
          payload: {
            comment
          }
        }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /comment/
   * @async
   * @method getComment
   * @description fetch all comments
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CommentController
   */

  getAllComments = async (req, res, next) => {
    try {
      const { product_id } = req.params;
      const comments = await commentModel.find({ product_id });
      return res
      .status(httpStatus.OK)
      .json(sendResponse({
        message: "Comments fetched successfully",
        payload: {
          comments
        }
      }))
    } catch (error) {
      next(error);
    }
  };

  getUnseenComments = async (req, res, next) => {
    try {
      const { product_id } = req.params;
      const comments = await commentModel.find({ product_id, is_seen: false });
      responseReturn(res, 200, {
        message: "Unseen comments fetched successfully",
        data: {
          comments,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  readComment = async (req, res, next) => {
    try {
      const { vendor_id } = getSession();
      const comment = await commentModel.findOneAndUpdate(
        { _id: req.params.id, vendor_id },
        { is_seen: true, seen_at: dayjs().toISOString() },
        { new: true }
      );
      responseReturn(res, 200, {
        message: "Comment marked as seen",
        data: {
          comment,
        },
      });
    } catch (error) {
      next(error);
    }
  };

    /**
   * Route: PATCH: /comment/
   * @async
   * @method hideComment
   * @description hide a comment
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CommentController
   */

  hideComment = async (req, res, next) => {
    try {
      const comment = await commentModel.findByIdAndUpdate(
        req.params.commentId,
        { isHidden: true },
        { new: true }
      );
      return res
      .status(httpStatus.OK)
      .json(sendResponse({
        message: "Comments hidden successfully",
        payload: {
          comment
        }
      }))
    } catch (error) {
      next(error);
    }
  };

   /**
   * Route: PUT: /comment/
   * @async
   * @method updateComment
   * @description update a comment
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CommentController
   */
  updateComment = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const comment = await commentModel.findByIdAndUpdate(
        commentId,
        { content, updated_at: dayjs().toISOString() },
        { new: true }
      );
      return res
      .status(httpStatus.OK)
      .json(sendResponse({
        message: "Comments updated successfully",
        payload: {
          comment
        }
      }))
    } catch (error) {
      next(error);
    }
  };

   /**
   * Route: POST: /comment/
   * @async
   * @method replyComment
   * @description reply a comment
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CommentController
   */
  replyToComment = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const { response } = req.body;
      const comment = await commentModel.findByIdAndUpdate(
        commentId,
        { response, replied_at: dayjs().toISOString() },
        { new: true }
      );
      return res
      .status(httpStatus.OK)
      .json(sendResponse({
        message: "Success",
        payload: {
          comment
        }
      }))
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: DELETE: /comment/
   * @async
   * @method deleteComment
   * @description delete a comment
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CommentController
   */
  deleteComment = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      await commentModel.findByIdAndDelete(commentId);
      return res
      .status(httpStatus.OK)
      .json(sendResponse({
        message: "Comment deleted successfully",
      }))
    } catch (error) {
      next(error);
    }
  };
}


module.exports = new commentController();
