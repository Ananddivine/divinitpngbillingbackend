const express = require("express");
const router = express.Router();
const { softDeleteInvoice, restoreInvoice, getTrashedInvoices, permanentlyDeleteInvoice } = require("../controllers/BillingController");

router.put("/andrewtrash/:invoiceId", softDeleteInvoice);
router.put("/andrewrestore/:invoiceId", restoreInvoice);
router.get("/andrewtrash", getTrashedInvoices);
router.delete("/andrewdelete-permanent/:invoiceId", permanentlyDeleteInvoice);

module.exports = router;
