const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Name of the counter (e.g., "poId")
  seq: { type: Number, default: 1 }, // Starting sequence
});

module.exports = mongoose.model("Counter", counterSchema);
