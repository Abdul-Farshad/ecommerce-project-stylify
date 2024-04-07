const express = require("express");

const router = express.Router();

const adminDashboardController = require("../../controllers/adminDashboard_controller");
const { adminLogoutCheck } = require("../../middlewares/auth");
// Get admin panel page
router.get(
  "/admin_dashboard",
  adminLogoutCheck,
  adminDashboardController.getAdminDashboard,
);

// get dashboard chart data
router.get("/get_chartData", adminLogoutCheck, adminDashboardController.getChartData);

// get top selling products and category
router.get("/get_top_selling_data", adminLogoutCheck, adminDashboardController.getTopSellingItems);
module.exports = router;
