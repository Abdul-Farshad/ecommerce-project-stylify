const Cart = require("../models/cart");

// when try to get login page
const userLogoutCheck = async (req, res, next) => {
  try {
    if (req.session?.user_id && req.session.isUser) {
      // User is already logged in, redirect to home page
      res.redirect("/home");
    } else {
      // User is not logged in, allow access to login page
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

// if user not login (redirecting to login page)
const userLoginCheck = async (req, res, next) => {
  try {
    if (!req.session.user_id || !req.session.isUser) {
      // check the request from front end (fetch)
      if (req.headers.accept.includes("application/json")) {
        return res
          .status(401)
          .json({ message: "User not logged in", redirect: "/user_signin" });
      }
      console.log(3);
      res.redirect("/user_signin");
    } else {
      next();
    }
  } catch (err) {
    console.error("user login check middleware error: ", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// check approval for rendering reset password page (user)
const isResetPass = (req, res, next) => {
  if (!(req.session.resetPass && req.session.resetPass.approve)) {
    return res.redirect("/forgot_password");
  }
  next();
};

// -------------------------------------------------------------------------------------------------

// admin login checking middleware
const adminLoginCheck = async (req, res, next) => {
  try {
    if (req.session?.adminData?.adminLogin) {
      res.redirect("/admin_dashboard");
    } else {
      next();
    }
  } catch (err) {
    console.error(err.message);
  }
};

// check admin sig out and use this for all admin routes
const adminLogoutCheck = async (req, res, next) => {
  try {
    if (req.session.adminData) {
      next();
    } else {
      res.redirect("/admin_signin");
    }
  } catch (err) {
    console.error(err.message);
  }
};

// -------------------------------------------------------------------------------------------------

// checking cart items for all routes navbar
const cartItemQtyCheck = async (req, res, next) => {
  const userId = req.session.user_id;
  const cartItemQty = await Cart.countDocuments({ userId });
  res.locals.cartItemQty = cartItemQty; // Make it available to all templates
  next();
};

module.exports = {
  userLogoutCheck,
  userLoginCheck,
  adminLoginCheck,
  adminLogoutCheck,
  cartItemQtyCheck,
  isResetPass,
};
