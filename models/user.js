const mongoose = require("mongoose");

// Define a separate schema for addresses
const addressSchema = new mongoose.Schema({
  houseaddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  post: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    required: false,
  },
}, { _id: true }); // Each address will have a unique _id by default

// Update the user schema to include an array of addresses
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  addresses: [addressSchema], // Changed from single object to array
  password: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
}, 
{
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
