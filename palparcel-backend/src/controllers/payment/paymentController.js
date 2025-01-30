const {
  mongo: { ObjectId },
} = require("mongoose");
const { default: mongoose } = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const httpStatus = require("http-status");

const { Status } = require("../../utiles/typings");
const APIError = require("../../utiles/api.error");
const sellerModel = require("../../models/sellerModel");
const stripeModel = require("../../models/stripeModel");
const sellerWallet = require("../../models/sellerWallet");
const { getSession } = require("../../utiles/use_session");
const SellerOrderModel = require("../../models/authOrder");
const customerOrder = require("../../models/customerOrder");
const { sendResponse } = require("../../utiles/send_response");
const SubscriptionModel = require("../../models/subscription.model");
const withdrowRequest = require("../../models/withdrowRequest").default;

const { responseReturn } = require("../../utiles/response");
const PaymentService = require("../../service/payment.service");
const stripe = require("stripe")(
  "sk_test_51Oml5cGAwoXiNtjJZbPFBKav0pyrR8GSwzUaLHLhInsyeCa4HI8kKf2IcNeUXc8jc8XVzBJyqjKnDLX9MlRjohrL003UDGPZgQ"
);

class paymentController {
  /**
   * Route: GET: / get summary
   * @async
   * @method getWalletSummary
   * @description get wallet summary
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof paymentController
   */
  getWalletSummary = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const wallet = await sellerWallet.find({ sellerId: user_id });
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      const totalSales = wallet.reduce((acc, curr) => acc + curr.amount, 0);
      const productsSold = wallet.length;
      const totalWithdrawn = wallet.reduce(
        (acc, curr) => acc + (curr.withdrawn ? curr.amount : 0),
        0
      );
      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Wallet details retrieved successfully",
          payload: {
            totalSales,
            productsSold,
            totalWithdrawn,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /get history
   * @async
   * @method getWithdrawalHistory
   * @description get withdrawal history
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof paymentController
   */
  getWithdrawalHistory = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const wallet = await sellerWallet.find({ sellerId: user_id });
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      const withdrawalHistory = wallet.filter((item) => item.withdrawn);

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Withdrawal history retrieved successfully",
          payload: {
            withdrawalHistory,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /initiate-withdrawal
   * @async
   * @method initiateWithdrawal
   * @description initiate withdrawal
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof paymentController
   */
  initiateWithdrawal = async (req, res, next) => {
    try {
      const { amount, transactionPin } = req.body;
      const { user_id } = getSession();
      const vendor = await sellerWallet.find({ sellerId: user_id });

      if (!transactionPin) {
        return res.status(400).json({ message: "Input your transaction pin" });
      }

      if (vendor.totalSales - vendor.totalWithdrawn < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // const bankList = await PaymentService.getBankList();
      // console.log(bankList);
      // // check if the bank details of the vendor is valid
      // const bankDetails = vendor.bankDetails;
      // const bank = bankList.find((item) => item.name === bankDetails.bankName);
      // if (!bank) {
      //   return res.status(400).json({ message: "Invalid bank name" });
      // }

      // if (bankDetails.accountNumber.length !== bank.account_number_length) {
      //   return res.status(400).json({ message: "Invalid account number" });
      // }

      const newWithdrawal = {
        bankDetails: vendor.bankDetails,
        amount,
        date: new Date(),
        status: "pending",
      };

      await sellerWallet.findOneAndUpdate(
        { sellerId: user_id },
        {
          $push: {
            withdrawals: newWithdrawal,
          },
          $inc: {
            totalWithdrawn: amount,
          },
        }
      );

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Withdrawal initiated successfully",
          payload: {
            newWithdrawal,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /set-pin
   * @async
   * @method setTransactionPin
   * @description set transaction pin
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof paymentController
   */
  setTransactionPin = async (req, res, next) => {
    try {
      const { user_id } = getSession();

      // ENCRYPT TRANSACTION PINS
      const { transactionPin, new_transactionPin } = req.body;
      if (!transactionPin) {
        res.status(500).json({ message: "Server error" });
      }
      const setPin = await sellerWallet.findOneAndUpdate(
        { sellerId: user_id },
        { transactionPin: new_transactionPin }
      );

      return res.status(httpStatus.OK).json(
        sendResponse({
          message: "Transaction pin set successfully",
          payload: {
            setPin,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: PUT: /update
   * @async
   * @method updateBankDetails
   * @description update details
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof paymentController
   */
  updateBankDetails = async (req, res, next) => {
    try {
      const { user_id } = getSession();
      const { bankName, accountNumber, accountName } = req.body;

      const data = await sellerWallet.findOneAndUpdate(
        { sellerId: user_id },
        {
          bankDetails: {
            bankName,
            accountNumber,
            accountName,
          },
        },
        { new: true }
      );

      return res.status(httpStatus.CREATED).json(
        sendResponse({
          message: "Bank details updated successfully",
          payload: {
            data,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /initialize-payment
   * @async
   * @method initializePayment
   * @description initialize a payment
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof PaymentController
   */

  initializePayment = async (req, res, next) => {
    try {
      const { user } = getSession();

      const { order_item_id } = req.body;
      const _id = new mongoose.Types.ObjectId(order_item_id);

      const order = await customerOrder.findOne({ _id, customerId: user._id });

      const payload = {
        email: user.email,
        amount: order.price * 100,
        full_name: user.full_name,
      };

      const { data } = await PaymentService.initializePayment(payload);

      await Promise.all([
        customerOrder.findOneAndUpdate(
          { _id, customerId: user._id },
          { payment_reference: data.reference, order_checkout_url: data.authorization_url },
          { upsert: true, new: true }
        ),

        SellerOrderModel.updateMany(
          { orderId: _id },
          { $set: { payment_reference: data.reference } }
        ),
      ]);

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: data, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /verify-payment
   * @async
   * @method verifyPayment
   * @description create payment
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof PaymentController
   */

  verifyPayment = async (req, res, next) => {
    try {
      const { user } = getSession();

      const { order_item_id } = req.body;
      const _id = new mongoose.Types.ObjectId(order_item_id);

      const order = await customerOrder.findOne({ _id, customerId: user._id });

      const { data } = await PaymentService.verifyPayment(order.payment_reference);

      if (data.status !== Status.SUCCESS) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: data.gateway_response,
        });
      }
      await Promise.all([
        customerOrder.findOneAndUpdate(
          { _id, customerId: user._id, payment_reference: data.reference },
          { payment_status: Status.PAID, $push: { order_status: Status.PLACED } },

          { upsert: true, new: true }
        ),

        SellerOrderModel.updateMany(
          { orderId: _id, payment_reference: data.reference },
          { $set: { payment_status: Status.PAID } }
        ),
      ]);

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: data, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /verify-account
   * @async
   * @method verifyBankDetails
   * @description list banks
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof PaymentController
   */

  verifyBankDetails = async (req, res, next) => {
    try {
      const { account_number, bank_name } = req.body;
      const payload = await PaymentService.verifyBankDetails(account_number, bank_name);

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /all-banks
   * @async
   * @method getBanks
   * @description list banks
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof PaymentController
   */

  getBankNames = async (req, res, next) => {
    try {
      const banks = await PaymentService.getBankList({ ...req.query });

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: banks, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: POST: /subscribe-seller
   * @async
   * @method subscribeSeller
   * @description list banks
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof PaymentController
   */

  subscribeSeller = async (req, res, next) => {
    try {
      const { subscription_interval, amount, subscription_name } = req.body;

      const subscription = await PaymentService.createSubscription({
        amount,
        subscription_name,
        subscription_interval,
      });

      if (!subscription.status) {
        throw new APIError({
          status: httpStatus.BAD_REQUEST,
          message: subscription.gateway_response,
        });
      }

      return res
        .status(httpStatus.OK)
        .json(
          sendResponse({ message: "success", payload: subscription.data, status: httpStatus.OK })
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Route: GET: /subscriptions
   * @async
   * @method getSellerSubscriptions
   * @description list banks
   * @param {Request} req - HTTP Request object
   * @param {Response} res - HTTP Response object
   * @param {NextFunction} next - HTTP NextFunction object
   * @returns {ExpressResponseInterface} {ExpressResponseInterface}
   * @memberof PaymentController
   */

  getSellerSubscriptions = async (req, res, next) => {
    try {
      const { user: seller } = getSession();

      const subscriptions = await SubscriptionModel.paginate(
        { sellerId: seller._id },
        {
          ...req.query,
          lean: true,
          sort: { created_date: -1 },
          select: "amount interval sellerId created_date next_payment_date",
        }
      );

      return res
        .status(httpStatus.OK)
        .json(sendResponse({ message: "success", payload: subscriptions, status: httpStatus.OK }));
    } catch (error) {
      next(error);
    }
  };

  // /////////////////////////////////////////////
  ///////////////// NOT IN USE ///////////////////

  create_stripe_connect_account = async (req, res) => {
    const { id } = req;
    const uid = uuidv4();

    try {
      const stripeInfo = await stripeModel.findOne({ sellerId: id });

      if (stripeInfo) {
        await stripeModel.deleteOne({ sellerId: id });
        const account = await stripe.accounts.create({ type: "express" });

        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: "http://localhost:3001/refresh",
          return_url: `http://localhost:3001/success?activeCode=${uid}`,
          type: "account_onboarding",
        });
        await stripeModel.create({
          sellerId: id,
          stripeId: account.id,
          code: uid,
        });
        responseReturn(res, 201, { url: accountLink.url });
      } else {
        const account = await stripe.accounts.create({ type: "express" });

        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: "http://localhost:3001/refresh",
          return_url: `http://localhost:3001/success?activeCode=${uid}`,
          type: "account_onboarding",
        });
        await stripeModel.create({
          sellerId: id,
          stripeId: account.id,
          code: uid,
        });
        responseReturn(res, 201, { url: accountLink.url });
      }
    } catch (error) {
      console.log("strpe connect account errror" + error.message);
    }
  };
  // End Method

  active_stripe_connect_account = async (req, res) => {
    const { activeCode } = req.params;
    const { id } = req;

    try {
      const userStripeInfo = await stripeModel.findOne({ code: activeCode });

      if (userStripeInfo) {
        await sellerModel.findByIdAndUpdate(id, {
          payment: "active",
        });
        responseReturn(res, 200, { message: "payment Active" });
      } else {
        responseReturn(res, 404, { message: "payment Active Fails" });
      }
    } catch (error) {
      responseReturn(res, 500, { message: "Internal Server Error" });
    }
  };
  // End Method

  sumAmount = (data) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum = sum + data[i].amount;
    }
    return sum;
  };

  get_seller_payment_details = async (req, res) => {
    const { sellerId } = req.params;

    try {
      const payments = await sellerWallet.find({ sellerId });

      const pendingWithdrows = await withdrowRequest.find({
        $and: [
          {
            sellerId: {
              $eq: sellerId,
            },
          },
          {
            status: {
              $eq: "pending",
            },
          },
        ],
      });

      const successWithdrows = await withdrowRequest.find({
        $and: [
          {
            sellerId: {
              $eq: sellerId,
            },
          },
          {
            status: {
              $eq: "success",
            },
          },
        ],
      });

      const pendingAmount = this.sumAmount(pendingWithdrows);
      const withdrowAmount = this.sumAmount(successWithdrows);
      const totalAmount = this.sumAmount(payments);

      let availableAmount = 0;

      if (totalAmount > 0) {
        availableAmount = totalAmount - (pendingAmount + withdrowAmount);
      }

      responseReturn(res, 200, {
        totalAmount,
        pendingAmount,
        withdrowAmount,
        availableAmount,
        pendingWithdrows,
        successWithdrows,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  // End Method

  withdrowal_request = async (req, res) => {
    const { amount, sellerId } = req.body;

    try {
      const withdrowal = await withdrowRequest.create({
        sellerId,
        amount: parseInt(amount),
      });
      responseReturn(res, 200, {
        withdrowal,
        message: "Withdrowal Request Send",
      });
    } catch (error) {
      responseReturn(res, 500, { message: "Internal Server Error" });
    }
  };
  // End Method

  get_payment_request = async (req, res) => {
    try {
      const withdrowalRequest = await withdrowRequest.find({
        status: "pending",
      });
      responseReturn(res, 200, { withdrowalRequest });
    } catch (error) {
      responseReturn(res, 500, { message: "Internal Server Error" });
    }
  };
  // End Method

  payment_request_confirm = async (req, res) => {
    const { paymentId } = req.body;
    try {
      const payment = await withdrowRequest.findById(paymentId);
      const { stripeId } = await stripeModel.findOne({
        sellerId: new ObjectId(payment.sellerId),
      });

      await stripe.transfers.create({
        amount: payment.amount * 100,
        currency: "usd",
        destination: stripeId,
      });

      await withdrowRequest.findByIdAndUpdate(paymentId, { status: "success" });
      responseReturn(res, 200, { payment, message: "Request Confirm Success" });
    } catch (error) {
      responseReturn(res, 500, { message: "Internal Server Error" });
    }
  };

  ////////////////////////////////////////////////////
  /////////////////// END ///////////////////////////
  //////////////////////////////////////////////////
}

module.exports = new paymentController();
