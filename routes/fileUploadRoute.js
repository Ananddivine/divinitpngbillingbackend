// routes/fileUploadRoute.js

const express = require('express');
const { uploadFile, upload, getFiles, deleteFile  } = require('../controllers/fileUploadController');
const checkRole = require('../middleware/checkRole');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/fileupload', verifyToken, checkRole(['admin']), upload.any(), uploadFile); // POST request for file upload

// Fetch all files
router.get('/', verifyToken, checkRole(['admin']), getFiles);

// Delete a file by ID
router.delete('/:id',verifyToken, checkRole(['admin']), deleteFile);


module.exports = router;
