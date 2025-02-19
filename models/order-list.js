const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    product: {
      productName: {
        type: String,
        required: true
      },
      productId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
      },
      productImage: {
        type: String
      },
      quantity: {
        type: Number,
        required: true
      },
      size: {
        type: [String],
        required: true
      },
      selectedColor: {  
        type: String,
        required: true
      },
      productRate: {
        type: Number,
        required: true
      },
      totalPrice: {
        type: Number,
        required: true
      }
    },
    selectedAddress: {
      houseaddress: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      post: {
        type: String,
        required: true
      },
      landmark: {
        type: String
      }
    },
    selectedShippingMethod: {
      type: String,
      required: true
    },
    selectedPaymentMethod: {
      type: String,
      required: true
    },
    userDetails: {
      userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      number: {
        type: Number,
        required: true
      }
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
