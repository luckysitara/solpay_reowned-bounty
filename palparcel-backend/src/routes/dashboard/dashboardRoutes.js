const dashboardController = require("../../controllers/seller/dasboard/dashboardController");
// const { authMiddleware } = require("../../middlewares/authMiddleware");
const router = require("express").Router();

router.get(
  "/seller/get-dashboard-data",
  dashboardController.get_seller_dashboard_data
);

router.post(
  "/plan-type",
  dashboardController.select_plan_type
);

// router.post("/banner/add", authMiddleware, dashboardController.add_banner);
// router.get("/banner/get/:productId", authMiddleware, dashboardController.get_banner);
// router.put("/banner/update/:bannerId", authMiddleware, dashboardController.update_banner);

// router.get("/banners", dashboardController.get_banners);

module.exports = router;
