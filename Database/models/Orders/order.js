const mongoose = require("mongoose");
const orderSchema = mongoose.Schema(
  {
    order_number: {
      type: String,
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Customer",
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Seller",
    },
    delivery_partner_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    ordered_quantity: {
      type: Number,
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    discount_amount: {
      type: Number,
      required: true,
    },
    wallet_amount_used: {
      type: Number,
      required: true,
      defalut: 0,
    },
    payment_method: {
      type: String,
      enum: ["cod", "upi", "net_banking"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid"],
      required: true,
      default: "pending",
    },
    delivery_address: {
      type: String,
      required: true,
    },
    delivery_otp: {
      type: Number,
    },
    seller_accepted: {
      type: Boolean,
      required: true,
      default: "false",
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
        "retured",
      ],
      required: true,
      default:"placed"
    },
    changed_by_role: {
      type: String,
      enum: ["admin", "seller", "delivery"],
    },
    changed_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    seller_accepted_at: {
      type: Date,
    },
    packed_at: {
      type: Date,
    },
    assigned_at: {
      type: Date,
    },
    delivered_at: {
      type: Date,
    },
    created_at: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
