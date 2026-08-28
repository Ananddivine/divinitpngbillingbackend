const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
  id: {
    type: Number,  // Assuming 'id' is a number, you can adjust this type if needed
    required: true, // Ensure that 'id' is required
  },
  name: {
    type: String,
    required: true,
  },
  images: {
    type: [String], // Storing an array of image URLs
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number, // Assuming price is stored as a number
    required: true,
  },
  old_price: {
    type: Number, // Optional old price
  },
  description: {
    type: String,
    required: true,
  },
});

// Export the model
module.exports = mongoose.model('Product', productSchema);
