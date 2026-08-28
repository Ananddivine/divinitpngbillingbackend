// fileRoutes.js
const express = require('express');
const upload = require('../middleware/multer'); // Adjust the path as necessary
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const UserFileModel = require('../models/userFileModel');

// Upload endpoint
router.post('/upload', upload.array('product_images', 4), (req, res) => {
    console.log('Received files:', req.files); // Log the received files
    console.log('Request body:', req.body); // Log the request body

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded or wrong field name' });
    }

    const imageUrls = req.files.map(file => `https://lapunivers-backend.onrender.com/images/${file.filename}`);
    res.json({ success: true, image_urls: imageUrls });
});


// Endpoint to get files uploaded by the authenticated user
router.get('/my-uploads', authMiddleware, async (req, res) => {
    try {
        const userFiles = await UserFileModel.find({ userId: req.user._id });
        res.status(200).json(userFiles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user files' });
    }
});



module.exports = router;
