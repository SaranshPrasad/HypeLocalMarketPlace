// const express = require("express");
// const router = express.Router();
// const cookieParser = require("cookie-parser");
// const Product = require("../../Database/models/Product/product");
// const { sellerAuth } = require("../middlewares/Seller.js/auth");
// router.use(express.json());
// router.use(cookieParser());

// // Product CURD Operation
// router.get("/get/all", async(req,res) => {
//     try {
//         const products = await Product.find();
//         if(products.length === 0){
//             return res.status(200).json({message: "No product to display.. first add some products", products});
//         }
//         if(!products){
//             throw new Error("Something went wrong no products found..");
//         }
//         res.status(200).json({message:"Products data fetched successfully.", products});

//     } catch (error) {
//         res.status(400).json({message:"Something went wrong."+error.message});
//     }
// });

// router.post("/add", sellerAuth, async(req,res) => {
//     const {product_name,product_id,product_desc,seller_id,added_by,product_price,product_discounted_price,product_category,stock_quantity,is_active} = req.body;

//     try {
//         const product = await Product.findOne({product_id:product_id});
//         if(product){
//             throw new Error("Product already exists try updating product stock quantity");
            
//         }
//         const newProduct = new Product({
//             product_name,
//             product_id,
//             product_desc,
//             seller_id,
//             added_by,
//             product_price,
//             product_discounted_price,
//             product_category,
//             stock_quantity,
//             is_active
//         });
//         await newProduct.save();
//         res.status(200).json({message:"Product added.", newProduct});
//     } catch (error) {
//         res.status(400).json({message:"Something went wrong."+error.message});
        
//     }
// });

// router.patch("/update/:id", sellerAuth, async (req,res) => {
//     const {product_price, product_discounted_price, is_active, stock_quantity } = req.body;
//     const {id} = req.params;
//     try {
//         const product = await Product.findByIdAndUpdate(id, {product_price, product_discounted_price, is_active, stock_quantity}, {returnDocument: 'after'});
//         if(!product){
//             throw new Error("Product not found.."); 
//         }
//         res.status(200).json({message:"Product Updated..", product
//         });
//     } catch (error) {
//         res.status(400).json({message:"Something went wrong."+error.message});
        
//     }
// });

// router.delete("/delete/:id", sellerAuth, async(req,res) => {
//     const {id} = req.params;
//     try {
//         const product = await Product.findByIdAndDelete({_id:id});
//         if(!product){
//             throw new Error("Product Not found..");
//         }
//         res.status(200).json({message:"Product Deleted Successfully", product});
//     } catch (error) {
//         res.status(400).json({message:"Something went wrong."+error.message});
        
//     }
// });






// module.exports = router;
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Product = require("../../Database/models/Product/product");
const { sellerAuth } = require("../middlewares/Seller.js/auth");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

router.use(express.json());
router.use(cookieParser());

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per file
    fileFilter
});


const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
                if (error) reject(error);
                else resolve({
                    url: result.secure_url,
                    public_id: result.public_id
                });
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};


const deleteFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (err) {
        console.error("Cloudinary delete error:", err.message);
    }
};

router.get("/get/all", async(req,res) => {
    try {
        const products = await Product.find();

        if(products.length === 0){
            return res.status(200).json({
                message: "No product to display.. first add some products",
                products
            });
        }

        res.status(200).json({
            message:"Products data fetched successfully.",
            products
        });

    } catch (error) {
        res.status(400).json({
            message:"Something went wrong. " + error.message
        });
    }
});

router.post("/add", sellerAuth, upload.array("images", 4), async(req,res) => {
    const {
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
    } = req.body;

    try {
        const product = await Product.findOne({ product_id });

        if(product){
            throw new Error("Product already exists try updating product stock quantity");
        }
        let images = [];
        if(req.files && req.files.length > 0){
            const uploads = req.files.map(file =>
                uploadToCloudinary(file.buffer)
            );
            images = await Promise.all(uploads);
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
            is_active,
            images
        });

        await newProduct.save();

        res.status(200).json({
            message:"Product added.",
            newProduct
        });

    } catch (error) {
        res.status(400).json({
            message:"Something went wrong. " + error.message
        });
    }
});


router.patch("/update/:id", sellerAuth, upload.array("images", 4), async (req,res) => {
    const {
        product_price,
        product_discounted_price,
        is_active,
        stock_quantity
    } = req.body;

    const { id } = req.params;

    try {
        const existingProduct = await Product.findById(id);

        if(!existingProduct){
            throw new Error("Product not found..");
        }

        let updateData = {
            product_price,
            product_discounted_price,
            is_active,
            stock_quantity
        };
        if(req.files && req.files.length > 0){
            if(existingProduct.images && existingProduct.images.length > 0){
                const deletions = existingProduct.images.map(img =>
                    deleteFromCloudinary(img.public_id)
                );
                await Promise.all(deletions);
            }
            const uploads = req.files.map(file =>
                uploadToCloudinary(file.buffer)
            );

            const newImages = await Promise.all(uploads);

            updateData.images = newImages;
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after' }
        );

        res.status(200).json({
            message:"Product Updated..",
            product
        });

    } catch (error) {
        res.status(400).json({
            message:"Something went wrong. " + error.message
        });
    }
});

router.delete("/delete/:id", sellerAuth, async(req,res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);

        if(!product){
            throw new Error("Product Not found..");
        }
        if(product.images && product.images.length > 0){
            const deletions = product.images.map(img =>
                deleteFromCloudinary(img.public_id)
            );
            await Promise.all(deletions);
        }

        await Product.findByIdAndDelete(id);

        res.status(200).json({
            message:"Product Deleted Successfully"
        });

    } catch (error) {
        res.status(400).json({
            message:"Something went wrong. " + error.message
        });
    }
});

module.exports = router;