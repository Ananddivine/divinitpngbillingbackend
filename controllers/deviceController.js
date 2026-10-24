const crypto = require("crypto");
const axios = require("axios");
const Device = require("../models/Device");

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const validCoords = (loc) =>
  loc &&
  typeof loc.latitude === "number" &&
  typeof loc.longitude === "number" &&
  Math.abs(loc.latitude) <= 90 &&
  Math.abs(loc.longitude) <= 180;

// Function to get address from coordinates
async function getAddressFromCoordinates(latitude, longitude) {
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: { format: "json", lat: latitude, lon: longitude },
      headers: { "User-Agent": "LapStockTracker/1.0" }, // Nominatim requires this
      timeout: 5000,
    });
    return response.data.display_name || "Address not found";
  } catch (error) {
    console.error("Error fetching address:", error.message);
    return "Address not available";
  }
}

// Middleware: device-facing routes need the token in the x-api-token header
exports.requireDeviceToken = (req, res, next) => {
  const expected = process.env.ENROLL_TOKEN;
  if (!expected) return res.status(500).json({ status: "error", message: "Server token not configured" });
  if (!safeEqual(req.headers["x-api-token"] || "", expected)) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
  next();
};

// Validate API  (FIX: credentials come from .env, not from the code)
exports.validation = async (req, res) => {
  const { name, token } = req.body || {};
  if (!process.env.ENROLL_NAME || !process.env.ENROLL_TOKEN) {
    return res.status(500).json({ status: "error", message: "Server credentials not configured" });
  }
  if (safeEqual(name || "", process.env.ENROLL_NAME) && safeEqual(token || "", process.env.ENROLL_TOKEN)) {
    return res.json({ status: "success" });
  }
  return res.status(401).json({ status: "error", message: "Invalid name or token" });
};

// ✅ Register or Update Device
exports.registerDevice = async (req, res) => {
  const { serial_number, model, config, storage, ram, location } = req.body || {};

  if (!serial_number || typeof serial_number !== "string") {
    return res.status(400).json({ status: "error", message: "serial_number is required" });
  }
  const serial = serial_number.trim();
  const loc = validCoords(location) ? { ...location, timestamp: new Date() } : undefined;

  try {
    const existingDevice = await Device.findOne({ serial_number: serial });

    if (existingDevice) {
      existingDevice.model = model || existingDevice.model;
      existingDevice.config = config || existingDevice.config;
      existingDevice.storage = storage || existingDevice.storage;
      existingDevice.ram = ram || existingDevice.ram;
      existingDevice.location = loc || existingDevice.location;
      existingDevice.lastSeen = new Date();

      await existingDevice.save();

      return res.status(200).json({
        status: "success",
        message: "Device updated successfully",
        data: existingDevice,
      });
    }

    const newDevice = new Device({
      serial_number: serial,
      model,
      config,
      storage,
      ram,
      location: loc,
      lastSeen: new Date(),
    });
    await newDevice.save();

    return res.status(201).json({
      status: "success",
      message: "Device registered successfully",
      data: newDevice,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ status: "error", message: "Device already exists" });
    }
    console.error("Error in registerDevice:", error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
};

// ✅ Fetch all devices  (FIX: empty list is 200 with [], not 404)
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find().sort({ updatedAt: -1 });
    res.json(devices);
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ message: "Error fetching devices" });
  }
};

// ✅ Update Device Location
exports.updateDeviceLocation = async (req, res) => {
  const { serial_number, location } = req.body || {};

  if (!serial_number || !validCoords(location)) {
    return res.status(400).json({ status: "error", message: "Missing serial_number or valid location data." });
  }

  try {
    const address = await getAddressFromCoordinates(location.latitude, location.longitude);

    // FIX: no upsert. It used to create broken devices for unknown serial numbers.
    const device = await Device.findOneAndUpdate(
      { serial_number },
      {
        $set: {
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address,
            accuracy: typeof location.accuracy === "number" ? location.accuracy : null,
            source: typeof location.source === "string" ? location.source.slice(0, 20) : null,
            timestamp: new Date(),
          },
          lastSeen: new Date(),
        },
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ status: "error", message: "Device not registered." });
    }

    res.status(200).json({
      status: "success",
      message: "Location updated successfully.",
      device,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ status: "error", message: "Failed to update location." });
  }
};

// NEW: change status (In Office / Rented / Overdue / Missing / Maintenance)
exports.updateStatus = async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { serial_number: req.params.serial },
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    );
    if (!device) return res.status(404).json({ message: "Device not found" });
    res.json(device);
  } catch (error) {
    res.status(400).json({ message: "Invalid status" });
  }
};