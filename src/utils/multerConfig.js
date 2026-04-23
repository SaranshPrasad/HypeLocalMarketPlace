const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Use memory storage (IMPORTANT)
const storage = multer.memoryStorage();
const upload = multer({ storage });