// eslint-disable-next-line import/no-extraneous-dependencies
const { body, validationResult } = require("express-validator");
// eslint-disable-next-line import/no-extraneous-dependencies
const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const OTPModel = require("../models/otpSchema");
const transporter = require("../nodemailerConfig");
const Wallet = require("../models/wallet");

const inputValidation = [
  body("fname")
    .notEmpty()
    // .withMessage("Please enter your full name")
    .withMessage("Please enter your full name")
    .bail()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Full name should be between 4 and 20 characters")
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage("Full name should only contain letters and spaces")
    .customSanitizer((value) => {
      const words = value.split(" ");
      const capitalizedWords = words.map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1),
      );
      return capitalizedWords.join(" ");
    }),
  body("username")
    .notEmpty()
    .withMessage("Please enter a username")
    .bail()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Username should be between 4 and 20 characters")
    .matches(/^[a-zA-Z0-9_\s]*$/)
    .withMessage("Username should only contain A-z, 0-9, and _"),
  body("email")
    .notEmpty()
    .withMessage("Please enter email address")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .trim()
    .normalizeEmail()
    .toLowerCase(),
  body("mobile")
    .notEmpty()
    .withMessage("Please enter mobile number")
    .bail()
    .isLength({ min: 10, max: 13 })
    .withMessage("Invalid mobile number")
    .bail()
    .isMobilePhone("any", { strictMode: false })
    .withMessage("Invalid mobile number"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Please create a password")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

// check errors after validating
const checkErrors = async (req, res) => {
  try {
    console.log("checking user reg input errors");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.errors);
      const testError = errors.errors;
      testError.forEach((element) => {
        console.log(element.path);
      });
      res.render("user_registration", {
        title: "Register user",
        errors: errors.array(),
        fname: req.body.fname,
        username: req.body.username,
        email: req.body.email,
        mobile: req.body.mobile,
        pass: req.body.password,
      });
      return;
    }
    console.log("no reg input errors");
    const { username, email, mobile } = req.body;
    console.log(username, email, mobile);
    // check user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }, { mobile }],
    });
    console.log(existingUser);
    if (existingUser) {
      console.log("user already exists");
      const error = "User already exists";
      res.render("user_registration", {
        title: "Register user",
        error,
        fname: req.body.fname,
        username: req.body.username,
        email: req.body.email,
        mobile: req.body.mobile,
        pass: req.body.password,
      });
    } else {
      req.session.userData = {
        fname: req.body.fname,
        userName: req.body.username,
        email: req.body.email,
        mobileNumber: req.body.mobile,
        password: req.body.password,
      };
      res.redirect("/user_registration?showOTPSection=true");
    }

    console.log("before passing the OTP email", req.body.email);
    // eslint-disable-next-line no-use-before-define
    sendOTPEmail(req.body.email, res);
    console.log("sendOTP function called");
  } catch (err) {
    console.log("Error: ", err);
  }
};

// re-send otp to user's gmail account
const resendOTP = async (req, res) => {
  try {
    const userEmail = req.session.userData.email;
    // eslint-disable-next-line no-use-before-define
    const response = await sendOTPEmail(userEmail, res);
    if (response) {
      console.log(response);
      res.json({ success: true, message: "OTP re-sent successfully" });
    } else {
      res.json({ success: false, message: "Failed to resend OTP" });
    }
  } catch (err) {
    console.log("Resending otp error: ", err);
  }
};

// OTP Validation - user sign in
// eslint-disable-next-line consistent-return
const userSignup = async (req, res, next) => {
  try {
    const enteredOTP = [
      req.body.code1,
      req.body.code2,
      req.body.code3,
      req.body.code4,
    ].join("");

    const { email } = req.session.userData;
    const storedOTP = await OTPModel.findOne({ email });
    console.log("stored otp is: ", storedOTP);

    if (storedOTP.expiration < Date.now()) {
      req.session.otpError = "Sorry, the OTP has expired. Please request a new one";
      return res.redirect("/user_registration?showOTPSection=true");
    }

    if (storedOTP && enteredOTP) {
      const isMatch = await bcryptjs.compare(enteredOTP, storedOTP.hashedOTP);

      if (isMatch) {
        const { userData } = req.session;
        // hash password using bcryptjs
        const saltRound = 10;
        const hashedPassword = await bcryptjs.hash(
          userData.password,
          saltRound,
        );
        userData.password = hashedPassword;
        // eslint-disable-next-line no-unused-vars
        const newUser = await new User(userData).save();
        console.log(req.session);
        console.log("new user added");
        // redirecting to login page
        req.session.msg = "Signup successful! Please log in";
        console.log("signup success✅");
        const userId = await User.findOne(
          { userName: userData.userName, email: userData.email },
          { _id: 1 },
        );

        // create new User Wallet
        await new Wallet({ userId }).save()
          .then(() => {
            console.log("new wallet created");
          }).catch((err) => {
            console.log(err);
          });

        return res.redirect("/user_signin");
      }
      console.log("OTP not is match");
      req.session.otpError = "OTP is incorrect";
      return res.redirect("/user_registration?showOTPSection=true");
    }
    req.session.otpError = "Sorry, the OTP has expired. Please request a new one";
    return res.redirect("/user_registration?showOTPSection=true");
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// generate OTP,  OTP sending to email
// eslint-disable-next-line consistent-return
async function sendOTPEmail(email, res) {
  try {
    // delete old record
    await OTPModel.deleteOne({ email });

    console.log("generating otp");
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    // email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "OTP Verification",
      html: `<p>Your One-Time Password (OTP) for verification is here.<br>Please enter this code within the next  5 minutes to complete the verification process. If you didn't request this code, please ignore this message</p>
            <p style="color:tomato; font-size:25px;letter-spacing:2px;">
            <h2>${otp}</h2></p>`,
    };

    console.log("before hashing otp");
    //   hash otp
    const saltRound = 10;
    const hashedOTP = await bcryptjs.hash(otp, saltRound);
    console.log("hash otp", hashedOTP);
    const OTPdata = { email, hashedOTP };

    console.log("before storing in db");
    //  store in db
    // eslint-disable-next-line no-unused-vars
    const userOTP = await new OTPModel(OTPdata).save();
    console.log("after storing in db");
    console.log("env email:", process.env.AUTH_EMAIL);
    // test transporter
    transporter.verify((error, success) => {
      try {
        if (error) {
          // console.log("tronsporter Error:", error.message);
          throw new Error("transporter Error:", error.message);
        } else {
          console.log("ready for messages");
          console.log(success);
        }
      } catch (err) {
        console.log(err);
      }
    });

    // sending email to user
    await transporter.sendMail(mailOptions);
    console.log(`otp send to ${email}`);
    return true;
  } catch (err) {
    console.log(err);
    res.json(err);
  }
}

module.exports = {
  inputValidation,
  checkErrors,
  sendOTPEmail,
  resendOTP,
  userSignup,
};
