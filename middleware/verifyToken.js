const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if authorization header is present
  if (!authHeader) {
    console.log('Authorization header missing');
    return res.status(403).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token

  if (!token) {
    console.log('Token missing in Authorization header');
    return res.status(403).json({ success: false, message: 'Invalid token format' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = decoded;
    console.log('Token verified successfully:', decoded);
    next();
  });
};

module.exports = verifyToken;
