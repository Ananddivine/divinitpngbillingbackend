const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  serial_number: { type: String, required: true },
  model: { type: String, required: true },
  config: { type: String, required: true },
  storage: String,
  ram: String,
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
});

const Device = mongoose.model("Device", deviceSchema);
module.exports = Device;
