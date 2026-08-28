const express = require('express');
const { sendOtp, verifyOtp, userSignup, userLogin, getCartItems, addToCart, removeCartItem, } = require('../controllers/userController');
const { getUserNotifications, markNotificationAsRead } = require('../controllers/issueController');
const fetchUser = require('../middleware/fetchUser');

const router = express.Router();

// Route to send OTP
router.post('/send-otp', sendOtp);

// Route to verify OTP and proceed with account creation
router.post('/verify-otp', verifyOtp);

// Route for user signup
router.post('/signup', userSignup);

// Route for user login
router.post('/login', userLogin);


// Route to fetch user's cart items
router.post('/getcart', fetchUser, getCartItems); // Ensure fetchUser middleware is used for authentication

// Route to add item to cart
router.post('/addtocart', fetchUser, addToCart); // Use fetchUser to ensure user is authenticated

// Route to remove item from cart
router.post('/removecartitem', fetchUser, removeCartItem); // Use fetchUser for authentication

// Fetch all notifications for the logged-in user
router.get('/notifications', fetchUser, getUserNotifications);

// Mark a notification as read
router.put('/notifications/:notificationId', fetchUser, markNotificationAsRead);


module.exports = router;
