const router = require("express").Router();
const { celebrate: validate } = require("celebrate");

const authControllers = require("../../controllers/seller/auth/authControllers");
const SellerValidation = require("../../validations/seller.validations");


router
  .route("/update-seller/:id")
  .put(
    [validate(SellerValidation.updateSeller, { abortEarly: false })],
    authControllers.updateSeller
  );

router
  .route("/upload-store-image/:id")
  .post(
    [validate(SellerValidation.uploadStoreImage, { abortEarly: false })],
    authControllers.uploadStoreImage
  );


// router.get("/request-seller-get", authMiddleware, sellerController.request_seller_get);
// router.get("/get-seller/:sellerId", authMiddleware, sellerController.get_seller);
// router.post("/seller-status-update", authMiddleware, sellerController.seller_status_update);

// router.get("/get-sellers", authMiddleware, sellerController.get_active_sellers);

// router.get("/get-deactive-sellers", authMiddleware, sellerController.get_deactive_sellers);

module.exports = router;
