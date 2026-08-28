// File upload controller
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require("../models/fileUploadModel");
const { moveFileToDrive } = require('../utils/fileUtils');

// Set up storage for attachments with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit files to 5MB
  fileFilter: (req, file, cb) => {
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
const uploadFile = async (req, res) => {
  try {
    const fileUrls = [];
    if (req.files) {
      for (let file of req.files) {
        const filePath = path.join(__dirname, '../uploads', file.filename);
        const webViewLink = await moveFileToDrive(filePath, file.filename);  // Upload to Google Drive
        fileUrls.push(webViewLink); // Store the link to the file
      }
    }

    // Save the file metadata to MongoDB
    const newFile = new File({
      title: req.body.title,
      attachments: fileUrls,  // Save the Google Drive links
    });

    await newFile.save();
    res.json(newFile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Fetch all files
const getFiles = async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch files', error: err });
  }
};

// Delete a file by ID
const deleteFile = async (req, res) => {
  const { id } = req.params;
  
  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Optionally delete from Google Drive if required
    // await deleteFileFromGoogleDrive(file.filename); 

    await File.findByIdAndDelete(id);
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete file', error: err });
  }
};

module.exports = { uploadFile,  upload, getFiles, deleteFile };


