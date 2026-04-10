const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Product = require("../../Database/models/Product/product");
const { sellerAuth } = require("../middlewares/Seller.js/auth");
router.use(express.json());
router.use(cookieParser());

// Product CURD Operation
router.get("/get/all", async(req,res) => {
    try {
        const products = await Product.find();
        if(products.length === 0){
            return res.status(200).json({message: "No product to display.. first add some products", products});
        }
        if(!products){
            throw new Error("Something went wrong no products found..");
        }
        res.status(200).json({message:"Products data fetched successfully.", products});

    } catch (error) {
        res.status(400).json({message:"Something went wrong."+error.message});
    }
});

router.post("/add", sellerAuth, async(req,res) => {
    const {product_name,product_id,product_desc,seller_id,added_by,product_price,product_discounted_price,product_category,stock_quantity,is_active} = req.body;

    try {
        const product = await Product.findOne({product_id:product_id});
        if(product){
            throw new Error("Product already exists try updating product stock quantity");
            
        }
        const newProduct = new Product({
            product_name,
            product_id,
            product_desc,
            seller_id,
            added_by,
            product_price,
            product_discounted_price,
            product_category,
            stock_quantity,
            is_active
        });
        await newProduct.save();
        res.status(200).json({message:"Product added.", newProduct});
    } catch (error) {
        res.status(400).json({message:"Something went wrong."+error.message});
        
    }
});

router.patch("/update/:id", sellerAuth, async (req,res) => {
    const {product_price, product_discounted_price, is_active, stock_quantity } = req.body;
    const {id} = req.params;
    try {
        const product = await Product.findByIdAndUpdate(id, {product_price, product_discounted_price, is_active, stock_quantity}, {returnDocument: 'after'});
        if(!product){
            throw new Error("Product not found.."); 
        }
        res.status(200).json({message:"Product Updated..", product
        });
    } catch (error) {
        res.status(400).json({message:"Something went wrong."+error.message});
        
    }
});

router.delete("/delete/:id", sellerAuth, async(req,res) => {
    const {id} = req.params;
    try {
        const product = await Product.findByIdAndDelete({_id:id});
        if(!product){
            throw new Error("Product Not found..");
        }
        res.status(200).json({message:"Product Deleted Successfully", product});
    } catch (error) {
        res.status(400).json({message:"Something went wrong."+error.message});
        
    }
});






module.exports = router;
