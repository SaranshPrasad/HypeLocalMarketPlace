const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Admin = require("../../Database/models/Admin/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminSession = require("../../Database/models/Admin/adminSession");
const { adminAuth } = require("../middlewares/Admin/auth");
const Seller = require("../../Database/models/Seller/seller");
const Customer = require("../../Database/models/Customer/customer");
const Product = require("../../Database/models/Product/product");

router.use(cookieParser());
router.use(express.json());

router.post("/login", async (req, res) => {
  const { phoneNumber, password } = req.body;
  try {
    const admin = await Admin.findOne({ phoneNumber: phoneNumber });
    if (!admin) {
      throw new Error("Admin not exists.");
    }
    const validatePassword = await bcrypt.compare(password, admin.password);
    if (!validatePassword) {
      throw new Error("Invalid credentials");
    }
    const token = await jwt.sign({ _id: admin._id }, "HYPERLOCAL2026", {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    const sessions = new AdminSession({
      userId: admin._id,
      token: token,
      device: req.headers["user-agent"],
      ip: req.ip,
    });
    const saveSessions = await sessions.save();
    res.status(200).json({ message: "Login Successfull", admin, saveSessions, token:token });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Something went wrong : " + error.message });
  }
});

router.post("/signup", async (req, res) => {
  const { name, phoneNumber, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ phoneNumber: phoneNumber });
    if (existingAdmin) {
      throw new Error("Admin already exists with this credentials try login");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      name: name,
      phoneNumber: phoneNumber,
      password: hashedPassword,
    });
    const savedAdmin = await newAdmin.save();
    res.status(200).json({ message: "Signup Successfull", savedAdmin });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Something went wrong : " + error.message });
  }
});


router.post("/logout", adminAuth , async (req, res) => {
    const {name}  = req.user;
    const token = req.cookies.token;
    await AdminSession.deleteOne({ token });
      res.cookie("token", null, {
        expires: new Date(Date.now()),
      });
      res.status(200).json({message:`Admin ${name} Logout Successfully !`})
});

router.get("/active-sessions",adminAuth, async (req, res) => {
    const {_id} = req.user;
  const sessions = await AdminSession.find({ userId: _id });

  res.json(sessions);
});
router.get("/all/sellers/request", adminAuth, async(req,res) => {
    try {
        const sellerRequests = await Seller.find({isVerified : false});
        if(sellerRequests.length === 0){
            return res.status(200).json({message:"No seller requests pending..", sellerRequests});
        }
        res.status(200).json({message:"Sellers fetched successfully", sellerRequests});
    } catch (error) {
      res.status(400).json({message:`Something went wrong ${error.message}`});
    }
});

router.post("/approve/seller", adminAuth, async (req, res) => {
  const { sellerId } = req.body;
  try {
    const seller = await Seller.findOne({ _id: sellerId });
    if (!seller) {
      throw new Error("Seller not found!");
    }
    if (seller.isVerified) {
      throw new Error("Seller is already verified");
    }
    console.log(seller.phoneNumber);
      const cleanName = seller.owner_name.slice(0, 3).toLowerCase();
      const lastDigits = seller.phoneNumber.toString().slice(-4);
      const random = Math.floor(100 + Math.random() * 900);

      const password =  `${cleanName}@${lastDigits}${random}`;
      const hashedPassword = await bcrypt.hash(password, 10);
      const data  = {
        isVerified:true,
        password:hashedPassword
      }
    
    const updatedSeller = await Seller.findByIdAndUpdate(
      seller._id,
      { 
        isVerified:true,
        password:hashedPassword
       },
      { returnDocument: 'after' },
    );
    res
      .status(200)
      .json({ message: `Seller is verified now. and your their credential is ${seller.phoneNumber} password is ${password}`, updatedSeller,  });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Something went wrong : " + error.message });
  }
});

router.get("/all/sellers", adminAuth, async (req,res) => {
    try {
      const seller = await Seller.find();
      if(!seller){
        throw new Error("Something went wrong seller not found");
        
      }
      if(seller.length === 0){
        return res.status(200).json({message:"Seller data not sufficient to display try adding seller", seller});
      }
      res.status(200).json({message:"Seller fetched", seller});
      
    } catch (error) {
      res
      .status(400)
      .json({ message: "Something went wrong : " + error.message });
    }
});

router.delete("/delete/seller/:id", adminAuth, async (req, res) => {
    const {id} = req.params;
    try {
      const seller = await Seller.findByIdAndDelete({_id:id});
      if(!seller){
        throw new Error("Seller not found");
      }
      res.status(200).json({message:"Seller deleted successfully.", seller});
    } catch (error) {
      res
      .status(400)
      .json({ message: "Something went wrong : " + error.message });
    }
});

router.get("/dashboard", adminAuth, async(req,res) => {
    try {
      const customers = await Customer.find();
      const seller = await Seller.find();
      const products = await Product.find();
      if (customers.length === 0 && seller.length === 0 && products.length === 0) {
        throw new Error("Not enough data to show.");
      }
      res.status(200).json({message:"Data fetched !", total_seller:seller.length, total_customer:customers.length,total_products:products.length, seller, customers, products, user:req.user});
    } catch (error) {
      res.status(400).json({message:"Something went wrong : "+error.message});
    }
});

router.get("/profile", adminAuth, async(req,res) => {
  const user = req.user;
  try {
    if(!user){
      throw new Error("User not found login again");
    }
    res.status(200).json({message:"Profile fetched.", user});
  } catch (error) {
      res.status(400).json({message:"Something went wrong : "+error.message});
  }
});



module.exports = router;