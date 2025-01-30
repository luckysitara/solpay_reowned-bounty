const router = require("express").Router();
const { celebrate: validate } = require("celebrate");

const AuthPolicy = require("../../policies/auth.policy");
// const HomeValidation = require("../../validations/home.validations");
const reviewControllers = require("../../controllers/home/reviewController");

router
  .route("/reviews/:product_id")
  .get(reviewControllers.getProductReviews);

router
  .route("/reviews/:product_id")
  .post(
    // [validate(HomeValidation.getAllProductReview, { abortEarly: false })],
    reviewControllers.getProductReviews
  );

/**
 * Check customer refresh_token and refresh user access_token to perform HTTP requests
 * @description Validate the request, check if customer has a valid refresh_token and is authorized to perform this request
 */
router.use(AuthPolicy.hasAccessToken);

router
  .route("/review/:product_id")
  .post(
    // [validate(HomeValidation.submitProductReview, { abortEarly: false })],
    reviewControllers.submitProductReview
  );

router
  .route("/review/:review_id")
  .post(
    // [validate(HomeValidation.replyReview, { abortEarly: false })],
    reviewControllers.reply_review
  );

module.exports = router;
