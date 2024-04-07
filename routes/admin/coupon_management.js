const express = require("express");

const router = express.Router();
const { adminLogoutCheck } = require("../../middlewares/auth");
const couponManagement = require("../../controllers/couponManagement_controller");

// Get coupon management page
router.get("/coupon", adminLogoutCheck, couponManagement.getCouponManagement);

// create new coupon form submission
router.post(
  "/coupon/create_coupon",
  adminLogoutCheck,
  couponManagement.createCoupon,
);

// Delete Coupon
router.get(
  "/coupon/deleteCoupon/:id",
  adminLogoutCheck,
  couponManagement.deleteCoupon,
);
module.exports = router;
