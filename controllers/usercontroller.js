const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Admin = require("../models/admin");
const Order = require('../models/order-list');
const Cart = require('../models/cart');
const Product = require('../models/product');
const sendVerifyEmail = require("../service/nodemailer");

let storeotp;
let otp = null; // Define otp variable
const register = async (req, res, next) => {
  try {
    console.log(req.body);
    const { name, number, email, password, address } = req.body;

    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      phone,
      email,
      address,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log("otp");
    console.log(otp);

    // Store the OTP in a variable accessible to the verification endpoint
    storeotp = otp;

    // Send OTP via email
    await sendVerifyEmail(email, otp);

    // Generate a JWT token
    const token = jwt.sign({ _id: savedUser._id }, "secret");

    // Set the token as a cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 100000,
    });

    // Send success response
    res.json({ message: "success" });
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const { otp } = req.body;
    console.log(storeotp + "storr");

    if (otp == storeotp) {
      // OTP is valid and matches
      console.log("OTP matched: success");
      res.json({ message: "success" });
    } else {
      // OTP is invalid or doesn't match
      console.log("OTP mismatched: failure");
      res.json({ message: "failure" });
    }
  } catch (error) {
    next(error);
  }
};

const user = async (req, res, next) => {
  try {
    // Retrieve the token from the request headers
    const token = req.headers.authorization.split("Bearer ")[1];

    // Verify the token
    const claims = jwt.verify(token, "secret");

    if (!claims) {
      return res.status(401).send({
        message: "unauthenticated",
      });
    }

    const user = await User.findOne({ _id: claims._id });

    // Check if the user is blocked
    if (user.status === true) {
      return res.status(403).send({
        message: "Access denied. User is blocked.",
      });
    }

    const { firstName, password, ...data } = await user.toJSON();

    res.send({ firstName, ...data });
  } catch (err) {
    return res.status(401).send({
      message: "unauthenticated",
    });
  }
};

const logout = (req, res, next) => {
  res.cookie("jwt", "", { maxAge: 0 });

  res.send({
    message: "success",
  });
};

const login = async (req, res) => {
    console.log(req.body);
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send({
      message: "User not found",
    });
  }
  if (!(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(400).send({
      message: "Incorrect password",
    });
  }

  if (user.status == true) {
    return res.status(403).send({
      message: "Access denied. User is blocked.",
    });
  }

  const token = jwt.sign({ _id: user._id }, "secret");

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 100000,
  });

  res.send({
    userId: user._id,
    token: token,
    message: "Success",
  });
};

const emailentering = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send({
      message: "User not found",
    });
  }

  if (user.status == true) {
    return res.status(403).send({
      message: "Access denied. User is blocked.",
    });
  }

  const token = jwt.sign({ _id: user._id }, "secret");

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 100000,
  });

  res.send({
    userId: user._id,
    message: "Success",
  });
};

const usersList = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const edituser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    console.log("Entering updateUser controller");

    const userId = req.params.id;
    const updatedUser = req.body;
    console.log("Updated User Data:", updatedUser);

    // Check if addresses are provided in the request
    if (updatedUser.addresses) {
      if (!Array.isArray(updatedUser.addresses)) {
        return res.status(400).json({ success: 0, message: "Addresses should be an array" });
      }

      // Validate and sanitize each address object
      updatedUser.addresses = updatedUser.addresses.map(address => ({
        houseaddress: address.houseaddress || '',
        city: address.city || '',
        post: address.post || '',
        landmark: address.landmark || ''
      }));
    }

    // Perform the update operation
    const user = await User.findOneAndUpdate(
      { _id: userId },
      updatedUser,
      {
        new: true,
        runValidators: true, // Ensure that validation rules are applied
        context: 'query' // Needed for some validators
      }
    );

    if (!user) {
      return res.status(404).json({ success: 0, message: "User not found" });
    }

    // Optional: Handle additional fields like `block` if necessary
    if (updatedUser.block !== undefined) {
      user.block = updatedUser.block;
      await user.save(); // Save the user after modifying `block`
    }

    res.json({ success: 1, message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    next(error);
  }
};


const addAddress = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const newAddress = req.body;

    // Validate newAddress fields
    if (!newAddress.houseaddress || !newAddress.city || !newAddress.post) {
      return res.status(400).json({ success: 0, message: "Missing required address fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: 0, message: "User not found" });
    }

    user.addresses.push(newAddress);
    await user.save();

    res.json({ success: 1, message: "Address added successfully", user });
  } catch (error) {
    console.error("Error adding address:", error);
    next(error);
  }
};


const updateAddress = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const addressId = req.params.addressId;
    const updatedAddress = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: 0, message: "User not found" });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: 0, message: "Address not found" });
    }

    // Update address fields
    address.houseaddress = updatedAddress.houseaddress || address.houseaddress;
    address.city = updatedAddress.city || address.city;
    address.post = updatedAddress.post || address.post;
    address.landmark = updatedAddress.landmark !== undefined ? updatedAddress.landmark : address.landmark;

    await user.save();

    res.json({ success: 1, message: "Address updated successfully", user });
  } catch (error) {
    console.error("Error updating address:", error);
    next(error);
  }
};



const removeAddress = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const addressId = req.params.addressId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: 0, message: "User not found" });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ success: 0, message: "Address not found" });
    }

    address.remove();
    await user.save();

    res.json({ success: 1, message: "Address removed successfully", user });
  } catch (error) {
    console.error("Error removing address:", error);
    next(error);
  }
};



const newpassword = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const newPassword = req.body.password; // Assuming the new password is sent in the request body

    // Hash the new password before updating it in the database
    const hash = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    const user = await User.findByIdAndUpdate(
      userId,
      { password: hash }, // Update the password field with the hashed password
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: 0, message: "User not found" });
    }

    res.json({ success: 1, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: 1, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const userlogin = async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });

  if (!admin) {
    return res.status(404).send({
      message: "User not found",
    });
  }
  if (!(await bcrypt.compare(req.body.password, admin.password))) {
    return res.status(400).send({
      message: "Incorrect password",
    });
  }

  const token = jwt.sign({ _id: admin._id }, "secret");

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 100000,
  });

  res.send({
    message: "Success",
  });
};

const blocking = async (req, res, next) => {
  const { userId } = req.params;
  const { status } = req.body;

  try {
    // Find the organizer by ID and update the status
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { status } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "user  not found" });
    }

    // Return the updated organizer
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const booking = async (req, res, next) => {
  try {
    const event = await eventModel
      .findOne({ _id: req.params.id })
      .populate("organisaerId");

    console.log("enterr" + event);
    res.json(event);
  } catch (error) {
    next(error);
  }
};





const order = async (req, res, next) => {
  try {
    const {
      product,
      selectedAddress,
      selectedShippingMethod,
      selectedPaymentMethod,
      userDetails
    } = req.body;

    // Validate that required fields are provided
    if (!product || !selectedAddress || !selectedShippingMethod || !selectedPaymentMethod || !userDetails) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    // Create a new order document
    const newOrder = new Order({
      product,
      selectedAddress,
      selectedShippingMethod,
      selectedPaymentMethod,
      userDetails,
      // You can optionally set orderStatus here if you want to override the default value:
      // orderStatus: "Processing" 
    });

    // Save the new order to the database
    const savedOrder = await newOrder.save();

    // Send a response with the saved order
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    next(error);
  }
};


const getOrdersForAdmin = async (req, res, next) => {
  try {
    // Get pagination parameters from query (defaults to page 1 and limit 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the number of orders to skip based on the page and limit
    const skip = (page - 1) * limit;

    // Fetch orders with pagination
    const orders = await Order.find()
      .skip(skip)  // Skip the orders for the current page
      .limit(limit); // Limit the number of orders

    // Count the total number of orders
    const totalOrders = await Order.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalOrders / limit);

    // Check if orders exist
    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found' });
    }

    // Send the orders and pagination info as a response
    res.status(200).json({
      success: true,
      orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};



const addtoCart = async (req, res, next) => {
  console.log(req.body);
  
  const { productId, size, color, quantity, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Find the product by its ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure price is available

    // Find the cart for the user or create a new one
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    // Check if the item already exists in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size && item.color === color
    );

    if (existingItemIndex > -1) {
      // If the item exists, update the quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // If the item doesn't exist, add it to the cart
      cart.items.push({
        productId,
        productName: product.productName,
        size,
        color,
   
        quantity
      });
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.quantity * item.price), 0);

    // Save the cart
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};






const getCartItems = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const removeCartItem = async (req, res) => {
  const { userId, itemId } = req.body;

  if (!userId || !itemId) {
    return res.status(400).json({ message: 'User ID and item ID are required' });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};





module.exports = {
  register,
  user,
  logout,
  login,
  usersList,
  edituser,
  updateUser,
  deleteUser,
  userlogin,
  verifyUser,
  blocking,
  booking,
  emailentering,
  newpassword,
  addAddress,
  order,
  getOrdersForAdmin,
  addtoCart,
  getCartItems,
  removeCartItem
};
