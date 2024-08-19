const CategoryModel = require("../models/category");

const Categoryadding = async (req, res, next) => {
    try {
      const { Category } = req.body;
  console.log(Category);
      // Check if the category name already exists in the database
      const existingCategory = await CategoryModel.findOne({
        Category: { $regex: `^${Category}$`, $options: "i" },
      });
  
      if (existingCategory) {
        // Category name already exists
        return res.status(400).json({ message: "Category already exists" });
      }
  
      // Create a new event
      const newCategory = new CategoryModel({
        Category,
      });
  
      // Save the event to the database
      const savedCategory = await newCategory.save();
  
      // Send success response
      res.json({ message: "success" }); // Return the saved event ID to the client if needed
    } catch (error) {
      // Handle error
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    }
  };


  const categorylist = async (req, res, next) => {
    try {
      const category = await CategoryModel.find();
  
      res.status(200).json({ category });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  };

  const updateCategoryStatus = async (req, res, next) => {
    try {
      const { categoryId } = req.params; // Get category ID from the URL parameters
      const { status } = req.body; // Get the new status from the request body
  
      // Ensure status is a boolean
      if (typeof status !== 'boolean') {
        return res.status(400).json({ message: 'Invalid status value' });
      }
  
      // Find the category by ID and update its status
      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        categoryId,
        { Status: status },
        { new: true, runValidators: true } // Return the updated document and validate
      );
  
      // Check if category was found and updated
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Send the updated category in the response
      res.json({ message: 'Category status updated successfully', category: updatedCategory });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
module.exports = {
    Categoryadding,
     categorylist,
     updateCategoryStatus,
   
  };