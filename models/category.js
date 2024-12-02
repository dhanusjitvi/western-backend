const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    Category: {
    type: String,
    require: true,
  },
  Status: {
    type: Boolean,
    required: true,
    default: false,
  }
});

module.exports = mongoose.model("Category", categorySchema);
