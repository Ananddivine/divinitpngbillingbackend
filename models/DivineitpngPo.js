const mongoose = require("mongoose");

const PartsOrderSchema = new mongoose.Schema(
  {
    poNumber: Number,
    venderName: String,
    venderEmail: String,
    venderAddress: String,
    venderNumber: String,
    gstNumber: String,
    poDate: String,
    taxPercent: Number,
    products: [
      {
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    subtotal: Number,
    tax: Number,
    total: Number,
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    deleted: { type: Boolean, default: false },
    updatedStocks:{ type: Boolean, default: false },
  },
);

module.exports = mongoose.model("PartsOrder", PartsOrderSchema);
