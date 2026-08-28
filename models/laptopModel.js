const mongoose = require("mongoose");

const laptopSchema = new mongoose.Schema({
    serialNumber: { type: String, required: false },
    manufacturer: { type: String, required: false },
    model: { type: String, required: false },
    cpu: { type: String, required: false },
    ram: { type: String, required: false },
    storage: { type: String, required: false },
  });
  

module.exports = mongoose.model("Laptop", laptopSchema);
