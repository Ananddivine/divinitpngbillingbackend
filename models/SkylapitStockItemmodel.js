const mongoose = require("mongoose");

const SkylapitStockItemSchema = new mongoose.Schema({
  name: { type: String, required: true },  
  category: { type: String, required: true }, 
  quantity: { type: Number, required: true }, 
  price: { type: Number, required: true } 
}, { timestamps: true });

module.exports = mongoose.model("SkylapitStockItem", SkylapitStockItemSchema);
