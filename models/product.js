const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const productSchema = new Schema(
  {
    categoryId: {
      type: ObjectId,
      ref: 'Category',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productRate: {
      type: Number,
      required: true,
    },
    supplierproductRate: {
      type: Number,
      required: true,
    },
    productprofitRate: {
      type: Number,
      
    },
    productinvestmentRate: {
      type: Number,

    },
    quantity: {
      type: Number,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    size: {
      type: [String], // Array of strings
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
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
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
