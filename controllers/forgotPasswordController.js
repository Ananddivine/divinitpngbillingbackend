const User = require('../models/userModel');  // Assuming you have a User model
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Store OTPs temporarily in memory (for production, store them in the DB)
let otpStorage = {};

// Function to send OTP to user’s email
exports.requestOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate an OTP
        const otp = crypto.randomInt(100000, 999999);

        // Store OTP with an expiry time (5 minutes)
        otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

        // Configure Nodemailer to send the OTP email
        const transporter = nodemailer.createTransport({
            service: 'gmail',  // Change to your email provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Function to verify OTP
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    const storedOtp = otpStorage[email];

    if (!storedOtp) {
        return res.status(400).json({ message: 'OTP not requested or expired' });
    }

    // Check if OTP is valid and not expired
    if (storedOtp.otp === parseInt(otp) && storedOtp.expiresAt > Date.now()) {
        return res.status(200).json({ message: 'OTP verified successfully' });
    }

    return res.status(400).json({ message: 'Invalid or expired OTP' });
};

// Function to reset password
exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password before saving (assuming bcrypt is used)
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();

        // Clear the OTP storage for this email
        delete otpStorage[email];

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
