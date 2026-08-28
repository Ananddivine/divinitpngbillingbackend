const Receipt = require("../models/Divineitpngreceipt");

// Generate next receipt number, e.g. ACK26-0001
exports.getLastReceiptNumber = async (req, res) => {
  try {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = `ACK${year}-`;

    const lastReceipt = await Receipt.findOne({ receiptNumber: { $regex: `^${prefix}` } })
      .sort({ receiptNumber: -1 })
      .collation({ locale: "en", numericOrdering: true });

    let nextNumber = 0;
    if (lastReceipt) {
      nextNumber = parseInt(lastReceipt.receiptNumber.replace(prefix, "")) + 1;
    }

    const nextReceiptNumber = `${prefix}${nextNumber.toString().padStart(4, "0")}`;

    res.json({
      currentLastReceiptNumber: lastReceipt ? lastReceipt.receiptNumber : "",
      nextReceiptNumber,
    });
  } catch (error) {
    console.error("Failed to fetch last receipt number:", error);
    res.status(500).json({ error: "Failed to fetch last receipt number" });
  }
};

// Generate next job number, e.g. DIP0001
exports.getLastJobNumber = async (req, res) => {
  try {
    const lastReceipt = await Receipt.findOne()
      .sort({ jobNumber: -1 })
      .collation({ locale: "en", numericOrdering: true });

    const lastJobNumber = lastReceipt ? lastReceipt.jobNumber : "DIP0000";
    const numericPart = parseInt(lastJobNumber.replace("DIP", ""), 10) || 0;
    const nextJobNumber = `DIP${(numericPart + 1).toString().padStart(4, "0")}`;

    res.json({ lastJobNumber, nextJobNumber });
  } catch (error) {
    console.error("Failed to fetch last job number:", error);
    res.status(500).json({ error: "Failed to fetch last job number" });
  }
};

exports.createReceipt = async (req, res) => {
  try {
    const receiptNumber = String(req.body.receiptNumber || "").trim();
    const jobNumber = String(req.body.jobNumber || "").trim();

    if (!receiptNumber) {
      return res.status(400).json({ message: "Receipt number is required" });
    }
    if (!jobNumber) {
      return res.status(400).json({ message: "Job number is required" });
    }

    const existing = await Receipt.findOne({ receiptNumber });
    if (existing) {
      return res.status(409).json({ message: "Receipt number already exists" });
    }

    const newReceipt = new Receipt({
      receiptNumber,
      jobNumber,
      receivedDate: req.body.receivedDate,
      expectedDeliveryDate: req.body.expectedDeliveryDate,
      customerName: req.body.customerName,
      customerNumber: req.body.customerNumber,
      customerEmail: req.body.customerEmail,
      deviceType: req.body.deviceType,
      brand: req.body.brand,
      modelNumber: req.body.modelNumber,
      serialNumber: req.body.serialNumber,
      color: req.body.color,
      devicePassword: req.body.devicePassword,
      accessories: req.body.accessories,
      reportedIssue: req.body.reportedIssue,
      physicalCondition: req.body.physicalCondition,
      estimatedCost: req.body.estimatedCost,
      technicianName: req.body.technicianName,
      status: req.body.status || "Received",
    });

    await newReceipt.save();

    res.status(201).json({ message: "Receipt saved successfully!", receipt: newReceipt });
  } catch (error) {
    console.error("❌ Error saving receipt:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ deleted: false }).sort({ createdAt: -1 });
    res.status(200).json(receipts);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    res.status(500).json({ message: "Failed to fetch receipts" });
  }
};

exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    res.status(200).json(receipt);
  } catch (error) {
    console.error("Error fetching receipt:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateReceipt = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    if (!_id) return res.status(400).json({ message: "_id is required to update a receipt" });

    const updated = await Receipt.findByIdAndUpdate(_id, { $set: updateData }, { new: true });
    if (!updated) return res.status(404).json({ message: "Receipt not found" });

    res.status(200).json({ message: "Receipt updated successfully", receipt: updated });
  } catch (error) {
    console.error("❌ Error updating receipt:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStatus = async (req, res) => {
  const { receiptNumber, status } = req.body;
  try {
    const receipt = await Receipt.findOne({ receiptNumber });
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    receipt.status = status;
    await receipt.save();

    res.status(200).json({ message: "Status updated", receipt });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.softDeleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    receipt.deleted = true;
    await receipt.save();

    res.status(200).json({ message: "Receipt moved to trash", receipt });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTrashedReceipts = async (req, res) => {
  try {
    const trashedReceipts = await Receipt.find({ deleted: true }).sort({ updatedAt: -1 });
    res.status(200).json(trashedReceipts);
  } catch (error) {
    console.error("Error fetching trashed receipts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.restoreReceipt = async (req, res) => {
  const { receiptId } = req.params;
  try {
    const receipt = await Receipt.findById(receiptId);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    receipt.deleted = false;
    await receipt.save();

    res.status(200).json({ message: "Receipt restored", receipt });
  } catch (error) {
    console.error("Error restoring receipt:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.permanentlyDeleteReceipt = async (req, res) => {
  const { receiptId } = req.params;
  try {
    const receipt = await Receipt.findByIdAndDelete(receiptId);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    res.status(200).json({ message: "Receipt permanently deleted" });
  } catch (error) {
    console.error("Error deleting receipt permanently:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchJobNumber = async (req, res) => {
  const { query } = req.query;
  try {
    const receipts = await Receipt.find({ jobNumber: { $regex: query, $options: "i" } }).limit(10);
    res.json(receipts);
  } catch (error) {
    console.error("Error in searchJobNumber:", error);
    res.status(500).json({ message: "Server error" });
  }
};