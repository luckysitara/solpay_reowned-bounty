const orderController = require("../../controllers/seller/order/orderController");
const router = require("express").Router();

// Customer
router.post("/home/order/place-order", orderController.place_order);
router.get(
  "/home/coustomer/get-dashboard-data/:userId",
  orderController.get_customer_dashboard_data
);
router.get("/home/coustomer/get-orders/:customerId/:status", orderController.get_orders);
router.get("/home/coustomer/get-order-details/:orderId", orderController.get_order_details);

router.post("/order/create-payment", orderController.create_payment);
router.get("/order/confirm/:orderId", orderController.order_confirm);

// Admin
router.get("/admin/orders", orderController.get_admin_orders);
router.get("/admin/order/:orderId", orderController.get_admin_order);
router.put("/admin/order-status/update/:orderId", orderController.admin_order_status_update);

// Seller
router.route("/seller/overview").get(orderController.statistics);

router
  .route("/seller/monthly-yearly/sales-report")
  .get(orderController.monthly_and_yearly_sales_report);

router.route("/seller/top-selling-items").get(orderController.top_selling_items);

router.route("/seller/recent-orders").get(orderController.recent_orders);

router
.route("/seller-orders")
.get(orderController.get_seller_orders);

router
.route("/:orderId")
.get(orderController.get_seller_order);

router
.route("/seller/update-order-status/:orderId")
.put(orderController.seller_order_status_update);

module.exports = router;
