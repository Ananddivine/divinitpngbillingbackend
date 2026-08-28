const express = require("express");
const router = express.Router();
const poController = require("../controllers/DivineitpngPoController");
const upload = require('../middleware/multer');
const { getLastPoNumber, deletePo, getvenderPo, updatePo, getPoById, getDeletedOrders, getPoByNumber, getProductsandQuantity, getAllVendors, getPurchaseData } = require("../controllers/DivineitpngPoController");

  router.post("/po/create", upload.single("poPdf"), poController.createPo);
  router.get("/po/all", poController.getPos);
  router.get("/po/data", getvenderPo);
  router.get("/po/:id", getPoById);
  router.get("/last-po-number", getLastPoNumber);
  router.delete('/po/delete/:poId', deletePo);
  router.put("/po/trash/:poId", poController.softDeletePo);
  router.put("/po/restore/:poId", poController.restorePo);
  router.get("/deleted-orders", getDeletedOrders);
  router.delete("/po/delete-permanent/:poId", poController.permanentlyDeletePo);
  router.put("/po/updatePo", updatePo);
  router.get("/DivineitpngPoOrders/:id", getPoByNumber);
  router.get("/ProductsandQuantity", getProductsandQuantity);
  router.get("/vendors", getAllVendors);
  router.get("/overview", getPurchaseData);
  
module.exports = router;
