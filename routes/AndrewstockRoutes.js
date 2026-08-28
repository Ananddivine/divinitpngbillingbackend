const express = require("express");
const router = express.Router();
const stockController = require("../controllers/AndrewstockController");
const {getTotalSales, getStockItems, getTotalCustomers, getInvoiceSummary, updatePaymentStatus, getDueInvoiceCount, getSalesData } = require("../controllers/BillingController");


// Routes
router.post("/andrewstock/items", stockController.addStock);
router.get("/andrewstock/items", stockController.getAllStocks);
router.put("/andrewstock/items/:id", stockController.updateStock);
router.delete("/andrewstock/items/:id", stockController.deleteStock);
router.get("/andrewsales/total", getTotalSales);
router.get("/andrewgetstock/items", getStockItems);
router.get("/andrewgetcustomers/total", getTotalCustomers);

// route for dashbaord
router.get('/andrewsales/data', getSalesData);
// route for dashbaord
router.get('/andrewsummary', getInvoiceSummary);

router.post("/andrewupdate-payment", updatePaymentStatus);
router.get('/andrewdue-count', getDueInvoiceCount);

module.exports = router;
