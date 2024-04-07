/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
const bcryptjs = require("bcryptjs");
const moment = require("moment");
const easyinvoice = require("easyinvoice");
const User = require("../models/user");
const OTPModel = require("../models/otpSchema");
const Address = require("../models/address");
const { sendOTPEmail } = require("./userRegValidation");
const Order = require("../models/order");
const Product = require("../models/product");
const Wishlist = require("../models/wishlist");
const Wallet = require("../models/wallet");
const Transaction = require("../models/transaction");

// get user profile page
const getMyAccount = async (req, res) => {
  try {
    const { isUser } = req.session;
    const userId = req.session.user_id;
    console.log(userId);
    const userData = await User.findById(userId);
    res.render("my_account", { title: "My account", isUser, userData });
  } catch (err) {
    console.error("user account page rendering error: ", err.message);
  }
};

// get user profile data edit page
const getEditpage = async (req, res) => {
  try {
    const { isUser } = req.session;
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    res.render("edit_user_profile", {
      title: "Edit Profile",
      isUser,
      userData,
    });
  } catch (err) {
    console.log("getting user profile editing page error: ", err.message);
  }
};

// update user profile data
const updateUserData = async (req, res) => {
  try {
    console.log("reached at update user data route");
    const userId = req.params.id;
    if (!userId) {
      throw new Error("couldn't find user id for updating user profile data");
    }
    const { fname, userName, email, mobileNumber } = req.body;
    req.session.userData = {
      fname,
      userName,
      email,
      mobileNumber,
    };
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw new Error(
        "couldn't find a existing user with received user id for updating user profile data"
      );
    }
    console.log(req.session);
    if (email && email !== existingUser.email) {
      console.log("new email and existing email are different");
      console.log(
        "checking the provided email is already in use with another account"
      );
      const existingEmail = await User.find({ email });
      if (existingEmail.length > 0) {
        console.log("The email address is already in use");
        return res
          .status(400)
          .json({ error: "The email address is already in use" });
      }
      sendOTPEmail(email, res);
      return res.status(200).json({ otpRequired: true });
    }
    // compare existing data with new data
    if (fname !== existingUser.fname) {
      existingUser.fname = fname;
    }
    if (userName !== existingUser.userName) {
      existingUser.userName = userName;
    }
    if (email !== existingUser.email) {
      existingUser.email = email;
    }
    if (mobileNumber !== existingUser.mobileNumber) {
      existingUser.mobileNumber = mobileNumber;
    }
    console.log(existingUser);
    console.log("going to save the new user data");
    // save updated userData
    await existingUser.save();
    return res.status(200).json("Information updated successfully");
  } catch (err) {
    console.error("user profile data updating error: ", err.message);
  }
};

// validate otp and update user profile data
const validateOTPAndUpdateUserData = async (req, res) => {
  try {
    console.log("reached at validateOTPAndUpdateUserData route");
    const enteredOTP = req.body.otpCode;
    console.log("entered otp is:", enteredOTP);
    const { email } = req.session.userData;
    const userId = req.params.id;
    const storedOTP = await OTPModel.findOne({ email });
    console.log("stored otp is: ", storedOTP);

    if (storedOTP.expiration < Date.now()) {
      return res.status(400).json({
        error: "Sorry, the OTP has expired. Please request a new one",
      });
    }

    if (storedOTP && enteredOTP) {
      const isMatch = await bcryptjs.compare(enteredOTP, storedOTP.hashedOTP);

      if (isMatch) {
        const { userData } = req.session;

        console.log(req.session);
        const existingUser = await User.findById(userId);
        if (!existingUser) {
          throw new Error(
            "couldn't find existing user in database for update user profile data"
          );
        }
        if (userData.fname !== existingUser.fname) {
          existingUser.fname = userData.fname;
        }
        if (userData.userName !== existingUser.userName) {
          existingUser.userName = userData.userName;
        }
        if (userData.email !== existingUser.email) {
          existingUser.email = userData.email;
        }
        if (userData.mobileNumber !== existingUser.mobileNumber) {
          existingUser.mobileNumber = userData.mobileNumber;
        }
        // update existing user data with new one
        await existingUser.save();
        return res.status(200).json({ message: "Updated successfully" });
      }
      console.log("OTP not is match");
      return res.status(400).json({ error: "OTP is incorrect" });
    }
    return res
      .status(400)
      .json({ error: "Sorry, the OTP has expired. Please request a new one" });
  } catch (err) {
    console.log("validate OTP and update user data error:", err.message);
  }
};

// Get manage address page
const getManageAddress = async (req, res) => {
  try {
    const { isUser } = req.session;
    const { userData } = req.session;
    const { message } = req.session || "";

    delete req.session.message;
    // eslint-disable-next-line no-underscore-dangle
    const userAddress = await Address.find({ userId: userData._id });
    console.log("userAddress", userAddress);
    res.render("manage_address", {
      title: "Manage Address",
      isUser,
      userData,
      message,
      userAddress,
    });
  } catch (err) {
    console.log("get manage address page error: ", err.message);
  }
};

// Get add new address page
const getAddNewAddress = (req, res) => {
  try {
    const { isUser } = req.session;
    const { userData } = req.session;
    const errorMsg = req.session.error || "";
    delete req.session.error;
    res.render("add_new_address", {
      title: "Manage Address",
      isUser,
      userData,
      errorMsg,
    });
  } catch (err) {
    console.log("get add new address page error: ", err.message);
  }
};
// add new address post method
const addNewAddress = async (req, res) => {
  try {
    console.log("reached at addNewAddress route");

    const userId = req.session.user_id;
    const {
      fname,
      country,
      state,
      district,
      PINCode,
      mobile,
      city,
      landmark,
      address,
    } = req.body;

    if (!userId) {
      throw new Error("couldn't find user id in session storage");
    }
    const userAddress = {
      userId,
      name: fname,
      country,
      state,
      district,
      PINCode,
      mobile,
      city,
      address,
    };
    if (landmark) {
      userAddress.landmark = landmark;
    }
    // check existing same address
    const existingAddress = await Address.findOne({
      userId: userAddress.userId,
      name: { $regex: new RegExp(`^${userAddress.name}$`, "i") },
      country: userAddress.country,
      state: userAddress.state,
      district: userAddress.district,
      PINCode: userAddress.PINCode,
      mobile: userAddress.mobile,
      city: userAddress.city,
      landmark: userAddress.landmark,
      address: userAddress.address,
    });
    if (existingAddress) {
      req.session.error = "This address already exists";
      res.redirect("/account/manage_address/add_address");
    } else {
      // save the address in database
      await new Address(userAddress).save();

      req.session.message = "New address added successfully";
      res.redirect("/account/manage_address");
    }
  } catch (err) {
    console.log("new address adding error: ", err.message);
  }
};

// get edit existing address page
const getEditAddress = async (req, res) => {
  try {
    const { isUser } = req.session;
    const { userData } = req.session;
    const addressId = req.params.id;
    if (!addressId) {
      throw new Error("couldn't find address id in params");
    }
    const existingAddress = await Address.findById(addressId);
    if (!existingAddress) {
      throw new Error("couldn't find address in database with received id");
    }
    res.render("edit_address", {
      title: "Manage Address",
      isUser,
      userData,
      existingAddress,
    });
  } catch (err) {
    console.log("getting edit address page error: ", err.message);
  }
};

// edit address patch method
const editAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    if (!addressId) {
      return res
        .status(404)
        .json({ error: "Couldn't find address id for edit address" });
    }
    const {
      name,
      country,
      state,
      district,
      PINCode,
      mobile,
      city,
      landmark,
      address,
    } = req.body;

    const existingAddress = await Address.findOne({ _id: addressId });

    if (!existingAddress) {
      return res.status(404).json({
        error: "Couldn't find address in database with received address id",
      });
    }
    const updatedData = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      country,
      state,
      district,
      PINCode,
      mobile,
      city,
      address,
    };
    if (landmark) {
      updatedData.landmark = landmark;
    }
    console.log("before updating: ", updatedData);
    // update the existing data;
    await Address.findOneAndUpdate({ _id: addressId }, updatedData, {
      new: true,
    });
    console.log("address updated successfully");
    return res.status(200).json({ message: "Address updated successfully" });
  } catch (err) {
    console.error("edit address error: ", err.message);
  }
};
// Delete address
const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    if (!addressId) {
      throw new Error("couldn't find address id for deleting address");
    }
    await Address.findByIdAndDelete(addressId);
    console.log("address deleted successfully");
    res.redirect("/account/manage_address");
  } catch (err) {
    console.error("delete address error: ", err.message);
  }
};

// Get my orders page
const getMyOrders = async (req, res) => {
  try {
    const { isUser } = req.session;
    const userId = req.session.user_id;
    const { userData } = req.session;

    const page = req.query.page || 1;
    const limit = 10;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const count = await Order.countDocuments({ user: userId });
    const pages = [];
    const totalPage = Math.ceil(count / limit);
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= totalPage; i++) {
      pages.push(i);
    }

    // formatting all order date
    const formattedOrders = await Promise.all(
      orders.map(async (order) => ({
        ...order.toObject(),
        createdAt: await formatDate(order.createdAt),
      }))
    );
    res.render("my_orders", {
      title: "My Orders",
      isUser,
      formattedOrders,
      userData,
      pages,
    });
  } catch (err) {
    console.error("my orders page rendering error: ", err.message);
  }
};

// Get order details page
const getOrderDetails = async (req, res) => {
  try {
    const { isUser } = req.session;
    const userId = req.session.user_id;
    const orderId = req.params.id;
    const { userData } = req.session;
    let returnAvailable = true;
    if (!orderId) {
      throw new Error("couldn't find order id in req.params");
    }
    const getOrder = await Order.findOne({ _id: orderId, user: userId });
    if (!getOrder) {
      throw new Error(
        "Couldn't find an order with the received order Id and user Id"
      );
    }
    // calculate date for availability of return option
    const tenDaysLater = new Date(
      getOrder.createdAt.getTime() + 10 * 24 * 60 * 60 * 1000
    ); // 10 days in milliseconds
    tenDaysLater.setHours(23, 59, 59, 999); // up to midnight
    console.log("ten days", tenDaysLater);
    const currentDate = new Date();
    if (currentDate <= tenDaysLater) {
      returnAvailable = true;
    } else {
      returnAvailable = false;
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
    if (products.length === 0) {
      throw new Error("couldn't find product data in database");
    }
    const subtotal = order.totalAmount + order.discount - order.shippingCharge;
    res.render("order_details", {
      title: "Order Details",
      isUser,
      userData,
      order,
      products,
      subtotal,
      returnAvailable,
    });
  } catch (err) {
    console.log("order details page rendering error: ", err);
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log("orderID", orderId);
    const userId = req.session.user_id;
    if (!orderId) {
      throw new Error("order Id not received for order cancellation");
    } else if (!userId) {
      throw new Error("couldn't find user name in session storage");
    }
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error(
        "couldn't find an order in database for cancel the order"
      );
    }
    await Order.findByIdAndUpdate(orderId, {
      status: "Cancelled",
      paymentStatus: "Refunded",
    });

    // update stock
    await Promise.all(
      order.products.map(async (product) => {
        const productId = product.product;
        const { quantity } = product;
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: quantity },
        });
      })
    );
    // update wallet and transaction history
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      throw new Error("couldn't find a wallet with userId: ", userId);
    }
    if (order && order.paymentStatus === "Success") {
      const transactionId = await generateRandomId();
      const refundTransaction = new Transaction({
        walletId: wallet._id,
        transactionId,
        amount: order.totalAmount,
        type: "Credit",
        reasonType: "Refund",
        description: "Refund of cancelled order",
      });

      // update Wallet
      wallet.balance += order.totalAmount;
      wallet.transactions.push(refundTransaction._id);

      // save
      await refundTransaction.save();
      await wallet.save();
    }
    res.redirect("/account/my_orders");
  } catch (err) {
    console.log("Order cancellation error: ", err.message);
  }
};

// Return order
const returnOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.session.user_id;
    const { reason } = req.query;
    if (!orderId) {
      throw new Error("couldn't find an order Id");
    } else if (!reason) {
      throw new Error("couldn't received a reason for return the order");
    } else if (!userId) {
      throw new Error("couldn't find user Id");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("couldn't find order in database with this order Id");
    }
    console.log("order", order);
    await Order.findByIdAndUpdate(orderId, {
      status: "Returned",
      returnReason: reason,
      paymentStatus: "Refunded",
    });

    // update stock
    await Promise.all(
      order.products.map(async (product) => {
        const productId = product.product;
        const { quantity } = product;
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: quantity },
        });
      })
    );
    // update wallet and transaction history
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      throw new Error("couldn't find a wallet with userId: ", userId);
    }
    if (order && order.paymentStatus === "Success") {
      const transactionId = await generateRandomId();
      const refundTransaction = new Transaction({
        walletId: wallet._id,
        transactionId,
        amount: order.totalAmount,
        type: "Credit",
        reasonType: "Refund",
        description: "Refund for returned order",
      });

      // update Wallet
      wallet.balance += order.totalAmount;
      wallet.transactions.push(refundTransaction._id);

      // save
      await refundTransaction.save();
      await wallet.save();
    }
    res.redirect("/account/my_orders");
  } catch (err) {
    console.error("Return order error:", err);
  }
};
// Download invoice
const downloadInvoice = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const orderId = req.query.id;
    if (!orderId) {
      throw new Error("couldn't find order_id in query params");
    } else if (!userId) {
      throw new Error("couldn't find user id in session storage");
    }

    const getOrder = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate("user", "fname");
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
    const currentDate = await formatDate(new Date());

    // Generate invoice PDF
    const data = {
      documentTitle: "Invoice",
      currency: "INR",
      taxNotation: "GST",
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      logo: "Stylify", // Use the the logo
      sender: {
        company: "Stylify",
        address: "sample address",
        zip: "12345",
        city: "Stylify city",
        country: "India",
      },
      client: {
        company: order.user.fname,
        address: order.shippingAddress.address,
        zip: order.shippingAddress.PINCode,
        city: order.shippingAddress.district,
        country: order.shippingAddress.country,
      },
      information: {
        number: order.orderId,
        date: currentDate,
      },
      products: products.map((product) => ({
        quantity: product.quantity,
        description: product.name,
        tax: 0,
        price: product.price,
      })),
      bottomNotice: "Thank you for your business",
    };

    const result = await easyinvoice.createInvoice(data);
    const pdfBase64 = result.pdf.toString("base64");
    // Send the PDF as an attachment
    res.attachment("invoice.pdf");
    res.send(Buffer.from(pdfBase64, "base64"));
  } catch (err) {
    console.error("Invoice download error: ", err);
  }
};

// Get My wishlist page
const getMyWishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { isUser } = req.session;
    const { userData } = req.session;
    if (!userId) {
      throw new Error("couldn't find user ID in session storage");
    }
    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: "product",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    const wishlistItems = wishlist?.product.map((product) => ({
      wishlistItemId: product._id,
      productId: product.productId._id,
      addedDate: product.addedDate,
      proName: product.productId.name,
      regPrice: product.productId.regularPrice,
      proPrice: product.productId.price,
      image: product.productId.images[0],
    }));
    console.log(wishlistItems);
    res.render("wishlist", {
      title: "My Wishlist",
      isUser,
      userData,
      wishlistItems,
    });
  } catch (err) {
    console.log("whish list page rendering error: ", err);
  }
};

// Get my wallet page
const getMyWallet = async (req, res) => {
  try {
    const { isUser } = req.session;
    const userId = req.session.user_id;
    const { userData } = req.session;

    const page = req.query.page || 1;
    const limit = 5;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      throw new Error("couldn't find wallet in database with the userId");
    }
    // eslint-disable-next-line no-use-before-define
    const balance = formateAmount(wallet.balance);

    const allTransactions = await Transaction.find({
      walletId: wallet._id,
    }).sort({ createdAt: -1 });

    const totalTransactions = allTransactions.length;
    const totalPages = Math.ceil(totalTransactions / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalTransactions);

    // formate date and restructure array
    const transactions = await Promise.all(
      allTransactions.slice(startIndex, endIndex).map(async (transaction) => ({
        ...transaction.toObject(),
        date: await formatDate(transaction.date),
      }))
    );

    // Generate pages array for pagination
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    res.render("wallet", {
      title: "My Wallet",
      isUser,
      userData,
      wallet,
      balance,
      transactions,
      pages,
    });
  } catch (err) {
    console.error("Wallet page rendering error", err.message);
  }
};
// Date formatting function
const formatDate = async (date) => moment(date).format("D-MM-YYYY");

// Amount formatting function
function formateAmount(amount) {
  const result = new Intl.NumberFormat("en-IN", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return result;
}

async function generateRandomId() {
  const timestamp = Date.now().toString();
  return `#${timestamp}`;
}

module.exports = {
  formatDate,
  getMyAccount,
  getEditpage,
  updateUserData,
  validateOTPAndUpdateUserData,
  getManageAddress,
  getAddNewAddress,
  addNewAddress,
  getEditAddress,
  editAddress,
  deleteAddress,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  returnOrder,
  downloadInvoice,
  getMyWishlist,
  getMyWallet,
  formateAmount,
};
