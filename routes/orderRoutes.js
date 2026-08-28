const express = require('express');
const { placeOrder, getUserOrders, cancelOrder } = require('../controllers/orderController');
const { getCartItems } = require('../controllers/userController');
const fetchUser = require('../middleware/fetchUser'); // Middleware for authentication


const router = express.Router();

// Route to place a new order
router.post('/placeorder', fetchUser, placeOrder);

// Route to fetch user's orders
router.post('/myorders', fetchUser, getUserOrders);



router.post('/getcart', fetchUser, getCartItems); 

// Route to cancel an order
router.post('/cancelorder', fetchUser, async (req, res) => {
    await cancelOrder(req, res);
  });
  

module.exports = router;
