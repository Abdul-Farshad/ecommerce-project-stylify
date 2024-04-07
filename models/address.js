const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    PINCode: {
      type: Number,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
// change first letter of the name to uppercase
addressSchema.pre("save", function (next) {
  if (this.name) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  next();
});

// create model
const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
