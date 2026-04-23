const mongoose  = require("mongoose");
const productSchema = mongoose.Schema({
    product_name:{
        type:String,
        required:true
    },
    product_id:{
        type:String,
        required:true
    },
    product_desc:{
        type:String,
        required:true
    },
    seller_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Seller"
    },
    admin_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin"
    },
    added_by:{
        type:String,
        enum: ["admin", "seller"],
        required:true,
        default:"seller"
    },
    product_price:{
        type:Number,
        required:true
    },
    product_discounted_price:{
        type:Number
    },
    product_category:{
        type:String,
        required:true
    },
    stock_quantity:{
        type:Number,
        required:true
    },
    images: [
  {
    url: { type: String },
    public_id: { type: String }
  }
],
    is_active:{
        type:Boolean,
        required:true
    },

}, {timestamps:true});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;