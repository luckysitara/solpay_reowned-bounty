const router = require("express").Router();
const { celebrate: validate } = require("celebrate");

const AuthPolicy = require("../../policies/auth.policy");
const ShippingAddressValidation = require("../../validations/shippingAddress.validations");
const shippingAddressController = require("../../controllers/customer/shippingAddressController");

router.use(AuthPolicy.hasAccessToken);

router
  .route("/shipping-addresses")
  .post(
    [validate(ShippingAddressValidation.addShippingAddress, { abortEarly: false })],
    shippingAddressController.addShippingAddress
  )
  .get(shippingAddressController.getShippingAddresses);

router
  .route("/shipping-addresses/:id")
  .put(
    [validate(ShippingAddressValidation.updateShippingAddress, { abortEarly: false })],
    shippingAddressController.updateShippingAddress
  )
  .get(shippingAddressController.getShippingAddressById)
  .delete(shippingAddressController.deleteShippingAddress);

module.exports = router;
