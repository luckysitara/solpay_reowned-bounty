const Stripe = require("stripe");
const Paystack = require("paystack-api");
const httpStatus = require("http-status");

const ErrorService = require("./error.service");
const APIError = require("../utiles/api.error");
const { network } = require("../config/network");
const { envVariables: config } = require("../config");
const { getSession } = require("../utiles/use_session");
const SubscriptionModel = require("../models/subscription.model");

/**
 *
 * @class Payment Service
 * @classdesc Class representing the payment service
 * @description payment service class
 * @name PaymentService
 */

class PaymentService {
  static stripe;
  static paystack;
  static gateway;

  static init() {
    PaymentService.stripe = new Stripe(config.STRIPE_SECRET_KEY, {
      apiVersion: config.STRIPE_VERSION,
    });

    PaymentService.paystack = new Paystack(config.PAY_STACK_SECRET_KEY);

    // create reusable network gateway
    PaymentService.gateway = network;
    // Alter defaults after instance has been created
    PaymentService.gateway.defaults.baseURL = "https://api.paystack.co";
    PaymentService.gateway.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${config.PAY_STACK_SECRET_KEY}`;
  }

  /* ************************************************************************************** *
   * ******************************                           ***************************** *
   * ******************************       PAYSTACK PAYMENT    ***************************** *
   * ******************************                           ***************************** *
   * ************************************************************************************** */

  /**
   * @async
   * @method initializePayment
   * @description  initialize paystack payment
   * @param {Object} payload
   * @memberof PaymentServiceInterface
   */

  static async initializePayment(payload) {
    const result = {
      data: null,
      error: null,
    };
    try {
      const { plan, ...rest } = payload;
      const response = await PaymentService.paystack.transaction.initialize({
        ...rest,
        plan,
      });

      result.data = response.data;
    } catch (error) {
      result.error = new APIError({
        errorData: error,
        message: error.message,
        status: error.statusCode,
      });
    }

    return result;
  }

  /**
   * @async
   * @method verifyPayment
   * @description  verify paystack payment
   * @param {string} reference
   * @returns {Promise<PaymentResponseType<Stripe.PaymentIntent>>}
   * @memberof PaymentServiceInterface
   */

  static async verifyPayment(reference) {
    const result = {
      data: null,
      error: null,
    };
    try {
      const response = await PaymentService.paystack.transaction.verify({ reference });

      result.data = response.data;
    } catch (error) {
      result.error = new APIError({
        errorData: error,
        message: error.message,
        status: error.statusCode,
      });
    }

    return result;
  }
  /**
   * @async
   * @method verifySubscription
   * @description  verify paystack payment
   * @param {string} reference
   * @returns {Promise<PaymentResponseType<Stripe.PaymentIntent>>}
   * @memberof PaymentServiceInterface
   */

  static async verifySubscription(reference) {
    const result = {
      data: null,
      error: null,
    };
    try {
      const subscription = await SubscriptionModel.findOne({ payment_reference: reference }).lean();
      if (subscription) {
        // throw error if payment reference already exit
        throw new APIError({
          status: httpStatus.NOT_FOUND,
          message: "Already subscribed with provided reference",
        });
      }
      result.data = response.subscription;
    } catch (error) {
      result.error = new APIError({
        errorData: error,
        message: error.message,
        status: error.statusCode,
      });
    }

    return result;
  }

  /**
   * @async
   * @method getBankList
   * @description Get all supported banks from paystack
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  static async getBankList(params) {
    const { user } = getSession();

    let user_country = "nigeria";
    if (user.country) {
      user_country = user.country;
    }
    const { data } = await PaymentService.gateway.get("/bank", {
      params: { ...params, country: user_country },
    });

    return data.data;
  }

  /**
   * @async
   * @method verifyBankDetails
   * @description verify bank account numbers
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  static async verifyBankDetails(account_number, bank_name) {
    const bankList = await this.getBankList({ currency: "NGN" });
    const bank = bankList.find((bank) => bank.name.toLowerCase() === bank_name.toLowerCase());

    const { data } = await PaymentService.gateway.get(
      `/bank/resolve?account_number=${account_number}&bank_code=${bank.code}`
    );

    return data.data;
  }

  /**
   * @async
   * @method createSubscriptionCustomer
   * @description create customer for subscription
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  static async createSubscriptionCustomer(sellerDetails) {
    const [first_name, last_name] = sellerDetails.first_name.split(" ");

    const { data } = await PaymentService.gateway.post(`/customer`, {
      last_name,
      first_name,
      email: sellerDetails.email,
      phone: sellerDetails.phone_number,
      metadata: { seller_id: sellerDetails._id },
    });

    return data.data;
  }
  /**
   * @async
   * @method createSubscription
   * @description create customer for subscription
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  static async createSubscription(params) {
    const { user: seller } = getSession();

    const { subscription_interval, amount, subscription_name } = params;

    if (seller.has_paid_subscription) {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: "You already have an active subscription",
      });
    }

    const planResponse = await PaymentService.gateway.post("/plan", {
      amount: amount * 100,
      interval: subscription_interval,
      name: `${seller.full_name.split(" ")[0]} ${subscription_name}`,
    });

    const plan = planResponse.data.data;

    const subscriptionCheckout = await PaymentService.gateway.post("/transaction/initialize", {
      email: seller.email,
      amount: plan.amount,
      plan: plan.plan_code,
    });

    const data = subscriptionCheckout.data;

    return data;
  }

  /**
   * @async
   * @method checkReceipt
   * @description check user payment receipt to be valid
   * @param {PaymentParams} params
   * @returns {Promise<null>}
   * @memberof PaymentServiceInterface
   */
  static async checkReceipt(payment_reference) {
    const subscription = await SubscriptionModel.findOne({ payment_reference }).lean();

    if (subscription) {
      // throw error if payment reference already exit
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "Already subscribed with provided reference",
      });
    }

    return subscription;
  }

  /* ************************************************************************************** *
   * ******************************                           ***************************** *
   * ******************************         STRIPE PAYMENT    ***************************** *
   * ******************************                           ***************************** *
   * ************************************************************************************** */

  /**
   * @async
   * @method confirmPayment
   * @description  confirm stripe payment
   * @param {string} payment_reference_id
   * @returns {Promise<PaymentResponseType<Stripe.PaymentIntent>>}
   * @memberof PaymentServiceInterface
   */

  static async confirmPayment(payment_reference_id) {
    const result = {
      data: null,
      error: null,
    };

    try {
      const payment = await PaymentService.stripe.paymentIntents.retrieve(payment_reference_id);
      result.data = payment;
    } catch (error) {
      result.error = new APIError({
        errorData: error,
        message: error.message,
        status: error.statusCode,
      });
    }

    return result;
  }

  /**
   * @async
   * @method getCustomer
   * @description get stripe customer
   * @returns Promise<Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>>
   * @memberof PaymentServiceInterface
   */

  static async getCustomer(details) {
    const { stripe_customer_id, ...metadata } = details.metadata;

    if (stripe_customer_id) {
      return PaymentService.stripe.customers.retrieve(stripe_customer_id);
    }

    return PaymentService.stripe.customers.create({ ...details, metadata });
  }

  /**
   * @async
   * @method createPayment
   * @description  create stripe payment
   * @param payload Stripe.PaymentIntentCreateParams
   * @param customerDetails CreatePaymentCustomerInterface
   * @returns Promise<CreatePaymentReturnType>
   * @memberof PaymentServiceInterface
   */

  static async createPayment(payload, customerDetails) {
    const customer = await PaymentService.getCustomer(customerDetails);
    const { description, ...rest } = payload;

    const ephemeralKey = await PaymentService.stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: config.STRIPE_VERSION }
    );

    const paymentIntent = await PaymentService.stripe.paymentIntents.create({
      ...rest,
      currency: "USD",
      amount: 50, // default charge back amount
      customer: customer.id,
      payment_method_types: ["card"],
      description,
    });

    return {
      customer: customer.id,
      ephemeral_key: ephemeralKey.secret,
      payment_reference_id: paymentIntent.id,
      payment_intent: paymentIntent.client_secret,
    };
  }

  /**
   * @async
   * @method chargePayment
   * @description create stripe payment
   * @param payload ChargePaymentInterface
   * @returns Promise<Stripe.Response<Stripe.PaymentIntent | void>>
   * @memberof PaymentServiceInterface
   */

  static async chargePayment(payload) {
    const { stripe_customer_id, order_item_id, customer_id, ...rest } = payload;

    let result = null;

    const params = { type: "card", customer: stripe_customer_id };

    for await (const method of PaymentService.stripe.paymentMethods.list(params)) {
      try {
        const response = await PaymentService.stripe.paymentIntents.create({
          ...rest,
          confirm: true,
          off_session: true,
          payment_method: method.id,
          customer: stripe_customer_id,
          metadata: { order_item_id: String(order_item_id), customer_id: String(customer_id) },
        });

        if (response.status === "succeeded") {
          result = response;
          break;
        }
      } catch (error) {
        ErrorService.reportError({
          errorData: error,
          status: error.status,
          error: "Error charging customer card",
          message: `Failed to charge customer card with id ${stripe_customer_id}`,
        });
      }
    }

    return result;
  }

  /**
   * @async
   * @method refundPayment
   * @description  refund payment
   * @param {string} payment_intent
   * @returns Promise<Stripe.Response<Stripe.Refund>>
   * @memberof PaymentServiceInterface
   */

  static async refundPayment(payment_intent) {
    const result = {
      data: null,
      error: null,
    };

    try {
      const data = await PaymentService.stripe.refunds.create({ payment_intent });
      result.data = data;
    } catch (error) {
      result.error = new APIError({
        errorData: error,
        message: error.message,
        status: error.statusCode,
      });
    }

    return result;
  }
}

module.exports = PaymentService;
