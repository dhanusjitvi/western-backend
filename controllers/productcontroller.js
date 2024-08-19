// controllers/productcontroller.js
const mongoose = require('mongoose');
const productModal = require('../models/product'); // Adjust path as needed

const productAdding = async (req, res) => {
  try {
    const { productName, quantity, description, categoryId, sizes } = req.body;
    const images = req.files; // Access the uploaded files

    // Validate inputs
    if (!productName || !quantity || !description || !categoryId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    if (!Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({ message: "Invalid sizes" });
    }

    // Process image data
    const imageData = images.map(image => ({
      public_id: image.filename,
      url: image.path,
    }));
    
    // Create a new product
    const newProduct = new productModal({
      productName,
      quantity,
      description,
      categoryId: new mongoose.Types.ObjectId(categoryId), // Ensure categoryId is a valid ObjectId
      sizes: sizes || [], // Sizes can be an array or a single value, adjust as needed
      images: imageData,
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    // Send success response
    res.json({ message: "Product added successfully", productId: savedProduct._id });
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
}

module.exports = {
  productAdding
};
