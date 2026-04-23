const jwt = require("jsonwebtoken");
const SellerSession = require("../../../Database/models/Seller/sellerSession");
const Seller = require("../../../Database/models/Seller/seller");
require("dotenv").config;
const sellerAuth = async (req, res, next) => {
  // get token from cookie which is saved when login or signup
  const token = req.headers.authorization?.split(" ")[1];
  try {
    // If token is not present
    if (!token) {
      throw new Error("Login Again");
    }
    // get the _id from token
    const decodedMessage = await jwt.verify(token, "HYPERLOCAL2026");
    const session = await SellerSession.findOne({ token });

    if (!session) {
      return res.status(401).send("Session expired or logged out");
    }
    const { _id } = decodedMessage;
    // find user with _id to check user is present or not !
    const user = await Seller.findById(_id);
    if (!user) {
      throw new Error("User not found !");
    }
    // Set the user in req
    req.user = user;
    // call the next function
    next();
  } catch (error) {
    res
      .status(400)
      .json({ message: "Something Went Wrong : " + error.message });
  }
};

module.exports = { sellerAuth };
