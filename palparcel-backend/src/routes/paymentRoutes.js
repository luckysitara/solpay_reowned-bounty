const router = require("express").Router();
const { celebrate: validate } = require("celebrate");

const { isVendor } = require("../middlewares/is_vendor_middleware");
const PaymentValidation = require("../validations/payment.validation");
const { getBanks } = require("../middlewares/get_all_banks_middleware");
const paymentController = require("../controllers/payment/paymentController");

router.get(
  "/payment/create-stripe-connect-account",
  paymentController.create_stripe_connect_account
);

router.route("/wallet-details").get(paymentController.getWalletSummary);

router.route("/withdraw").post(paymentController.initiateWithdrawal);

router.route("/set-transaction-pin").post(paymentController.setTransactionPin);

router.route("/update-bank-details").put(paymentController.updateBankDetails);

router.route("/wallet-history").get(paymentController.getWithdrawalHistory);

router.put(
  "/payment/active-stripe-connect-account/:activeCode",
  paymentController.active_stripe_connect_account
);

router.get(
  "/payment/seller-payment-details/:sellerId",
  paymentController.get_seller_payment_details
);
router.post("/payment/withdrowal-request", paymentController.withdrowal_request);

router.get("/payment/request", paymentController.get_payment_request);
router.post("/payment/request-confirm", paymentController.payment_request_confirm);

// PAYSTACK PAYMENT ROUTES
router
  .route("/subscribe")
  .post(
    [validate(PaymentValidation.subscribe, { abortEarly: false }), isVendor],
    paymentController.subscribeSeller
  );

router.get("/all-banks", getBanks);
router.get("/banks", paymentController.getBankNames);

router.get("/banks", paymentController.getBankNames);

router.post("/verify-payment", paymentController.verifyPayment);

router.post("/initialize-payment", paymentController.initializePayment);

router.get("/verify-bank-account", paymentController.verifyBankDetails);

router
  .route("/subscriptions")
  .get(
    [validate(PaymentValidation.getSubscriptions, { abortEarly: false }), isVendor],
    paymentController.getSellerSubscriptions
  );

module.exports = router;
