const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const OTPModel = require("../models/otpSchema");
const { sendOTPEmail } = require("./userRegValidation");

// eslint-disable-next-line consistent-return
const userSigninValidation = async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(`username:${username}, pass:${password}`);
    if (username !== "" && password !== "") {
      const user = await User.findOne({ userName: username });
      if (user) {
        console.log("User", user);
        if (user.isBlocked) {
          console.log("user account has been blocked by admin");
          req.session.isBlocked = true;
          return res.redirect("/user_signin");
        }
        const isMatch = await bcryptjs.compare(password, user.password); // comparing password
        if (isMatch) {
          // eslint-disable-next-line no-underscore-dangle
          req.session.user_id = user._id;
          if (req.session?.user_id) {
            req.session.isUser = true;
          }
          req.session.userData = user;
          console.log(req.session);
          return res.redirect("/home");
        }
        // redirect to login page
        req.session.err = "Incorrect Password";
        return res.redirect("/user_signin");
      }
      // redirect to login page
      req.session.err = "Invalid credentials";
      return res.redirect("/user_signin");
    }
  } catch (err) {
    console.log(`user log in error: ${err}`);
  }
};

// check email address for reset user password
const emailSubmitForm = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("received email", email);
    if (!email) {
      throw new Error("couldn't find email in body");
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: "*Email address not found." });
    }
    sendOTPEmail(email, res);
    req.session.resetPass = {
      email,
      approve: true,
    };
    return res.status(200).json({ otpRequired: true });
  } catch (err) {
    console.log("forgot password email form submission error: ", err);
  }
};

const validateOTP = async (req, res) => {
  try {
    const { email } = req.session.resetPass;
    if (!email) {
      throw new Error("email not found in session storage");
    }
    const enteredOTP = [
      req.body.code1,
      req.body.code2,
      req.body.code3,
      req.body.code4,
    ].join("");

    const storedOTP = await OTPModel.findOne({ email });

    if (storedOTP?.expiration < Date.now()) {
      req.session.otpError = "Sorry, the OTP has expired. Please request a new one";
      return res.redirect("/forgot_password");
    }

    if (storedOTP && enteredOTP) {
      const isMatch = await bcryptjs.compare(enteredOTP, storedOTP.hashedOTP);

      if (isMatch) {
        res.redirect("/reset_password");
      }
      console.log("OTP is not match");
      req.session.otpError = "OTP is incorrect";
      return res.redirect("/forgot_password");
    }
    req.session.otpError = "Sorry, the OTP has expired. Please request a new one";
    return res.redirect("/forgot_password");
  } catch (err) {
    console.log("password re-set page rendering error: ", err);
  }
};

// Get reset password page
const getResetPassword = (req, res) => {
  res.render("reset_password", { title: "Sign in" });
};

// reset password post method
const resetPassword = async (req, res) => {
  try {
    const { password, conformPassword } = req.body;
    if (password !== conformPassword) {
      throw new Error("password and conform Password are not match");
    }
    const { email } = req.session.resetPass;
    // hash new the password
    const saltRound = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRound);
    const user = await User.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
      },
    );
    console.log("password updated successfully");
    if (!user) {
      throw new Error(
        "couldn't find a user in database with the email address",
      );
    }
    req.session.msg = "Your password has been successfully reset. You can now log in with your new password.";
    delete req.session?.resetPass;
    res.redirect("/user_signin");
  } catch (err) {
    console.log("reset password error: ", err);
  }
};
module.exports = {
  userSigninValidation,
  emailSubmitForm,
  validateOTP,
  getResetPassword,
  resetPassword,
};
