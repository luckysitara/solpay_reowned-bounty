const router = require("express").Router();
const { celebrate: validate } = require("celebrate");

const AuthPolicy = require("../../policies/auth.policy");
const HomeValidation = require("../../validations/home.validations");
const homeControllers = require("../../controllers/home/homeControllers");

router
  .route("/search")
  .get(
    [validate(HomeValidation.searchProducts, { abortEarly: false })],
    homeControllers.searchProducts
  );

router
  .route("/top-selling-product")
  .get(
    [validate(HomeValidation.queryParams, { abortEarly: false })],
    homeControllers.getTopSellingItems
  );

router
  .route("/all")
  .get([validate(HomeValidation.queryParams, { abortEarly: false })], homeControllers.getProducts);

router
  .route("/price-range")
  .get(
    [validate(HomeValidation.getProductByPriceRange, { abortEarly: false })],
    homeControllers.getProductByPriceRange
  );

router.get("/categories", homeControllers.getCategories);

router
  .route("/:product_id")
  .get([validate(HomeValidation.ids, { abortEarly: false })], homeControllers.getProductDetail);

router
  .route("/similar-products/:product_id")
  .get(
    [validate(HomeValidation.getAllProductReview, { abortEarly: false })],
    homeControllers.getSimilarProducts
  );

router
  .route("/vendor-products/:product_id")
  .get(
    [validate(HomeValidation.getAllProductReview, { abortEarly: false })],
    homeControllers.getVendorProducts
  );

module.exports = router;
