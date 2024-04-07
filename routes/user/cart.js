const express = require("express");

const router = express.Router();
const { userLoginCheck } = require("../../middlewares/auth");
const cartController = require("../../controllers/cart_controller");

// Get cart page
router.get("/cart", userLoginCheck, cartController.viewCart);

// add product to cart
router.post("/add_to_cart", userLoginCheck, cartController.addToCart);

// remove item from cart
router.delete(
  "/remove_from_cart/:id",
  userLoginCheck,
  cartController.removeCartItem,
);

// update cart item quantity
router.put(
  "/update_cartItem_qty/:id",
  userLoginCheck,
  cartController.updateQty,
);

// get cart items
router.get("/get_cart_items", userLoginCheck, cartController.getCartItems);

// get Checkout page
router.get("/cart/checkout", userLoginCheck, cartController.getCheckoutPage);

// Get available coupons
router.get("/cart/checkout/getCoupons", userLoginCheck, cartController.getCoupons);

// place order
router.post(
  "/cart/checkout/place_order",
  userLoginCheck,
  cartController.placeOrder,
);

// update order payment status
router.post(
  "/update_order_paymentStatus",
  userLoginCheck,
  cartController.updatePaymentStatus,
);
module.exports = router;
