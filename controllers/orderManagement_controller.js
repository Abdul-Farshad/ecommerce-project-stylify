const Order = require("../models/order");
const { formatDate } = require("./userAccount_controller");
const Product = require("../models/product");

// Get admin side orders list
const getOrders = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;
    const orders = await Order.find({ status: { $ne: "Pending" } })
      .sort({ createdAt: -1 })
      .populate("user", "fname")
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const count = await Order.countDocuments({ status: { $ne: "Pending" } });
    const pages = [];
    const totalPage = Math.ceil(count / limit);
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= totalPage; i++) {
      pages.push(i);
    }
    if (!orders.length === 0) {
      console.log("No orders found");
    }
    res.render("admin_orders", { title: "Order Management", orders, pages });
  } catch (err) {
    console.log("order management page rendering error", err.message);
  }
};

// Get view order details page
const viewOrderDetails = async (req, res) => {
  try {
    console.log("reached at admin side get order details route");
    const orderId = req.params.id;
    if (!orderId) {
      throw new Error("couldn't find order id in req.params");
    }
    const getOrder = await Order.findOne({ _id: orderId });
    if (!getOrder) {
      throw new Error(
        "Couldn't find an order with the received order Id and user Id"
      );
    }
    // formatting  date
    const order = {
      ...getOrder.toObject(),
      createdAt: await formatDate(getOrder.createdAt),
    };
    const products = await Promise.all(
      order.products.map(async (orderProduct) => {
        const product = await Product.findById(orderProduct.product);
        if (!product) {
          throw new Error(
            `couldn't find a product with ${orderProduct.product}`
          );
        }
        return {
          ...product.toObject(),
          quantity: orderProduct.quantity,
          price: orderProduct.price,
        };
      })
    );
    console.log("products", products);
    if (products.length === 0) {
      throw new Error("couldn't find product data in database");
    }

    const subtotal = order.totalAmount + order.discount - order.shippingCharge;

    res.render("admin_order_details", {
      title: "Order Management",
      order,
      products,
      subtotal,
    });
  } catch (err) {
    console.log("view order details page rendering error:", err);
  }
};

// Change order status
const changeOrderStatus = async (req, res) => {
  try {
    console.log("reached at change order status route");
    const orderId = req.params.id;
    const newStatus = req.query.status;
    console.log(newStatus);
    if (!orderId) {
      throw new Error("order Id not received for order cancellation");
    }
    if (!newStatus) {
      throw new Error("status not received for update order status");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error(
        "couldn't find an order in database for cancel the order"
      );
    }
    const updateFields = { status: newStatus };

    // If the new status is "Delivered", update paymentStatus to "Success"
    if (newStatus === "Delivered") {
      updateFields.paymentStatus = "Success";
    }
    await Order.findByIdAndUpdate(orderId, updateFields, { new: true });
    res.redirect(`/orders/view_order_details/${orderId}`);
  } catch (err) {
    console.log("changing order status error:", err);
  }
};
module.exports = {
  getOrders,
  viewOrderDetails,
  changeOrderStatus,
};
