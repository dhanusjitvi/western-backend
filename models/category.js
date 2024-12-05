const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    Category: {
    type: String,
    require: true,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Category", categorySchema);
