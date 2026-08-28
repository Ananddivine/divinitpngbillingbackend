//productContrller.js
const Product = require('../models/productModel'); // Ensure this model exists
const id = require('../models/productModel'); // Ensure this model exists

// Add a new product
const addProduct = async (req, res) => {
  try {
    // Fetch all existing products
    let products = await Product.find({});
    let id;

    // Generate a new id based on the last product's id
    if (products.length > 0) {
      let last_product = products[products.length - 1];
      id = last_product.id + 1;
    } else {
      id = 1;
    }

  


    // Create a new product instance
    const product = new Product({
      id: id,
      name: req.body.name,
      images: req.body.images, // Store the array of image URLs
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      description: req.body.description,
      available: true, // Example additional field
      date: new Date(),
    });

    // Save the new product instance
    await product.save();
    console.log("Product saved");

    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
    }
};


const removeProduct = async (req, res) => {
    const { id } = req.body; // Get product ID from the request body

    try {
        const product = await Product.findOneAndDelete({ id }); // Assuming you are using 'id' to find the product
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
        console.error('Error removing product:', error);
        res.status(500).json({ success: false, message: 'Failed to remove product', error: error.message });
    }
};

module.exports = {
    addProduct,
    getAllProducts,
    removeProduct, // Ensure this is exported
};