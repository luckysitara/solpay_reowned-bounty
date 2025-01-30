const {
  mongo: { ObjectId },
} = require("mongoose");
const mongoose = require("mongoose");
const httpStatus = require("http-status");

const APIError = require("../../utiles/api.error");
const cardModel = require("../../models/cardModel");
const { envVariables: config } = require("../../config");
const productModel = require("../../models/productModel");
const { getSession } = require("../../utiles/use_session");
const wishlistModel = require("../../models/wishlistModel");
const { sendResponse } = require("../../utiles/send_response");
const NotificationModel = require("../../models/Notification.model");
const { cryptoRandomString } = require("../../utiles/cryptoRandomString");
const calculateTotalAmount = require("../../utiles/calculateTotalAmount");
const constructPageableDocs = require("../../utiles/construct_pageable_docs");
const { NotificationType, NotificationMessageType } = require("../../utiles/typings");

class CartController {
  /**
   * Route: POST: /product/add-to-cart
   * @async
   * @method addToCart
   * @description Add product to cart
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CartController
   */

  addToCart = async (req, res, next) => {
    const { user } = getSession();
    try {
      const { productId, quantity } = req.body;

      const product = await productModel.findById(productId).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid Request",
        })
      );

      const productExist = await cardModel.findOne({ productId, userId: user._id });

      if (productExist) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Product Already Added To Cart",
        });
      }

      const cartProduct = await cardModel.create({
        quantity,
        productId,
        userId: user._id,
      });

      return res
        .status(httpStatus.CREATED)
        .json(
          sendResponse({ message: "success", payload: cartProduct, status: httpStatus.CREATED })
        );
    } catch (error) {
      next(error);
    }
  };
  // End Method

  /**
   * Route: GET: /product/get-cart-products
   * @async
   * @method getCartProducts
   * @description Get cart products
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CartController
   */

  getCartProducts = async (req, res, next) => {
    try {
      const { user } = getSession();

      const totalDocs = await cardModel.countDocuments({
        userId: user._id,
        is_deleted: false,
      });

      const aggregate = await cardModel.aggregate([
        {
          $match: {
            userId: user._id,
            is_deleted: false,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
      ]);

      const card_products = constructPageableDocs(aggregate, { ...req.query, count: totalDocs });

      const { totalAmount, outOfStockItems } = calculateTotalAmount(card_products);

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "success",
          status: httpStatus.OK,
          payload: {
            ...card_products,
            docs: card_products.docs.map((doc) => ({
              ...doc,
              price: totalAmount,
              shipping_fee: 20 * totalDocs,
              out_of_stock_product: outOfStockItems,
            })),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };
  // End Method

  /**
   * Route: DELETE: /product/delete-cart-product/:card_id
   * @async
   * @method deleteCartProduct
   * @description Delete cart product
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CartController
   */

  deleteCartProduct = async (req, res, next) => {
    try {
      const { cart_id } = req.params;

      await cardModel
        .findByIdAndUpdate(cart_id, { is_deleted: true })
        .orFail(
          new APIError({
            status: httpStatus.BAD_REQUEST,
            message: "cannot delete product",
          })
        );
      return res
        .status(httpStatus.OK)
        .json(sendResponse({ status: httpStatus.OK, message: "Product Removed Successfully" }));
    } catch (error) {
      next(error);
    }
  };
  // End Method

  /**
   * Route: PUT: /product/quantity-inc/:card_id
   * @async
   * @method increaseQuantity
   * @description Increase product quantity in cart
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CartController
   */

  increaseQuantity = async (req, res, next) => {
    try {
      const { card_id } = req.params;

      const product = await cardModel.findByIdAndUpdate(
        card_id,
        { $inc: { quantity: 1 } },
        { new: true }
      ).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid request",
        })
      );
      return res
        .status(httpStatus.OK)
        .json(sendResponse({ status: httpStatus.OK, message: "Quantity updated" }));
    } catch (error) {
      next(error);
    }
  };
  // End Method

  /**
   * Route: PUT: /product/quantity-dec/:card_id
   * @async
   * @method decreaseQuantity
   * @description Decrease product quantity in cart
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CartController
   */

  decreaseQuantity = async (req, res, next) => {
    try {
      const { card_id } = req.params;

      const product = await cardModel.findByIdAndUpdate(
        card_id,
        { $inc: { quantity: -1 } },
        { new: true }
      ).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid request",
        })
      );
      return res
        .status(httpStatus.OK)
        .json(sendResponse({ status: httpStatus.OK, message: "Quantity updated" }));
    } catch (error) {
      next(error);
    }
  };
  // End Method

  /**
   * Route: PUT: /product/add-to-wishlist
   * @async
   * @method addToWishlist
   * @description Add product to wishlist
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CartController
   */

  addToWishlist = async (req, res, next) => {
    try {
      const { user } = getSession();
      const { slug, productId, quantity } = req.body;

      const product = await productModel.findById(productId).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid Request",
        })
      );

      const productExist = await wishlistModel.findOne({ slug, is_deleted: false });

      if (productExist) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Product Is Already In Wishlist",
        });
      }

      const newWishListItem = await wishlistModel.create({
        slug,
        quantity,
        user_id: user._id,
        product_id: product._id,
      });

      return res.status(httpStatus.OK).json(
        sendResponse({
          status: httpStatus.OK,
          payload: newWishListItem,
          message: "Product Added to Wishlist",
        })
      );
    } catch (error) {
      next(error);
    }
  };
  // End Method

  /**
   * Route: GET: /product/get-wishlist-products
   * @async
   * @method getWishlist
   * @description Get wishlist products
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CartController
   */

  getWishlist = async (req, res, next) => {
    try {
      const { user } = getSession();

      const user_id = new mongoose.Types.ObjectId(user._id);

      const totalDocs = await wishlistModel.countDocuments({ user_id, is_deleted: false });

      const aggregate = await wishlistModel
        .aggregate()
        .match({ user_id, is_deleted: false })
        .lookup({
          from: "products",
          as: "product",
          foreignField: "_id",
          localField: "product_id",
        })
        .unwind({ path: "$product", preserveNullAndEmptyArrays: true })
        .match({ product: { $ne: null } })
        .project({ __v: 0 });

      const wishlistItems = constructPageableDocs(aggregate, { ...req.query, count: totalDocs });

      const { totalAmount, outOfStockItems } = calculateTotalAmount(wishlistItems);

      return res.status(httpStatus.CREATED).json(
        sendResponse({
          message: "success",
          status: httpStatus.OK,
          payload: {
            ...wishlistItems,
            docs: wishlistItems.docs.map((doc) => ({
              ...doc,
              price: totalAmount,
              shipping_fee: 20 * totalDocs,
              out_of_stock_product: outOfStockItems,
            })),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };
  // End Method

  /**
   * Route: DELETE: /product/remove-wishlist-product/:wishlistId
   * @async
   * @method removeWishlist
   * @description Remove product from wishlist
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CartController
   */

  removeWishlist = async (req, res, next) => {
    try {
      const { wishlistId } = req.params;

      await wishlistModel
        .findByIdAndUpdate(wishlistId, { is_deleted: true })
        .orFail(
          new APIError({
            status: httpStatus.BAD_REQUEST,
            message: "Cannot delete item from wishlist",
          })
        );

      return res.status(httpStatus.OK).json(
        sendResponse({
          status: httpStatus.OK,
          message: "Product removed from Wishlist",
        })
      );
    } catch (error) {
      next(error);
    }
  };
  // End Method

  /**
   * Route: PUT: /product/generate-wishlist-share-link
   * @async
   * @method generateWishListShareLink
   * @description Generate wishlist share link
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CartController
   */

  generateWishListShareLink = async (_req, res, next) => {
    try {
      const { user } = getSession();

      const wishlist = await wishlistModel.find({ is_deleted: false, user_id: user._id });

      const generalLinkId = await cryptoRandomString(11);
      const generalShareLink = `${config.PALPARCEL_USER_PORTAL_CLIENT}/wish-list/${generalLinkId}`;

      const updates = wishlist.map(async (list) => {
        const itemLinkId = await cryptoRandomString(11);

        const itemShareLink = `${config.PALPARCEL_USER_PORTAL_CLIENT}/wish-list/item/${itemLinkId}`;

        return {
          updateOne: {
            filter: { _id: list._id },
            update: {
              item_link_id: itemLinkId,
              item_share_link: itemShareLink,
              general_link_id: generalLinkId,
              general_share_link: generalShareLink,
            },
          },
          itemShareLink: {
            id: list._id,
            slug: list.slug,
            link: itemShareLink,
          },
        };
      });

      const bulkOperations = await Promise.all(updates);

      const itemShareLinks = bulkOperations.map((op) => op.itemShareLink);

      await wishlistModel.bulkWrite(bulkOperations.map((op) => op.updateOne));

      return res.status(httpStatus.OK).json(
        sendResponse({
          status: httpStatus.OK,
          message: "Links generated successfully",
          payload: { generalShareLink, itemShareLinks },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /product/view-wishlist
   * @async
   * @method viewWishList
   * @description View wishlist
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CartController
   */

  viewWishList = async (req, res, next) => {
    try {
      const { link_id } = req.body;

      const filter = {
        is_deleted: false,
        $or: [{ general_link_id: link_id }, { item_link_id: link_id }],
      };

      const totalDocs = await wishlistModel.countDocuments(filter);

      const aggregate = await wishlistModel
        .aggregate()
        .match(filter)
        .lookup({
          from: "products",
          as: "product",
          foreignField: "_id",
          localField: "product_id",
        })
        .unwind({ path: "$product", preserveNullAndEmptyArrays: true })
        .match({ product: { $ne: null } })
        .project({ __v: 0 });

      const wishlistItems = constructPageableDocs(aggregate, { ...req.query, count: totalDocs });

      const { totalAmount, outOfStockItems } = calculateTotalAmount(wishlistItems);

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "success",
          status: httpStatus.OK,
          payload: {
            ...wishlistItems,
            docs: wishlistItems.docs.map((doc) => ({
              ...doc,
              total_price: totalAmount,
              out_of_stock_product: outOfStockItems,
            })),
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: PUT: /product/accept-wishlist-items
   * @async
   * @method acceptWishListItems
   * @description Accept wishlist items
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CartController
   */

  acceptWishListItems = async (req, res, next) => {
    try {
      const { link_id } = req.body;

      const wishlist = await wishlistModel
        .findOne({ item_link_id: link_id, is_deleted: false })
        .orFail(
          new APIError({
            status: httpStatus.BAD_REQUEST,
            message: "Item does not exist",
          })
        );

      const product = await productModel.findById(wishlist.product_id).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Invalid Request",
        })
      );

      const productExist = await cardModel.findOne({ productId: product._id });

      if (productExist) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Product Already Added To Cart",
        });
      }

      const cartProduct = await cardModel.create({
        productId: product._id,
        userId: wishlist.user_id,
        quantity: wishlist.quantity,
      });

      const payload = {
        user_id: wishlist.user_id,
        type: NotificationType.WISH_LIST_ACCEPTED,
        message: "Your wish list item has been accepted",
        title: NotificationMessageType.WISH_LIST_ACCEPTED,
      };

      await NotificationModel.createNotification(payload);

      return res.status(httpStatus.CREATED).json(
        sendResponse({
          payload: cartProduct,
          status: httpStatus.OK,
          message: "Wish List item Added To Cart",
        })
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CartController();