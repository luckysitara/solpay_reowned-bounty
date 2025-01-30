const router = require("express").Router();
const { celebrate: validate } = require("celebrate");

const AuthValidation = require("../validations/auth.validations");
const authControllers = require("../controllers/seller/auth/authControllers");

router
  .route("/signup")
  .post(
    [validate(AuthValidation.registerSeller, { abortEarly: false })],
    authControllers.seller_register
  );

router
  .route("/seller-login")
  .post(
    [validate(AuthValidation.signin, { abortEarly: false })],
    authControllers.seller_login
  )

router
  .route("/seller/verify-otp")
  .post(
    [validate(AuthValidation.verifyOtp, { abortEarly: false })],
    authControllers.verifySellerOtp
  );

  router
  .route("/seller/forgot-password")
  .post(
    [validate(AuthValidation.forgotPassword, { abortEarly: false })],
    authControllers.sellerForgotPassword
  );

  router
  .route("/seller/reset-password")
  .post(
    [validate(AuthValidation.resetPassword, { abortEarly: false })],
    authControllers.resetSellerPassword
  );


  // router.route("/get-user").get(authMiddleware, authControllers.getUser);

// router.route("/seller-login").post(authControllers.seller_login);


// router.route("/logout").get(authMiddleware, authControllers.logout);

module.exports = router;
