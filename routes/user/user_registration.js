const express = require("express");

const userRegValidation = require("../../controllers/userRegValidation");
const { userLogoutCheck } = require("../../middlewares/auth");

const router = express.Router();

//  get user sign up page
router.get("/user_registration", userLogoutCheck, (req, res) => {
  const showOTPSection = req.query.showOTPSection === "true";
  const { otpError } = req.session;
  res.render("user_registration", {
    title: "Register user",
    showOTPSection,
    otpError,
  });
  delete req.session.otpError;
});

// user registration post method
router.post(
  "/user_registration",
  userRegValidation.inputValidation,
  userRegValidation.checkErrors,
);
// re-send otp to email
router.get("/resend_otp", userRegValidation.resendOTP);

// user sign up post method (OTP submission)
router.post("/user_signup", userRegValidation.userSignup);

module.exports = router;
