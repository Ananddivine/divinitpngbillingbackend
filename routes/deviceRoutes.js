const express = require("express");
const {
  validation,
  registerDevice,
  getAllDevices,
  updateDeviceLocation,
  updateStatus,
  requireDeviceToken,
} = require("../controllers/deviceController");

const router = express.Router();

// API Endpoints
router.post("/validate", validation);
router.post("/register", requireDeviceToken, registerDevice); // device sends header x-api-token
router.post("/location", requireDeviceToken, updateDeviceLocation);
router.get("/device", getAllDevices); // TODO: protect with a dashboard login (next step)
router.patch("/device/:serial/status", updateStatus); // TODO: same

module.exports = router;