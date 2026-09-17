const express = require("express");
const router = express.Router();
const { getTotalSales, getTotalCustomers, getStockItems, getSalesData, getInvoiceSummary, updatePaymentStatus, getDueInvoiceCount, updateInvoice } = require("../controllers/SkylapitinvoiceController");


router.get("/sales/total", getTotalSales);
router.get("/getstock/items", getStockItems);
router.get("/getcustomers/total", getTotalCustomers);
// route for dashbaord
router.get('/sales/data', getSalesData);
// route for dashbaord
router.get('/summary', getInvoiceSummary);

router.post("/update-payment", updatePaymentStatus);
router.get('/due-count', getDueInvoiceCount);
router.put("/updateInvoice", updateInvoice);


module.exports = router;
