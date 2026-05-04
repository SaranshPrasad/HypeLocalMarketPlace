const express = require("express");
const { userAuth } = require("../middlewares/Customer/auth");
const Cart = require("../../Database/models/Orders/cart");
const router = express.Router();
const cookieParser = require("cookie-parser");

router.use(cookieParser());
router.use(express.json());


router.get("/items", userAuth, async (req,res) => {
    const {_id} = req.user;
    try {
        const cart = await Cart.findOne({customer_id:_id});
        if(!cart){
            throw new Error("Cart not found");
        }
        if(cart.length === 0){
            return res.status(200).json({message:" Not enough data to show"})
        }
        res.status(200).json({message:" Data fetched", cart});
    } catch (error) {
        res.status(400).json({message:"Something went wrong"+error.message});
    }
});

router.post("/add", userAuth, async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.body;

    let cart = await Cart.findOne({ customer_id: customerId });
    
    if (!cart) {
      cart = new Cart({
        customer_id: customerId,
        items: [{ product_id: productId, quantity: 1 }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product_id.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ product_id: productId, quantity: 1 });
      }
      cart.total_items += 1;
    }
    await cart.save();

    res.status(200).json({ message: "Added to cart", cart });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/increase", userAuth, async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ customer_id: req.user._id });

    const item = cart.items.find(
      (item) => item.product_id.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }
    item.quantity += 1;

    await cart.save();

    res.json({ message: "Quantity increased", cart });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/decrease", userAuth, async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ customer_id: req.user._id });

    const itemIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      // remove item if quantity = 1
      cart.items.splice(itemIndex, 1);
    }

    updateTotalItems(cart);
    await cart.save();

    res.json({ message: "Quantity decreased", cart });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/remove/:productId", userAuth, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ customer_id: req.user._id });

    cart.items = cart.items.filter(
      (item) => item.product_id.toString() !== productId
    );

    updateTotalItems(cart);
    await cart.save();

    res.json({ message: "Item removed", cart });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;