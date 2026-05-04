const express = require("express");
const Order = require("../../Database/models/Orders/order");
const Product = require("../../Database/models/Product/product");
const Cart = require("../../Database/models/Orders/cart");
const router = express.Router();
const cookieParser = require("cookie-parser");
const { userAuth } = require("../middlewares/Customer/auth");
const { generateOrderNumber } = require("../utils/utils");


router.use(cookieParser());
router.use(express.json());

router.post("/place", userAuth, async (req, res) => {
  try {
    const customerId = req.user._id;
    const { payment_method, delivery_address } = req.body;

    const cart = await Cart.findOne({ customer_id: customerId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let createdOrders = [];

    for (let item of cart.items) {
      const product = await Product.findById(item.product_id);

      if (!product) continue;

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} out of stock`
        });
      }

      const total = product.product_price * item.quantity;

      const order = await Order.create({
        order_number: generateOrderNumber(),
        customer_id: req.user._id,
        seller_id: product.seller_id,
        product_id: product._id,
        ordered_quantity: item.quantity,
        total_amount: total,
        payment_method,
        delivery_address,
        changed_by_role: "customer",
        changed_by_id: customerId,
        delivery_otp: Math.floor(1000 + Math.random() * 9000)
      });

      product.stock -= item.quantity;
      await product.save();

      createdOrders.push(order);
    }

    // Clear cart
    cart.items = [];
    cart.total_items = 0;
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      orders: createdOrders
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my", userAuth, async (req, res) => {
  try {
    const orders = await Order.find({
      customer_id: req.user._id
    })
    .populate("product_id")
    .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched",
      orders
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my/order/:id", userAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer_id: req.user._id
    }).populate("product_id");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.patch("/cancel/:id", userAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer_id: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      ["packed", "assigned", "out_for_delivery", "delivered"]
      .includes(order.status)
    ) {
      return res.status(400).json({
        message: "Cannot cancel now"
      });
    }

    order.status = "cancelled";
    order.changed_by_role = "customer";
    order.changed_by_id = req.user._id;

    await order.save();

   

    res.json({
      message: "Order cancelled",
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/timeline/:id", userAuth, async (req, res) => {
  try {
    const data = await Order.findById(req.params.id);
    const history = {
      status:data.status,
      changed_by_role:data.changed_by_role,
      seller_accepted:data.seller_accepted,
      seller_accepted_at:data.seller_accepted_at
      
    }
    res.json({
      message: "Timeline fetched",
      history
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;