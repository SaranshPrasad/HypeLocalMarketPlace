const mongoose = require("mongoose");
const sessionSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Seller"
    },
    token:{
        type:String,
        required:true
    },
    device:{
        type:String,
        required:true
    },
    ip:{
        type:String,
        required:true}
    

}, {timestamps:true});

const SellerSession = mongoose.model("SellerSession", sessionSchema);
module.exports = SellerSession;
