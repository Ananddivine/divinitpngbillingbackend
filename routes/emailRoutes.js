const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure Multer to store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use SMTP settings
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail or SMTP email
    pass: process.env.EMAIL_PASS, // App password if using Gmail
  },
});

// Email sending route
router.post('/send-invoice', upload.single('pdf'), async (req, res) => {
  try {
    const { email } = req.body; // Get user email from request
    const pdfBuffer = req.file.buffer; // Get uploaded PDF file

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Invoice from Jerish Construction',
      text: 'Please find your attached invoice.',
      attachments: [
        {
          filename: 'Invoice.pdf',
          content: pdfBuffer,
          encoding: 'base64',
        },
      ],
    };


    console.time('EmailSending');
    await transporter.sendMail(mailOptions);
    console.timeEnd('EmailSending');

    res.status(200).json({ message: 'Invoice sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error });
  }
});

module.exports = router;
