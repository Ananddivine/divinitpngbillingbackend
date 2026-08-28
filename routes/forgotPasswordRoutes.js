const express = require('express');
const { requestOTP, verifyOTP, resetPassword } = require('../controllers/forgotPasswordController');
const router = express.Router();

// Route to request OTP
router.post('/request-otp', requestOTP);

// Route to verify OTP
router.post('/verify-otp', verifyOTP);

// Route to reset password
router.post('/reset-password', resetPassword);

module.exports = router;
