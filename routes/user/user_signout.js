const express = require("express");

const router = express.Router();

// User Sign out get method
// eslint-disable-next-line consistent-return
router.get("/sign_out", (req, res) => {
  try {
    console.log("before logout :", req.session);
    if (req.session.isUser || req.session.user_id) {
      delete req.session.user_id;
      delete req.session.isUser;
    }
    console.log("after logout :", req.session);
    return res.redirect("/home");
  } catch (err) {
    console.log(`user signout error: ${err}`);
  }
});

module.exports = router;
