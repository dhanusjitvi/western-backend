const CategoryModel = require("../models/category");

const categoryAdding = async (req, res) => {
  try {
    console.log(req.body); // Print form fields for debugging
    console.log(req.files); // Print uploaded files for debugging

    const { Category } = req.body;
    const images = req.files; // Access uploaded files

    // Validate inputs
    if (!Category) {
      return res.status(400).json({ message: "Category name is required" });
    }

    if (!images || images.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // Process image data
    const imageData = images.map((image) => ({
      public_id: image.filename, // From Cloudinary
      url: image.path, // Cloudinary URL
    }));

    // Check if the category name already exists
    const existingCategory = await CategoryModel.findOne({
      Category: { $regex: `^${Category}$`, $options: "i" },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create a new category
    const newCategory = new CategoryModel({
      Category,
      images: imageData, // Add images to the category
    });

    // Save the category to the database
    const savedCategory = await newCategory.save();

    // Send success response
    res.json({
      message: "Category added successfully",
      categoryId: savedCategory._id,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [categories, totalCategories] = await Promise.all([
      CategoryModel.find().skip(skip).limit(limit),
      CategoryModel.countDocuments(),
    ]);

    res.json({
      categories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params; // Get category ID from the URL parameters

    // Find and delete the category by ID
    const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);

    // Check if category was found and deleted
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  categoryAdding,
  getCategories,
  deleteCategory,
  categorylist,
};
