/* eslint-disable consistent-return */
const express = require("express");
const User = require("../../models/user");

const router = express.Router();

router.get("/delete_account", async (req, res) => {
  try {
    console.log(`before deleting user Account : ${JSON.stringify(req.session, null, 2)}`);

    if (req.session.user_id) {
      await User.findByIdAndDelete(req.session.user_id);
      delete req.session.userData;
      delete req.session.user_id;
      delete req.session.isUser;
    } else {
      throw new Error("cannot find user id in session storage for deleting user account");
    }
    console.log(`after deleting user account  : ${JSON.stringify(req.session, null, 2)}`);
    return res.redirect("/home");
  } catch (err) {
    console.log(`user signout error: ${err}`);
  }
});

module.exports = router;
