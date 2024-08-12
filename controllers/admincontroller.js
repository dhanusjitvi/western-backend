const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/user");

const Admin = require("../models/admin");

const adminlogin = async (req, res) => {
  try {
    console.log("hii");
    console.log(req.body.email);

    // Find admin by email
    const admin = await Admin.findOne({ email: req.body.email });
    console.log(admin);

    if (!admin) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    // Check password
    if (!(await bcrypt.compare(req.body.password, admin.password))) {
      return res.status(400).send({
        message: "Incorrect password",
      });
    }

    // Generate token
    const token = jwt.sign({ _id: admin._id }, "secret", { expiresIn: '1h' }); // Adjust token expiry as needed

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true, // Cookie is accessible only by the web server
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 3600000 // 1 hour in milliseconds
    });

    // Send response
    res.send({
      token: token,
      adminId: admin._id, // Include the user ID in the response
      message: "Success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
};


const register = async (req, res) => {
  try {
    console.log(req.body); // Log the request body to ensure it contains the expected fields
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if email is already taken
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new Admin({
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Generate a JWT token
    
    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET || "default_secret", {
      expiresIn: '1h' // Set token expiration time
    });

    // Set the token as a cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 // Cookie expiration time (e.g., 1 hour)
    });

    // Send success response
    res.json({ message: "Registration successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during registration" });
  }

 
};




module.exports = {
    adminlogin,
    register
   
  };