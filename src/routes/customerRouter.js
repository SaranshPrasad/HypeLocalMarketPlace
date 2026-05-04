const express = require("express");
const { userAuth } = require("../middlewares/Customer/auth");
const Customer = require("../../Database/models/Customer/customer");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Session = require("../../Database/models/Customer/session");
const OTP = require("../../Database/models/Customer/otp");
const Cart = require("../../Database/models/Orders/cart");
const Product = require("../../Database/models/Product/product");
const OrderStatus = require("../../Database/models/Orders/order_status");
const Order = require("../../Database/models/Orders/order");
const { generateOrderNumber } = require("../utils/utils");
router.use(cookieParser());
router.use(express.json());
router.get("/customer", (req, res) => {
    res.send("Hellow From Customer Router");
});

// Phone Number + Password Authentication
// router.post("/auth/login", async (req, res) => {
//     const {phoneNumber, password}= req.body;
//     const {_id} = req.user;
//     try {
//         const user = await Customer.findOne({phoneNumber});
//         if(!user){
//             return res.status(404).json({message:"User not verified !"});
//         }

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         res.status(200).json({message: "OTP GENERATED "+otp});
//         const newOTP = new OTP({
//             otp:otp,
//             userId:_id,
//             expiresAt: new Date(Date.now() + 5 * 60 * 1000)
//         });
//         const generatedOTP = await newOTP.save();
//         const isPasswordValid = await user.validatePassword(password);
//         if(isPasswordValid){
//             const token = await user.getJWT();
//             const session = new  Session({
//                 userId: user._id,
//                 token:token,
//                 device:req.headers["user-agent"],
//                 ip:req.ip
//             });
//             const sessionData = await session.save();
//             res.cookie('token', token,{
//                 httpOnly: true,
//                 secure: true, 
//                 sameSite: "None", 
//               });
//             return res.status(200).json({message:"User logged In successfully !!" , user, token:token, sessionData});
//         }
//     } catch (error) {
//         res.status(400).json({message:"Something went wrong "+error.message});
//     }
// });

// router.post("/auth/signup", async (req,res) => {
//     const {name,phoneNumber,password,referalCode} = req.body;
//     try {

//         const existingMember = await Customer.findOne({phoneNumber:phoneNumber});
//         if(existingMember){
//             throw new Error("Customer already exists....");
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);
//         if(referalCode === null){
//             referalCode = "";
//         }
//         const customer = new Customer({
//            name:name,
//             password:hashedPassword,
//             phoneNumber:phoneNumber,
//            referalCode:referalCode,
//         });
//         const newCustomer = await customer.save();
//         const token = await customer.getJWT();
//         res.status(200).json("Customer signup successfully..", newCustomer, token);
//     } catch (error) {
//         res.status(400).json({message:"Something went wrong "+error.message});
//     }
// });


// Phone Number + OTP VERSION 
router.post("/getOTP", async( req, res) => {
    const {phoneNumber} = req.body;
    try {
        const user = await Customer.findOne({phoneNumber:phoneNumber});
        if(!user){
            throw new Error("User not found: SignUp first.");
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const newOTPsession = new OTP({
            otp:otp,
            userId:user._id,
            expiresAt:new Date(Date.now() + 5 * 60 * 1000)
        });
        const odata = await newOTPsession.save();
        res.status(200).json({message:`${odata.otp} is your One Time Password`});
    } catch (error) {
        res.status(400).json({message:"Something went wrong : "+ error.message});
    }
});

router.post("/verifyOTP", async (req,res) => {
    const {otp, phoneNumber} = req.body;
    try {
        const user = await Customer.findOne({phoneNumber:phoneNumber});

        if(!phoneNumber){
            throw new Error("Something went wrong invalid phone number");
        }
        const prevOTP = await OTP.findOne({userId: user._id});
        const previousOTP = prevOTP.otp;
        if(previousOTP !== otp){
            throw new Error("Invalid OTP");
        }

        const token = await user.getJWT();
        const newSession = new Session({
                userId: user._id,
                token:token,
                device:req.headers["user-agent"],
                ip:req.ip
   
        });
        const sessions = await newSession.save();
        res.cookie('token', token,{
                httpOnly: true,
                secure: true, 
                sameSite: "None", 
              });
        await OTP.deleteMany({ userId: user._id });
        res.status(200).json({message:"OTP verfied thanks..", sessions, token, otp});
    } catch (error) {
                res.status(400).json({message:"Something went wrong : "+ error.message});

    }
});

router.post("/resend-otp", async (req, res) => {
    const {phoneNumber} = req.body;
    try {
        const user = await Customer.findOne({phoneNumber: phoneNumber});
        if(!user){
            throw new Error("User not defined.");
        }
        const prev = await OTP.findOne({userId: user._id});
        if(prev){
            await OTP.deleteMany({userId: user._id});
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const newOTPsession = new OTP({
            otp:otp,
            userId:user._id,
            expiresAt:new Date(Date.now() + 5 * 60 * 1000)
        });
        const odata = await newOTPsession.save();
        res.status(200).json({message:`${odata.otp} is your One Time Password`});
    } catch (error) {
        res.status(400).json({message:"Something went wrong : "+ error.message});
    }
});


router.post("/auth/logout", userAuth , async (req, res) => {
    const {name}  = req.user;
    const token = req.cookies.token;
      res.cookie("token", null, {
        expires: new Date(Date.now()),
      });
      await Session.deleteOne({ token });
      res.status(200).json({message:`${name} Logout Successfully !`})
});
router.post("/auth/logout-all",userAuth, async (req, res) => {
  const {_id} = req.user;

  await Session.deleteMany({userId: _id });

  res.clearCookie("token");
  res.send("Logged out from all devices");
});

router.get("/active-sessions",userAuth, async (req, res) => {
    const {_id} = req.user;
  const sessions = await Session.find({ userId: _id });

  res.json(sessions);
});

router.get("/profile", userAuth, async(req,res) => {
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