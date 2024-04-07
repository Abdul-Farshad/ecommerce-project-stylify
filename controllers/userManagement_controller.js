const User = require("../models/user");

const getUserManagement = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 5;
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const count = await User.countDocuments();
    const pages = [];
    const totalPage = Math.ceil(count / limit);
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= totalPage; i++) {
      pages.push(i);
    }
    res.render("user_management", { title: "User management", users, pages });
  } catch (err) {
    console.error(`getting user management page Error: ${err}`);
  }
};

// block user
// eslint-disable-next-line consistent-return
const blockUser = async (req, res) => {
  try {
    console.log("when blocking session:", req.session);
    console.log("blocking user");
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });
    if (user) {
      user.isBlocked = true;
      await user.save();
      req.session.isUser = false;
      return res.redirect("/user_management");
    }
    throw new Error("user not found in database");
  } catch (err) {
    console.error(`user blocking error: ${err.message}`);
  }
};

// unblock user
const unBlockUser = async (req, res) => {
  try {
    console.log("going to unblock user");
    const userId = req.params.id;
    const user = await User.findOne({ _id: userId });
    if (user) {
      user.isBlocked = false;
      await user.save();
      req.session.isUser = true;
      res.redirect("/user_management");
    } else {
      console.error("user not found in database");
    }
  } catch (error) {
    console.error(`blocking user error: ${error}`);
  }
};

module.exports = {
  getUserManagement,
  blockUser,
  unBlockUser,
};
