// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require("mongoose");

// create user schema
const UserSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

// change first letter of the name to uppercase
UserSchema.pre("save", function (next) {
  if (this.fname) {
    this.fname = this.fname.charAt(0).toUpperCase() + this.fname.slice(1);
  }
  next();
});
// create model
const User = mongoose.model("User", UserSchema);

module.exports = User;
