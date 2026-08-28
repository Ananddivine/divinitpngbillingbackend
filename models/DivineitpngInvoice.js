const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: String,
    jobNumber: String,
    customerName: String,
    customerEmail: String,
    customerAddress: String,
    customerNumber: String,
    gstNumber: String,
    invoiceDate: String,
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
    invoicePdf: { type: String }, // Path to the PDF
    paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    deleted: { type: Boolean, default: false },
  },
);

module.exports = mongoose.model("Invoice", invoiceSchema);
