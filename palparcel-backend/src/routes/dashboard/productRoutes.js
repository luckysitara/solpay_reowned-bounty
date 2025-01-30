const router = require("express").Router();

const AuthPolicy = require("../../policies/auth.policy");
const productController = require("../../controllers/seller/dasboard/productController");
const productValidation = require("../../validations/product.validation");

router.use(AuthPolicy.hasAccessToken);

router
  .route("/upload-product")
  .post( productController.add_product);

router
  .route("/add-to-inventory")
  .post( productController.addProductsToInventory);

router
.route("/get-all-products")
.get(productController.products_get);

router
.route("/approve-product/:id")
.post(productController.sendForApproval);

router
.route("/get-inventory-products")
.get(productController.getAllInventoryProducts);

router
.route("/get-product/:productId")
.get(productController.product_get);

router
.route("/update-product/:productId")
.patch(productController.product_update);

router
.route("/update-product-image/:productId")
.post(productController.product_image_update);

router
.route("/delete-product/:productId")
.delete(productController.product_delete);

module.exports = router;


