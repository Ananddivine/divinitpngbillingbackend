const Po =   require("../models/SkylapitPo");
const axios = require('axios')
const mongoose = require("mongoose");
const PartsOrder = require("../models/SkylapitPo");


exports.createPo = async (req, res) => {
  const { poDate, poNumber, gstNumber, taxPercent, products, subtotal, tax, total, venderName, venderEmail, venderAddress, venderNumber } = req.body;

  try {   
    // Check if the po number already exists
    const existingpo = await Po.findOne({ poNumber });
    if (existingpo) {
      console.log("⚠️ po number already exists:", poNumber);
      return res.status(400).json({ message: "po number already exists"});
    } 

    // Save po data to MongoDB
    const newpo = new Po({
      poNumber,
      venderName, 
      venderEmail,
      venderAddress,
      venderNumber,
      poDate,
      gstNumber,
      taxPercent,
      products,
      subtotal,
      tax,
      total,
    });

    await newpo.save();

   // Send data to Google Sheets
        const googleScriptURL = "https://script.google.com/macros/s/AKfycbwlUrOxqH4t3aqc5aVd4UmjYNCpqjYSmGz8OkJK6s10zAXN81dU2Rb4Y-HZ9bxeyycxHw/exec"; // Replace with your Apps Script URL
        await axios.post(googleScriptURL, newpo, { headers: { "Content-Type": "application/json" } });
    
        res.status(201).json({ message: "po saved and backed up to Google Sheets!",  po: newpo  });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getLastPoNumber = async (req, res) => {
  try {
    const lastPo = await Po.findOne().sort({ poNumber: -1 }); // Fetch last PO by descending order
    if (!lastPo) {
      return res.status(404).json({ message: "No PO found", poNumber: 0 });
    }
    res.status(200).json({ poNumber: lastPo.poNumber });
  } catch (error) {
    console.error("❌ Error fetching last PO number:", error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getPos = async (req, res) => {
  try {
    const pos = await Po.find({ deleted: false }); // Exclude deleted pos
    res.status(200).json(pos);
  } catch (error) {
    console.error("Error fetching pos:", error);
    res.status(500).json({ message: "Failed to fetch pos" });
  }
};

exports.getProductsandQuantity = async (req, res) => {
  try {
    const orders = await Po.find({ deleted: false, updatedStocks: false });

    const productAndQuantity = orders.flatMap(order =>
      order.products.map(product => ({
        _id: order._id, // Include order ID for updates
        name: product.name,
        quantity: product.quantity,
      }))
    );

    res.status(200).json(productAndQuantity);
  } catch (error) {
    console.error("Error fetching products and quantity:", error);
    res.status(500).json({ message: "Failed to fetch products and quantity!" });
  }
};



exports.getvenderPo = async (req, res) => {
  try {
    const po = await Po.find(); // Fetch all po
    const venders = po.map(po => ({
      name: po.venderName,
      email: po.venderEmail,
      contact: po.venderNumber,
      poNumber: po.poNumber
    }));
    res.status(200).json(venders);  // Send venders' data from po
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch po" });
  }
};






exports.deletePo = async (req, res) => {
  const { poId } = req.params;

  try {
    const po = await Po.findById(poId);

    if (!po) {
      return res.status(404).json({ message: "po not found" });
    }

    // Soft delete: update the deleted flag
    po.deleted = true;
    await po.save();

    res.status(200).json({ message: "po moved to trash", po });
  } catch (error) {
    console.error("Error moving po to trash:", error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getvenderPo = async (req, res) => {
  try {
    const pos = await Po.find(); // Fetch all pos
    const venders = pos.map(po => ({
      name: po.venderName,
      email: po.venderEmail,
      contact: po.venderNumber,
      poNumber: po.poNumber
    }));
    res.status(200).json(venders);  // Send venders' data from pos
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pos" });
  }
};

// Get total sales from all pos
exports.getTotalSales = async (req, res) => {
  try {
    const pos = await Po.find();
    const totalSales = pos.reduce((sum, po) => sum + po.total, 0);

    res.status(200).json({ totalSales });
  } catch (error) {
    console.error("Error fetching total sales:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  const { poNumber, paymentStatus } = req.body;

  try {
    const po = await Po.findOne({ poNumber });

    if (!po) {
      return res.status(404).json({ message: "po not found" });
    }

    po.paymentStatus = paymentStatus;
    await po.save();

    res.status(200).json({ message: "Payment status updated", po });
  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getDuePoCount  = async (req, res) => {
  try {
    const dueCount = await Po.countDocuments({ paymentStatus: { $ne: 'Paid' } });
    res.status(200).json({ dueCount });
  } catch (error) {
    console.error('Error fetching due pos count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.softDeletePo = async (req, res) => {
  const { poId } = req.params;

  try {
    const po = await Po.findById(poId);

    if (!po) {
      return res.status(404).json({ message: "po not found" });
    }

    // Mark po as deleted
    po.deleted = true;
    await po.save();

    res.status(200).json({ message: "po moved to trash", po });
  } catch (error) {
    console.error("Error moving po to trash:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.restorePo = async (req, res) => {
  const { poId } = req.params;

  try {
    const po = await Po.findById(poId);

    if (!po) {
      return res.status(404).json({ message: "po not found" });
    }

    po.deleted = false;
    await po.save();

    res.status(200).json({ message: "po restored", po });
  } catch (error) {
    console.error("Error restoring po:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getDeletedOrders = async (req, res) => {
  try {
    console.log("📌 Fetching deleted orders..."); // Debugging log
    const deletedOrders = await Po.find({ deleted: true });

    console.log("✅ Deleted Orders Found:", deletedOrders); // Log response
    res.status(200).json(deletedOrders);
  } catch (error) {
    console.error("❌ Error fetching deleted orders:", error); // Log error details
    res.status(500).json({ message: "Error fetching deleted orders", error: error.message });
  }
};

exports.permanentlyDeletePo = async (req, res) => {
  const { poId } = req.params;

  try {
    const po = await Po.findByIdAndDelete(poId);

    if (!po) {
      return res.status(404).json({ message: "po not found" });
    }

    res.status(200).json({ message: "po permanently deleted" });
  } catch (error) {
    console.error("Error deleting po permanently:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Update po
exports.updatePo = async (req, res) => {
  const { poNumber, venderName, gstNumber, venderNumber, poDate, products, subtotal, tax, total } = req.body;

  try {
      const updatedpo = await Po.findOneAndUpdate(
          { poNumber },
          { $set: { venderName, gstNumber, venderNumber, poDate, products, subtotal, tax, total } },
          
      );

      if (!updatedpo) {
          return res.status(404).json({ message: "po not found" });
      }

      res.status(200).json({ message: "po updated successfully", po: updatedpo });
  } catch (error) {
      console.error("❌ Error updating po:", error);
      res.status(500).json({ message: "Server error" });
  }
};

exports.getPoById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid PO ID" });
    }

    // Find PO by ID
    const po = await Po.findById(id);
    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }

    res.status(200).json(po);
  } catch (error) {
    console.error("❌ Error fetching PO by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get PO by poNumber where deleted is false
exports.getPoByNumber = async (req, res) => {
  try {
    const { poNumber } = req.params;

    // Ensure poNumber is treated as a number
    const parsedPoNumber = Number(poNumber);
    if (isNaN(parsedPoNumber)) {
      return res.status(400).json({ message: "Invalid poNumber" });
    }

    const po = await PartsOrder.findOne({ poNumber: parsedPoNumber, deleted: false });

    if (!po) {
      return res.status(404).json({ message: "PO not found or deleted" });
    }

    res.json(po);
  } catch (error) {
    console.error("Error fetching PO:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getPoByNumber = async (req, res) => {
  const { id } = req.params; // Extract poNumber from URL

  try {
    const po = await Po.findOne({ poNumber: id });

    if (!po) {
      return res.status(404).json({ message: "PO not found" });
    }

    res.status(200).json(po);
  } catch (error) {
    console.error("❌ Error fetching PO:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await PartsOrder.aggregate([
      {
        $group: {
          _id: "$venderEmail", // group by email to ensure uniqueness
          venderName: { $first: "$venderName" },
          venderEmail: { $first: "$venderEmail" },
          venderNumber: { $first: "$venderNumber" },
          venderAddress: { $first: "$venderAddress" },
          gstNumber: { $first: "$gstNumber" },
        },
      },
    ]);

    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendor list:", error);
    res.status(500).json({ error: "Failed to fetch vendor list" });
  }
};

exports.getPurchaseData = async (req, res) => {
  try {
    // Aggregate total purchase amount by poDate
    const data = await PartsOrder.aggregate([
      {
        $match: {
          deleted: false,
        },
      },
      {
        $group: {
          _id: "$poDate",
          amount: { $sum: "$total" },
        },
      },
      {
        $sort: { _id: 1 } // Sort by date ascending
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          amount: 1,
        },
      },
    ]);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching purchase data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};