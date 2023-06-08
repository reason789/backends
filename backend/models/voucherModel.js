const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },

  minSpend: {
    type: Number,
  },
  expireTime: {
    type: String,
    required: true,
  },

  maxUse: {
    type: Number,
  },

  used: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Voucher", VoucherSchema);
