const fs = require('fs');
const path = require('path');
const { moveFileToDrive } = require('./googleDriveUtils'); // Import the function

// Ensure the upload directory exists
const ensureUploadDirExists = (uploadDir) => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created directory: ${uploadDir}`);
  }
};

// No need to redeclare moveFileToDrive here. Just use the imported one.
module.exports = {
  ensureUploadDirExists,
  moveFileToDrive // Export the function directly without redefining it
};
