const router = require("express").Router();
const adminControllers = require("../controllers/admin/admin.controller");

router
.route( "/dashboard-data")
.get( adminControllers.get_admin_dashboard_data);

router
.route( "/transaction-metrics")
.get( adminControllers.get_admin_transaction_metrics);

router
.route( "/top-vendors")
.get( adminControllers.get_top_vendors);

router
.route( "/product-status")
.get( adminControllers.get_product_status);

router
.route( "/all-vendors")
.get( adminControllers.get_vendors);

router
.route( "/:id/approve")
.put( adminControllers.approve_products);

router
.route( "/product-approval")
.get( adminControllers.get_and_approve_awaiting_products);

module.exports = router;