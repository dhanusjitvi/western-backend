const mongoose = require('mongoose');
const Product = require('../models/product');
const Wishlist = require('../models/wishlist');
const Cart = require('../models/cart');

const productAdding = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    const {
      productName,
      quantity,
      productDescription,
      categoryId,
      productRate,
      supplierproductRate,
      sizes,  // This is where the sizes object is coming in.
    } = req.body;

    // Validate required fields
    if (!productName || !quantity || !productDescription || !categoryId || !productRate || !supplierproductRate || !sizes) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate ObjectId for categoryId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid categoryId format" });
    }

    // Parse and validate sizes
    let parsedSizes = {};
    try {
      // Loop over all sizes and parse the value of each size (stringified JSON)
      for (const [size, sizeDetails] of Object.entries(sizes)) {
        // Parse the stringified size details (e.g., '{"quantity":50,"color":["#FFFF99","#ACFFAC"]}')
        let parsedSizeDetails = JSON.parse(sizeDetails);

        // Validate the format of parsed size details
        if (
          typeof parsedSizeDetails !== 'object' ||
          typeof parsedSizeDetails.quantity !== 'number' ||
          !Array.isArray(parsedSizeDetails.color) ||
          parsedSizeDetails.color.some((color) => typeof color !== 'string')
        ) {
          throw new Error(`Invalid format for size '${size}': Must include 'quantity' (number) and 'color' (array of strings)`);
        }

        // Store the parsed size details into the parsedSizes object
        parsedSizes[size] = parsedSizeDetails;
      }
    } catch (error) {
      return res.status(400).json({
        message: "Invalid sizes format. Must be an object with quantity and color arrays.",
        details: error.message,
      });
    }

    // Validate and process images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const images = req.files.map((file) => ({
      public_id: file.filename,
      url: file.path,
    }));

    // Calculate product investment rate
    const productinvestmentRate = parseFloat(supplierproductRate) * parseInt(quantity, 10);

    // Create new product object
    const newProduct = new Product({
      productName,
      quantity: parseInt(quantity, 10),
      productDescription,
      productRate: parseFloat(productRate),
      supplierproductRate: parseFloat(supplierproductRate),
      productinvestmentRate,
      categoryId: new mongoose.Types.ObjectId(categoryId),
      sizes: parsedSizes, // Save the parsed sizes
      images,
    });

    // Save product to the database
    const savedProduct = await newProduct.save();

    res.status(201).json({ message: "Product added successfully", productId: savedProduct._id });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "An error occurred while adding the product" });
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

const categorybasedproductd = async (req, res) => {
  try {
    console.log(req.body);
    
    // Corrected the property name to match the request body
    const { categoryID } = req.body;
    console.log(categoryID);
    
    if (!categoryID) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    // Query products based on category ID
    const products = await Product.find({ categoryId: categoryID }); // Adjust the query to match your database schema
    console.log(products);

    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products by category ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Find the product by ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate the ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Ensure sizes and colors are properly formatted
    if (updateData.sizes && typeof updateData.sizes !== 'object') {
      return res.status(400).json({ message: 'Sizes must be an object with size-quantity pairs' });
    }

    if (updateData.colors && !Array.isArray(updateData.colors)) {
      return res.status(400).json({ message: 'Colors must be an array of hex codes' });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(), // Update the timestamp
      },
      { new: true, runValidators: true } // Return the updated document and validate data
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Check if already in the wishlist
    const existingItem = await Wishlist.findOne({ userId, productId });
    if (existingItem) {
      return res.status(400).json({ message: 'Product is already in your wishlist.' });
    }

    const wishlistItem = new Wishlist({ userId, productId });
    await wishlistItem.save();

    res.status(201).json({ message: 'Product added to wishlist.' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Failed to add to wishlist.' });
  }
};

// Remove from Wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const removedItem = await Wishlist.findOneAndDelete({ userId, productId });

    if (!removedItem) {
      return res.status(404).json({ message: 'Product not found in wishlist.' });
    }

    res.status(200).json({ message: 'Product removed from wishlist.' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Failed to remove from wishlist.' });
  }
};

// Get Wishlist for a User
const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const wishlist = await Wishlist.find({ userId }).populate('productId');

    res.status(200).json({ wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist.' });
  }
};


const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, selectedOptions } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, selectedOptions });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(201).json({ message: 'Product added to cart.', cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add to cart.' });
  }
};

// Get Cart Items
const getCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return res.status(404).json({ message: 'Cart is empty.' });
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart.' });
  }
};

// Remove from Cart
const removeFromCart = async (req, res) => {
  try {
    console.log(req.params);
    
    const { userId, productId } = req.params; // Getting from URL

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    // Convert `productId` to ObjectId before filtering
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== new mongoose.Types.ObjectId(productId).toString()
    );

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Product removed from cart.', cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove from cart.' });
  }
};


// Update Cart Item Quantity
const updateCartQuantity = async (req, res) => {
  try {
    console.log(req.params , req.body );
    
    const { userId, itemId } = req.params;
    const { quantity } = req.body;


    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    // Find the item in the cart
    const item = cart.items.find((item) => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }

    item.quantity = quantity; // Update quantity
    await cart.save();

    res.status(200).json({ message: 'Cart item updated successfully.', cart });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Failed to update cart item.' });
  } 
};


module.exports = {
  productAdding,
  getProducts,
  admingetProducts,
  admindeleteProduct,
  categorybasedproductd,
  getProductById,
  updateProduct,
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  addToCart,
  getCartItems,
  removeFromCart,
  updateCartQuantity,
};
