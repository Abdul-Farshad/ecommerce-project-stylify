const mongoose = require("mongoose");

// wallet schema
const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    default: 0.0,
    min: 0,
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  ],
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
