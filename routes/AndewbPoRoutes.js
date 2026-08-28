const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices, getLastInvoiceNumber, deleteInvoice } = require('../controllers/AndewbPoBilling');

// Route for creating an invoice
router.post('/andrewpoinvoices', createInvoice);

// Route for fetching all invoices
router.get('/andrewpoinvoices', getInvoices);

router.get('/andrewpolastinvoices', getLastInvoiceNumber);

router.delete('/deletepoinvoice/:invoiceId', deleteInvoice);

module.exports = router;
