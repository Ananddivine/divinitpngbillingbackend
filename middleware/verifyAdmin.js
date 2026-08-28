const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  // Check if token is provided
  if (!token) {
    return res.status(403).json({ success: false, message: 'No token provided' });
  }

  try {
    // Split "Bearer" from the token and verify it
    const bearerToken = token.split(' ')[1];
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }
      req.user = decoded; // Attach user info to request object
      next();  // Move to the next middleware
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to authenticate token' });
  }
};

module.exports = verifyToken;
