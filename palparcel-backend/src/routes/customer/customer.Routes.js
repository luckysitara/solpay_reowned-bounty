const router = require("express").Router();
const { celebrate: validate } = require("celebrate");

const CustomerValidation = require("../../validations/customer.validations");
const customerAuthController = require("../../controllers/customer/customerAuthController");

router.route("/customer-profile").get(customerAuthController.getCustomerProfile);

router
  .route("/update-customer")
  .put(
    [validate(CustomerValidation.updateCustomer, { abortEarly: false })],
    customerAuthController.updateCustomer
  );

router
  .route("/upload-image")
  .post(
    [validate(CustomerValidation.uploadCustomerImage, { abortEarly: false })],
    customerAuthController.uploadCustomerImage
  );

router
  .route("/delete-address")
  .delete(
    [validate(CustomerValidation.deleteAddress, { abortEarly: false })],
    customerAuthController.deleteAddress
  );

module.exports = router;
