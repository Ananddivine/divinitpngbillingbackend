const Invoice =   require("../models/SkylapitInvoice");
const path = require("path");
const fs = require("fs");
const axios = require('axios')
const StockItem = require("../models/SkylapitStockItemmodel"); 
const moment = require("moment");
const { sendMonthlyInvoiceReport } = require("../services/monthlyInvoiceReportService");

exports.createInvoice = async (req, res) => {
  try {
    // Generate next invoice number atomically
    const year = new Date().getFullYear().toString().slice(-2); // "26"
    const prefix = `S${year}-`;

    const lastInvoice = await Invoice.findOne({ invoiceNumber: { $regex: `^${prefix}` } })
      .sort({ invoiceNumber: -1 })
      .collation({ locale: "en", numericOrdering: true });

    let nextNumber = 0;
    if (lastInvoice) {
      nextNumber = parseInt(lastInvoice.invoiceNumber.replace(prefix, "")) + 1;
    }

    const generatedInvoiceNumber = `${prefix}${nextNumber.toString().padStart(4, "0")}`;
    const invoiceNumber = String(req.body.invoiceNumber || generatedInvoiceNumber).trim();

    if (!invoiceNumber) {
      return res.status(400).json({ message: "Invoice number is required" });
    }

    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      const message = existingInvoice.deleted
        ? "Invoice number exists in trash. Restore or permanently delete it first."
        : "Invoice number already exists";

      return res.status(409).json({
        message,
        deleted: Boolean(existingInvoice.deleted),
        invoiceId: existingInvoice._id,
      });
    }

    // Create invoice
    const newInvoice = new Invoice({
      invoiceNumber,
      jobNumber: req.body.jobNumber,
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      customerAddress: req.body.customerAddress,
      customerNumber: req.body.customerNumber,
      invoiceDate: req.body.invoiceDate,
      gstNumber: req.body.gstNumber,
      taxPercent: req.body.taxPercent,
      products: req.body.products,
      subtotal: req.body.subtotal,
      tax: req.body.tax,
      total: req.body.total,
      invoicePdf: `invoices/${invoiceNumber}.pdf`,
    });

    await newInvoice.save();

   // Send data to Google Sheets
        const googleScriptURL = "https://script.google.com/macros/s/AKfycbzkO3lKr5kQMd2ghZAVhQcldgwKJEzLcHKYRCdLfhfchctUwwCINOLZrqJk-BTMUDu0uA/exec"; // Replace with your Apps Script URL
        await axios.post(googleScriptURL, newInvoice, { headers: { "Content-Type": "application/json" } });
    
        res.status(201).json({ message: "Invoice saved and backed up to Google Sheets!",  invoice: newInvoice  });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ deleted: false })
      .collation({ locale: "en", numericOrdering: true })
      .sort({ invoiceNumber: 1 });

    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};


exports.getLastInvoiceNumber = async (req, res) => {
  try {
    const year = new Date().getFullYear().toString().slice(-2); // "26"
    const prefix = `D${year}-`; // D26-

    // Find last invoice of THIS YEAR only
    const lastInvoice = await Invoice.findOne({
      invoiceNumber: { $regex: `^${prefix}` }
    })
    .sort({ invoiceNumber: -1 })
    .collation({ locale: "en", numericOrdering: true });

  let nextNumber = 0; // Start from 0000 if no invoice exists
if (lastInvoice) {
  nextNumber = parseInt(lastInvoice.invoiceNumber.replace(prefix, "")) + 1;
}

    const nextInvoiceNumber = `${prefix}${nextNumber.toString().padStart(4, "0")}`;

    res.json({
      currentLastInvoiceNumber: lastInvoice ? lastInvoice.invoiceNumber : "",
      nextInvoiceNumber,
    });

  } catch (error) {
    console.error("Failed to fetch last invoice number:", error);
    res.status(500).json({ error: "Failed to fetch last invoice number" });
  }
};

exports.getLastJobNumber = async (req, res) => {
  try {
    // Ensure correct sorting by applying collation
    const lastInvoice = await Invoice.findOne()
      .sort({ jobNumber: -1 }) // Sorting numerically
      .collation({ locale: "en", numericOrdering: true }); // Ensures SK0100 > SK0099

    // Default to SKY0000 if no invoice exists
    let lastJobNumber = lastInvoice ? lastInvoice.jobNumber : "SKY0000";

    // Extract numeric part and increment
    const numericPart = parseInt(lastJobNumber.replace("SKY", ""), 10) || 0;
    const nextJobNumber = `SKY${(numericPart).toString().padStart(4, "0")}`;

    res.json({ lastJobNumber: nextJobNumber });
  } catch (error) {
    console.error("Failed to fetch last Job Number:", error);
    res.status(500).json({ error: "Failed to fetch last Job number" });
  }
};





exports.deleteInvoice = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Soft delete: update the deleted flag
    invoice.deleted = true;
    await invoice.save();

    res.status(200).json({ message: "Invoice moved to trash", invoice });
  } catch (error) {
    console.error("Error moving invoice to trash:", error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getCustomerInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find(); // Fetch all invoices
    const customers = invoices.map(invoice => ({
      name: invoice.customerName,
      email: invoice.customerEmail,
      contact: invoice.customerNumber,
      invoiceNumber: invoice.invoiceNumber,
      jobNumber: invoice.jobNumber
    }));
    res.status(200).json(customers);  // Send customers' data from invoices
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

// Get total sales from all invoices
exports.getTotalSales = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    const totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

    res.status(200).json({ totalSales });
  } catch (error) {
    console.error("Error fetching total sales:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all stock items
exports.getStockItems = async (req, res) => {
  try {
    const stockItems = await StockItem.find();
    res.status(200).json(stockItems);
  } catch (error) {
    console.error("Error fetching stock items:", error);
    res.status(500).json({ message: "Failed to fetch stock items" });
  }
};

exports.getTotalCustomers = async (req, res) => {
  try {
    const totalCustomers = await Invoice.distinct("customerEmail").countDocuments();

    res.status(200).json({ totalCustomers });
  } catch (error) {
    console.error("Error fetching total customers:", error);
    res.status(500).json({ message: "Failed to fetch customer count" });
  }
};


exports.getInvoiceSummary = async (req, res) => {
  try {
    const totalInvoices = await Invoice.countDocuments();

    const totalInvoicedAgg = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const receivedAgg = await Invoice.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const outstandingAgg = await Invoice.aggregate([
      { $match: { paymentStatus: "Pending" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const latestInvoices = await Invoice.find().sort({ invoiceDate: -1 }).limit(5);

    // 👉 Monthly Summary Added Here
    const monthlyInvoices = await Invoice.aggregate([
      {
        $addFields: {
          invoiceDateObj: { $toDate: "$invoiceDate" } // convert string to Date
        }
      },
      {
        $project: {
          month: { $dateToString: { format: "%Y-%m", date: "$invoiceDateObj" } },
          total: 1,
          paymentStatus: 1,
        }
      },
      {
        $group: {
          _id: "$month",
          Invoiced: { $sum: "$total" },
          Received: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$total", 0]
            }
          },
          Outstanding: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "Pending"] }, "$total", 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedMonthlySummary = monthlyInvoices.map(item => ({
      month: moment(item._id).format("MMM"),
      Invoiced: item.Invoiced,
      Received: item.Received,
      Outstanding: item.Outstanding
    }));

    res.status(200).json({
      totalInvoices,
      totalSales: totalInvoicedAgg.length > 0 ? totalInvoicedAgg[0].total : 0,
      received: receivedAgg.length > 0 ? receivedAgg[0].total : 0,
      outstanding: outstandingAgg.length > 0 ? outstandingAgg[0].total : 0,
      latestInvoices,
      invoiceSummary: formattedMonthlySummary  // 👈 Send to frontend
    });
  } catch (error) {
    console.error("Error fetching invoice summary:", error);
    res.status(500).json({ message: "Failed to fetch invoice summary" });
  }
};



exports.getSalesData = async (req, res) => {
  try {
    // Fetch total sales
    const totalSalesResult = await Invoice.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$total" } } }
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

    // Fetch total customers (distinct email count)
    const totalCustomers = await Invoice.distinct("customerEmail").then(customers => customers.length);

    // Fetch all stock items
    const stockItems = await StockItem.find() || [];

    // Fetch total invoices
    const totalInvoices = await Invoice.countDocuments();

    // Ensure data is properly formatted before sending response
    res.status(200).json({
      totalSales,
      totalCustomers,
      stockItems,
      totalInvoices,
    });

  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ message: "Failed to fetch sales data" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  const { invoiceNumber, paymentStatus } = req.body;

  try {
    const invoice = await Invoice.findOne({ invoiceNumber });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.paymentStatus = paymentStatus;
    await invoice.save();

    res.status(200).json({ message: "Payment status updated", invoice });
  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getDueInvoiceCount  = async (req, res) => {
  try {
    const dueCount = await Invoice.countDocuments({ paymentStatus: { $ne: 'Paid' } });
    res.status(200).json({ dueCount });
  } catch (error) {
    console.error('Error fetching due invoices count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.softDeleteInvoice = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Mark invoice as deleted
    invoice.deleted = true;
    await invoice.save();

    res.status(200).json({ message: "Invoice moved to trash", invoice });
  } catch (error) {
    console.error("Error moving invoice to trash:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.restoreInvoice = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    invoice.deleted = false;
    await invoice.save();

    res.status(200).json({ message: "Invoice restored", invoice });
  } catch (error) {
    console.error("Error restoring invoice:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getTrashedInvoices = async (req, res) => {
  try {
    const trashedInvoices = await Invoice.find({ deleted: true });
    res.status(200).json(trashedInvoices);
  } catch (error) {
    console.error("Error fetching trashed invoices:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.permanentlyDeleteInvoice = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const invoice = await Invoice.findByIdAndDelete(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Remove PDF file from the server
    const pdfPath = path.join(__dirname, "..", "uploads", "invoices", `${invoice.invoiceNumber}.pdf`);
    fs.unlink(pdfPath, (err) => {
      if (err) {
        console.error("Failed to delete invoice PDF file", err);
      }
    });

    res.status(200).json({ message: "Invoice permanently deleted" });
  } catch (error) {
    console.error("Error deleting invoice permanently:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Update Invoice
exports.updateInvoice = async (req, res) => {
  const {
    _id,
    originalInvoiceNumber,
    invoiceNumber,
    jobNumber,
    customerName,
    customerEmail,
    customerAddress,
    gstNumber,
    customerNumber,
    invoiceDate,
    products,
    subtotal,
    tax,
    total,
    taxPercent,
  } = req.body;

  try {
      const filter = _id
        ? { _id }
        : { invoiceNumber: originalInvoiceNumber || invoiceNumber };

      const updatedInvoice = await Invoice.findOneAndUpdate(
          filter,
          {
            $set: {
              invoiceNumber,
              jobNumber,
              customerName,
              customerEmail,
              customerAddress,
              gstNumber,
              customerNumber,
              invoiceDate,
              products,
              subtotal,
              tax,
              total,
              taxPercent,
            }
          },
          { new: true } // Returns the updated document
      );

      if (!updatedInvoice) {
          return res.status(404).json({ message: "Invoice not found" });
      }

      res.status(200).json({ message: "Invoice updated successfully", invoice: updatedInvoice });
  } catch (error) {
      console.error("❌ Error updating invoice:", error);
      res.status(500).json({ message: "Server error" });
  }
};


exports.searchJobNumber = async (req, res) => {
  const { query } = req.query;

  try {
    const invoices = await Invoice.find({
      jobNumber: { $regex: query, $options: "i" }
    }).limit(10);

    res.json(invoices);
  } catch (error) {
    console.error("Error in searchJobNumber:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.sendMonthlyReportEmail = async (req, res) => {
  try {
    const { period = "current", month, year } = req.body || {};

    const result = await sendMonthlyInvoiceReport({
      period,
      month,
      year,
    });

    res.status(200).json({
      message: "Monthly report sent successfully",
      ...result,
    });
  } catch (error) {
    const isAuthError = error.code === "EAUTH" || String(error.responseCode || "") === "535";

    console.error("Error sending monthly report:", error.message);
    res.status(500).json({
      message: isAuthError
        ? "Email authentication failed. Update EMAIL_USER and EMAIL_PASS in backend .env with valid Gmail app-password credentials."
        : error.message || "Failed to send monthly report",
    });
  }
};
