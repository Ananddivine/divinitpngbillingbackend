const jwt = require('jsonwebtoken');

const fetchUser = (req, res, next) => {
  const token = req.header('auth-token');
  console.log('Received token:', token); // Debugging
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', data); // Debugging
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};


module.exports = fetchUser;
