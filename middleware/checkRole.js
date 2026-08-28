const jwt = require('jsonwebtoken');

// Middleware to verify user role
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: 'Access denied. Insufficient role.' });
      }
      req.user = decoded; // Attach user data for later use
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid token.' });
    }
  };
};

module.exports = checkRole;
