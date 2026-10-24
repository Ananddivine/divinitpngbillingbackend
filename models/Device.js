const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    serial_number: { type: String, required: true, unique: true, trim: true }, // FIX: no duplicates
    model: { type: String, default: "N/A" },
    config: { type: String, default: "N/A" },
    storage: String,
    ram: String,
    status: {
      type: String,
      enum: ["In Office", "Rented", "Overdue", "Missing", "Maintenance"],
      default: "In Office",
    },
    lastSeen: Date, // when the device last reported in
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
      accuracy: { type: Number }, // metres
      source: { type: String }, // "windows" (Wi-Fi/GPS) or "ip" (approximate)
      timestamp: { type: Date, default: Date.now },
    },
  },
  { timestamps: true } // FIX: adds createdAt / updatedAt (the date filter uses createdAt)
);

const Device = mongoose.model("Device", deviceSchema);
module.exports = Device;