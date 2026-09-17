const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/SkylapitinvoiceController");
const upload = require('../middleware/multer');
const { getLastInvoiceNumber, deleteInvoice, getCustomerInvoices, getLastJobNumber, searchJobNumber} = require("../controllers/SkylapitinvoiceController");
const Invoice = require('../models/SkylapitInvoice'); 


// Route to create invoice with PDF
router.post("/create", upload.single("invoicePdf"), invoiceController.createInvoice);

// Route to fetch all invoices
router.get("/all", invoiceController.getInvoices);

router.post("/monthly-report/send", invoiceController.sendMonthlyReportEmail);


router.get("/data", getCustomerInvoices);

router.delete('/delete/:invoiceId', deleteInvoice);

// routes/invoiceRoutes.js
  router.get("/last", getLastInvoiceNumber);
  router.get("/job/last", getLastJobNumber)
  router.put("/trash/:invoiceId", invoiceController.softDeleteInvoice);
  router.put("/restore/:invoiceId", invoiceController.restoreInvoice);
  router.delete("/delete-permanent/:invoiceId", invoiceController.permanentlyDeleteInvoice);
  router.put("/updateInvoice", invoiceController.updateInvoice);

  router.get("/search-job",searchJobNumber);

// Endpoint to get all invoices (with customer details)
router.get('/all', async (req, res) => {
    try {
      const invoices = await Invoice.find();  // Fetch all invoices
      res.status(200).json(invoices); // Send invoices to frontend
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

module.exports = router;
