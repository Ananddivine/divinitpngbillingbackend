//productRoutes.js
const express = require('express');
const { addProduct, getAllProducts, removeProduct } = require('../controllers/productController'); // Make sure to implement these in your controller
const multer = require('multer');
const checkRole = require('../middleware/checkRole');
const verifyToken = require('../middleware/verifyToken');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/upload/'); // Change this to your upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Avoid filename conflicts
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).fields([{ name: 'product_images', maxCount: 4 }]);

const router = express.Router();

router.post('/remove', removeProduct);

// Route to add a new product
router.post('/add', verifyToken, checkRole(['admin']), upload, addProduct);


// Route to get all products
router.get('/', getAllProducts); // Fetch all products

module.exports = router;
