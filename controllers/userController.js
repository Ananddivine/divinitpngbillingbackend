const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');  
const disposableDomains = require('disposable-email-domains');
const rateLimit = require('express-rate-limit');

const otpStore = {}; 

// Rate limiter for OTP requests
const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 requests per 10 minutes
  message: 'Too many requests, please try again later.',
});

const allowedDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'aol.com',
  'icloud.com',
  'protonmail.com'
]; // Add more professional domains as needed.

const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Extract domain and local part from the email
    const [localPart, domain] = email.split('@');

    // Validate domain: Check if it's in the allowed list
    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({
        success: false,
        message: 'Please use a professional email address (e.g., Gmail, Yahoo, Outlook, etc.)',
      });
    }

    // Reject email if it contains a "+" symbol
    if (localPart.includes('+')) {
      return res.status(400).json({
        success: false,
        message: 'Email addresses with "+" symbols are not allowed. Use the valid email',
      });
    }

    // Reject email if the local part contains more than 2 dots
    const dotCount = localPart.split('.').length - 1;
    if (dotCount > 2) {
      return res.status(400).json({
        success: false,
        message: 'Email addresses with more than two dots in the local part are not allowed. Use the valid email',
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpHash = crypto.createHash('sha256').update(otp.toString()).digest('hex');

    otpStore[email] = {
      otpHash,
      expiresAt: Date.now() + 2 * 60 * 1000, // 2-minute validity
      lastRequestedAt: Date.now(),
    };

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Account Verification',
      text: `Your OTP is ${otp}. It is valid for 2 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);

    res.status(200).json({ success: true, message: 'OTP sent to your email.' });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};


// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Check if OTP exists
    const otpData = otpStore[email];
    if (!otpData) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Check OTP expiration
    if (Date.now() > otpData.expiresAt) {
      delete otpStore[email]; // Remove expired OTP
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Validate OTP
    const hashedInputOtp = crypto.createHash('sha256').update(otp.toString()).digest('hex');
    if (hashedInputOtp !== otpData.otpHash) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    // OTP is valid
    delete otpStore[email]; // Remove OTP after successful verification
    res.status(200).json({ success: true, message: 'OTP verified. Proceed to create account.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};



// User signup (after OTP verification)
const userSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if email already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a random token
    const token = crypto.randomBytes(20).toString('hex');

    // Initialize cartData (for example purposes)
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    // Create user in the database
    const user = new User({
      name: username,
      email,
      password: hashedPassword,
      cartData: cart,
      token: token,
    });

    await user.save();

    // Generate JWT token for authentication
    const data = { user: { id: user._id, name: user.name } };
    const authToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Send response with auth token and user data
    res.json({
      success: true,
      authToken,
      token,
      user: {
        name: user.name,
        email: user.email,
        id: user._id
      }
    });

    // Send welcome email using NodeMailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for registering',
      text: 'Thank you for registering on our platform!',
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
        return res.status(500).json({ success: false, message: 'Error sending email' });
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// User login
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid password' });

    // Generate a new JWT token for the user on login
    const data = { user: { id: user._id, name: user.name } };
    const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Return the user object with username and token
    res.json({ 
      success: true, 
      token, 
      user: { 
        name: user.name, 
        email: user.email,
        id: user._id 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to log in', error: error.message });
  }
};


// Get Cart Items
const getCartItems = async (req, res) => {
  console.log('User ID:', req.user); // Debugging line
  const userId = req.user.id; // Ensure req.user is set correctly

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json(user.cartData); // Assuming cartData contains the cart items
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch cart items', error: error.message });
  }
};

// Add to Cart
const addToCart = async (req, res) => {
  const userId = req.user.id; // Get the user ID from the request
  const { item } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize cartData if it doesn't exist
    user.cartData[item] = (user.cartData[item] || 0) + 1; // Increment quantity or initialize
    await user.save();
    
    res.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add item to cart', error: error.message });
  }
};

// Remove from Cart
const removeCartItem = async (req, res) => {
  const userId = req.user.id; // Get the user ID from the request
  const { item } = req.body;

  try {
    const user = await User.findById(userId);
    if (user.cartData[item]) {
      user.cartData[item] -= 1; // Decrement quantity
      if (user.cartData[item] <= 0) {
        delete user.cartData[item]; // Remove the item if quantity is 0
      }
      await user.save();
      res.json({ success: true, message: 'Item removed from cart' });
    } else {
      res.status(400).json({ success: false, message: 'Item not found in cart' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove item from cart', error: error.message });
  }
};

module.exports = {
  otpRateLimiter,
  sendOtp,
  verifyOtp,  
  userSignup,
  userLogin,
  getCartItems,
  addToCart,
  removeCartItem,
};
