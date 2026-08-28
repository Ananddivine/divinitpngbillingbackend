const nodemailer = require('nodemailer');

// Utility function to send an email
const sendEmail = async (recipientEmail, subject, text) => {
  try {
    // Set up the email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,   // Your email address (set in .env)
        pass: process.env.EMAIL_PASS    // Your email password (set in .env)
      }
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,    // Sender email address
      to: recipientEmail,              // Recipient email address
      subject: subject,                // Email subject
      text: text                       // Email content
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

module.exports = sendEmail;
