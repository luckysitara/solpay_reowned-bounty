const mongoose = require("mongoose");
const httpStatus = require("http-status");

const { Status } = require("../../utiles/typings");
const APIError = require("../../utiles/api.error");
const CartModel = require("../../models/cardModel");
const SellerOrderModel = require("../../models/authOrder");
const { getSession } = require("../../utiles/use_session");
const CustomerModel = require("../../models/customerModel");
const { sendResponse } = require("../../utiles/send_response");
const CustomerOrderModel = require("../../models/customerOrder");
const { generateTrackingId } = require("../../utiles/generate_otp");

class CustomerOrderController {
  /**
   * Route: GET: /orders/users
   * @async
   * @method searchPickupLocation
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerOrderController
   */
  searchPickupLocation = async (req, res, next) => {
    try {
      const users = await CustomerModel.paginate(
        { is_deleted: false, is_verified: true },
        {
          ...req.query,
          lean: true,
          select: "full_name shipping_address -password -_id",
          limit: 400,
        }
      );

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: users, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /orders
   * @async
   * @method getOrders
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerOrderController
   */
  getOrders = async (req, res, next) => {
    try {
      const { user_id } = getSession();

      const order_history = await CustomerOrderModel.paginate(
        { is_deleted: false, customerId: user_id },
        {
          ...req.query,
          lean: true,
          sort: { createdAt: -1 },
        }
      );

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: order_history, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: PUT: /orders/:order_id
   * @async
   * @method cancelOrder
   * @description cancel an order
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerOrderController
   */
  cancelOrder = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const order_id = new mongoose.Types.ObjectId(req.params.order_id);
      const customerOrder = await CustomerOrderModel.findOneAndUpdate(
        {
          _id: order_id,
          is_deleted: false,
          customerId: user_id,
          delivery_status: Status.PENDING,
        },
        { order_status: Status.CANCELLED },
        { new: true }
      ).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Cannot cancel order",
        })
      );

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: customerOrder, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: DELETE: /orders/:order_id
   * @async
   * @method deleteOrder
   * @description cancel an order
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerOrderController
   */
  deleteOrder = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const order_id = new mongoose.Types.ObjectId(req.params.order_id);
      const deletedOrder = await CustomerOrderModel.findOneAndUpdate(
        {
          _id: order_id,
          is_deleted: false,
          customerId: user_id,
          delivery_status: { $nin: [Status.SHIPPED, Status.DELIVERED] },
        },
        { is_deleted: true },
        { new: true }
      ).orFail(
        new APIError({
          status: httpStatus.BAD_REQUEST,
          message: "Cannot delete order",
        })
      );

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: deletedOrder, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /orders/
   * @async
   * @method createOrder
   * @description cancel an order
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof CustomerOrderController
   */
  createOrder = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const userId = new mongoose.Types.ObjectId(user_id);
      const { shipping_fee, shipping_address, delivery_option } = req.body;

      if (!shipping_fee || !delivery_option || isNaN(parseFloat(shipping_fee))) {
        throw new Error("Invalid or missing shipping fee");
      }

      const cartItems = await CartModel.aggregate()
        .match({ userId, is_deleted: false })
        .lookup({
          from: "products",
          as: "product",
          foreignField: "_id",
          localField: "productId",
          pipeline: [
            {
              $addFields: {
                stockAsNumber: { $toDouble: "$stock" },
              },
            },
            {
              $match: {
                stockAsNumber: { $gt: 0 }, // Filter out products with stock value 0
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                price: 1,
                stock: 1,
                images: 1,
                discount: 1,
                shopName: 1,
                sellerId: 1,
              },
            },
          ],
        })
        .unwind({ path: "$product", preserveNullAndEmptyArrays: true })
        .match({ product: { $ne: null } })
        .project({ __v: 0 });

      if (cartItems.length === 0) {
        throw new Error("No items found in the cart");
      }

      const totalAmount =
        cartItems.reduce((total, item) => {
          const product = item.product;

          const productPrice = parseFloat(product.price);

          if (isNaN(productPrice)) {
            throw new Error(`Invalid price for product`);
          }

          const discountPrice =
            productPrice - (productPrice * (parseFloat(product.discount) || 0)) / 100;
          return total + discountPrice * item.quantity;
        }, 0) + parseFloat(shipping_fee);

      const products = cartItems.map((item) => {
        const productPrice = parseFloat(item.product.price);
        const discountPrice =
          productPrice - (productPrice * (parseFloat(item.product.discount) || 0)) / 100;
        return {
          productId: item.productId,
          quantity: item.quantity,
          image: item.product.images[0],
          shope_name: item.product.shopName,
          price: isNaN(discountPrice) ? 0 : discountPrice,
        };
      });

      const tracking_id = generateTrackingId();

      // Create customer order
      const customerOrderPayload = {
        tracking_id,
        shipping_fee,
        delivery_option,
        customerId: userId,
        price: totalAmount,
        payment_status: Status.PENDING,
        shippingInfo: shipping_address,
        date: new Date().toISOString(),
        products,
      };
      const customerOrder = await CustomerOrderModel.create(customerOrderPayload);

      // Group cart items by sellerId
      const sellerOrdersPayload = Object.values(
        cartItems.reduce((acc, item) => {
          const sellerId = item.product.sellerId;
          if (!acc[sellerId]) {
            acc[sellerId] = {
              sellerId,
              price: 0,
              tracking_id,
              shipping_fee,
              delivery_option,
              orderId: customerOrder._id,
              payment_status: Status.PENDING,
              shippingInfo: shipping_address,
              date: new Date().toISOString(),
              products: [],
            };
          }
          const productPrice = parseFloat(item.product.price);
          const discountPrice =
            productPrice - (productPrice * (parseFloat(item.product.discount) || 0)) / 100;
          acc[sellerId].products.push({
            productId: item.productId,
            image: item.product.images[0],
            shope_name: item.product.shopName,
            quantity: parseInt(item.quantity),
            price: isNaN(discountPrice) ? 0 : discountPrice,
          });
          acc[sellerId].price += discountPrice * item.quantity;
          return acc;
        }, {})
      );

      await Promise.all([SellerOrderModel.insertMany(sellerOrdersPayload)]);

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Order created successfully",
          status: httpStatus.OK,
          payload: { customerOrder },
        })
      );
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CustomerOrderController();
