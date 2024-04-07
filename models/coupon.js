const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    minimumPurchaseAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    redeemedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
  },
  { timestamps: true },
);

// Set TTL index on expirationDate field
couponSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0 });

// Create a model
const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;

// // Method to update the expiration status
// couponSchema.methods.updateExpirationStatus = function () {
//   if (this.expirationDate < new Date() && this.status === "active") {
//     this.status = "expired";
//     return this.save();
//   }
//   return Promise.resolve(this);
// };
