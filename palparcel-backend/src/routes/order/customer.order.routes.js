const router = require("express").Router();
const { celebrate: validate } = require("celebrate");

const OrderValidation = require("../../validations/order.validations");
const CustomerOrderController = require("../../controllers/order/customerOrder.controller");

router
  .route("/customer")
  .get(
    [validate(OrderValidation.getAllOrders, { abortEarly: false })],
    CustomerOrderController.getOrders
  );

router
  .route("/customer/create-order")
  .post(
    [validate(OrderValidation.createOrder, { abortEarly: false })],
    CustomerOrderController.createOrder
  );

router.route("/customer/users").get(CustomerOrderController.searchPickupLocation);

router
  .route("/customer/:order_id")
  .put(
    [validate(OrderValidation.orderId, { abortEarly: false })],
    CustomerOrderController.cancelOrder
  );

router
  .route("/customer/:order_id")
  .put(
    [validate(OrderValidation.orderId, { abortEarly: false })],
    CustomerOrderController.deleteOrder
  );

module.exports = router;
