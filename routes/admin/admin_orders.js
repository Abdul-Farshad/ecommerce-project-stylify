const express = require("express");

const router = express.Router();
const orderManagement = require("../../controllers/orderManagement_controller");
const { adminLogoutCheck } = require("../../middlewares/auth");
// Get orders page
router.get("/orders", adminLogoutCheck, orderManagement.getOrders);

// Get view order details page
router.get("/orders/view_order_details/:id", adminLogoutCheck, orderManagement.viewOrderDetails);

// Change order status
router.get("/orders/view_order_details/changeStatus/:id", adminLogoutCheck, orderManagement.changeOrderStatus);
module.exports = router;
