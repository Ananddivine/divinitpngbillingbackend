const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices, getLastInvoiceNumber, deleteInvoice, updatePaymentStatus} = require('../controllers/BillingController');

// Route for creating an invoice
router.post('/andrewinvoices', createInvoice);

// Route for fetching all invoices
router.get('/andrewinvoices', getInvoices);

router.get('/andrewlastinvoices', getLastInvoiceNumber);

router.delete('/andrewdeleteinvoice/:invoiceId', deleteInvoice);



router.post("/andrewupdate-payment", updatePaymentStatus);

module.exports = router;
