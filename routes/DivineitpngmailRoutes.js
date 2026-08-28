const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure Multer to store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const emailPass = String(process.env.EMAIL_PASS || '').replace(/\s+/g, '');

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use SMTP settings
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail or SMTP email
    pass: emailPass, // App password if using Gmail
  },
});

// Email sending route
router.post('/skymail', upload.single('pdf'), async (req, res) => {
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
      subject: 'Your Invoice from Divineitpng',
      text: 'Please find your attached invoice.',
      html: `
    <p>Please find your attached invoice.</p>
    <hr>
    <p>Best regards,</p>
    <p><strong>Divineitpng</strong></p>
    <p>📞 +91 9606120007</p>
    <p>🌐 <a href="https://www.Divineitpng.in" target="_blank">Divineitpng.in</a></p>
  `,
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
