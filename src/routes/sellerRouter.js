const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Seller = require("../../Database/models/Seller/seller");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SellerSession = require("../../Database/models/Seller/sellerSession");
const { sellerAuth } = require("../middlewares/Seller.js/auth");
const Order = require("../../Database/models/Orders/order");
const Product = require("../../Database/models/Product/product");
router.use(express.json());
router.use(cookieParser());

router.post("/sellerForm", async (req, res) => {
  const { owner_name, phoneNumber, email } = req.body;
  try {
    const existingSeller = await Seller.findOne({ phoneNumber: phoneNumber });
    if (existingSeller) {
      throw new Error(
        "Try using another phone number this number is already registered",
      );
    }
    const newSeller = new Seller({
      owner_name,
      phoneNumber,
      email,
    });
    const saveSeller = await newSeller.save();
    res
      .status(200)
      .json({
        message: "Seller form submited wait for admin approval",
        saveSeller,
      });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Something went wrong : " + error.message });
  }
});

router.post("/auth/login", async (req, res) => {
  const { phoneNumber, password } = req.body;
  try {
    if (!phoneNumber) {
      throw new Error("Enter a valid pair of credentials");
    }
    const existingSeller = await Seller.findOne({ phoneNumber: phoneNumber });
    if (!existingSeller) {
      throw new Error(
        "No seller is registered using this phone number try filling seller form",
      );
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingSeller.password,
    );
    if (!isPasswordValid) {
      throw new Error("Password is invalid");
    }
    const token = await jwt.sign(
      { _id: existingSeller._id },
      "HYPERLOCAL2026",
      { expiresIn: "1d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
     const newSession = new SellerSession({
                userId: existingSeller._id,
                token:token,
                device:req.headers["user-agent"],
                ip:req.ip
   
        });
    const sessions = await newSession.save();
    res.status(200).json({message:"Seller Logged In successfully", existingSeller, sessions});
  } catch (error) {
    res
      .status(400)
      .json({ message: "Something went wrong : " + error.message });
  }
});

router.post("/auth/logout", sellerAuth , async (req, res) => {
    const {name}  = req.user;
    const token = req.cookies.token;
    await SellerSession.deleteOne({ token });
      res.cookie("token", null, {
        expires: new Date(Date.now()),
      });
      res.status(200).json({message:`Seller ${name} Logout Successfully !`})
});

// Date - 07-04-2026
router.patch("/update/seller_details", sellerAuth, async (req, res) => {
  const {bussiness_name, addhaar_no,address_details} = req.body;
  const _id = req.user._id;
  try {
    const seller = await Seller.findByIdAndUpdate(_id, {
      bussiness_name:bussiness_name,
      addhaar_no:addhaar_no,
      address_details:address_details
    }, {returnDocument: 'after'});
    if(!seller){
      throw new Error("Seller not found!");
    }
    res.status(200).json({message:"Seller updated successfully.", seller});
  } catch (error) {
     res
      .status(400)
      .json({ message: "Something went wrong : " + error.message });
  } 
} );

router.get("/order/details", sellerAuth, async(req,res) =>{
  const {_id} = req.user;
  try {
    const orders = await Order.find({sellerId:_id});
    if(orders.length === 0){
      return res.status(200).json({message:"No orders till now.", orders});
    }
    const acceptedOrders = orders.filter((order) => {return order.seller_accepted === true});
    const pendingOrders = orders.filter((order) => {return order.seller_accepted === false && order.status === 'placed'});
    const deliveredOrders = orders.filter((order) => {return order.status === 'delivered' && order.changed_by_role === 'delivery'});
    res.status(200).json({message:"Orders Fetched", acceptedOrders, pendingOrders, deliveredOrders, orders});
  } catch (error) {
     res
      .status(400)
      .json({ message: "Something went wrong : " + error.message });
  }
});

router.get("/dashboard", sellerAuth, async (req, res) => {
  const seller_id = req.user._id;

  try {
    const products = await Product.find({ seller_id });

    if (products.length === 0) {
      return res.status(200).json({
        message:
          "Insufficient product data to display, please add some products first.",
        products,
      });
    }

    const orders = await Order.find({ seller_id });

    const delivered_products = orders.filter(
      (order) => order.status === "delivered"
    );

    const out_for_delivery_products = orders.filter(
      (order) => order.status === "out_for_delivery"
    );

 
    let total_revenue = delivered_products.reduce(
      (acc, order) => acc + order.discount_amount,
      0
    );

    let total_amount_to_be_delivered = out_for_delivery_products.reduce(
      (acc, order) => acc + order.discount_amount,
      0
    );

    const dashboardDatas = {
      total_number_of_orders: orders.length,
      delivered_products: delivered_products.length,
      total_revenue,
      total_amount_to_be_delivered,
      products_to_be_delivered: out_for_delivery_products.length,
      total_items: products.length
      
    };

    res.status(200).json({
      message: "Data fetched!",
      dashboardDatas,user:req.user
    });
  } catch (error) {
    res.status(400).json({
      message: "Something went wrong : " + error.message,
    });
  }
});


router.get("/profile", sellerAuth, async(req,res) => {
  const user = req.user;
  try {
    if(!user){
    throw new Error("User not found login Again..");
  }
  res.status(200).json({message:"Profile Fetched", user});
  } catch (error) {
    res.status(400).json({
      message: "Something went wrong : " + error.message,
    });
  }
})

module.exports = router;
