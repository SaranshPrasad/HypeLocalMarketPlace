const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  items: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  total_items: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;