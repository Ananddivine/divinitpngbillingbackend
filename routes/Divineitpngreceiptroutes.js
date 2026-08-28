const express = require("express");
const router = express.Router();
const receiptController = require("../controllers/divineitpngReceiptController");

// NOTE: keep specific routes (last, job/last, search-job) ABOVE "/:id"
// so Express doesn't treat "last" or "job" as an :id param.
router.get("/last", receiptController.getLastReceiptNumber);
router.get("/job/last", receiptController.getLastJobNumber);
router.get("/search-job", receiptController.searchJobNumber);
router.get("/trash", receiptController.getTrashedReceipts);

router.post("/create", receiptController.createReceipt);
router.get("/", receiptController.getReceipts);
router.get("/:id", receiptController.getReceiptById);
router.put("/update", receiptController.updateReceipt);
router.put("/status", receiptController.updateStatus);
router.put("/restore/:receiptId", receiptController.restoreReceipt);
router.delete("/permanent/:receiptId", receiptController.permanentlyDeleteReceipt);
router.delete("/:id", receiptController.softDeleteReceipt);

module.exports = router;