const express = require("express");
const router = express.Router();
const stockController = require("../controllers/SkylapitstockController");


// Routes
router.post("/stock/items", stockController.addStock);
router.get("/stock/items", stockController.getAllStocks);
router.put("/stock/items/:id", stockController.updateStock);
router.delete("/stock/items/:id", stockController.deleteStock);
router.post("/stock/makeentery", stockController.moveToStocks);

module.exports = router;
