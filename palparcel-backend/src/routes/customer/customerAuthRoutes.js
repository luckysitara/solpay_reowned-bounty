const router = require("express").Router();
const { celebrate: validate } = require("celebrate");

const AuthPolicy = require("../../policies/auth.policy");
const AuthValidation = require("../../validations/auth.validations");
const customerAuthController = require("../../controllers/customer/customerAuthController");

router
  .route("/customer/signup")
  .post(
    [validate(AuthValidation.registerCustomer, { abortEarly: false })],
    customerAuthController.registerCustomer
  );

router
  .route("/customer/signin")
  .post(
    [validate(AuthValidation.signin, { abortEarly: false })],
    customerAuthController.signinCustomer
  );

router
  .route("/customer/verify-otp")
  .post(
    [validate(AuthValidation.verifyOtp, { abortEarly: false })],
    customerAuthController.verifyCustomerOtp
  );

router
  .route("/customer/reset-password")
  .post(
    [validate(AuthValidation.resetPassword, { abortEarly: false })],
    customerAuthController.resetCustomerPassword
  );

router
  .route("/customer/forgot-password")
  .post(
    [validate(AuthValidation.forgotPassword, { abortEarly: false })],
    customerAuthController.forgotCustomerPassword
  );

/**
 * Check customer refresh_token and refresh user access_token to perform HTTP requests
 * @description Validate the request, check if customer has a valid refresh_token and is authorized to perform this request
 */

router.use(AuthPolicy.hasAccessToken);

router.route("/customer/signout").post(customerAuthController.signout);

router.route("/customer/refresh-token").post(customerAuthController.refreshToken);

router
  .route("/customer/change-password")
  .post(
    [validate(AuthValidation.changePassword, { abortEarly: false })],
    customerAuthController.changeCustomerPassword
  );

module.exports = router;
