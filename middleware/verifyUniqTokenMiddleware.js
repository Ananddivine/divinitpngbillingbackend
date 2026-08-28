const UserAuth = require("../models/UserAuth");
const bcrypt = require("bcrypt");

const verifyUniqTokenMiddleware = async (req, res, next) => {
    try {
        const email = req.headers["user-email"]; // Read email from headers
        const uniqToken = req.headers["authorization"]?.split(" ")[1]; // Extract token from "Bearer token"

        if (!email || !uniqToken) {
            return res.status(401).json({ success: false, message: "Unauthorized: Missing credentials." });
        }

        const user = await UserAuth.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found." });
        }

        const isMatch = await bcrypt.compare(uniqToken, user.uniqToken);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
        }

        if (user.role !== "staff" && user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden: Access denied." });
        }

        next(); // Proceed to the deleteTask function
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};


module.exports = verifyUniqTokenMiddleware;
