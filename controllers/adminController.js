const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // For generating a unique token
const bcrypt = require('bcrypt'); // For hashing
const UserAuth = require('../models/UserAuth');
const Order = require('../models/orderModel');

// Admin login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    let role = null;

    console.log("Admin login attempt:", email);

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      role = 'admin';
    } else if (email === process.env.SECOND_ADMIN_EMAIL && password === process.env.SECOND_ADMIN_PASSWORD) {
      role = 'manager';
    } else if (email === process.env.UserOneEmail && password === process.env.UserOnePassword) {
      role = 'staff';
    } else if (email === process.env.UserTwoEmail && password === process.env.UserTwoPassword) {
      role = 'staffone';
    } else {
      console.log("Invalid login attempt");
      return res.json({ success: false, message: 'Invalid Credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: '12h' });

    // Generate a unique token
    const uniqToken = crypto.randomBytes(16).toString('hex');

    // Hash the unique token before storing it
    const salt = await bcrypt.genSalt(10);
    const hashedUniqToken = await bcrypt.hash(uniqToken, salt);

    let user = await UserAuth.findOne({ email });

    if (user) {
      console.log("Existing user found, updating hashed uniqToken.");
      user.uniqToken = hashedUniqToken;
      await user.save();
    } else {
      console.log("New user detected, saving auth details.");
      user = new UserAuth({ email, role, uniqToken: hashedUniqToken });
      await user.save();
    }

    console.log("Admin login successful:", { email, role, uniqToken });

    // Send only the raw uniqToken to the frontend
    res.json({ success: true, token, role, uniqToken });

  } catch (error) {
    console.error("Error during admin login:", error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Unique Token
const verifyUniqToken = async (req, res) => {
  const { email, uniqToken } = req.body;

  console.log("Verifying token for:", email);

  try {
      if (!email || !uniqToken) {
          return res.json({ success: false, message: "Email and token are required." });
      }

      const user = await UserAuth.findOne({ email });

      if (!user) {
          console.log("User not found:", email);
          return res.json({ success: false, message: "User not found." });
      }

      const isMatch = await bcrypt.compare(uniqToken, user.uniqToken);

      if (isMatch) {
          console.log("Token verified successfully for user:", user.email);

          // Allow both "staff" and "admin"
          if (user.role === "staff" || user.role === "admin") {
              return res.json({ success: true, role: user.role });
          } else {
              console.log("Unauthorized role:", user.role);
              return res.json({ success: false, message: "Unauthorized role." });
          }
      } else {
          console.log("Invalid or expired token for user:", email);
          return res.json({ success: false, message: "Invalid or expired token." });
      }
  } catch (error) {
      console.error("Error verifying token:", error);
      res.status(500).json({ success: false, message: error.message });
  }
};


// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('products.productId').populate('userId');
    res.json({ success: true, orders });
    console.log("clint order feched:", orders)
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// Update order status
const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};





module.exports = {
  adminLogin,
  getAllOrders,
  updateOrderStatus,
  verifyUniqToken,
};
