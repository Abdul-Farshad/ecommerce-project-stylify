const express = require("express");

const router = express.Router();

const { adminLogoutCheck } = require("../../middlewares/auth");
const salesReportController = require("../../controllers/salesReport_controller");

// Get sales report page
router.get("/sales_report", adminLogoutCheck, salesReportController.getSalesReport);
// Download sales report
router.get("/download_sales_report", adminLogoutCheck, salesReportController.downloadSalesReport);

module.exports = router;
