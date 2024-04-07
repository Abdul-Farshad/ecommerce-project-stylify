const mongoose = require("mongoose");

const { Schema } = mongoose;

const transactionSchema = new Schema({
  walletId: {
    type: Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["Credit", "Debit"],
    required: true,
  },
  reasonType: {
    type: String,
    enum: ["Refund"],
  },
  description: {
    type: String,
    // required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Create a model for the transaction schema
const Transactions = mongoose.model("Transactions", transactionSchema);

module.exports = Transactions;
