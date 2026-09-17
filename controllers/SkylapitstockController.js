const Stock = require("../models/SkylapitStockItemmodel");
const SkylapitStockItem = require("../models/SkylapitStockItemmodel")
const PartsOrder = require("../models/SkylapitPo");

// Add new stock item
exports.addStock = async (req, res) => {
    try {
      const { name, category, quantity, price } = req.body;
      if (!name || !category || !quantity || !price) {
        return res.status(400).json({ error: "All fields are required!" });
      }
      const newStock = new Stock({ name, category, quantity, price });
      await newStock.save();
      res.status(201).json({ message: "Stock added successfully!", stock: newStock });
    } catch (error) {
      res.status(500).json({ error: "Failed to add stock" });
    }
  };
  
  // Import PartsOrder model
  exports.moveToStocks = async (req, res) => {
    try {
      const { name, quantity, orderId } = req.body; // Use orderId instead of poNumber
  
      let stockItem = await SkylapitStockItem.findOne({ name });
  
      if (stockItem) {
        stockItem.quantity += quantity;
        await stockItem.save();
      } else {
        stockItem = new SkylapitStockItem({
          name,
          category: "Uncategorized",
          quantity,
          price: 0,
        });
        await stockItem.save();
      }
  
      // ✅ Update using `_id`
      if (orderId) {
        const updatedOrder = await PartsOrder.findByIdAndUpdate(
          orderId, 
          { $set: { updatedStocks: true } }, 
          { new: true }
        );
  
        console.log("🔄 Updated Order:", updatedOrder);
  
        if (!updatedOrder) {
          return res.status(404).json({ message: "Parts order not found!" });
        }
      }
  
      res.status(200).json({ message: "Product moved to stock successfully", stockItem });
    } catch (error) {
      console.error("Error moving product to stock:", error);
      res.status(500).json({ message: "Error moving product to stock", error });
    }
  };
  
// Fetch all stock items
exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock items" });
  }
};

// Update stock item
exports.updateStock = async (req, res) => {
    try {
      const { name, category, quantity, price } = req.body;
      const stock = await Stock.findByIdAndUpdate(
        req.params.id,
        { name, category, quantity, price },
        { new: true }
      );
      if (!stock) {
        return res.status(404).json({ error: "Stock item not found!" });
      }
      res.status(200).json({ message: "Stock updated successfully!", stock });
    } catch (error) {
      res.status(500).json({ error: "Failed to update stock" });
    }
  };
  

// Delete stock item
exports.deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStock = await Stock.findByIdAndDelete(id);
    if (!deletedStock) {
      return res.status(404).json({ error: "Stock item not found" });
    }
    res.status(200).json({ message: "Stock deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete stock" });
  }
};
