const Device = require("../models/Device");
const axios = require("axios");

// Function to get address from coordinates
async function getAddressFromCoordinates(latitude, longitude) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    return response.data.display_name || "Address not found";
  } catch (error) {
    console.error("Error fetching address:", error);
    return "Address not available";
  }
}

// Validate API
exports.validation = async (req, res) => {
  const { name, token } = req.body;
  if (name === "lapstock" && token === "12345") {
    return res.json({ status: "success" });
  } else {
    return res.status(400).json({ status: "error", message: "Invalid name or token" });
  }
};

// ✅ Register or Update Device
exports.registerDevice = async (req, res) => {
  const { serial_number, model, config, storage, ram, location } = req.body;

  try {
    const existingDevice = await Device.findOne({ serial_number });

    if (existingDevice) {
      existingDevice.model = model || existingDevice.model;
      existingDevice.config = config || existingDevice.config;
      existingDevice.storage = storage || existingDevice.storage;
      existingDevice.ram = ram || existingDevice.ram;
      existingDevice.location = location || existingDevice.location;

      await existingDevice.save();

      return res.status(200).json({
        status: "success",
        message: "Device updated successfully",
        data: existingDevice,
      });
    } else {
      const newDevice = new Device({
        serial_number,
        model,
        config,
        storage,
        ram,
        location,
      });

      await newDevice.save();

      return res.status(201).json({
        status: "success",
        message: "Device registered successfully",
        data: newDevice,
      });
    }
  } catch (error) {
    console.error("Error in registerDevice:", error);
    return res.status(500).json({ status: "error", message: "An error occurred" });
  }
};

// ✅ Fetch Device Serial Number
exports.getAllDevices = async (req, res) => {
  try {
    // Fetch all devices from the database
    const devices = await Device.find();

    if (!devices || devices.length === 0) {
      return res.status(404).json({ message: "No devices found" });
    }

    // Respond with an array of devices
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching devices", error });
  }
};


// ✅ Update Device Location
exports.updateDeviceLocation = async (req, res) => {
  const { serial_number, location } = req.body;

  if (!serial_number || !location) {
    return res.status(400).json({ status: "error", message: "Missing serial_number or location data." });
  }

  try {
    const address = await getAddressFromCoordinates(location.latitude, location.longitude);

    const device = await Device.findOneAndUpdate(
      { serial_number },
      {
        $set: {
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address,
          },
        },
      },
      { new: true, upsert: true }
    );

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
