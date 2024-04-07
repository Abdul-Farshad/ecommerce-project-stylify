const express = require("express");

const router = express.Router();
const userAccount = require("../../controllers/userAccount_controller");
const { userLoginCheck } = require("../../middlewares/auth");

// get user profile page
router.get("/account", userLoginCheck, userAccount.getMyAccount);

// get edit user profile page
router.get("/account/edit_profile", userLoginCheck, userAccount.getEditpage);

// update user profile data (if email not changed)
router.patch(
  "/account/update_user_data/:id",
  userLoginCheck,
  userAccount.updateUserData,
);
// update user profile data (if email changed)
router.patch(
  "/validate_otp/:id",
  userLoginCheck,
  userAccount.validateOTPAndUpdateUserData,
);

// -------------------------------------------------------------------------------------------------

// Get manage address page
router.get(
  "/account/manage_address",
  userLoginCheck,
  userAccount.getManageAddress,
);

// Get new address add page
router.get(
  "/account/manage_address/add_address",
  userLoginCheck,
  userAccount.getAddNewAddress,
);
// Add new address
router.post(
  "/account/manage_address/add_address",
  userLoginCheck,
  userAccount.addNewAddress,
);

// Get edit existing address
router.get(
  "/account/manage_address/edit_address/:id",
  userLoginCheck,
  userAccount.getEditAddress,
);
// Edit address patch method
router.patch(
  "/account/manage_address/edit_address/:id",
  userLoginCheck,
  userAccount.editAddress,
);

// get delete existing address page
router.get("/deleteAddress/:id", userLoginCheck, userAccount.deleteAddress);

// -------------------------------------------------------------------------------------------------

// Get my orders page
router.get("/account/my_orders", userLoginCheck, userAccount.getMyOrders);

// Get order details page
router.get(
  "/account/my_orders/order_details/:id",
  userLoginCheck,
  userAccount.getOrderDetails,
);

// Cancel order
router.get(
  "/account/my_orders/order_details/cancel_order/:id",
  userLoginCheck,
  userAccount.cancelOrder,
);
// Return order
router.get("/account/my_orders/order_details/return/:id", userLoginCheck, userAccount.returnOrder);

// Download order invoice
router.get("/download_invoice", userLoginCheck, userAccount.downloadInvoice);

// Get wishlist page
router.get("/account/wishlist", userLoginCheck, userAccount.getMyWishlist);

// Get Wallet page
router.get("/account/my_wallet", userLoginCheck, userAccount.getMyWallet);
module.exports = router;
