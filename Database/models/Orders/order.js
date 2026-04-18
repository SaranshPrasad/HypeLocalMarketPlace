const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    required: true,
    unique: true
  },

  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true
  },

  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  delivery_partner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Delivery"
  },

  ordered_quantity: {
    type: Number,
    required: true
  },

  total_amount: {
    type: Number,
    required: true
  },

  discount_amount: {
    type: Number,
    default: 0
  },

  wallet_amount_used: {
    type: Number,
    default: 0
  },

  payment_method: {
    type: String,
    enum: ["cod", "upi", "net_banking"],
    required: true
  },

  payment_status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },

  delivery_address: {
    type: String,
    required: true
  },

  delivery_otp: Number,

  seller_accepted: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: [
      "placed",
      "accepted",
      "packed",
      "assigned",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned",
      "rejected"
    ],
    default: "placed"
  },

  changed_by_role: {
    type: String,
    enum: ["admin", "seller", "delivery", "customer"]
  },
  seller_rejected:{
    type:Boolean,
    default:false
  },

  changed_by_id: mongoose.Schema.Types.ObjectId,

  seller_accepted_at: Date,
  packed_at: Date,
  assigned_at: Date,
  delivered_at: Date

}, { timestamps: true });
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;