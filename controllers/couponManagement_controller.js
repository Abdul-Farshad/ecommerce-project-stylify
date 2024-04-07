/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */

const Coupon = require("../models/coupon");
const { formatDate } = require("./userAccount_controller");
// Get coupon management page
const getCouponManagement = async (req, res) => {
  const couponDeleted = req.session.couponDeleted || false;
  delete (req.session.couponDeleted);

  const page = req.query.page || 1;
  const limit = 5;
  const pages = [];

  const allCoupons = await Coupon.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  const count = await Coupon.countDocuments();
  const totalPage = Math.ceil(count / limit);
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i <= totalPage; i++) {
    pages.push(i);
  }
  // formate date and restructure array
  const coupons = await Promise.all(
    allCoupons.map(async (coupon) => ({
      ...coupon.toObject(),
      createdAt: await formatDate(coupon.createdAt),
      expirationDate: await formatDate(coupon.expirationDate),
    })),
  );
  res.render("coupon_management", {
    title: "Coupon Management",
    pages,
    coupons,
    couponDeleted,
  });
};

// create new coupon
const createCoupon = async (req, res) => {
  try {
    const { minimumPurchaseAmount, discountPercentage, expirationDate } = req.body;
    // generate coupon code
    // eslint-disable-next-line no-use-before-define
    const couponCode = generateCouponCode(6);
    const couponData = {
      couponCode,
      minimumPurchaseAmount,
      discountPercentage,
      expirationDate,
    };
    //   store in database
    const newCoupon = await new Coupon(couponData).save();
    couponData.expirationDate = await formatDate(couponData.expirationDate);
    couponData._id = newCoupon._id;
    couponData.createdAt = await formatDate(newCoupon.createdAt);
    return res
      .status(200)
      .json({ message: "Coupon created successfully!", couponData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    console.log("reached delete coupon route");
    console.log(req.params);
    const couponId = req.params.id;
    if (!couponId) {
      throw new Error("couldn't find a coupon Id in params");
    }
    await Coupon.findByIdAndDelete(couponId);
    console.log("coupon deleted successfully");
    req.session.couponDeleted = true;
    res.redirect("/coupon");
  } catch (err) {
    console.error("coupon deletion error: ", err);
  }
};

// generate random string
function generateCouponCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let couponCode = "";
  for (let i = 0; i < length; i++) {
    couponCode += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return couponCode;
}

module.exports = {
  getCouponManagement,
  createCoupon,
  deleteCoupon,
};
