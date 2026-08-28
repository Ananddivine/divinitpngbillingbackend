const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../Productimages/images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadDir); // Specify upload directory
    },
    filename: function (_req, file, cb) {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`); // Generate unique filename
    }
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
  } else {
      cb(new Error("Invalid file type. Only PDF, JPG, and PNG are allowed!"), false);
  }
};

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB file size
  });
  
  const invoiceDir = path.join(__dirname, 'uploads', 'invoices');
  
  if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }
// Create the multer instance with the configured storage


// Export the multer instance
module.exports = upload;
