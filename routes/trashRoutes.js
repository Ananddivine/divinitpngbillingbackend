const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/SkylapitinvoiceController");

router.put("/trash/:invoiceId", invoiceController.softDeleteInvoice);
router.put("/restore/:invoiceId", invoiceController.restoreInvoice);
router.get("/trash", invoiceController.getTrashedInvoices);
router.delete("/delete-permanent/:invoiceId", invoiceController.permanentlyDeleteInvoice);

module.exports = router;
