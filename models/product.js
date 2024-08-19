const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const productSchema = mongoose.Schema(
  {
    categoryId: {
      type: ObjectId,
      ref: 'Category',
    },
    productName: {
      type: String,
      require: true,
    },

    productSize: {
        type: String,
        require: true,
      },
 
    productRate: {
      type: Number,
      require: true,
    },
    Productdescription: {
      type: String,
      require: true,
    },

    status: {
      type: Boolean,
      default: false,
    },
    image: [
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
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Event', productSchema);

module.exports = Product;
