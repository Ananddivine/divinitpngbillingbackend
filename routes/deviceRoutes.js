const express = require("express");
const {
  validation,
  registerDevice,
  getAllDevices,
  updateDeviceLocation,
} = require("../controllers/deviceController");

const router = express.Router();

// API Endpoints
router.post("/validate", validation)
router.post("/register", registerDevice);
router.get("/device", getAllDevices);
router.post("/location", updateDeviceLocation);

module.exports = router;
