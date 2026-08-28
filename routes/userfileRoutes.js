const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');

// Set up storage with correct upload directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');  // Ensure files are stored in the correct folder
  },
  filename: function (req, file, cb) {
    cb(null, 'uploadedFile_' + Date.now() + path.extname(file.originalname));
  }
});

// Set up multer with the defined storage
const upload = multer({ storage: storage });

// File upload route
router.post('/uploadfile', upload.single('uploadedFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.status(200).json({ success: true, file: req.file });
  } catch (error) {
    console.error(error); // Log the actual error
    res.status(500).json({ success: false, message: 'File upload failed', error: error.message });
  }
});

module.exports = router;
