const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  hashedOTP: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiration: {
    type: Date,
    default() {
      return new Date(this.createdAt.getTime() + 5 * 60 * 1000);
    },
    index: { expires: 0 },
    required: true,
  },
});

const OTPModel = mongoose.model("OTP", otpSchema);
module.exports = OTPModel;
