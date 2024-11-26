const mongoose = require('mongoose');
const Product = require('../models/product'); // Adjust path as needed

const productAdding = async (req, res) => {
  try {
    console.log(req.body);  // Print out the form fields
    console.log(req.files); // Print out the uploaded files

    const { productName, quantity, productDescription, categoryId, size, productRate, supplierproductRate } = req.body;
    const images = req.files; // Access the uploaded files

    // Validate inputs
    if (!productName || !quantity || !productDescription || !categoryId || !productRate || !supplierproductRate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(size) || size.length === 0) {
      return res.status(400).json({ message: "Invalid sizes" });
    }

    // Calculate `productinvestmentRate`
    const productinvestmentRate = parseFloat(productRate) * parseInt(quantity);

    // Process image data
    const imageData = images.map(image => ({
      public_id: image.filename,
      url: image.path,
    }));

    // Create a new product
    const newProduct = new Product({
      productName,
      quantity: parseInt(quantity), // Ensure quantity is a number
      productDescription,
      productRate: parseFloat(productRate), // Ensure productRate is a number
      supplierproductRate: parseFloat(supplierproductRate),
      productinvestmentRate, // Add the calculated field
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



const getProducts = async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find();

    // Send the products as a response
    res.json(products);
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching products" });
  }
};


const admingetProducts = async (req, res) => {
  try {
    // Extract page and limit from query parameters, with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const products = await Product.find()
      .skip(skip)
      .limit(limit);

    // Get total count of products for pagination info
    const totalProducts = await Product.countDocuments();

    // Send the paginated products and metadata as a response
    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching products" });
  }
};


const admindeleteProduct = async (req, res) => {
  try {
    console.log("enterr");
    
    const { id } = req.params;

    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Attempt to delete the product by ID
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Send response with 200 status and the success message
    return res.status(200).json({
      message: 'Product deleted successfully',
      product: deletedProduct // Send back deleted product info if needed
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  productAdding,
  getProducts,
  admingetProducts,
  admindeleteProduct
};
