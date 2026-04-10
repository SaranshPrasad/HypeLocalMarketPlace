const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const customerSchema = mongoose.Schema({
    name:{
        type:String,
        maxLength:20,
        required:true,
    },
    phoneNumber:{
        type:Number,
        maxLength:10,
        required:true,
        unique:true
    },
    referalCode:{
        type:String
    },
    password:{
        type:String,
        required:true
    }
}, {timestamps:true});

// token creation 
customerSchema.methods.getJWT = async function() {
    const user = this;
    const token = await jwt.sign({_id:user._id},"HYPERLOCAL2026" , {expiresIn:"1d"});
    return token;
}

// validatePassword 
customerSchema.methods.validatePassword = async function(password) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid;
}

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;