const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    shop_number: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    landmark: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true,
        length: 6
    },
    country: {
        type: String,
        default: "India"
    }
}, { _id: false });
const sellerSchema = mongoose.Schema({
    bussiness_name: {
        type: String,
        required: true
    },
    owner_name: {
        type: String,
        required: true
    },
    addhaar_no: {
        type: String,
        required: true,
        maxLength: 12
    },
    address_details: addressSchema, 
    profile_photo: {
        type: String
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: true,
        length: 10
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minLength: 8
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Seller = mongoose.model("Seller", sellerSchema);
module.exports = Seller;