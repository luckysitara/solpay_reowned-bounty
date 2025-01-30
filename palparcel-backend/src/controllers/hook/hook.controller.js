const crypto = require("crypto");
const httpStatus = require("http-status");
const { default: mongoose } = require("mongoose");

const APIError = require("../../utiles/api.error");
const SellerModel = require("../../models/sellerModel");
const { envVariables: config } = require("../../config");
const SellerWallet = require("../../models/sellerWallet");
const SellerOrderModel = require("../../models/authOrder");
const customerOrder = require("../../models/customerOrder");
const { sendResponse } = require("../../utiles/send_response");
const PaymentService = require("../../service/payment.service");
const SubscriptionModel = require("../../models/subscription.model");
const { Status, CommissionRate, PlanType } = require("../../utiles/typings");

class HookController {
  /**
   * Route: GET: /orders/users
   * @async
   * @method paystackHook
   * @description add product was a card
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof HookController
   */
  paystackHook = async (req, res, next) => {
    try {
      let payload;
      const hash = crypto
        .createHmac("sha512", config.PAY_STACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (hash === req.headers["x-paystack-signature"]) {
        const event = req.body;

        switch (event.event) {
          case "charge.success":
            const reference = event.data.reference;
            const { data } = await PaymentService.verifyPayment(reference);

            if (data.status !== Status.SUCCESS) {
              throw new APIError({
                status: httpStatus.BAD_REQUEST,
                message: data.gateway_response,
              });
            }

            payload = data;

            // Fetch the customer order and related seller orders
            const sellerOrders = await SellerOrderModel.find({ payment_reference: reference });

            console.log({ sellerOrders });

            // Fetch all sellers involved in this order in a single query
            const sellerIds = sellerOrders.map((order) => order.sellerId);
            console.log({ sellerIds });

            const sellers = await SellerModel.find({ _id: { $in: sellerIds } });

            console.log({ sellers });

            const sellerLookup = sellers.reduce((acc, seller) => {
              acc[seller._id] = seller;
              return acc;
            }, {});

            console.log({ sellerLookup });

            // Update customer order payment status
            await customerOrder.findOneAndUpdate(
              { payment_reference: reference },
              { payment_status: Status.PAID, $push: { order_status: Status.PLACED } }
            );

            // Update seller orders payment status
            await SellerOrderModel.updateMany(
              { payment_reference: reference },
              { $set: { payment_status: Status.PAID } }
            );

            // Prepare bulk update operations
            const bulkOps = sellerOrders.map((sellerOrder) => {
              const seller = sellerLookup[sellerOrder.sellerId];

              let amountToCredit = sellerOrder.price;
              if (seller.plan_type === PlanType.COMMISSION) {
                let commissionRate = 0;
                if (sellerOrder.price <= config.CATEGORY_ONE_PRICE) {
                  commissionRate = CommissionRate.CATEGORY_ONE;
                } else if (sellerOrder.price <= config.CATEGORY_TWO_PRICE) {
                  commissionRate = CommissionRate.CATEGORY_TWO;
                } else {
                  commissionRate = CommissionRate.CATEGORY_THREE;
                }
                // Also subtract the delivery fee amount
                // TODO: shipping amount (credit rider with shipping fee)
                const commissionAmount = sellerOrder.price * commissionRate;
                amountToCredit = sellerOrder.price - commissionAmount;
              }

              return {
                updateOne: {
                  filter: { sellerId: sellerOrder.sellerId },
                  update: { $inc: { amount: amountToCredit } },
                },
              };
            });

            console.log({ bulkOps });

            // Execute bulk operations
            await SellerWallet.bulkWrite(bulkOps);
            break;

          case "subscription.create":
            const subscription = event.data;

            // check if receipt already exists
            await PaymentService.checkReceipt(subscription.subscription_code);

            // update seller model
            const updatedSeller = await SellerModel.findOneAndUpdate(
              { "payment_gateway.customer_code": subscription.customer.customer_code },
              {
                has_paid_subscription: true,
                next_payment_date: subscription.next_payment_date,
                payment_gateway: {
                  plan: subscription.plan.plan_code,
                  subscription_code: subscription.subscription_code,
                  customer_code: subscription.customer.customer_code,
                },
              },
              { new: true }
            );

            const sellerId = new mongoose.Types.ObjectId(updatedSeller._id);

            // update subscription models
            const updatedSubscription = await SubscriptionModel.create({
              sellerId,
              created_date: subscription.createdAt,
              interval: subscription.plan.interval,
              amount: subscription.plan.amount / 100,
              cron_expression: subscription.cron_expression,
              authorization: { ...subscription.authorization },
              next_payment_date: subscription.next_payment_date,
              payment_reference: subscription.subscription_code,
              customer_code: subscription.customer.customer_code,
            });

            payload = updatedSubscription;
            break;

          default:
            console.log(`Unhandled event type`);
        }
      }

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };
}
module.exports = new HookController();
