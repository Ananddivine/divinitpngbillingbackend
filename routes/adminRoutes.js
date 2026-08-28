const express = require('express');
const { adminLogin, getAllOrders } = require('../controllers/adminController');
const verifyToken = require('../middleware/verifyToken'); // Middleware for admin token verification
const { updateOrderStatus, verifyUniqToken } = require('../controllers/adminController');
const checkRole = require('../middleware/checkRole')

const router = express.Router();

// Route for admin login
router.post('/adminlogin', adminLogin);

router.post('/updateorderstatus', verifyToken, checkRole(['admin', 'manager']), updateOrderStatus);
router.get('/getallorders', verifyToken, checkRole(['admin']), getAllOrders);

router.post('/verify-uniq-token', verifyUniqToken);

module.exports = router;
