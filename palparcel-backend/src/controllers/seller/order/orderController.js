const mongoose = require("mongoose");

const authOrderModel = require("../../../models/authOrder");
const customerOrder = require("../../../models/customerOrder");
const myShopWallet = require("../../../models/myShopWallet");
const sellerWallet = require("../../../models/sellerWallet");
const SellerOrderModel = require("../../../models/authOrder");
const Refund = require("../../../models/refund.model");
const Product = require("../../../models/productModel");
const { getSession } = require("../../../utiles/use_session");

const cardModel = require("../../../models/cardModel");
const moment = require("moment");
const { responseReturn } = require("../../../utiles/response");
const httpStatus = require("http-status");
const { sendResponse } = require("../../../utiles/send_response");
const {
  mongo: { ObjectId },
} = require("mongoose");
const constructPageableDocs = require("../../../utiles/construct_pageable_docs");
const stripe = require("stripe")(
  "sk_test_51Oml5cGAwoXiNtjJZbPFBKav0pyrR8GSwzUaLHLhInsyeCa4HI8kKf2IcNeUXc8jc8XVzBJyqjKnDLX9MlRjohrL003UDGPZgQ"
);

class orderController {
  /**
   * Route: GET: /statisticsdata/
   * @async
   * @method getStatisticsData
   * @description view a statistics data
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof OrderController
   */
  statistics = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const orders = await SellerOrderModel.aggregate([
        {
          $match: { sellerId: user_id },
        },
        {
          $unwind: "$products",
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $add: [{ $multiply: ["$products.price", "$products.quantity"] }, "$shipping_fee"],
              },
            },
            totalItemsSold: {
              $sum: "$products.quantity",
            },
          },
        },
      ]);

      const refunds = await Refund.aggregate([
        {
          $match: { sellerId: user_id },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: null,
            totalRefundValue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
      ]);

      const totalRevenue = orders.length ? orders[0].totalRevenue : 0;
      const totalItemsSold = orders.length ? orders[0].totalItemsSold : 0;
      const totalRefundValue = refunds.length ? refunds[0].totalRefundValue : 0;

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Retrieved Successfully",
          status: httpStatus.OK,
          payload: {
            totalRevenue,
            totalItemsSold,
            totalRefundValue,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  // end method

  // SELLERS SALES REPORT
  /**
   * Route: GET: /salesreport/
   * @async
   * @method getSalesReport
   * @description view a sales report
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof OrderController
   **/
  monthly_and_yearly_sales_report = async (req, res, next) => {
    try {
      const { month, year } = req.query;
      const { user_id } = getSession();

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

      const salesReport = await SellerOrderModel.aggregate([
        {
          $match: {
            sellerId: user_id,
            createdAt: {
              $gte: startOfMonth,
              $lt: startOfNextMonth,
            },
          },
        },
        {
          $unwind: "$products",
        },
        {
          $group: {
            _id: null,
            totalSalesVolume: {
              $sum: "$products.quantity",
            },
            totalSalesValue: {
              $sum: {
                $add: [{ $multiply: ["$products.price", "$products.quantity"] }, "$shipping_fee"],
              },
            },
          },
        },
      ]);

      const totalSalesVolume = salesReport.length ? salesReport[0].totalSalesVolume : 0;
      const totalSalesValue = salesReport.length ? salesReport[0].totalSalesValue : 0;

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Retrieved Successfully",
          status: httpStatus.OK,
          payload: {
            totalSalesVolume,
            totalSalesValue,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  // end method

  // SELLERS TOP SELLING ITEMS
  /**
   * Route: GET: /topsellingitems/
   * @async
   * @method getTopSellingItems
   * @description view a top selling items
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof OrderController
   **/
  top_selling_items = async (req, res, next) => {
    try {
      // const sellerId = new mongoose.Types.ObjectId(req.params.id);
      const { user_id } = getSession();

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 7;

      const totalDocs = await SellerOrderModel.countDocuments({ sellerId: user_id });

      const aggregate = await SellerOrderModel.aggregate([
        {
          $match: { sellerId: user_id },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            totalQuantitySold: { $sum: "$products.quantity" },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" },
        {
          $project: {
            _id: 1,
            name: "$productDetails.name",
            category: "$productDetails.category",
            totalQuantitySold: 1,
            status: {
              $cond: {
                if: { $gt: ["$productDetails.stock", 0] },
                then: "available",
                else: "out of stock",
              },
            },
          },
        },
        { $sort: { totalQuantitySold: -1 } },
        { $limit: limit },
        { $skip: (page - 1) * limit },
      ]);

      const topSellingItems = constructPageableDocs(aggregate, { ...req.query, count: totalDocs });

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "success",
          status: httpStatus.OK,
          payload: {
            ...topSellingItems,
            docs: topSellingItems.docs,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  // SELLERS RECENTS ORDERS
  /**
   * Route: GET: /recentorders/
   * @async
   * @method getRecentOrders
   * @description view a recent orders
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof OrderController
   **/
  recent_orders = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 7;

      const recentOrders = await SellerOrderModel.find({ sellerId: user_id })
        .sort({ created_At: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("products.productId", "name")
        .exec();

      const formattedOrders = recentOrders
        .map((order, index = 1) => {
          let serial_number = index + 1;
          return order.products.map((item) => ({
            s_n: serial_number++,
            itemName: item.productId.name,
            numberOfItems: item.quantity,
            purchaseDate: order.date,
            deliveredDate: order.updatedAt || "N/A", // Assuming deliveredDate might be available
            status: order.delivery_status,
          }));
        })
        .flat();

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "success",
          status: httpStatus.OK,
          payload: {
            formattedOrders,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  // SELLERS ORDERS
  /**
   * Route: GET: /getorders/
   * @async
   * @method getOrders
   * @description view all orders
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof OrderController
   **/
  get_seller_orders = async (req, res, next) => {
    // const sellerId = new mongoo(se.Types.ObjectId(req.params.id);
    const { user_id } = getSession();

    let { searchValue } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 7;

    try {
      if (searchValue) {
      } else {
        const orders = await authOrderModel
          .find({
            sellerId: user_id,
          })
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ created_At: -1 });
        const totalOrder = await authOrderModel
          .find({
            sellerId: user_id,
          })
          .countDocuments();

        return res.status(httpStatus.OK).json(
          sendResponse({
            message: "success",
            status: httpStatus.OK,
            payload: {
              orders,
              totalOrder,
            },
          })
        );
      }
    } catch (error) {
      next(error);
    }
  };
  // End Method

  /**
   * Route: GET: /getorder/
   * @async
   * @method getOrder
   * @description view an order
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof OrderController
   **/
  get_seller_order = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const orderId = req.params.orderId;

      const order = await authOrderModel.find({ sellerId: user_id, orderId });

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Success",
          status: httpStatus.OK,
          payload: {
            order,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };
  // End Method

  /**
   * Route: PUT: /updateorderstatus/
   * @async
   * @method updateOrderStatus
   * @description update order status
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof OrderController
   **/
  seller_order_status_update = async (req, res, next) => {
    const { orderId } = req.params;
    const { delivery_status } = req.body;

    try {
      const updatedStatus = await authOrderModel.findOneAndUpdate(
        { orderId },
        {
          delivery_status,
        },
        { new: true }
      );

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Order status updated successfully",
          status: httpStatus.OK,
          payload: {
            updatedStatus,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };
  // End Method


  ///////////////////// NOT IN USE //////////////

  paymentCheck = async (id) => {
    try {
      const order = await customerOrder.findById(id);
      if (order.payment_status === "unpaid") {
        await customerOrder.findByIdAndUpdate(id, {
          delivery_status: "cancelled",
        });
        await authOrderModel.updateMany(
          {
            orderId: id,
          },
          {
            delivery_status: "cancelled",
          }
        );
      }
      return true;
    } catch (error) {
      console.log(error);
    }
  };

  // end method

  place_order = async (req, res) => {
    const { price, products, shipping_fee, shippingInfo, userId } = req.body;
    let authorOrderData = [];
    let cardId = [];
    const tempDate = moment(Date.now()).format("LLL");

    let customerOrderProduct = [];

    for (let i = 0; i < products.length; i++) {
      const pro = products[i].products;
      for (let j = 0; j < pro.length; j++) {
        const tempCusPro = pro[j].productInfo;
        tempCusPro.quantity = pro[j].quantity;
        customerOrderProduct.push(tempCusPro);
        if (pro[j]._id) {
          cardId.push(pro[j]._id);
        }
      }
    }

    try {
      const order = await customerOrder.create({
        customerId: userId,
        shippingInfo,
        products: customerOrderProduct,
        price: price + shipping_fee,
        payment_status: "unpaid",
        delivery_status: "pending",
        date: tempDate,
      });
      for (let i = 0; i < products.length; i++) {
        const pro = products[i].products;
        const pri = products[i].price;
        const sellerId = products[i].sellerId;
        let storePor = [];
        for (let j = 0; j < pro.length; j++) {
          const tempPro = pro[j].productInfo;
          tempPro.quantity = pro[j].quantity;
          storePor.push(tempPro);
        }

        authorOrderData.push({
          orderId: order.id,
          sellerId,
          products: storePor,
          price: pri,
          payment_status: "unpaid",
          shippingInfo: "Easy Main Warehouse",
          delivery_status: "pending",
          date: tempDate,
        });
      }

      await authOrderModel.insertMany(authorOrderData);
      for (let k = 0; k < cardId.length; k++) {
        await cardModel.findByIdAndDelete(cardId[k]);
      }

      setTimeout(() => {
        this.paymentCheck(order.id);
      }, 15000);

      responseReturn(res, 200, {
        message: "Order Placed Success",
        orderId: order.id,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // End Method

  get_customer_dashboard_data = async (req, res) => {
    const { userId } = req.params;

    try {
      const recentOrders = await customerOrder
        .find({
          customerId: new ObjectId(userId),
        })
        .limit(5);
      const pendingOrder = await customerOrder
        .find({
          customerId: new ObjectId(userId),
          delivery_status: "pending",
        })
        .countDocuments();
      const totalOrder = await customerOrder
        .find({
          customerId: new ObjectId(userId),
        })
        .countDocuments();
      const cancelledOrder = await customerOrder
        .find({
          customerId: new ObjectId(userId),
          delivery_status: "cancelled",
        })
        .countDocuments();
      responseReturn(res, 200, {
        recentOrders,
        pendingOrder,
        totalOrder,
        cancelledOrder,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method

  get_orders = async (req, res) => {
    const { customerId, status } = req.params;

    try {
      let orders = [];
      if (status !== "all") {
        orders = await customerOrder.find({
          customerId: new ObjectId(customerId),
          delivery_status: status,
        });
      } else {
        orders = await customerOrder.find({
          customerId: new ObjectId(customerId),
        });
      }
      responseReturn(res, 200, {
        orders,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method

  get_order_details = async (req, res) => {
    const { orderId } = req.params;

    try {
      const order = await customerOrder.findById(orderId);
      responseReturn(res, 200, {
        order,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method

  get_admin_orders = async (req, res) => {
    let { page, searchValue, parPage } = req.query;
    page = parseInt(page);
    parPage = parseInt(parPage);

    const skipPage = parPage * (page - 1);

    try {
      if (searchValue) {
      } else {
        const orders = await customerOrder
          .aggregate([
            {
              $lookup: {
                from: "authororders",
                localField: "_id",
                foreignField: "orderId",
                as: "suborder",
              },
            },
          ])
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });

        const totalOrder = await customerOrder.aggregate([
          {
            $lookup: {
              from: "authororders",
              localField: "_id",
              foreignField: "orderId",
              as: "suborder",
            },
          },
        ]);

        responseReturn(res, 200, { orders, totalOrder: totalOrder.length });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method

  get_admin_order = async (req, res) => {
    const { orderId } = req.params;
    try {
      const order = await customerOrder.aggregate([
        {
          $match: { _id: new ObjectId(orderId) },
        },
        {
          $lookup: {
            from: "authororders",
            localField: "_id",
            foreignField: "orderId",
            as: "suborder",
          },
        },
      ]);
      responseReturn(res, 200, { order: order[0] });
    } catch (error) {
      console.log("get admin order details" + error.message);
    }
  };
  // End Method

  admin_order_status_update = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
      await customerOrder.findByIdAndUpdate(orderId, {
        delivery_status: status,
      });
      responseReturn(res, 200, { message: "order Status change success" });
    } catch (error) {
      console.log("get admin status error" + error.message);
      responseReturn(res, 500, { message: "internal server error" });
    }
  };
  // End Method

  create_payment = async (req, res) => {
    const { price } = req.body;
    try {
      const payment = await stripe.paymentIntents.create({
        amount: price * 100,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      responseReturn(res, 200, { clientSecret: payment.client_secret });
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method

  order_confirm = async (req, res) => {
    const { orderId } = req.params;
    try {
      await customerOrder.findByIdAndUpdate(orderId, {
        payment_status: "paid",
      });
      await authOrderModel.updateMany(
        { orderId: new ObjectId(orderId) },
        {
          payment_status: "paid",
          delivery_status: "pending",
        }
      );
      const cuOrder = await customerOrder.findById(orderId);

      const auOrder = await authOrderModel.find({
        orderId: new ObjectId(orderId),
      });

      const time = moment(Date.now()).format("l");
      const splitTime = time.split("/");

      await myShopWallet.create({
        amount: cuOrder.price,
        month: splitTime[0],
        year: splitTime[2],
      });

      for (let i = 0; i < auOrder.length; i++) {
        await sellerWallet.create({
          sellerId: auOrder[i].sellerId.toString(),
          amount: auOrder[i].price,
          month: splitTime[0],
          year: splitTime[2],
        });
      }
      responseReturn(res, 200, { message: "success" });
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method
}

module.exports = new orderController();
