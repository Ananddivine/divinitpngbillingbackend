const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware to verify user token
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token: ", decoded);
    req.user = await User.findById(decoded.id).select('-password'); // Get the user from DB
    if (!req.user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token: ", decoded);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const fetchUser = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token
  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = { _id: data.user.id, username: data.user.name }; // Ensure user data is present
    next();
  } catch (err) {
    console.log('Invalid token:', err); // Log invalid token
    return res.status(401).json({ message: 'Invalid token' });
  }
};



module.exports = {
  authMiddleware,
  protect,
  fetchUser
};
