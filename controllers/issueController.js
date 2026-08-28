//issueController.js
const Issue = require('../models/issueModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sendNotificationEmail = require('../services/emailService');
const Notification = require('../models/notificationModel');
const { moveFileToDrive } = require('../utils/fileUtils');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads'); // Make sure this path is correct
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}


// Set up storage for attachments with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Store files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit files to 5MB
  fileFilter: (req, file, cb) => {
    console.log("File Name:", file.originalname);  // Log file name
    console.log("MIME Type:", file.mimetype);  // Log MIME type
  
    const allowedTypes = /jpeg|jpg|png|pdf|doc|rar|docx|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, documents, and ZIP files are allowed'));
    }
  },
  
});

  // Create issue with attachments
  const createIssue = async (req, res) => {
    try {
      const fileUrls = [];
      for (let file of req.files) {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        const webViewLink = await moveFileToDrive(filePath, file.filename);  // Upload to Google Drive
        fileUrls.push(webViewLink); // Store the link to the file
      }
  
      const newIssue = new Issue({
        title: req.body.title,
        description: req.body.description,
        user: req.user._id,
        username: req.user.username,
        attachments: fileUrls,  // Save the Google Drive links
      });
  
      await newIssue.save();
      res.json(newIssue);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error', error: err });
    }
  };


// Get all issues with populated user field
const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find(); // Fetch all issues
    console.log('Fetched issues:', issues); // Log fetched issues
    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error); // Log the specific error
    res.status(500).json({ message: 'Error fetching issues', error: error.message });
  }
};


// Reply to an issue
const replyToIssue = async (req, res) => {
  const { issueId } = req.params;
  const { message } = req.body;

  try {
    const issue = await Issue.findById(issueId)
      .populate('user', 'username email')  // Populate the user field for the issue creator
      .populate('replies.user', 'username');  // Populate user in replies to get username

    // Check if the issue exists
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Create a new reply
    const reply = {
      user: req.user._id, // Current logged-in user
      username: req.user.username, // Store the username directly in replies
      message,
    };

    // Add the reply to the issue's replies array
    issue.replies.push(reply);
    await issue.save();

    // Create and send the notification (same as before)
    const notification = new Notification({
      user: issue.user._id,
      issue: issue._id,
      reply: reply._id,
      message: `${req.user.username} has replied to your issue: ${issue.title}`,
    });
    await notification.save();

    // Send the email notification if necessary
    if (issue.user && issue.user.email) {
      const emailSubject = 'New Reply to Your Issue';
      const emailText = `Hello ${issue.user.username || 'there'},\n\nSomeone has replied to your issue titled "${issue.title}".\n\nMessage: ${message}\n\nCheck it out here: https://lapunivers.vercel.app/Notifications\n\nBest regards,\nYour Team`;

      // Trigger the email notification
      sendNotificationEmail(issue.user.email, emailSubject, emailText);
    }

    // Return the updated issue with populated fields
    res.status(200).json(issue);
  } catch (error) {
    console.error('Error replying to issue:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};



// Get issues uploaded by the specific user
const getUserIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ user: req.user._id }); // Fetch issues for the logged-in user
    res.json(issues);
  } catch (error) {
    console.error('Error fetching user issues:', error);
    res.status(500).json({ message: 'Error fetching user issues', error: error.message });
  }
};




const fetchUserIssues = async (req, res) => {
  try {
    // Fetch issues based on the user ID from the token
    const issues = await Issue.find({ user: req.user._id }); // Use the user ID from the request object
    res.json(issues);
  } catch (error) {
    console.error('Error fetching user issues:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete issue by ID and remove attached files
const deleteIssue = async (req, res) => {
  const { issueId } = req.params;

  try {
    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Ensure the user trying to delete is the owner of the issue
    if (issue.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this issue' });
    }

    // Delete attached files from the server
    issue.attachments.forEach((filePath) => {
      const filePathLocal = path.join(__dirname, '../uploads/', path.basename(filePath));
      if (fs.existsSync(filePathLocal)) {
        fs.unlinkSync(filePathLocal); // Remove file from uploads directory
      }
    });

    // Delete the issue
    await issue.deleteOne();
    res.status(200).json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ message: 'Error deleting issue', error: error.message });
  }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('issue', 'title') // Populate the issue title
      .populate('reply', 'message') // Populate the reply message
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark notifications as read
const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true; // Mark it as read
    await notification.save();
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

module.exports = { createIssue, getIssues, replyToIssue, getUserIssues, deleteIssue, fetchUserIssues, getUserNotifications, markNotificationAsRead, upload };
