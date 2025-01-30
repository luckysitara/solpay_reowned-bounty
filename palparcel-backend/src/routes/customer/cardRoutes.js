const router = require("express").Router();
const { celebrate: validate } = require("celebrate");

const AuthPolicy = require("../../policies/auth.policy");
const CartValidation = require("../../validations/cart.validations");
const cartController = require("../../controllers/customer/cardController");

router.get("/product/view-wishlist", cartController.viewWishList);
router.post("/product/accept-wishlist", cartController.acceptWishListItems);

router.use(AuthPolicy.hasAccessToken);

router
  .route("/product/add-to-cart")
  .post([validate(CartValidation.addToCart, { abortEarly: false })], cartController.addToCart);

router.get("/product/cart-products", cartController.getCartProducts);
router.delete("/product/delete_cart_products/:cart_id", cartController.deleteCartProduct);
router.put("/product/quantity_inc/:cart_id", cartController.increaseQuantity);
router.put("/product/quantity_dec/:cart_id", cartController.decreaseQuantity);

router.post("/product/add-to-wishlist", cartController.addToWishlist);
router.get("/product/wishlist-items", cartController.getWishlist);
router.post("/product/generate-wishlist-link", cartController.generateWishListShareLink);
router.delete("/product/removeWishlist/:wishlistId", cartController.removeWishlist);

module.exports = router;
