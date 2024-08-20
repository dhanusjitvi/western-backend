const mongoose = require('mongoose');
const Product = require('../models/product'); // Adjust path as needed

const productAdding = async (req, res) => {
  try {
    console.log(req.body);  // Print out the form fields
    console.log(req.files); // Print out the uploaded files

    const { productName, quantity, productDescription, categoryId, size, productRate } = req.body;
    const images = req.files; // Access the uploaded files

    // Validate inputs
    if (!productName || !quantity || !productDescription || !categoryId || !productRate) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    if (!Array.isArray(size) || size.length === 0) {
      return res.status(400).json({ message: "Invalid sizes" });
    }

    // Process image data
    const imageData = images.map(image => ({
      public_id: image.filename,
      url: image.path,
    }));
    
    // Create a new product
    const newProduct = new Product({
      productName,
      quantity,
      productDescription,
      productRate,
      categoryId: new mongoose.Types.ObjectId(categoryId), // Ensure categoryId is a valid ObjectId
      size, // Sizes should be an array
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
};

module.exports = {
  productAdding
};
