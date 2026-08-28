require("dotenv").config();
const Laptop = require("../models/laptopModel");

exports.createOrUpdateLaptop = async (req, res) => {
    try {
        // Read valid name and token from environment variables
        const validName = process.env.AUTH_NAME;
        const validToken = process.env.AUTH_TOKEN;

        console.log("🔹 Expected Name:", validName);
        console.log("🔹 Expected Token:", validToken);

        if (!validName || !validToken) {
            console.log("❌ Error: Missing authentication values in .env");
            return res.status(500).json({
                success: false,
                message: "Server Error: Missing authentication values in .env",
            });
        }

        // Validate name and token from request headers
        const { name, token } = req.headers;

        console.log("🔹 Received Name:", name);
        console.log("🔹 Received Token:", token);

        if (name !== validName || token !== validToken) {
            console.log("❌ Unauthorized Access: Invalid Name or Token");
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid Name or Token!",
            });
        }

        // Extract laptop details from request
        const { serialNumber, manufacturer, model, cpu, ram, storage } = req.body;

        let laptop = await Laptop.findOne({ serialNumber });

        if (laptop) {
            laptop.ram = ram;
            laptop.storage = storage;
            await laptop.save();
            console.log("✅ Laptop details updated successfully!");
            return res.status(200).json({
                success: true,
                message: "Laptop details updated successfully!",
                data: laptop,
            });
        }

        laptop = await Laptop.create({
            serialNumber,
            manufacturer,
            model,
            cpu,
            ram,
            storage,
        });

        console.log("✅ New laptop added successfully!");
        return res.status(201).json({
            success: true,
            message: "Laptop added successfully!",
            data: laptop,
        });
    } catch (error) {
        console.error("❌ Error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};


// Fetch all laptop details
exports.getLaptops = async (req, res) => {
  try {
    const laptops = await Laptop.find();
    res.status(200).json({ success: true, data: laptops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
