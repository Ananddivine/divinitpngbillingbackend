const mongoose = require("mongoose");

const accessoriesSchema = new mongoose.Schema(
  {
    charger: { type: Boolean, default: false },
    chargerCable: { type: Boolean, default: false },
    bag: { type: Boolean, default: false },
    mouse: { type: Boolean, default: false },
    adapter: { type: Boolean, default: false },
    battery: { type: Boolean, default: false },
    other: { type: String, default: "" },
  },
  { _id: false }
);

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true },
    jobNumber: { type: String, required: true },

    receivedDate: { type: String, required: true },
    expectedDeliveryDate: { type: String },

    customerName: { type: String, required: true },
    customerNumber: { type: String, required: true },
    customerEmail: { type: String },

    deviceType: {
      type: String,
      enum: ["Laptop", "Desktop", "Printer", "Other"],
      default: "Laptop",
    },
    brand: { type: String },
    modelNumber: { type: String },
    serialNumber: { type: String },
    color: { type: String },
    devicePassword: { type: String }, // optional, for technician access only

    accessories: { type: accessoriesSchema, default: () => ({}) },

    reportedIssue: { type: String, required: true },
    physicalCondition: { type: String }, // visible damage/scratches noted at intake

    estimatedCost: { type: Number, default: 0 },
    technicianName: { type: String },

    status: {
      type: String,
      enum: ["Received", "In Progress", "Completed", "Delivered"],
      default: "Received",
    },

    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SkylapitReceipt", receiptSchema);