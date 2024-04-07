const express = require("express");

const router = express.Router();

// admin sign out
// eslint-disable-next-line consistent-return
router.get("/admin_signout", (req, res) => {
  try {
    if (req.session.adminData) {
      delete req.session.adminData;
      return res.redirect("/admin_signin");
    }
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

module.exports = router;
