const express = require("express");

const router = express.Router();
const nocache = require("nocache");
const signinController = require("../../controllers/userSignin_controller");
const { userLogoutCheck } = require("../../middlewares/auth");
const { isResetPass } = require("../../middlewares/auth");
/* GET users signin page. */
router.get("/user_signin", userLogoutCheck, nocache(), (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    const message = req.session.msg;
    const error = req.session.err;
    const { isBlocked } = req.session;

    delete req.session.msg;
    delete req.session.err;
    delete req.session.isBlocked;

    res.render("user_signin", {
      title: "Sign in",
      message,
      error,
      isBlocked,
    });
  } catch (err) {
    console.log(`user signin Error: ${err}`);
  }
});

// User sign in POST request
router.post(
  "/user_signin",
  userLogoutCheck,
  signinController.userSigninValidation,
);

// get forgot password page
router.get("/forgot_password", userLogoutCheck, (req, res) => {
  const { otpError } = req.session;
  delete req.session.otpError;
  res.render("forgot_password", { title: "Sign in", otpError });
});

// email form submission
router.post("/forgot_password", userLogoutCheck, signinController.emailSubmitForm);

// OTP validation
router.post("/reset_password_OTP_val", userLogoutCheck, signinController.validateOTP);

// get reset password page
router.get("/reset_password", userLogoutCheck, isResetPass, signinController.getResetPassword);

// reset password POST method
router.post("/reset_password", userLogoutCheck, signinController.resetPassword);
module.exports = router;
