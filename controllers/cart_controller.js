const Razorpay = require("razorpay");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Address = require("../models/address");
const User = require("../models/user");
const Order = require("../models/order");
const Coupon = require("../models/coupon");
const { formatDate } = require("./userAccount_controller");

// config razorpay
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// view products in shopping cart
const viewCart = async (req, res) => {
  try {
    const { isUser } = req.session;
    const userId = req.session.user_id;
    let shippingCharge = 0;
    const cartItems = await Cart.find({ userId }).populate("productId");
    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.productId.price * item.quantity,
      0
    );
    const discount = cartItems.reduce(
      (acc, item) => acc + item.productId.discount * item.quantity,
      0
    );
    let total = subtotal - discount;
    if (total < 1000) {
      shippingCharge = 40;
      total += shippingCharge;
    }
    res.render("cart", {
      title: "Shopping Cart",
      isUser,
      cartItems,
      subtotal,
      discount,
      shippingCharge,
      total,
    });
  } catch (err) {
    console.log("shopping cart page rendering error: ", err.message);
  }
};

// add products to cart
const addToCart = async (req, res) => {
  try {
    console.log("reached in add to cart back end");
    const { proId } = req.body;
    if (proId) {
      const product = await Product.findById(proId);
      if (product) {
        const userId = req.session.user_id;
        if (userId) {
          // check the product already exist in shopping cart
          const cartItem = await Cart.findOne({
            productId: proId,
            userId,
          }).populate("productId", "stock");
          if (cartItem) {
            if (cartItem.quantity >= cartItem.productId.stock) {
              return res.status(200).json({ redirect: "/cart" });
            }
            cartItem.quantity += 1;
            await cartItem.save();
            return res
              .status(200)
              .json({ message: "Item added to cart successfully" });
          }
          await new Cart({
            productId: proId,
            quantity: 1,
            userId,
          }).save();
          const cartItemQty = await Cart.countDocuments({ userId });
          return res
            .status(200)
            .json({ message: "Item added to cart successfully", cartItemQty });
        }
        return res.status(404).json({
          message: "for adding product to cart couldn't find user Id",
        });
      }
      return res.status(404).json({
        message:
          "product couldn't find in database for adding to shopping cart",
      });
    }
    throw new Error("product id not received");
  } catch (err) {
    console.error("product adding to shopping cart error: ", err.message);
  }
};

// Delete shopping cart item
const removeCartItem = async (req, res) => {
  try {
    console.log("reached at remove cart item route");
    const cartItemId = req.params.id;
    const userId = req.session.user_id;
    if (!cartItemId) {
      throw new Error("not received an id for deleting cart item");
    }
    if (!userId) {
      throw new Error("couldn't find user Id in session storage");
    }
    if (cartItemId === "all") {
      await Cart.deleteMany({ userId });
      return res
        .status(200)
        .json({ message: "All items removed successfully" });
    }
    await Cart.findByIdAndDelete(cartItemId);
    return res.status(200).json({ message: "Item removed successfully" });
  } catch (err) {
    console.error("removing cart item error:", err.message);
  }
};

// Update cart item quantity
const updateQty = async (req, res) => {
  try {
    const cartItemId = req.params.id;
    const newQty = JSON.parse(req.body.quantity) || 1;
    if (cartItemId) {
      const cartItem = await Cart.findById(cartItemId).populate(
        "productId",
        "stock"
      );
      if (cartItem) {
        if (cartItem.productId.stock <= newQty - 1) {
          return res.status(400).json({
            noStock: "Sorry! We don't have any more units for this item",
          });
        }
        cartItem.quantity = newQty;
        cartItem.save();
        return res.status(200).send("Cart item quantity updated successfully");
      }
      return res.status(404).json({ error: "Cart item not found" });
    }
    return res.status(400).json({ error: "Invalid cart item ID" });
  } catch (err) {
    console.error("updating cart item quantity error: ", err.message);
  }
};

// get cart items (for updating the cart summery)
const getCartItems = async (req, res) => {
  try {
    const userId = req.session.user_id;
    if (userId) {
      const cartItems = await Cart.find({ userId }).populate("productId");
      return res.status(200).json({ cartItems });
    }
    throw new Error("user Id missing in session");
  } catch (err) {
    console.error("get cart items error: ", err.message);
  }
};

// get check out page
const getCheckoutPage = async (req, res) => {
  try {
    const { isUser } = req.session;
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    const existingOrderId = req.query.id;

    let subtotal = 0;
    let discount = 0;
    let total = 0;
    let appliedCoupon = "";
    let shippingCharge = 0;
    if (existingOrderId) {
      // query existing order
      const order = await Order.findOne(
        { user: userId, _id: existingOrderId },
        {
          discount: 1,
          totalAmount: 1,
          appliedCoupon: 1,
          shippingCharge: 1,
        }
      );
      if (!order) {
        throw new Error("couldn't find existing order with received order_id");
      } else {
        console.log("existing order", order);
        subtotal = order.totalAmount + order.discount;
        discount = order.discount;
        if (total < 1000) {
          shippingCharge = 40;
          total += 40;
        }
        total = order.totalAmount;
        if (order.appliedCoupon) {
          appliedCoupon = order.appliedCoupon;
        }
      }
    } else {
      const cartItems = await Cart.find({ userId }).populate("productId");
      cartItems.forEach((item) => {
        if (item.productId.status === "Deleted") {
          console.log(item);
          return res.redirect(
            `/cart?msg=Sorry, the product '${item.productId.name}' is currently not available. Please remove it from your cart to proceed.`
          );
        }
      });
      subtotal = cartItems.reduce(
        (acc, item) => acc + item.productId.price * item.quantity,
        0
      );
      discount = cartItems.reduce(
        (acc, item) => acc + item.productId.discount * item.quantity,
        0
      );
      total = subtotal - discount;
      if (total < 1000) {
        shippingCharge = 40;
        total += 40;
      }
    }

    const address = await Address.find({ userId });
    res.render("checkout", {
      title: "Checkout",
      isUser,
      subtotal,
      discount,
      shippingCharge,
      total,
      address,
      userData,
      appliedCoupon,
      existingOrderId,
    });
  } catch (err) {
    console.log("get checkout page error: ", err.message);
  }
};

// Get available coupons
const getCoupons = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const totalAmount = parseFloat(req.query.tAmount);
    const currentDate = new Date();
    if (!totalAmount) {
      throw new Error("couldn't find total Amount in query string");
    }
    const coupons = await Coupon.find({
      minimumPurchaseAmount: { $lte: totalAmount },
      expirationDate: { $gte: currentDate },
      redeemedBy: { $ne: userId },
    }).sort({ expirationDate: 1 });
    if (coupons.length) {
      const formattedCoupons = [];
      await Promise.all(
        coupons.map(async (coupon) => {
          formattedCoupons.push({
            ...coupon.toObject(),
            expirationDate: await formatDate(coupon.expirationDate),
          });
        })
      );
      return res.status(200).json(formattedCoupons);
    }
    return res.status(404).json({ message: "No coupons available" });
  } catch (err) {
    console.log(err.message);
  }
};

// Place order with cart items or retry pending order
const placeOrder = async (req, res) => {
  try {
    console.log("reached at order placing route");
    const { addressId, paymentMethod, discount, totalAmount, couponCode } =
      req.body;
    const { existingOrderId } = req.body || null;
    const userId = req.session.user_id;
    if (!userId) {
      throw new Error("couldn't find user id in session storage");
    }
    const address = await Address.findById(addressId);
    if (!address) {
      throw new Error(
        "couldn't find a address in database with received address id"
      );
    }
    // check is it retry order or not
    if (existingOrderId) {
      const existingOrder = await Order.findById(existingOrderId);
      if (!existingOrder) {
        throw new Error("couldn't find existing order");
      }
      console.log(existingOrder);
      const { orderId } = existingOrder;
      if (paymentMethod === "Cash on Delivery") {
        existingOrder.shippingAddress = address;
        existingOrder.paymentMethod = paymentMethod;
        existingOrder.status = "Processing";
        existingOrder.appliedCoupon = couponCode || null;
        existingOrder.discount = discount;
        existingOrder.totalAmount = totalAmount;
        await existingOrder.save();
        // update stock quantity
        await updateStock(existingOrder);
        console.log("existing order updated successfully");
        return res
          .status(200)
          .json({ message: "Order placed successfully", orderId });
      }
      if (paymentMethod === "rzp") {
        const changedOrderData = {
          addressId,
          paymentMethod: "Razorpay",
          discount,
          totalAmount,
          couponCode,
        };
        const razorpayOrder = await instance.orders.create({
          amount: totalAmount * 100,
          currency: "INR",
          receipt: orderId,
        });
        // Redirect the user to the Razorpay payment gateway
        res.status(200).json({
          orderId,
          changedOrderData,
          razorpayOrderId: razorpayOrder.id,
          razorpayKey: process.env.RAZORPAY_KEY_ID,
          amount: totalAmount * 100,
          currency: "INR",
        });
      }
    } else {
      // fetch cart items
      const cartItems = await Cart.find({ userId });

      if (!cartItems.length) {
        throw new Error("couldn't find cart items with the user Id");
      }

      const products = await Promise.all(
        cartItems.map(async (item) => {
          const product = await Product.findById(item.productId).lean().exec();
          if (!product) {
            throw new Error(`Product not found for ID: ${item.productId}`);
          }
          return {
            // eslint-disable-next-line no-underscore-dangle
            product: product._id,
            quantity: item.quantity,
            price: product.price,
          };
        })
      );

      if (couponCode !== "") {
        console.log("coupon code", couponCode);
        const coupon = await Coupon.findOne({ couponCode });
        if (coupon && !coupon.redeemedBy.includes(userId)) {
          coupon.redeemedBy.push(userId);
          // coupon.redeemed = true;
          await coupon.save();
        } else if (!coupon) {
          res.status(400).json({
            error: "Sorry, the coupon you applied is no longer valid.",
          });
        }
      }
      // Generate order number
      // eslint-disable-next-line no-use-before-define
      const orderId = await generateRandomId();
      if (!orderId) {
        throw new Error("couldn't find orderId");
      }
      const orderData = {
        user: userId,
        orderId,
        products,
        discount,
        shippingCharge: totalAmount < 1000 ? 40 : 0,
        totalAmount,
        shippingAddress: address,
        status: paymentMethod === "Cash on Delivery" ? "Processing" : "Pending",
        paymentMethod: paymentMethod === "rzp" ? "Razorpay" : paymentMethod,
        appliedCoupon: couponCode || null,
      };
      await new Order(orderData)
        .save()
        .then(async (order) => {
          if (paymentMethod === "Cash on Delivery") {
            // update stock quantity
            await updateStock(order);
            return res
              .status(200)
              .json({ message: "Order placed successfully", orderId });
          }
          if (paymentMethod === "rzp") {
            console.log("payment method is razorpay");

            const razorpayOrder = await instance.orders.create({
              amount: totalAmount * 100,
              currency: "INR",
              receipt: orderId,
            });
            // Redirect the user to the Razorpay payment gateway
            res.status(200).json({
              orderId,
              razorpayOrderId: razorpayOrder.id,
              razorpayKey: process.env.RAZORPAY_KEY_ID,
              amount: totalAmount * 100,
              currency: "INR",
            });
          }
        })
        .catch((err) => {
          console.log(err.message);
          return res.status(500).json({ error: "Place order error:", err });
        });
    }
  } catch (err) {
    console.error("place order error: ", err.message);
  }
};

// update payment status after razorpay payment success
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, paymentId, status, changedOrderData } = req.body;
    if (!paymentId || !status || !orderId) {
      return res
        .status(400)
        .json({ message: "Missing paymentId or status or orderId" });
    }
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(400).json({
        message: "couldn't find the order in database with the order ID",
      });
    }
    // update stock
    updateStock(order);

    if (changedOrderData) {
      const address = await Address.findById(changedOrderData.addressId);
      if (!address) {
        throw new Error(
          "couldn't find a address in database with give address ID"
        );
      }
      console.log("changed order data", changedOrderData);
      order.shippingAddress = address;
      order.appliedCoupon = changedOrderData.couponCode || null;
      order.discount = changedOrderData.discount;
      order.totalAmount = changedOrderData.totalAmount;
      await order.save();
    }
    order.paymentId = paymentId;
    order.paymentStatus = status;
    order.status = "Processing";
    // save the order after payment status updating
    order.save();
    res.status(200).json({ message: "Payment status updated successfully" });
  } catch (err) {
    console.log("update payment status error: ", err);
    res
      .status(500)
      .json({ message: "Failed to update payment status", error: err.message });
  }
};

async function generateRandomId() {
  const timestamp = Date.now().toString();
  return `#${timestamp}`;
}

async function updateStock(order) {
  await Promise.all(
    order.products.map(async (product) => {
      const proId = product.product;
      const { quantity } = product;
      await Product.findByIdAndUpdate(proId, {
        $inc: { stock: -quantity },
      });
    })
  );
}
module.exports = {
  viewCart,
  addToCart,
  removeCartItem,
  updateQty,
  getCartItems,
  getCheckoutPage,
  getCoupons,
  placeOrder,
  updatePaymentStatus,
};
