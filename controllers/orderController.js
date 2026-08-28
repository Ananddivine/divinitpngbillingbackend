const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');



// Place a new order
const placeOrder = async (req, res) => {
  const userId = req.user.id; // Get the authenticated user ID
  const { products, deliveryInfo } = req.body;

  // Log request body for debugging
  console.log("Request Body for Place Order:", req.body);

  // Filter out products with quantity less than 1
  const filteredProducts = products.filter(prod => 
    prod.quantity > 0 && Number.isInteger(prod.productId) && prod.productId > 0
  );

  if (filteredProducts.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one product must have a valid quantity.' });
  }

  try {
    // Fetch valid products from the database using the numeric `id`
    const validProducts = await Product.find(
      { id: { $in: filteredProducts.map(prod => prod.productId) } },
      { _id: 1, id: 1 } // Fetch both _id and id fields
    ).lean();

    if (validProducts.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid products found.' });
    }

    // Create a mapping of product `id` to `_id`
    const validProductMap = validProducts.reduce((map, product) => {
      map[product.id] = product._id; // Map the numeric id to ObjectId
      return map;
    }, {});

    // Prepare products for order
    const formattedProducts = filteredProducts.map(prod => {
      const productId = validProductMap[prod.productId];
      if (!productId) {
        console.log(`Product with id ${prod.productId} does not exist.`);
        return null; // Return null if product doesn't exist
      }
      return {
        productId: new mongoose.Types.ObjectId(productId), // Ensure this is converted correctly
        quantity: prod.quantity,
      };
    }).filter(Boolean); // Filter out any null values

    if (formattedProducts.length === 0) {
      return res.status(400).json({ success: false, message: 'All products are invalid.' });
    }

    const newOrder = new Order({
      userId: new mongoose.Types.ObjectId(userId), // Correct usage of ObjectId
      products: formattedProducts,
      deliveryInfo,
      status: 'Pending',
      date: new Date(),
    });

    console.log('New Order:', newOrder);
    await newOrder.save();
    res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
    console.error("Order placement failed:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch orders for a user
const getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const orders = await Order.find({ userId }).populate('products.productId');
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
};


// Cancel an order
const cancelOrder = async (req, res) => {
  const userId = req.user.id; // Get the authenticated user ID
  const { orderId } = req.body; // Order ID to be canceled

  try {
    // Find the order by ID and ensure it belongs to the authenticated user
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or does not belong to the user.' });
    }

    // Check if the order is already canceled or completed
    if (order.status === 'Canceled' || order.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Order cannot be canceled as it is already processed.' });
    }

    // Update the order status to 'Canceled'
    order.status = 'Canceled';
    await order.save();

    res.json({ success: true, message: 'Order has been canceled successfully.' });
  } catch (error) {
    console.error("Cancel order failed:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  placeOrder,
  getUserOrders,
  cancelOrder,
};
